import { useState } from 'react'
import { matchResume, analyzeSkillGaps } from '../services/aiService'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const priorityColors = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100 text-green-600'
}

const AIAnalysis = ({ job }) => {
  const queryClient = useQueryClient()
  const [resumeText, setResumeText] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [gapResult, setGapResult] = useState(null)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [loadingGaps, setLoadingGaps] = useState(false)
  const [activeTab, setActiveTab] = useState('match')

  const handleMatch = async () => {
    if (!resumeText.trim()) return toast.error('Paste your resume first')
    if (!job.jobDescription) return toast.error('Add a job description to this job first')
    setLoadingMatch(true)
    try {
      const { analysis } = await matchResume(job.id, resumeText)
      setMatchResult(analysis)
      queryClient.invalidateQueries({ queryKey: ['job', job.id] })
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed')
    } finally {
      setLoadingMatch(false)
    }
  }

  const handleGapAnalysis = async () => {
    if (!resumeText.trim()) return toast.error('Paste your resume first')
    if (!job.jobDescription) return toast.error('Add a job description to this job first')
    setLoadingGaps(true)
    try {
      const { analysis } = await analyzeSkillGaps(job.id, resumeText)
      setGapResult(analysis)
      toast.success('Skill gaps analyzed!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed')
    } finally {
      setLoadingGaps(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
      <h2 className="font-semibold text-gray-800 mb-1">🤖 AI Analysis</h2>
      <p className="text-sm text-gray-400 mb-4">
        Paste your resume to get a match score and skill gap analysis
      </p>

      {/* Resume input */}
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        rows={5}
        placeholder="Paste your resume text here..."
        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
      />

      {/* Action buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleMatch}
          disabled={loadingMatch}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loadingMatch ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : '📊 Match Resume'}
        </button>
        <button
          onClick={handleGapAnalysis}
          disabled={loadingGaps}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loadingGaps ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : '🧠 Skill Gaps'}
        </button>
      </div>

      {/* Results */}
      {(matchResult || gapResult) && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            {matchResult && (
              <button
                onClick={() => setActiveTab('match')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition
                  ${activeTab === 'match'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Match Score
              </button>
            )}
            {gapResult && (
              <button
                onClick={() => setActiveTab('gaps')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition
                  ${activeTab === 'gaps'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Skill Gaps
              </button>
            )}
          </div>

          {/* Match result */}
          {activeTab === 'match' && matchResult && (
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className={`text-4xl font-bold
                  ${matchResult.score >= 70 ? 'text-green-600' :
                    matchResult.score >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {matchResult.score}%
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Match Score</p>
                  <p className="text-sm text-gray-500">{matchResult.summary}</p>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">✅ Strengths</h4>
                <ul className="space-y-1">
                  {matchResult.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-green-500 shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">⚠️ Gaps</h4>
                <ul className="space-y-1">
                  {matchResult.gaps.map((g, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-yellow-500 shrink-0">•</span> {g}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Suggestions</h4>
                <div className="space-y-2">
                  {matchResult.suggestions.map((s, i) => (
                    <div key={i} className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-700 mb-0.5">{s.section}</p>
                      <p className="text-sm text-gray-600">{s.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gap result */}
          {activeTab === 'gaps' && gapResult && (
            <div className="space-y-4">
              {/* Skills overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-green-700 mb-2">✅ You have</p>
                  <div className="flex flex-wrap gap-1">
                    {gapResult.candidateSkills.map((s, i) => (
                      <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-red-700 mb-2">❌ Missing</p>
                  <div className="flex flex-wrap gap-1">
                    {gapResult.missingSkills.map((s, i) => (
                      <span key={i} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">📚 Recommendations</h4>
                <div className="space-y-2">
                  {gapResult.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5
                        ${priorityColors[r.priority]}`}>
                        {r.priority}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{r.skill}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.resource}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AIAnalysis