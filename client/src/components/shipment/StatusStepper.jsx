import Badge from '../common/Badge.jsx'

const ORDER = ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']

export default function StatusStepper({ status = 'created' }) {
  const activeIdx = Math.max(0, ORDER.indexOf(status))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ORDER.map((s, idx) => {
          const isDone = idx < activeIdx
          const isActive = idx === activeIdx
          const isFuture = idx > activeIdx
          return (
            <div key={s} className="flex items-center gap-2 whitespace-nowrap">
              <div
                className={[
                  'h-2.5 w-2.5 rounded-full',
                  isDone ? 'bg-brand-accent' : isActive ? 'bg-brand-primary' : 'bg-dark-border',
                ].join(' ')}
              />
              <Badge status={isFuture ? 'pending' : s} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

