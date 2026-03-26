import { Link } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="sr-card p-8 text-center max-w-lg">
        <div className="font-display text-3xl font-bold text-text-primary">Access denied</div>
        <p className="mt-2 text-text-secondary">Your role doesn’t have permission to view that page.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="secondary">Go home</Button>
          </Link>
          <Link to="/login">
            <Button variant="primary">Login</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

