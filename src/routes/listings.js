const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
const includeSeller = { seller: { select: { id: true, name: true, college: true } } };

router.get('/', async (req, res, next) => {
  try {
    const { q, category, college, mine } = req.query;
    const where = { status: 'ACTIVE', ...(category ? { category } : {}), ...(college ? { seller: { college } } : {}), ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}) };
    if (mine === 'true' && req.headers.authorization) { try { const jwt = require('jsonwebtoken'); where.sellerId = jwt.verify(req.headers.authorization.replace(/^Bearer\s+/i, ''), process.env.JWT_SECRET || 'development-only-secret-change-me').id; } catch {} }
    res.json({ listings: await prisma.listing.findMany({ where, include: includeSeller, orderBy: { createdAt: 'desc' }, take: 50 }) });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, description, price, category, condition, emoji } = req.body;
    if (!title || !description || !price || !category || !condition) return res.status(400).json({ error: 'Please complete every listing field.' });
    const listing = await prisma.listing.create({ data: { title: title.trim(), description: description.trim(), price: Number(price), category, condition, emoji: emoji || '📦', sellerId: req.user.id }, include: includeSeller });
    res.status(201).json({ listing });
  } catch (error) { next(error); }
});

router.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.sellerId !== req.user.id) return res.status(403).json({ error: 'You can only update your own listings.' });
    res.json({ listing: await prisma.listing.update({ where: { id: listing.id }, data: { status: req.body.status }, include: includeSeller }) });
  } catch (error) { next(error); }
});
module.exports = router;
