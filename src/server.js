const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
app.use(cors()); app.use(express.json({ limit: '100kb' })); app.use(morgan('dev'));
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth')); app.use('/api/listings', require('./routes/listings')); app.use('/api/ai', require('./routes/ai'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Something went wrong. Please try again.' : err.message });
});
// This entry-point edit also makes node --watch reload route dependencies.
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Campus Bazaar running at http://localhost:${port}${process.env.DATABASE_URL ? ' (PostgreSQL)' : ' (demo mode — data resets on restart)'}`));
