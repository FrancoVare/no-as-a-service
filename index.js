const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Load reasons from JSON
const reasons = JSON.parse(fs.readFileSync('./reasons.json', 'utf-8'));

// Middleware to log requests
app.use(morgan('combined'));

// Rate limiter: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many requests, please try again later." }
});

app.use(limiter);

// Random rejection reason endpoint
app.get('/no', (req, res) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`No-as-a-Service is running on port ${PORT}`);
  console.log('Log format:');
  console.log(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');
});
