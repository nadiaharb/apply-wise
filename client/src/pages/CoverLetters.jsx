import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppLayout from '../layouts/AppLayout'
import { generateCoverLetter, getCoverLetters, deleteCoverLetter } from '../services/aiService'
import { useJobs } from '../hooks/useJobs'
import toast from 'react-hot-toast'

const TONES = [
  { value: 'professional', label: '👔 Professional' },
  { value: 'enthusiastic', label: '🔥 Enthusiastic' },
  { value: 'concise',      label: '⚡ Concise' },
  { value: 'creative',     label: '🎨 Creative' },
]

const CoverLetters = () => {
  const queryClient = useQueryClient()
  const { data: jobsData } = useJobs()
  const { data: clData, isLoading } = useQuery({
    queryKey: ['cover-letters'],
    queryFn: getCoverLetters
  })

  const [selectedJobId, setSelectedJobId] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [tone, setTone] = useState('professional')
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)

  const jobs = jobsData?.jobs || []
  const coverLetters = clData?.coverLetters || []

  const handleGenerate = async () => {
    if (!selectedJobId) return toast.error('Select a job first')
    if (!resumeText.trim()) return toast.error('Paste your resume first')
    setGenerating(true)
    try {
      const { coverLetter } = await generateCoverLetter(selectedJobId, resumeText, tone)
      queryClient.invalidateQueries({ queryKey: ['cover-letters'] })
      setSelected(coverLetter)
      toast.success('Cover letter generated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this cover letter?')) return
    try {
      await deleteCoverLetter(id)
      queryClient.invalidateQueries({ queryKey: ['cover-letters'] })
      if (selected?.id === id) setSelected(null)
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(selected.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cover Letters</h1>
        <p className="text-gray-500 text-sm mt-0.5">Generate tailored cover letters with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Generate New</h2>

            {/* Job selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a job...</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`px-3 py-2 rounded-lg text-sm border transition text-left
                      ${tone === t.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resume input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Resume
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={6}
                placeholder="Paste your resume text here..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : '✨ Generate Cover Letter'}
            </button>
          </div>

          {/* Saved list */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Saved
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {coverLetters.length}
              </span>
            </h2>

            {isLoading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : coverLetters.length === 0 ? (
              <p className="text-gray-300 text-sm italic">No cover letters yet</p>
            ) : (
              <div className="space-y-2">
                {coverLetters.map(cl => (
                  <div
                    key={cl.id}
                    onClick={() => setSelected(cl)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition group
                      ${selected?.id === cl.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-transparent hover:border-gray-200'}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{cl.company}</p>
                      <p className="text-xs text-gray-400 truncate">{cl.jobTitle}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(cl.id) }}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition text-lg leading-none ml-2 shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-800">{selected.company}</h2>
                  <p className="text-sm text-gray-400">{selected.jobTitle}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition
                    ${copied
                      ? 'border-green-300 bg-green-50 text-green-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 h-[500px] overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selected.content}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-gray-400 text-sm">
                Generate a cover letter or select one from your saved list
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default CoverLetters