const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    fullName: String,
    age: Number,
    gender: String,
    address: String,
    bloodGroup: String,
    allergies: String,
    medicalConditions: String,
    emergencyName: String,
    emergencyPhone: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);