import mongoose from 'mongoose'
import dns from 'node:dns'

// Force Google's public DNS servers to bypass local ISP DNS blocking of SRV records
dns.setServers(['8.8.8.8', '8.8.4.4'])

export default async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!uri) throw new Error('MONGODB_URI is missing')

  mongoose.set('strictQuery', true)
  mongoose.set('bufferCommands', false)
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 15000,
  })
  console.log('✅ MongoDB connected')
}

