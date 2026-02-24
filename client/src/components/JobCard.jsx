import { useDeleteJob } from '../hooks/useJobs'
import { useNavigate } from 'react-router-dom'

const statusColors = {
  wishlist: 'bg-gray-100 text-gray-600',
  applied: 'bg-blue-100 text-blue-600',
  interview: 'bg-yellow-100 text-yellow-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600'
}

const JobCard = ({ job }) => {
  const { mutate: deleteJob } = useDeleteJob()
  const navigate = useNavigate()

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm(`Delete ${job.company} — ${job.role}?`)) {
      deleteJob(job.id)
    }
  }

  const handleClick = () => {
    navigate(`/jobs/${job.id}`)
  }

  const appliedDate = job.appliedAt
    ? new Date(job.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{job.company}</p>
          <p className="text-gray-500 text-sm truncate mt-0.5">{job.role}</p>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition text-lg leading-none shrink-0"
        >
          ×
        </button>
      </div>

      <div className="flex items-center justify-between mt-3">
        {job.industry && (
          <span className="text-xs text-gray-400 truncate">{job.industry}</span>
        )}
        {appliedDate && (
          <span className="text-xs text-gray-400 ml-auto">{appliedDate}</span>
        )}
      </div>

      {job.matchScore && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Match</span>
            <span className="text-xs font-medium text-blue-600">{job.matchScore}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${job.matchScore}%` }}
            />
          </div>
        </div>
      )}

      {job.interviews?.length > 0 && (
        <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 rounded-lg px-2 py-1">
          📅 {job.interviews.length} interview{job.interviews.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default JobCard