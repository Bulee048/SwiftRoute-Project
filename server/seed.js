import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/User.model.js'

dotenv.config()

async function runSeed() {
  await mongoose.connect(process.env.MONGODB_URI)
  const hash = await bcrypt.hash('Admin@123', 10)

  const users = [
    { name: 'Super Admin', email: 'admin@swiftroute.com', role: 'admin' },
    { name: 'Test Merchant', email: 'merchant@swiftroute.com', role: 'merchant' },
    { name: 'Test Driver', email: 'driver@swiftroute.com', role: 'driver' },
  ]

  for (const u of users) {
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

  console.log('✅ Seed complete')
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

