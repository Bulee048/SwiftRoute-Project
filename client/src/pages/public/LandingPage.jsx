import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  Headset,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  WalletCards,
} from 'lucide-react'
import Navbar from '../../components/common/Navbar.jsx'
import Button from '../../components/common/Button.jsx'
import Page from '../../components/common/Page.jsx'
import Badge from '../../components/common/Badge.jsx'
import { containerVariants, itemVariants } from '../../utils/motion'

// Aliases to satisfy ESLint's no-unused-vars for motion usage via JSX member expressions.
const MotionDiv = motion.div
const MotionPath = motion.path

const features = [
  { icon: MapPinned, title: 'Real-Time Tracking', desc: 'Live driver location + route history.' },
  { icon: Truck, title: 'Multi-Role Ops', desc: 'Admin, merchant, driver dashboards.' },
  { icon: Activity, title: 'Status Telemetry', desc: 'Glowing chips, timelines, alerts.' },
  { icon: ShieldCheck, title: 'Secure Auth', desc: 'JWT access + refresh token flow.' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Revenue, load, throughput trends.' },
  { icon: Headset, title: '24/7 Support', desc: 'Ops-ready workflows and tooling.' },
]

const howItWorks = [
  { title: 'Create Order', desc: 'Merchant submits package + addresses + schedule.' },
  { title: 'Assign Driver', desc: 'Ops assigns best-fit driver and vehicle in one click.' },
  { title: 'Track Live', desc: 'Status timeline and route telemetry stream in real-time.' },
  { title: 'Delivered', desc: 'Proof of delivery, payment update, and instant notifications.' },
]

const testimonials = [
  {
    quote:
      'SwiftRoute reduced our failed deliveries by 37% in the first month. The control center feel is unreal.',
    name: 'Nexa Retail',
    role: 'Enterprise Merchant',
  },
  {
    quote:
      'Driver status and live shipment timeline made dispatch decisions way faster for our ops team.',
    name: 'UrbanDrop',
    role: 'Regional Logistics Lead',
  },
  {
    quote:
      'The merchant portal is clean, fast, and gives our customers tracking confidence without support calls.',
    name: 'QuickCart',
    role: 'Ecommerce Operations',
  },
]

function CountUpStat({ value, suffix = '', label }) {
  const target = Number(value)
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    let started = false
    let raf = null
    let startTime = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return
        started = true
        const duration = 1200
        const animate = (ts) => {
          if (!startTime) startTime = ts
          const progress = Math.min((ts - startTime) / duration, 1)
          setDisplay(Math.floor(progress * target))
          if (progress < 1) raf = requestAnimationFrame(animate)
        }
        raf = requestAnimationFrame(animate)
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [target])

  return (
    <div ref={ref} className="rounded-xl border border-dark-border bg-dark-base/40 p-3">
      <div className="text-xl font-display font-bold text-text-primary">
        {display}
        {suffix}
      </div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  )
}

export default function LandingPage() {
  const heroRef = useRef(null)
  const [showTopFab, setShowTopFab] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onScroll = () => setShowTopFab(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = heroRef.current
    if (!el) return

    let raf = 0
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height

      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setParallax({ x: dx * 26, y: dy * 18 })
      })
    }

    el.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <Page>
      <Navbar />
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
          <svg className="h-full w-full" viewBox="0 0 1200 900" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(55,65,81,0.45)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1200" height="900" fill="url(#grid)" />
            <motion.path
              d="M100 650 C300 520, 420 700, 700 540 C840 450, 980 510, 1120 420"
              stroke="rgba(14,165,233,0.7)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10 8"
              initial={{ pathLength: 0.1, opacity: 0.3 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 3.2, repeat: Infinity, repeatType: 'reverse' }}
            />
            <motion.path
              d="M120 730 C350 560, 500 760, 760 610 C900 520, 1040 580, 1140 530"
              stroke="rgba(249,115,22,0.75)"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="8 7"
              initial={{ pathLength: 0.15, opacity: 0.3 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 3.8, repeat: Infinity, repeatType: 'reverse', delay: 0.2 }}
            />
          </svg>
        </div>

        <div className="sr-container py-10 sm:py-16 space-y-12 sm:space-y-16 relative">
          {/* Decorative glowing moving map-pin particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[
              { left: '10%', top: '22%', delay: 0.0, scale: 1.0, driftX: 28, driftY: -18 },
              { left: '24%', top: '58%', delay: 0.7, scale: 0.9, driftX: -22, driftY: 16 },
              { left: '50%', top: '28%', delay: 0.35, scale: 1.05, driftX: 24, driftY: -14 },
              { left: '72%', top: '46%', delay: 1.05, scale: 0.85, driftX: -26, driftY: 18 },
              { left: '86%', top: '18%', delay: 0.9, scale: 1.0, driftX: 18, driftY: -12 },
            ].map((p, idx) => (
              <motion.div
                key={idx}
                className="absolute text-brand-secondary/80"
                style={{
                  left: p.left,
                  top: p.top,
                  transform: 'translate(-50%,-50%)',
                  filter: 'drop-shadow(0 0 16px rgba(14,165,233,0.35))',
                  zIndex: 0,
                }}
                animate={{
                  x: [0, p.driftX * p.scale],
                  y: [0, p.driftY * p.scale],
                  opacity: [0.2, 0.95, 0.2],
                }}
                transition={{
                  duration: 4.8 + idx * 0.35,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <MapPinned className="h-5 w-5" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-brand-secondary/30 blur-md" />
              </motion.div>
            ))}
          </div>

          <div className="relative z-10">
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
          <motion.div
            ref={heroRef}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="sr-card p-7 sm:p-10"
            style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)` }}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-dark-border bg-dark-elevated/40 px-4 py-2 text-xs text-text-secondary font-mono">
              <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
              command-center logistics platform
            </motion.div>
            <motion.h1 variants={itemVariants} className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-text-primary">
              Move Smarter.
              <br />
              <span className="text-brand-primary">Deliver Faster.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-4 text-base sm:text-lg text-text-secondary max-w-2xl">
              Industrial-futuristic delivery operations for admins, merchants, and drivers. Get full visibility across
              orders, shipments, routes, and payments from one control room.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Link to="/register">
                <Button size="lg" variant="primary">
                  Launch ops
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="secondary">
                  Track shipment
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 grid grid-cols-3 gap-3">
              <CountUpStat value={10} suffix="k+" label="deliveries" />
              <CountUpStat value={500} suffix="+" label="merchants" />
              <CountUpStat value={99} suffix=".9%" label="on-time" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="sr-card p-6 sm:p-8"
            style={{ transform: `translate3d(${-parallax.x * 0.6}px, ${parallax.y * 0.45}px, 0)` }}
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-xl text-text-primary">Live Ops Snapshot</div>
              <div className="sr-chip border-brand-accent/30 bg-brand-accent/10 text-brand-accent font-mono">online</div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-dark-border bg-dark-base/40 p-4">
                <div className="text-xs text-text-muted">Active Shipments</div>
                <div className="mt-1 text-2xl font-display text-text-primary">43</div>
              </div>
              <div className="rounded-xl border border-dark-border bg-dark-base/40 p-4">
                <div className="text-xs text-text-muted">Drivers Online</div>
                <div className="mt-1 text-2xl font-display text-text-primary">19</div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-dark-border bg-dark-base/60 p-4">
              <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
                <Route className="h-3.5 w-3.5" />
                route telemetry
              </div>
              <div className="mt-3 h-32 rounded-xl border border-dark-border bg-[linear-gradient(135deg,rgba(14,165,233,0.13),rgba(249,115,22,0.13))] relative overflow-hidden">
                <div className="absolute left-4 top-8 right-4 h-px bg-brand-secondary/40" />
                <div className="absolute left-10 top-14 right-6 h-px bg-brand-primary/50" />
                <div className="absolute left-1/3 top-1/2 h-2.5 w-2.5 rounded-full bg-brand-secondary animate-pulse" />
                <div className="absolute left-2/3 top-1/3 h-3 w-3 rounded-full bg-brand-primary animate-pulse" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-dark-border p-3">
                <span className="text-sm text-text-secondary">SWR-Q8L2MXP4Y1</span>
                <Badge status="in_transit" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-dark-border p-3">
                <span className="text-sm text-text-secondary">SWR-B1Z9RTJ6K2</span>
                <Badge status="out_for_delivery" />
              </div>
            </div>
          </motion.div>
        </section>
          </div>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div className="font-display text-2xl font-bold text-text-primary">Core Capabilities</div>
            <div className="text-xs font-mono text-text-muted">6 feature modules</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc }) => {
              const IconComp = icon
              return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="sr-card p-5"
              >
                <div className="h-10 w-10 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 grid place-items-center">
                  <IconComp className="h-5 w-5 text-brand-secondary" />
                </div>
                <div className="mt-4 font-display text-lg font-semibold text-text-primary">{title}</div>
                <div className="mt-1 text-sm text-text-secondary">{desc}</div>
              </motion.div>
              )
            })}
          </div>
        </section>

        <section className="sr-card p-6 sm:p-8">
          <div className="font-display text-2xl font-bold text-text-primary">How SwiftRoute Works</div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {howItWorks.map((step, idx) => (
              <div key={step.title} className="rounded-xl border border-dark-border bg-dark-base/40 p-4 relative overflow-hidden">
                <div className="text-xs font-mono text-brand-secondary">step {idx + 1}</div>
                <div className="mt-2 font-display text-lg text-text-primary">{step.title}</div>
                <div className="mt-1 text-sm text-text-secondary">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 sr-card p-6 sm:p-8">
            <div className="font-display text-2xl font-bold text-text-primary">Why Teams Choose SwiftRoute</div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Boxes, txt: 'Unified ops for orders, shipments, drivers, and vehicles.' },
                { icon: BarChart3, txt: 'Real-time analytics to reduce failed or delayed deliveries.' },
                { icon: WalletCards, txt: 'Payment visibility and refunds from one admin panel.' },
                { icon: Clock3, txt: 'Faster dispatch and response time with live status updates.' },
              ].map(({ icon, txt }) => {
                const IconComp = icon
                return (
                <div key={txt} className="rounded-xl border border-dark-border bg-dark-base/40 p-4 flex gap-3">
                  <IconComp className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary">{txt}</p>
                </div>
                )
              })}
            </div>
          </div>
          <div className="sr-card p-6 sm:p-8">
            <div className="font-display text-2xl font-bold text-text-primary">Pricing Teaser</div>
            <p className="mt-2 text-sm text-text-secondary">Flexible plans for startups to enterprise logistics teams.</p>
            <div className="mt-4 rounded-xl border border-dark-border bg-dark-base/40 p-4">
              <div className="text-text-muted text-xs">starting from</div>
              <div className="mt-1 text-3xl font-display text-text-primary">
                LKR 14,900<span className="text-sm text-text-muted">/month</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-accent" /> role-based dashboards</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-accent" /> live tracking + timeline</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-accent" /> priority support</li>
              </ul>
              <Link to="/pricing" className="mt-4 inline-block">
                <Button variant="secondary" size="sm">View plans</Button>
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="font-display text-2xl font-bold text-text-primary">What Merchants Say</div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="sr-card p-5">
                <p className="text-sm text-text-secondary">"{t.quote}"</p>
                <div className="mt-4">
                  <div className="font-display text-base text-text-primary">{t.name}</div>
                  <div className="text-xs text-text-muted">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sr-card p-6 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-[linear-gradient(130deg,rgba(14,165,233,0.12),rgba(249,115,22,0.12))]">
          <div>
            <div className="font-display text-3xl font-bold text-text-primary">Start Delivering Today</div>
            <div className="mt-2 text-text-secondary">
              Launch your logistics control room with SwiftRoute and monitor everything in one place.
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Create account</Button>
            </Link>
          </div>
        </section>

        <Link to="/track" className="fixed bottom-6 right-6 z-30">
          <Button variant="primary" className="shadow-glow">
            <MapPinned className="h-4 w-4" />
            Track Shipment
          </Button>
        </Link>

        {showTopFab && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-24 z-30 rounded-2xl border border-dark-border bg-dark-elevated/80 backdrop-blur px-4 py-3 text-sm text-text-primary hover:bg-dark-elevated/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/60 shadow-glow"
            aria-label="Back to top"
          >
            <span>Top</span>
          </button>
        )}
      </div>
      </div>
    </Page>
  )
}

