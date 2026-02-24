const openai = require('../utils/openai')
const prisma = require('../prisma/client')

// ─── Resume Match ─────────────────────────────────────────────

const matchResume = async (req, res, next) => {
  try {
    const { jobId, resumeText } = req.body

    if (!jobId || !resumeText)
      return res.status(400).json({ message: 'jobId and resumeText are required' })

    const job = await prisma.job.findUnique({ where: { id: jobId } })

    if (!job)
      return res.status(404).json({ message: 'Job not found' })

    if (job.userId !== req.userId)
      return res.status(403).json({ message: 'Not authorized' })

    if (!job.jobDescription)
      return res.status(400).json({ message: 'Add a job description first' })

    const prompt = `
You are a professional ATS resume reviewer.

Compare the resume below against the job description and return a JSON response with exactly this structure:
{
  "score": <number 0-100>,
  "summary": "<2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "suggestions": [
    { "section": "<resume section>", "tip": "<specific actionable improvement>" }
  ]
}

Return ONLY the JSON. No markdown, no explanation.

JOB DESCRIPTION:
${job.jobDescription}

RESUME:
${resumeText}
    `.trim()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    })

    const raw = response.choices[0].message.content
    const analysis = JSON.parse(raw)

    // save match score to job
    await prisma.job.update({
      where: { id: jobId },
      data: { matchScore: analysis.score }
    })

    res.json({ analysis })
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ message: 'AI returned invalid response, try again' })
    }
    next(err)
  }
}

// ─── Cover Letter Generator ───────────────────────────────────

const generateCoverLetter = async (req, res, next) => {
  try {
    const { jobId, resumeText, tone = 'professional' } = req.body

    if (!jobId || !resumeText)
      return res.status(400).json({ message: 'jobId and resumeText are required' })

    const job = await prisma.job.findUnique({ where: { id: jobId } })

    if (!job)
      return res.status(404).json({ message: 'Job not found' })

    if (job.userId !== req.userId)
      return res.status(403).json({ message: 'Not authorized' })

    const prompt = `
Write a compelling, tailored cover letter for the following job application.

Tone: ${tone}
Company: ${job.company}
Role: ${job.role}

Job Description:
${job.jobDescription || `${job.role} position at ${job.company}`}

Candidate Resume:
${resumeText}

Instructions:
- Keep it to 3-4 paragraphs
- Open with a strong hook, not "I am applying for..."
- Reference specific requirements from the job description
- Highlight 2-3 relevant achievements from the resume
- Close with a clear call to action
- Do NOT include date, address headers, or "Sincerely" signature
- Return only the cover letter text, nothing else
    `.trim()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })

    const content = response.choices[0].message.content

    // auto save to cover letters
    const saved = await prisma.coverLetter.create({
      data: {
        jobTitle: job.role,
        company: job.company,
        content,
        userId: req.userId
      }
    })

    res.json({ coverLetter: saved })
  } catch (err) {
    next(err)
  }
}

// ─── Skill Gap Analysis ───────────────────────────────────────

const analyzeSkillGaps = async (req, res, next) => {
  try {
    const { jobId, resumeText } = req.body

    if (!jobId || !resumeText)
      return res.status(400).json({ message: 'jobId and resumeText are required' })

    const job = await prisma.job.findUnique({ where: { id: jobId } })

    if (!job)
      return res.status(404).json({ message: 'Job not found' })

    if (job.userId !== req.userId)
      return res.status(403).json({ message: 'Not authorized' })

    if (!job.jobDescription)
      return res.status(400).json({ message: 'Add a job description first' })

    const prompt = `
You are a career coach analyzing skill gaps between a candidate's resume and a job description.

Return a JSON response with exactly this structure:
{
  "requiredSkills": ["<skill 1>", "<skill 2>", ...],
  "candidateSkills": ["<skill 1>", "<skill 2>", ...],
  "missingSkills": ["<skill 1>", "<skill 2>", ...],
  "recommendations": [
    {
      "skill": "<missing skill>",
      "resource": "<specific course, project, or action to learn it>",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Return ONLY the JSON. No markdown, no explanation.

JOB DESCRIPTION:
${job.jobDescription}

RESUME:
${resumeText}
    `.trim()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    })

    const raw = response.choices[0].message.content
    const analysis = JSON.parse(raw)

    res.json({ analysis })
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ message: 'AI returned invalid response, try again' })
    }
    next(err)
  }
}

module.exports = { matchResume, generateCoverLetter, analyzeSkillGaps }