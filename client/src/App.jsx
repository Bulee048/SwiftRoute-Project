import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import AppRouter from './routes/AppRouter.jsx'

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(17, 24, 39, 0.92)',
            color: '#F9FAFB',
            border: '1px solid rgba(55, 65, 81, 0.8)',
          },
        }}
      />
    </>
  )
}
