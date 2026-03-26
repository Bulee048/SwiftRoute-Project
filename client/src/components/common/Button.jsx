import clsx from 'clsx'

export default function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  // ESLint sometimes doesn't count `<As>` as usage, so alias explicitly.
  const AsComponent = As
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/60 disabled:opacity-60 disabled:cursor-not-allowed'
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }
  const variants = {
    primary:
      'bg-brand-primary text-white shadow-glow hover:bg-brand-primary/90 border border-brand-primary/50',
    secondary:
      'bg-dark-elevated/60 text-text-primary border border-dark-border hover:bg-dark-elevated/80',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-dark-elevated/40 border border-transparent',
  }

  return <AsComponent className={clsx(base, sizes[size], variants[variant], className)} {...props} />
}

