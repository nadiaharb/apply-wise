const styles = {
  wishlist:  'bg-gray-100 text-gray-600',
  applied:   'bg-blue-100 text-blue-600',
  interview: 'bg-yellow-100 text-yellow-700',
  offer:     'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-500'
}

const labels = {
  wishlist:  'Wishlist',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected'
}

const StatusBadge = ({ status, size = 'sm' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium
      ${styles[status]}
      ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
      {labels[status]}
    </span>
  )
}

export default StatusBadge