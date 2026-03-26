export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('join_room', (userId) => {
      socket.join(userId)
      console.log(`User ${userId} joined room`)
    })

    socket.on('driver_location_update', async (data) => {
      io.emit('driver_location_broadcast', data)
    })

    socket.on('mark_delivered', (data) => {
      io.emit('delivery_completed', { shipmentId: data.shipmentId, deliveredAt: new Date().toISOString() })
    })

    socket.on('shipment_status_change', (data) => {
      if (data?.merchantId) io.to(data.merchantId).emit('shipment_update', data)
      io.emit('shipment_update', data)
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })
}

