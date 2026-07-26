require("dotenv").config();

const express = require("express");
const passport = require("passport");
const cors = require("cors");

const connectDB = require("./src/config/db");

// Connect to MongoDB
connectDB();

const app = express();

// CORS Configuration

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VITE_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser (IMPORTANT)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Passport

app.use(passport.initialize());
require("./src/config/passport")(passport);


// Routes

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));


// Error Handler

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});


// Start Server

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;