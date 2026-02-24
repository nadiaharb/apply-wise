const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { matchResume, generateCoverLetter, analyzeSkillGaps } = require('../controllers/aiController')

router.use(authMiddleware)

router.post('/match', matchResume)
router.post('/cover-letter', generateCoverLetter)
router.post('/skill-gaps', analyzeSkillGaps)

module.exports = router