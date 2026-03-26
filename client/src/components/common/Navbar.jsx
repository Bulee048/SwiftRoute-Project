import { Link } from 'react-router-dom'
import Button from './Button.jsx'

export default function Navbar() {
  return (
    <div className="sticky top-0 z-20 border-b border-dark-border bg-dark-base/40 backdrop-blur">
      <div className="sr-container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-primary/15 border border-brand-primary/30 grid place-items-center">
            <div className="h-4 w-4 rounded-sm bg-brand-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg tracking-tight text-text-primary">
              Swift<span className="text-brand-primary">Route</span>
            </div>
            <div className="text-xs text-text-muted -mt-0.5">Move Smarter. Deliver Faster.</div>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2">
          <Link to="/pricing" className="text-sm text-text-secondary hover:text-text-primary">
            Pricing
          </Link>
          <Link to="/contact" className="text-sm text-text-secondary hover:text-text-primary">
            Contact
          </Link>
          <Link to="/track" className="text-sm text-text-secondary hover:text-text-primary">
            Track
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="secondary" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

