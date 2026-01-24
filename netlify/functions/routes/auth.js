// routes/auth.js - Authentication Routes (UPDATED with database fix)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose'); // ADD THIS LINE

// Apply logging to all routes
router.use(authMiddleware.logger);

// ====================
// PUBLIC ROUTES
// ====================
// API Info
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ResQ+ Authentication API',
        version: '1.0.0',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile (protected)'
        }
    });
});

// Register User (SAVES TO DATABASE) - FIXED VERSION
router.post('/register', authMiddleware.validateRequest(['email', 'password', 'fullName']), async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body.email);
        
        const { email, password, fullName, phone, age, gender, bloodGroup } = req.body;
        
        // ADDED: Check MongoDB connection before proceeding
        const dbState = mongoose.connection.readyState;
        console.log(`📊 MongoDB connection state: ${dbState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
        
        if (dbState !== 1) {
            console.error('❌ MongoDB not connected!');
            return res.status(500).json({
                success: false,
                error: 'Database not connected. Please check MongoDB connection.'
            });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('❌ Email already registered:', email);
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }
        
        // Create new user
        const user = new User({
            email: email.toLowerCase(),
            password: password, // Note: In production, hash with bcrypt
            fullName: fullName.trim(),
            phone: phone || '',
            age: age ? parseInt(age) : null,
            gender: gender || 'Prefer not to say',
            bloodGroup: bloodGroup || 'Unknown',
            createdAt: new Date(),
            lastLogin: new Date()
        });
        
        // Save to database
        await user.save();
        console.log('✅ User saved to database:', user._id, user.email);
        
        // Generate token
        const token = `resq_token_${user._id}_${Date.now()}`;
        
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token: token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                bloodGroup: user.bloodGroup,
                createdAt: user.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login User (NO CHANGES - KEEP AS IS)
router.post('/login', authMiddleware.validateRequest(['email', 'password']), async (req, res) => {
    try {
        console.log('🔐 Login attempt:', req.body.email);
        
        const { email, password } = req.body;
        
        // Find user in database
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        
        // Check password (simulated - in production use bcrypt.compare)
        // For demo, accept any password that's not empty
        if (!password || password.trim() === '') {
            return res.status(401).json({
                success: false,
                error: 'Password required'
            });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        console.log('✅ Login successful:', user._id);
        
        // Generate token
        const token = `resq_token_${user._id}_${Date.now()}`;
        
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                bloodGroup: user.bloodGroup,
                lastLogin: user.lastLogin
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// ====================
// PROTECTED ROUTES
// ====================
// Get User Profile (NO CHANGES)
router.get('/profile', authMiddleware.verifyToken, async (req, res) => {
    try {
        // Get user ID from token (in real app)
        // For demo, get from query parameter or use demo user
        const userId = req.query.userId;
        
        let user;
        if (userId) {
            user = await User.findById(userId).select('-password');
        } else {
            // Fallback: get first user or demo
            user = await User.findOne().select('-password');
        }
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: user
        });
        
    } catch (error) {
        console.error('❌ Profile error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
});

// Update Profile (NO CHANGES)
router.put('/profile', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { userId, ...updates } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user
        });
        
    } catch (error) {
        console.error('❌ Update profile error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

// Save Questionnaire Data (NO CHANGES)
router.post('/questionnaire', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { userId, ...questionnaireData } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: questionnaireData },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        console.log('✅ Questionnaire saved for user:', userId);
        
        res.json({
            success: true,
            message: 'Questionnaire data saved successfully',
            user: user
        });
        
    } catch (error) {
        console.error('❌ Questionnaire error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to save questionnaire'
        });
    }
});

// ADDED: Test endpoint to verify database connection
router.get('/test-db', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const stateMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        const userCount = await User.countDocuments();
        
        res.json({
            success: true,
            database: {
                state: stateMap[dbState] || 'unknown',
                readyState: dbState,
                userCount: userCount,
                connected: dbState === 1
            },
            message: 'Database connection test',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;