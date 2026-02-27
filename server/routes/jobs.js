const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getStats,
  addInterview,
  updateInterview,
  deleteInterview
} = require('../controllers/jobsController')

// all routes protected
router.use(authMiddleware)


router.get('/stats', getStats)

// jobs CRUD
router.get('/', getJobs)
router.get('/:id', getJob)
router.post('/', createJob)
router.patch('/:id', updateJob)
router.delete('/:id', deleteJob)

// interviews
router.post('/:id/interviews', addInterview)
router.patch('/:id/interviews/:interviewId', updateInterview)
router.delete('/:id/interviews/:interviewId', deleteInterview)

module.exports = router