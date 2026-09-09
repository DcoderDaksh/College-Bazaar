const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const sign = (user) => jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'development-only-secret-change-me', { expiresIn: '7d' });
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, college: user.college });

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, college } = req.body;
    if (!name || !email || !password || !college) return res.status(400).json({ error: 'Name, email, password, and college are required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });
    const user = await prisma.user.create({ data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash: await bcrypt.hash(password, 12), college: college.trim() } });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: (email || '').toLowerCase().trim() } });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ error: 'Incorrect email or password.' });
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try { const user = await prisma.user.findUnique({ where: { id: req.user.id } }); res.json({ user: publicUser(user) }); } catch (error) { next(error); }
});
module.exports = router;
