const prisma = require('../prisma/client')

// ─── Get all jobs for logged-in user ─────────────────────────

const getJobs = async (req, res, next) => {
  try {
    const { status, industry, search } = req.query

    const where = { userId: req.userId }

    if (status) where.status = status
    if (industry) where.industry = industry
    if (search) {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } }
      ]
    }

    const jobs = await prisma.job.findMany({
      where,
      include: { interviews: true },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ jobs })
  } catch (err) {
    next(err)
  }
}

// ─── Get single job ───────────────────────────────────────────

const getJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { interviews: true }
    })

    if (!job)
      return res.status(404).json({ message: 'Job not found' })

    // make sure it belongs to the logged-in user
    if (job.userId !== req.userId)
      return res.status(403).json({ message: 'Not authorized' })

    res.json({ job })
  } catch (err) {
    next(err)
  }
}

// ─── Create job ───────────────────────────────────────────────

const createJob = async (req, res, next) => {
  try {
    const {
      company,
      role,
      status,
      notes,
      jobDescription,
      industry,
      appliedAt
    } = req.body

    if (!company || !role)
      return res.status(400).json({ message: 'Company and role are required' })

    const validStatuses = ['wishlist', 'applied', 'interview', 'offer', 'rejected']
    if (status && !validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' })

    // free plan limit — max 10 jobs
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true }
    })

    if (user.plan === 'free') {
      const count = await prisma.job.count({ where: { userId: req.userId } })
      if (count >= 10) {
        return res.status(403).json({
          message: 'Free plan is limited to 10 jobs. Upgrade to Pro for unlimited.',
          upgrade: true
        })
      }
    }

    const job = await prisma.job.create({
      data: {
        company,
        role,
        status: status || 'wishlist',
        notes,
        jobDescription,
        industry,
        appliedAt: appliedAt ? new Date(appliedAt) : null,
        userId: req.userId
      }
    })

    res.status(201).json({ job })
  } catch (err) {
    next(err)
  }
}

// ─── Update job ───────────────────────────────────────────────

const updateJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } })

    if (!job)
      return res.status(404).json({ message: 'Job not found' })

    if (job.userId !== req.userId)
      return res.status(403).json({ message: 'Not authorized' })

    const {
      company,
      role,
      status,
      notes,
      jobDescription,
      industry,
      appliedAt,
      responseAt,
      matchScore
    } = req.body

    const validStatuses = ['wishlist', 'applied', 'interview', 'offer', 'rejected']
    if (status && !validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' })

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        ...(company && { company }),
        ...(role && { role }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(jobDescription !== undefined && { jobDescription }),
        ...(industry !== undefined && { industry }),
        ...(appliedAt !== undefined && { appliedAt: appliedAt ? new Date(appliedAt) : null }),
        ...(responseAt !== undefined && { responseAt: responseAt ? new Date(responseAt) : null }),
        ...(matchScore !== undefined && { matchScore })
      },
      include: { interviews: true }
    })

    res.json({ job: updated })
  } catch (err) {
    next(err)
  }
}

// ─── Delete job ───────────────────────────────────────────────

const deleteJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } })

    if (!job)
      return res.status(404).json({ message: 'Job not found' })

    if (job.userId !== req.userId)
      return res.status(403).json({ message: 'Not authorized' })

    // delete interviews first (cascade)
    await prisma.interview.deleteMany({ where: { jobId: req.params.id } })
    await prisma.job.delete({ where: { id: req.params.id } })

    res.json({ message: 'Job deleted' })
  } catch (err) {
    next(err)
  }
}

// ─── Get job stats ────────────────────────────────────────────

const getStats = async (req, res, next) => {
  try {
    const userId = req.userId

    const [total, byStatus, recent] = await Promise.all([
      // total count
      prisma.job.count({ where: { userId } }),

      // count per status
      prisma.job.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),

      // last 5 jobs
      prisma.job.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          company: true,
          role: true,
          status: true,
          createdAt: true
        }
      })
    ])

    // shape the byStatus into a clean object
    const statusCounts = {
      wishlist: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0
    }
    byStatus.forEach(({ status, _count }) => {
      statusCounts[status] = _count.status
    })

    // calculate response rate (all non-wishlist jobs are "applied")
    const responded = statusCounts.interview + statusCounts.offer + statusCounts.rejected
    const totalApplied = statusCounts.applied + responded
    const responseRate = totalApplied > 0
      ? Math.round((responded / totalApplied) * 100)
      : 0

    res.json({
      total,
      statusCounts,
      responseRate,
      recent
    })
  } catch (err) {
    next(err)
  }
}

// ─── Add interview to a job ───────────────────────────────────

const addInterview = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } })

    if (!job)
      return res.status(404).json({ message: 'Job not found' })

    if (job.userId !== req.userId)
      return res.status(403).json({ message: 'Not authorized' })

    const { date, type, notes } = req.body

    if (!date || !type)
      return res.status(400).json({ message: 'Date and type are required' })

    const validTypes = ['phone', 'technical', 'onsite', 'final']
    if (!validTypes.includes(type))
      return res.status(400).json({ message: 'Invalid interview type' })

    const interview = await prisma.interview.create({
      data: {
        date: new Date(date),
        type,
        notes,
        jobId: req.params.id
      }
    })

    // auto update job status to interview
    await prisma.job.update({
      where: { id: req.params.id },
      data: { status: 'interview' }
    })

    res.status(201).json({ interview })
  } catch (err) {
    next(err)
  }
}

// ─── Update interview ─────────────────────────────────────────

const updateInterview = async (req, res, next) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.interviewId },
      include: { job: true }
    })

    if (!interview)
      return res.status(404).json({ message: 'Interview not found' })

    if (interview.job.userId !== req.userId)
      return res.status(403).json({ message: 'Not authorized' })

    const { date, type, notes } = req.body

    const updated = await prisma.interview.update({
      where: { id: req.params.interviewId },
      data: {
        ...(date && { date: new Date(date) }),
        ...(type && { type }),
        ...(notes !== undefined && { notes })
      }
    })

    res.json({ interview: updated })
  } catch (err) {
    next(err)
  }
}

// ─── Delete interview ─────────────────────────────────────────

const deleteInterview = async (req, res, next) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.interviewId },
      include: { job: true }
    })

    if (!interview)
      return res.status(404).json({ message: 'Interview not found' })

    if (interview.job.userId !== req.userId)
      return res.status(403).json({ message: 'Not authorized' })

    await prisma.interview.delete({ where: { id: req.params.interviewId } })

    res.json({ message: 'Interview deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getStats,
  addInterview,
  updateInterview,
  deleteInterview
}