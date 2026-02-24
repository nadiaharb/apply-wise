import { Droppable, Draggable } from '@hello-pangea/dnd'
import JobCard from './JobCard'

const columnStyles = {
  wishlist: {
    header: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-200 text-gray-600',
    dot: 'bg-gray-400',
    label: 'Wishlist'
  },
  applied: {
    header: 'bg-blue-50 border-blue-100',
    badge: 'bg-blue-100 text-blue-600',
    dot: 'bg-blue-400',
    label: 'Applied'
  },
  interview: {
    header: 'bg-yellow-50 border-yellow-100',
    badge: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-400',
    label: 'Interview'
  },
  offer: {
    header: 'bg-green-50 border-green-100',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-400',
    label: 'Offer'
  },
  rejected: {
    header: 'bg-red-50 border-red-100',
    badge: 'bg-red-100 text-red-600',
    dot: 'bg-red-400',
    label: 'Rejected'
  }
}

const KanbanColumn = ({ status, jobs, onAddClick }) => {
  const style = columnStyles[status]

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border mb-3 ${style.header}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className="text-sm font-semibold text-gray-700">{style.label}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${style.badge}`}>
            {jobs.length}
          </span>
        </div>
        <button
          onClick={() => onAddClick(status)}
          className="text-gray-400 hover:text-blue-500 transition text-xl leading-none"
        >
          +
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] rounded-xl p-2 transition-colors space-y-2
              ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-200' : ''}`}
          >
            {jobs.map((job, index) => (
              <Draggable key={job.id} draggableId={job.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.85 : 1
                    }}
                  >
                    <JobCard job={job} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {jobs.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center text-gray-300 text-sm pt-8">
                Drop here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default KanbanColumn