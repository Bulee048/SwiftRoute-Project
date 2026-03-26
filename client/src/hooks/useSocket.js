import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'

export default function useSocket() {
  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL, { withCredentials: true })
    socketRef.current = s
    if (user?._id) s.emit('join_room', user._id)

    // Avoid setState synchronously inside the effect body; set it only after connect.
    const handleConnect = () => setSocket(s)
    s.on('connect', handleConnect)

    return () => {
      s.disconnect()
      s.off('connect', handleConnect)
      socketRef.current = null
      setSocket(null)
    }
  }, [user?._id])

  return socket
}

