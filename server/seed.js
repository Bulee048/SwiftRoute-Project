import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/User.model.js'
import Merchant from './models/Merchant.model.js'
import Driver from './models/Driver.model.js'
import Vehicle from './models/Vehicle.model.js'
import Order from './models/Order.model.js'
import Shipment from './models/Shipment.model.js'
import TrackingEvent from './models/TrackingEvent.model.js'
import Payment from './models/Payment.model.js'

dotenv.config()

async function runSeed() {
  await mongoose.connect(process.env.MONGODB_URI)
  const PASSWORD = 'Admin@123'
  const hash = await bcrypt.hash(PASSWORD, 10)

  const seededUsers = [
    { name: 'SwiftRoute Admin', email: 'admin@swiftroute.com', role: 'admin' },
    { name: 'Merchant One', email: 'merchant1@swiftroute.com', role: 'merchant' },
    { name: 'Merchant Two', email: 'merchant2@swiftroute.com', role: 'merchant' },
    { name: 'Driver One', email: 'driver1@swiftroute.com', role: 'driver' },
    { name: 'Driver Two', email: 'driver2@swiftroute.com', role: 'driver' },
  ]

  for (const u of seededUsers) {
    await User.updateOne(
      { email: u.email },
      {
        $set: {
          name: u.name,
          email: u.email,
          role: u.role,
          password: hash,
          isVerified: true,
          isActive: true,
        },
      },
      { upsert: true },
    )
  }

  // Fetch seeded user docs after upserts.
  const usersByEmail = Object.fromEntries(
    (await Promise.all(seededUsers.map((u) => User.findOne({ email: u.email }).lean()))).map((uDoc) => [
      uDoc.email,
      uDoc,
    ]),
  )

  const adminUser = usersByEmail['admin@swiftroute.com']
  const merchantUsers = [usersByEmail['merchant1@swiftroute.com'], usersByEmail['merchant2@swiftroute.com']]
  const driverUsers = [usersByEmail['driver1@swiftroute.com'], usersByEmail['driver2@swiftroute.com']]

  const CITY_POINTS = [
    { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
    { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
    { name: 'Galle', lat: 6.0535, lng: 80.2207 },
    { name: 'Jaffna', lat: 9.6615, lng: 80.0256 },
    { name: 'Negombo', lat: 7.2083, lng: 79.8325 },
    { name: 'Gampaha', lat: 7.0937, lng: 79.9976 },
  ]

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  function coordsAround(base, miles = 2) {
    // Small jitter so route/polyline doesn't look identical.
    const jitter = () => (Math.random() - 0.5) * 0.02
    const lat = base.lat + jitter()
    const lng = base.lng + jitter()
    return [lng, lat] // GeoJSON-like [lng, lat]
  }

  // Upsert Merchants
  const merchants = []
  for (let i = 0; i < merchantUsers.length; i += 1) {
    const u = merchantUsers[i]
    const doc = await Merchant.findOneAndUpdate(
      { user: u._id },
      {
        $set: {
          businessName: i === 0 ? 'LankaFlex Supplies' : 'OceanMart Wholesale',
          businessType: i === 0 ? 'ecommerce' : 'wholesale',
          gstin: i === 0 ? 'GST-LF-0001' : 'GST-OM-0002',
          contractStatus: 'active',
          assignedAdmin: adminUser._id,
          businessAddress: {
            street: i === 0 ? 'No. 12, Marine Drive' : 'No. 45, Harbor Road',
            city: i === 0 ? 'Colombo' : 'Galle',
            state: 'Western' ,
            country: 'LK',
            zip: i === 0 ? '00200' : '80000',
          },
        },
      },
      { new: true, upsert: true },
    )
    merchants.push(doc)
  }

  // Upsert Drivers + Vehicles + assign some initial location
  const drivers = []
  const vehicles = []
  for (let i = 0; i < driverUsers.length; i += 1) {
    const u = driverUsers[i]
    const baseCity = CITY_POINTS[i]

    const driverDoc = await Driver.findOneAndUpdate(
      { user: u._id },
      {
        $set: {
          licenseNumber: `LIC-${i + 1}-SWIFTROUTE-DEMO`,
          licenseExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          status: 'available',
          joiningDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80),
          currentLocation: { type: 'Point', coordinates: coordsAround(baseCity, 2) },
          rating: 4.4 - i * 0.3,
        },
      },
      { new: true, upsert: true },
    )

    // Vehicles
    const vehicleDoc = await Vehicle.findOneAndUpdate(
      { vehicleNumber: i === 0 ? 'VR-100-COLOMBO' : 'VR-200-KANDY' },
      {
        $set: {
          vehicleNumber: i === 0 ? 'VR-100-COLOMBO' : 'VR-200-KANDY',
          type: i === 0 ? 'van' : 'bike',
          brand: i === 0 ? 'SwiftVan' : 'RapidRider',
          model: i === 0 ? 'SV-1' : 'RR-9',
          year: 2022 + i,
          color: i === 0 ? 'Orange' : 'Black',
          status: 'active',
          currentLocation: { type: 'Point', coordinates: coordsAround(baseCity, 2) },
          assignedDriver: driverDoc._id,
          fuelType: i === 0 ? 'diesel' : 'petrol',
        },
      },
      { new: true, upsert: true },
    )

    driverDoc.vehicleAssigned = vehicleDoc._id
    await driverDoc.save()

    drivers.push(driverDoc)
    vehicles.push(vehicleDoc)
  }

  // Delete previous fake data related to seeded merchants (avoid duplicates on re-seed).
  const merchantIds = merchants.map((m) => m._id)
  const shipmentsToDelete = await Shipment.find({ merchant: { $in: merchantIds } }).select('_id')
  const shipmentIds = shipmentsToDelete.map((s) => s._id)

  await Promise.all([
    TrackingEvent.deleteMany({ shipment: { $in: shipmentIds } }),
    Shipment.deleteMany({ merchant: { $in: merchantIds } }),
    Order.deleteMany({ merchant: { $in: merchantIds } }),
    Payment.deleteMany({ merchant: { $in: merchantIds } }),
  ])

  // Create orders + shipments + timeline events + payments.
  const orderCountPerMerchant = 4
  const createdShipments = []

  for (const m of merchants) {
    for (let i = 0; i < orderCountPerMerchant; i += 1) {
      const from = pick(CITY_POINTS)
      let to = pick(CITY_POINTS)
      if (to.name === from.name) to = pick(CITY_POINTS)

      const assignedDriver = pick(drivers)
      const assignedVehicle = assignedDriver.vehicleAssigned || pick(vehicles)

      const priority = pick(['standard', 'express', 'same_day'])

      const subtotal = Math.round(25000 + Math.random() * 75000)
      const tax = Math.round(subtotal * 0.1)
      const deliveryCharge = Math.round(500 + Math.random() * 1500)
      const total = subtotal + tax + deliveryCharge

      const orderDoc = await Order.create({
        merchant: m._id,
        customer: {
          name: i % 2 === 0 ? 'S. Perera' : 'A. Silva',
          phone: i % 2 === 0 ? '077-1234-56' : '075-9876-54',
          email: i % 2 === 0 ? 'customer.perera@example.com' : 'customer.silva@example.com',
          address: {
            street: `${20 + i} Example Street`,
            city: to.name,
            state: to.name === 'Colombo' || to.name === 'Gampaha' ? 'Western' : 'Southern',
            country: 'LK',
            zip: String(80000 + i * 10),
          },
        },
        items: [
          {
            name: i % 2 === 0 ? 'Industrial Cleaning Kit' : 'Packaging Supplies',
            description: 'Demo item for SwiftRoute',
            quantity: 1 + (i % 3),
            weight: 2.5 + i,
            value: Math.round(total / 2),
          },
        ],
        packageDetails: {
          totalWeight: 2.5 + i,
          dimensions: { length: 40, width: 30, height: 20 },
          fragile: i % 2 === 0,
          specialInstructions: i % 2 === 0 ? 'Keep upright' : 'Handle with care',
        },
        pickupAddress: { street: 'Pickup Warehouse', city: from.name, state: 'Western', country: 'LK', zip: '00100' },
        deliveryAddress: { street: 'Drop-off Location', city: to.name, state: 'Southern', country: 'LK', zip: '80000' },
        priority,
        status: 'placed',
        paymentStatus: 'pending',
        amount: {
          subtotal,
          tax,
          deliveryCharge,
          discount: 0,
          total,
        },
        notes: 'Seeded demo order',
      })

      const route = [
        { lat: from.lat, lng: from.lng, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
        { lat: (from.lat + to.lat) / 2 + 0.02, lng: (from.lng + to.lng) / 2 - 0.02, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
        { lat: to.lat, lng: to.lng, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      ]

      const shouldFail = Math.random() < 0.25
      const finalStatus = shouldFail ? 'failed_delivery' : 'delivered'

      const shipmentDoc = await Shipment.create({
        order: orderDoc._id,
        merchant: m._id,
        driver: assignedDriver._id,
        vehicle: assignedVehicle._id,
        status: 'created',
        origin: { address: 'Pickup', city: from.name, coordinates: coordsAround(from) },
        destination: { address: 'Delivery', city: to.name, coordinates: coordsAround(to) },
        currentLocation: {
          address: 'En route',
          coordinates: coordsAround(from),
          updatedAt: new Date(Date.now() - 1000 * 60 * 25),
        },
        estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * (2 + i)).toISOString(),
        route,
        distance: Math.round(8 + Math.random() * 120),
        deliveryAttempts: shouldFail ? 1 : 0,
        notes: [],
      })

      // Link order -> shipment
      await Order.findByIdAndUpdate(orderDoc._id, { shipment: shipmentDoc._id })

      const sequence = shouldFail
        ? ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'failed_delivery']
        : ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']

      const updatedBy = adminUser._id
      const checkpointIds = []
      for (let s = 0; s < sequence.length; s += 1) {
        const status = sequence[s]
        const point = route[Math.min(s, route.length - 1)]

        const event = await TrackingEvent.create({
          shipment: shipmentDoc._id,
          status,
          description:
            status === 'created'
              ? 'Shipment created'
              : status === 'picked_up'
                ? 'Picked up from merchant'
                : status === 'in_transit'
                  ? 'In transit'
                  : status === 'out_for_delivery'
                    ? 'Out for delivery'
                    : shouldFail
                      ? 'Delivery attempt failed'
                      : 'Delivered successfully',
          location: {
            address: status === 'out_for_delivery' ? 'On the way' : 'Checkpoint',
            city: s < 3 ? from.name : to.name,
            coordinates: coordsAround(s < 3 ? from : to),
          },
          updatedBy,
          eventType: s === 0 ? 'auto' : 'system',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * (6 - s)).toISOString(),
        })

        checkpointIds.push(event._id)
      }

      await Shipment.findByIdAndUpdate(shipmentDoc._id, {
        status: finalStatus,
        checkpoints: checkpointIds,
        currentLocation: {
          address: finalStatus === 'delivered' ? 'Delivered' : 'Failed location',
          coordinates: finalStatus === 'delivered' ? coordsAround(to) : coordsAround(to),
          updatedAt: new Date(),
        },
      })

      await Payment.create({
        order: orderDoc._id,
        merchant: m._id,
        amount: total,
        currency: 'INR',
        method: priority === 'express' ? 'online' : 'cod',
        status: shouldFail ? 'pending' : 'completed',
        gateway: priority === 'express' ? 'stripe' : 'cod',
        gatewayOrderId: `GW-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
        gatewayPaymentId: `GP-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
        receipt: `RC-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
        paidAt: shouldFail ? undefined : new Date(Date.now() - 1000 * 60 * 30),
      })

      // Update driver aggregates (optional but makes dashboards feel alive)
      await Driver.findByIdAndUpdate(assignedDriver._id, {
        status: shouldFail ? 'on_delivery' : 'on_delivery',
        totalDeliveries: 10 + i,
        joiningDate: driverUsers[0].joiningDate,
      })

      createdShipments.push(shipmentDoc._id)
    }
  }

  console.log('✅ Seed complete')
  console.log('Dev login examples:')
  console.log(`- admin: admin@swiftroute.com / ${PASSWORD}`)
  console.log(`- merchants: merchant1@swiftroute.com, merchant2@swiftroute.com / ${PASSWORD}`)
  console.log(`- drivers: driver1@swiftroute.com, driver2@swiftroute.com / ${PASSWORD}`)

  await mongoose.disconnect()
}

runSeed()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('❌ Seed failed:', err.message)
    try {
      await mongoose.disconnect()
    } catch {}
    process.exit(1)
  })

