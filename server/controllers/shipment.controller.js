import Shipment from '../models/Shipment.model.js'
import TrackingEvent from '../models/TrackingEvent.model.js'
import Merchant from '../models/Merchant.model.js'
import Driver from '../models/Driver.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { buildPagination, getPagination } from '../utils/pagination.js'

export const createShipment = async (req, res, next) => {
  try {
    const doc = await Shipment.create(req.body)
    return ApiResponse.success(res, { shipment: doc }, 'Shipment created', 201)
  } catch (err) {
    next(err)
  }
}

export const getShipments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const q = {}

    // Role-based filtering so merchant/driver dashboards only see their own shipments.
    if (req.user?.role === 'admin') {
      if (req.query.merchant) q.merchant = req.query.merchant
      if (req.query.driver) q.driver = req.query.driver
    } else if (req.user?.role === 'merchant') {
      const merchant = await Merchant.findOne({ user: req.user._id })
      if (!merchant) {
        return ApiResponse.paginated(
          res,
          { shipments: [] },
          buildPagination(0, page, limit),
        )
      }
      q.merchant = merchant._id
    } else if (req.user?.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id })
      if (!driver) {
        return ApiResponse.paginated(
          res,
          { shipments: [] },
          buildPagination(0, page, limit),
        )
      }
      q.driver = driver._id
    }

    if (req.query.status) q.status = req.query.status

    const [total, items] = await Promise.all([
      Shipment.countDocuments(q),
      Shipment.find(q).populate('merchant driver order').skip(skip).limit(limit).sort({ createdAt: -1 }),
    ])
    return ApiResponse.paginated(res, { shipments: items }, buildPagination(total, page, limit))
  } catch (err) {
    next(err)
  }
}

export const trackShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId }).populate('driver merchant order')
    if (!shipment) return ApiResponse.error(res, 'Shipment not found', 404)
    const events = await TrackingEvent.find({ shipment: shipment._id }).sort({ timestamp: -1 }).limit(50)
    return ApiResponse.success(res, { shipment, events })
  } catch (err) {
    next(err)
  }
}

export const getShipmentById = async (req, res, next) => {
  try {
    const doc = await Shipment.findById(req.params.id).populate('merchant driver order vehicle')
    if (!doc) return ApiResponse.error(res, 'Shipment not found', 404)

    // Ownership checks for role-based dashboards.
    if (req.user?.role === 'merchant') {
      const merchant = await Merchant.findOne({ user: req.user._id })
      const shipmentMerchantId = doc.merchant?._id || doc.merchant
      if (!merchant || String(shipmentMerchantId) !== String(merchant._id)) {
        return ApiResponse.error(res, 'Forbidden', 403)
      }
    } else if (req.user?.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id })
      const shipmentDriverId = doc.driver?._id || doc.driver
      if (!driver || String(shipmentDriverId) !== String(driver._id)) {
        return ApiResponse.error(res, 'Forbidden', 403)
      }
    }

    return ApiResponse.success(res, { shipment: doc })
  } catch (err) {
    next(err)
  }
}

export const assignDriver = async (req, res, next) => {
  try {
    const { driverId, vehicleId } = req.body
    const doc = await Shipment.findByIdAndUpdate(
      req.params.id,
      { driver: driverId || null, vehicle: vehicleId || null, status: 'assigned' },
      { new: true },
    )
    if (!doc) return ApiResponse.error(res, 'Shipment not found', 404)

    // Add a timeline event so dashboards stay in sync.
    const event = await TrackingEvent.create({
      shipment: doc._id,
      status: doc.status,
      description: `Driver ${driverId ? 'assigned' : 'cleared'}`,
      location: {
        address: doc.currentLocation?.address || undefined,
        city: doc.origin?.city || undefined,
        coordinates: doc.currentLocation?.coordinates || [],
      },
      updatedBy: req.user?._id,
      eventType: 'admin',
    })
    doc.checkpoints.push(event._id)
    await doc.save()

    const io = req.app.get('io')
    io?.emit('shipment_update', { shipmentId: doc._id, status: doc.status })
    return ApiResponse.success(res, { shipment: doc }, 'Driver assigned')
  } catch (err) {
    next(err)
  }
}

export const updateShipmentStatus = async (req, res, next) => {
  try {
    const doc = await Shipment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    )
    if (!doc) return ApiResponse.error(res, 'Shipment not found', 404)

    const event = await TrackingEvent.create({
      shipment: doc._id,
      status: doc.status,
      description: req.body?.description || `Status updated to ${doc.status}`,
      location: {
        address: doc.currentLocation?.address || undefined,
        city: doc.origin?.city || undefined,
        coordinates: doc.currentLocation?.coordinates || [],
      },
      updatedBy: req.user?._id,
      eventType: req.user?.role === 'driver' ? 'driver' : 'admin',
    })
    doc.checkpoints.push(event._id)
    await doc.save()

    const io = req.app.get('io')
    io?.emit('shipment_update', { shipmentId: doc._id, status: doc.status })
    return ApiResponse.success(res, { shipment: doc }, 'Status updated')
  } catch (err) {
    next(err)
  }
}

export const updateShipmentLocation = async (req, res, next) => {
  try {
    const { address, coordinates } = req.body
    const doc = await Shipment.findByIdAndUpdate(
      req.params.id,
      { currentLocation: { address, coordinates, updatedAt: new Date() } },
      { new: true },
    )
    if (!doc) return ApiResponse.error(res, 'Shipment not found', 404)

    // Record location changes in timeline.
    const event = await TrackingEvent.create({
      shipment: doc._id,
      status: doc.status,
      description: 'Location updated',
      location: {
        address: address || undefined,
        city: doc.origin?.city || undefined,
        coordinates: coordinates || [],
      },
      updatedBy: req.user?._id,
      eventType: req.user?.role === 'driver' ? 'driver' : 'admin',
    })
    doc.checkpoints.push(event._id)
    await doc.save()

    const io = req.app.get('io')
    io?.emit('shipment_update', { shipmentId: doc._id, status: doc.status, location: doc.currentLocation })
    return ApiResponse.success(res, { shipment: doc }, 'Location updated')
  } catch (err) {
    next(err)
  }
}

export const addCheckpoint = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
    if (!shipment) return ApiResponse.error(res, 'Shipment not found', 404)

    const event = await TrackingEvent.create({
      shipment: shipment._id,
      status: req.body.status,
      description: req.body.description,
      location: req.body.location,
      updatedBy: req.user?._id,
      eventType: req.body.eventType || 'system',
    })

    shipment.checkpoints.push(event._id)
    await shipment.save()

    const io = req.app.get('io')
    io?.emit('shipment_update', { shipmentId: shipment._id, status: shipment.status, event })
    return ApiResponse.success(res, { event }, 'Checkpoint added', 201)
  } catch (err) {
    next(err)
  }
}

export const getTimeline = async (req, res, next) => {
  try {
    // Ownership checks for role-based dashboards.
    if (req.user?.role === 'merchant') {
      const merchant = await Merchant.findOne({ user: req.user._id })
      const shipment = await Shipment.findById(req.params.id).select('merchant driver')
      const shipmentMerchantId = shipment?.merchant?._id || shipment?.merchant
      if (!merchant || !shipment || String(shipmentMerchantId) !== String(merchant._id)) {
        return ApiResponse.error(res, 'Forbidden', 403)
      }
    } else if (req.user?.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id })
      const shipment = await Shipment.findById(req.params.id).select('merchant driver')
      const shipmentDriverId = shipment?.driver?._id || shipment?.driver
      if (!driver || !shipment || String(shipmentDriverId) !== String(driver._id)) {
        return ApiResponse.error(res, 'Forbidden', 403)
      }
    }

    const events = await TrackingEvent.find({ shipment: req.params.id }).sort({ timestamp: -1 })
    return ApiResponse.success(res, { events })
  } catch (err) {
    next(err)
  }
}

