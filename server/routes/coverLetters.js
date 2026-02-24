const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const prisma = require('../prisma/client')

router.use(authMiddleware)

// get all cover letters
router.get('/', async (req, res, next) => {
  try {
    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ coverLetters })
  } catch (err) { next(err) }
})

// delete cover letter
router.delete('/:id', async (req, res, next) => {
  try {
    const cl = await prisma.coverLetter.findUnique({ where: { id: req.params.id } })
    if (!cl) return res.status(404).json({ message: 'Not found' })
    if (cl.userId !== req.userId) return res.status(403).json({ message: 'Not authorized' })
    await prisma.coverLetter.delete({ where: { id: req.params.id } })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

module.exports = router