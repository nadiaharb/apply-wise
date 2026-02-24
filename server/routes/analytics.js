const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const prisma = require('../prisma/client')

router.use(authMiddleware)

router.get('/monthly', async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.userId },
      select: { createdAt: true, status: true }
    })

    // group by month
    const monthly = {}
    jobs.forEach(job => {
      const month = new Date(job.createdAt).toLocaleString('en-US', {
        month: 'short', year: 'numeric'
      })
      if (!monthly[month]) monthly[month] = { month, applied: 0, interviews: 0, offers: 0 }
      if (job.status === 'applied')   monthly[month].applied++
      if (job.status === 'interview') monthly[month].interviews++
      if (job.status === 'offer')     monthly[month].offers++
    })

    // sort chronologically
    const data = Object.values(monthly).sort(
      (a, b) => new Date(a.month) - new Date(b.month)
    )

    res.json({ data })
  } catch (err) {
    next(err)
  }
})

module.exports = router