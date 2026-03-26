import Navbar from '../../components/common/Navbar.jsx'

export default function PricingPage() {
  return (
    <div>
      <Navbar />
      <div className="sr-container py-10">
        <div className="sr-card p-6 sm:p-8">
          <div className="font-display text-2xl font-bold text-text-primary">Pricing</div>
          <p className="mt-2 text-text-secondary">
            Placeholder page. Next we’ll add tiered plans, feature matrix, and checkout integration.
          </p>
        </div>
      </div>
    </div>
  )
}

