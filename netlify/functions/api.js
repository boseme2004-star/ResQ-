// netlify/functions/api.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

// 1. MIDDLEWARE
app.use(cors({
    origin: '*', // Allows all origins while we fix the 502 error
    credentials: true
}));
app.use(express.json());

// 2. MONGODB CONNECTION (Serverless friendly)
const MONGODB_URI = process.env.MONGODB_URI;
let cachedDb = null;

const connectToDatabase = async () => {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }
    if (!MONGODB_URI) {
        throw new Error("Missing MONGODB_URI environment variable");
    }
    // Note: No need for useNewUrlParser in newer Mongoose versions
    cachedDb = await mongoose.connect(MONGODB_URI);
    return cachedDb;
};

// 3. ROUTE IMPORTS 
// Note: 'routes' folder must be inside 'netlify/functions/'
const authRoutes = require('./routes/auth');
const sosRoutes = require('./routes/sos');

// 4. DB CONNECTION MIDDLEWARE
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        // This response helps you debug if the IP is the problem
        res.status(500).json({ 
            error: "Database Connection Failed", 
            message: "Ensure 0.0.0.0/0 is added to MongoDB Atlas Network Access.",
            details: err.message 
        });
    }
});

// 5. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);

// The route you were trying to visit
app.get('/api/hello', (req, res) => {
    res.json({ 
        status: 'Success', 
        message: 'Hello from ResQ+ API!',
        database: "Connected"
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is active' });
});

// 6. EXPORT FOR NETLIFY
module.exports.handler = serverless(app);