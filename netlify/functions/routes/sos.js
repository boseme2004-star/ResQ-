// routes/sos.js - SOS Emergency Routes (SIMPLIFIED WITH HISTORY FIX)
const express = require('express');
const router = express.Router();
const SOS = require('../models/SOS');
const authMiddleware = require('../middleware/authMiddleware');

// Apply logging
router.use(authMiddleware.logger);

// ====================
// PUBLIC ROUTES
// ====================
// API Info
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ResQ+ SOS Emergency API',
        version: '1.0.0',
        endpoints: {
            sendSOS: 'POST /api/sos',
            getHistory: 'GET /api/sos/history/:userId',
            getSOS: 'GET /api/sos/:id'
        }
    });
});

// Send SOS Emergency (NO CHANGES)
router.post('/', async (req, res) => {
    try {
        const { userId, userName, location, emergencyType, coordinates } = req.body;
        
        // Simple validation
        if (!userId || !location) {
            return res.status(400).json({
                success: false,
                error: 'User ID and location are required'
            });
        }
        
        // Create SOS
        const sos = new SOS({
            userId: userId.toString(),
            userName: userName || 'Anonymous User',
            location: location,
            emergencyType: emergencyType || 'Medical',
            coordinates: coordinates || null,
            status: 'active'
        });
        
        await sos.save();
        
        console.log(`🚨 SOS #${sos._id} saved for user: ${userId}`);
        
        res.status(201).json({
            success: true,
            message: 'SOS emergency sent successfully',
            alert: {
                id: sos._id,
                trackingCode: `RESQ-${sos._id.toString().slice(-6).toUpperCase()}`,
                location: sos.location,
                emergencyType: sos.emergencyType,
                status: sos.status,
                createdAt: sos.createdAt
            }
        });
        
    } catch (error) {
        console.error('SOS save error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to save SOS',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get SOS History for User - FIXED VERSION
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        
        console.log(`📋 Fetching SOS history for user ID: ${userId}`);
        
        // FIX: Convert userId to String to match database format
        const history = await SOS.find({ userId: userId.toString() })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        
        console.log(`✅ Found ${history.length} SOS records for user ${userId}`);
        
        // Format response to include all necessary fields
        const formattedHistory = history.map(sos => ({
            id: sos._id,
            userId: sos.userId,
            userName: sos.userName || 'User',
            emergencyType: sos.emergencyType || 'Medical',
            location: sos.location || 'Unknown Location',
            status: sos.status || 'active',
            createdAt: sos.createdAt,
            resolvedAt: sos.resolvedAt,
            timestamp: sos.createdAt // Added for frontend compatibility
        }));
        
        res.json({
            success: true,
            message: 'SOS history retrieved successfully',
            userId: userId,
            count: formattedHistory.length,
            history: formattedHistory
        });
        
    } catch (error) {
        console.error('❌ History error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve history',
            details: error.message
        });
    }
});

// Get Specific SOS (NO CHANGES)
router.get('/:id', async (req, res) => {
    try {
        const sos = await SOS.findById(req.params.id).lean();
        
        if (!sos) {
            return res.status(404).json({
                success: false,
                error: 'SOS alert not found'
            });
        }
        
        res.json({
            success: true,
            sos: {
                id: sos._id,
                userId: sos.userId,
                userName: sos.userName,
                emergencyType: sos.emergencyType,
                location: sos.location,
                status: sos.status,
                createdAt: sos.createdAt,
                resolvedAt: sos.resolvedAt
            }
        });
        
    } catch (error) {
        console.error('Get SOS error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve SOS'
        });
    }
});

// Update SOS Status (NO CHANGES)
router.put('/:id/status', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const updateData = { status };
        if (status === 'resolved') updateData.resolvedAt = new Date();
        
        const sos = await SOS.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).lean();
        
        if (!sos) {
            return res.status(404).json({
                success: false,
                error: 'SOS alert not found'
            });
        }
        
        res.json({
            success: true,
            message: `SOS status updated to ${status}`,
            sos: {
                id: sos._id,
                status: sos.status,
                resolvedAt: sos.resolvedAt
            }
        });
        
    } catch (error) {
        console.error('Update status error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update status'
        });
    }
});

// ADDED: Test endpoint to check SOS collection
router.get('/test/sos-collection', async (req, res) => {
    try {
        const count = await SOS.countDocuments();
        const sample = await SOS.find().limit(5).lean();
        
        res.json({
            success: true,
            collection: 'SOS',
            count: count,
            sample: sample,
            message: 'SOS collection test successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;