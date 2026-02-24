import { useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import AppLayout from '../layouts/AppLayout'
import KanbanColumn from '../components/KanbanColumn'
import AddJobModal from '../components/AddJobModal'
import { useJobs, useUpdateJob } from '../hooks/useJobs'

const STATUSES = ['wishlist', 'applied', 'interview', 'offer', 'rejected']

const Jobs = () => {
  const { data, isLoading } = useJobs()
  const { mutate: updateJob } = useUpdateJob()
  const [showModal, setShowModal] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState('wishlist')
  const [search, setSearch] = useState('')

  const jobs = data?.jobs || []

  // filter by search
  const filtered = search
    ? jobs.filter(j =>
        j.company.toLowerCase().includes(search.toLowerCase()) ||
        j.role.toLowerCase().includes(search.toLowerCase())
      )
    : jobs

  // group jobs by status
  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = filtered.filter(j => j.status === status)
    return acc
  }, {})

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    // optimistic update — update UI immediately
    updateJob({
      id: draggableId,
      data: { status: destination.droppableId }
    })
  }

  const handleAddClick = (status) => {
    setDefaultStatus(status)
    setShowModal(true)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Job Board</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jobs.length} jobs tracked</p>
        </div>
        <button
          onClick={() => handleAddClick('wishlist')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          + Add Job
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company or role..."
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max">
            {STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                jobs={grouped[status]}
                onAddClick={handleAddClick}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-gray-700">No jobs yet</h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Start tracking your applications
          </p>
          <button
            onClick={() => handleAddClick('wishlist')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Add your first job
          </button>
        </div>
      )}

      {showModal && (
        <AddJobModal
          defaultStatus={defaultStatus}
          onClose={() => setShowModal(false)}
        />
      )}
    </AppLayout>
  )
}

export default Jobs