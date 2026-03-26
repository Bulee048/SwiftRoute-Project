export default function Table({ columns, rows, emptyText = 'No records found.', onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-dark-border">
      <table className="min-w-full text-sm">
        <thead className="bg-dark-elevated/60">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-text-muted font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-text-muted">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row.id || row._id || idx}
                className={`border-t border-dark-border/80 ${onRowClick ? 'cursor-pointer hover:bg-dark-elevated/30' : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') onRowClick(row)
                    }
                    : undefined
                }
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-text-secondary">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

