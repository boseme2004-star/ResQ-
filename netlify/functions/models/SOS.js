// models/SOS.js - SIMPLIFIED WORKING VERSION
const mongoose = require('mongoose');

const SOSSchema = new mongoose.Schema({
    // User Information
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    
    // Emergency Details
    emergencyType: {
        type: String,
        required: true,
        default: 'Medical'
    },
    description: String,
    
    // Location
    location: {
        type: String,
        required: true
    },
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    
    // Status
    status: {
        type: String,
        default: 'active'
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: Date
});

// Simple index
SOSSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SOS', SOSSchema);