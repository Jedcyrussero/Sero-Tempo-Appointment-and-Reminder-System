interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationControlsProps) {
  if (total === 0) return null;

  const start = (page - 1) * 25 + 1;
  const end = Math.min(page * 25, total);

  return (
    <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-4 py-3">
      <p className="text-sm text-text-secondary">
        Showing {start}-{end} of {total}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
