require('dotenv').config();
const express = require('express');
const passport = require('passport');
const connectDB = require('./src/config/db');

// Connect to database
connectDB();

const app = express();

const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport middleware
app.use(passport.initialize());
require('./src/config/passport')(passport);

// Routes
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

// Error handler (basic)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
