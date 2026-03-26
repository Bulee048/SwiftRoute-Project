import Navbar from '../../components/common/Navbar.jsx'
import Page from '../../components/common/Page.jsx'

export default function ContactPage() {
  return (
    <Page>
      <Navbar />
      <div className="sr-container py-10">
        <div className="sr-card p-6 sm:p-8">
          <div className="font-display text-2xl font-bold text-text-primary">Contact SwiftRoute</div>
          <p className="mt-2 text-text-secondary">
            Ops support available 24/7. Email: support@swiftroute.com
          </p>
        </div>
      </div>
    </Page>
  )
}

