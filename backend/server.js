const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Simple root route for testing
app.get('/', (req, res) => {
  res.send('VajraLink Backend is running.');
});

app.listen(PORT, () => {
  console.log(`VajraLink backend server is running on http://localhost:${PORT}`);
});
