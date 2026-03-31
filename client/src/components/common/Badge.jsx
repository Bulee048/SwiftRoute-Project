const STATUS_CONFIG = {
  delivered: { label: 'Delivered', color: 'bg-brand-accent/15 text-brand-accent border-brand-accent/25' },
  in_transit: { label: 'In Transit', color: 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/25' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-brand-primary/15 text-brand-primary border-brand-primary/25' },
  picked_up: { label: 'Picked Up', color: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
  assigned: { label: 'Assigned', color: 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/25' },
  failed_delivery: { label: 'Failed Delivery', color: 'bg-brand-danger/15 text-brand-danger border-brand-danger/25' },
  hub_received: { label: 'Hub Received', color: 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/25' },
  cancelled: { label: 'Cancelled', color: 'bg-brand-danger/15 text-brand-danger border-brand-danger/25' },
  pending: { label: 'Pending', color: 'bg-brand-warning/15 text-brand-warning border-brand-warning/25' },
  processing: { label: 'Processing', color: 'bg-brand-primary/15 text-brand-primary border-brand-primary/25' },
  completed: { label: 'Completed', color: 'bg-brand-accent/15 text-brand-accent border-brand-accent/25' },
  failed: { label: 'Failed', color: 'bg-brand-danger/15 text-brand-danger border-brand-danger/25' },
  refunded: { label: 'Refunded', color: 'bg-brand-danger/15 text-brand-danger border-brand-danger/25' },
  created: { label: 'Created', color: 'bg-slate-500/15 text-slate-300 border-slate-500/25' },
  draft: { label: 'Draft', color: 'bg-slate-500/15 text-slate-300 border-slate-500/25' },
  placed: { label: 'Placed', color: 'bg-slate-500/15 text-slate-300 border-slate-500/25' },
  confirmed: { label: 'Confirmed', color: 'bg-slate-500/15 text-slate-300 border-slate-500/25' },
  pickup_scheduled: { label: 'Pickup Scheduled', color: 'bg-brand-warning/15 text-brand-warning border-brand-warning/25' },
  in_transit_order: { label: 'In Transit', color: 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/25' },
  returned: { label: 'Returned', color: 'bg-brand-danger/15 text-brand-danger border-brand-danger/25' },
}

export default function Badge({ status = 'pending' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono ${cfg.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {cfg.label}
    </span>
  )
}

