import Button from './Button.jsx'

export default function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs text-text-muted font-mono">
        page {page} / {totalPages || 1}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= (totalPages || 1)}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

