const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.post('/suggestion', requireAuth, (req, res) => {
  const { title = 'your item', category = 'Other', condition = 'Good' } = req.body;
  const base = { Books: 450, Electronics: 4200, Furniture: 1600, Clothing: 550, Gaming: 1800, Other: 800 }[category] || 800;
  const multiplier = { New: 1.15, 'Like new': 1, Good: .75, Fair: .55 }[condition] || .75;
  const price = Math.round((base * multiplier) / 50) * 50;
  res.json({ suggestedPrice: price, description: `${title} in ${condition.toLowerCase()} condition. A campus-friendly ${category.toLowerCase()} listing, ready for a quick and convenient handover.` });
});
module.exports = router;
