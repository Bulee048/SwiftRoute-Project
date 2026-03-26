import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

export default function StatCard({ title, value, change, changeType, icon: Icon, color }) {
  const MotionDiv = motion.div
  const IconComp = Icon
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-surface border border-dark-border rounded-2xl p-6 relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-body">{title}</p>
          <p className="text-3xl font-display font-bold text-text-primary mt-1">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {changeType === 'up' ? (
              <TrendingUp className="w-4 h-4 text-brand-accent" />
            ) : (
              <TrendingDown className="w-4 h-4 text-brand-danger" />
            )}
            <span className={`text-xs font-medium ${changeType === 'up' ? 'text-brand-accent' : 'text-brand-danger'}`}>
              {change}
            </span>
            <span className="text-text-muted text-xs">vs last month</span>
          </div>
        </div>
        <div className="p-3 rounded-xl border border-dark-border" style={{ background: `${color}18` }}>
          <IconComp className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </MotionDiv>
  )
}

