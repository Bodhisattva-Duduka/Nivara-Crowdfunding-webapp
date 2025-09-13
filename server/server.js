const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ Serve uploads folder (important!)
// Serve uploads safely (no folder listing, only file access if path is known)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  index: false, // ❌ disables directory index
  redirect: false,
}));


// ✅ Serve client folder
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/donations', require('./routes/donations'));

// Root route
app.get('/', (req, res) => {
  res.send('Nivara FundHope API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
