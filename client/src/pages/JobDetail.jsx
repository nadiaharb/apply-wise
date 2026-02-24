import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import StatusBadge from '../components/StatusBadge'
import EditJobModal from '../components/EditJobModal'
import AddInterviewModal from '../components/AddInterviewModal'
import { useJob, useDeleteJob, useDeleteInterview } from '../hooks/useJobs'

const interviewTypeLabels = {
  phone:     '📞 Phone Screen',
  technical: '💻 Technical',
  onsite:    '🏢 Onsite',
  final:     '🎯 Final Round'
}

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useJob(id)
  const { mutate: deleteJob } = useDeleteJob()
  const { mutate: deleteInterview } = useDeleteInterview()

  const [showEditModal, setShowEditModal] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  const job = data?.job

  if (!job) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">Job not found.</p>
          <button onClick={() => navigate('/jobs')} className="text-blue-600 mt-2 text-sm hover:underline">
            ← Back to board
          </button>
        </div>
      </AppLayout>
    )
  }

  const handleDelete = () => {
    if (confirm(`Delete ${job.company} — ${job.role}?`)) {
      deleteJob(job.id, { onSuccess: () => navigate('/jobs') })
    }
  }

  const handleDeleteInterview = (interviewId) => {
    if (confirm('Remove this interview?')) {
      deleteInterview({ jobId: job.id, interviewId })
    }
  }

  const formatDate = (date) => date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      })
    : null

  const formatDateTime = (date) => date
    ? new Date(date).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : null

  return (
    <AppLayout>
      {/* Back button */}
      <button
        onClick={() => navigate('/jobs')}
        className="text-gray-400 hover:text-gray-600 text-sm mb-6 flex items-center gap-1 transition"
      >
        ← Back to board
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">{job.company}</h1>
                <StatusBadge status={job.status} size="lg" />
              </div>
              <p className="text-gray-500 text-lg">{job.role}</p>
              {job.industry && (
                <p className="text-gray-400 text-sm mt-1">{job.industry}</p>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="border border-red-200 text-red-500 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Dates row */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            {job.appliedAt && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Applied</p>
                <p className="text-sm font-medium text-gray-700">{formatDate(job.appliedAt)}</p>
              </div>
            )}
            {job.responseAt && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Response</p>
                <p className="text-sm font-medium text-gray-700">{formatDate(job.responseAt)}</p>
              </div>
            )}
            {job.appliedAt && job.responseAt && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Response Time</p>
                <p className="text-sm font-medium text-gray-700">
                  {Math.round(
                    (new Date(job.responseAt) - new Date(job.appliedAt)) / (1000 * 60 * 60 * 24)
                  )} days
                </p>
              </div>
            )}
            <div className="ml-auto">
              <p className="text-xs text-gray-400 mb-0.5">Added</p>
              <p className="text-sm font-medium text-gray-700">{formatDate(job.createdAt)}</p>
            </div>
          </div>

          {/* Match score */}
          {job.matchScore && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">AI Match Score</span>
                <span className={`text-sm font-bold
                  ${job.matchScore >= 70 ? 'text-green-600' :
                    job.matchScore >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {job.matchScore}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all
                    ${job.matchScore >= 70 ? 'bg-green-500' :
                      job.matchScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${job.matchScore}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Notes</h2>
            {job.notes ? (
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{job.notes}</p>
            ) : (
              <p className="text-gray-300 text-sm italic">No notes yet. Click Edit to add some.</p>
            )}
          </div>

          {/* Job description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Job Description</h2>
            {job.jobDescription ? (
              <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-6">
                {job.jobDescription}
              </p>
            ) : (
              <p className="text-gray-300 text-sm italic">
                No job description yet. Add it to unlock AI matching.
              </p>
            )}
          </div>
        </div>

        {/* AI section placeholder — Day 7 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">🤖 AI Analysis</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Get your resume matched against this job description
              </p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
              Coming tomorrow
            </span>
          </div>
        </div>

        {/* Interviews */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              Interviews
              {job.interviews?.length > 0 && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  {job.interviews.length}
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowInterviewModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
            >
              + Add Interview
            </button>
          </div>

          {job.interviews?.length > 0 ? (
            <div className="space-y-3">
              {job.interviews
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(interview => (
                  <div
                    key={interview.id}
                    className="flex items-start justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {interviewTypeLabels[interview.type]}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(interview.date)}
                      </p>
                      {interview.notes && (
                        <p className="text-xs text-gray-500 mt-1">{interview.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteInterview(interview.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-300 text-sm italic">
              No interviews scheduled yet.
            </p>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditJobModal job={job} onClose={() => setShowEditModal(false)} />
      )}
      {showInterviewModal && (
        <AddInterviewModal jobId={job.id} onClose={() => setShowInterviewModal(false)} />
      )}
    </AppLayout>
  )
}

export default JobDetail