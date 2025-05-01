const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const morgan = require('morgan');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const TRUST_PROXIES = Number(process.env.TRUST_PROXIES) || 1;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 10;
const RATE_LIMIT_WINDOW_MINUTES = Number(process.env.RATE_LIMIT_WINDOW_MS) || 1;
const REASONS_URL = process.env.REASONS_URL || 'https://raw.githubusercontent.com/hotheadhacker/no-as-a-service/refs/heads/main/reasons.json';

// Trust proxies for rate limiting
app.set('trust proxy', TRUST_PROXIES);

// Middleware to log requests
app.use(morgan('combined'));

// Rate limiter: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000 * RATE_LIMIT_WINDOW_MINUTES, // 1 minute
  max: RATE_LIMIT_MAX,
  message: { reason: "The answer is still no, please stop asking for a while." }
});

// Random rejection reason endpoint
app.get('/no', limiter, (req, res) => {
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  res.json({ reason });
});

app.get('/', (req, res) => {
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  fs.readFile('./frontend/no.html', 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading index.html');
    }
    res.send(data);
  });
});

// Serve static files from the frontend directory
app.use('/frontend', express.static('frontend/public'));

// Load reasons from JSON
const response = await fetch(REASONS_URL);
const reasons = [];

if (!response.ok) {
  console.error(`Failed to fetch reasons: ${response.statusText}, using local file as fallback`);
  reasons = JSON.parse(fs.readFileSync('./reasons.json', 'utf-8'));
} else {
  console.log(`Fetched reasons from ${REASONS_URL}`);
  const reasonsJson = await response.json();
  reasons = reasonsJson.reasons;
}

// Start server
app.listen(PORT, () => {
  console.log(`No-as-a-Service is running on port ${PORT}`);
  console.log('Log format:');
  console.log(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');
});
