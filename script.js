/ =========================================
// PWA SERVICE WORKER REGISTRATION
// =========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ ServiceWorker registered:', registration.scope);
      })
      .catch(error => {
        console.log('❌ ServiceWorker registration failed:', error);
      });
  });
}

// Detect if app is installed
window.addEventListener('appinstalled', () => {
  console.log('🎉 ResQ+ installed successfully!');
  localStorage.setItem('appInstalled', 'true');
});

// Check if in standalone mode (installed)
const isInStandaloneMode = () => {
  return (window.matchMedia('(display-mode: standalone)').matches) || 
         (window.navigator.standalone) || 
         document.referrer.includes('android-app://');
};

if (isInStandaloneMode()) {
  document.documentElement.classList.add('standalone-mode');
}
// script.js - ResQ+ Application Scripts (WITH SOS HISTORY FIX)
// =========================================
// BACKEND API CONFIGURATION
// =========================================
const API_BASE_URL = 'http://localhost:8080/api';

// API Service (NO CHANGES)
const ApiService = {
    async request(endpoint, method = 'GET', data = null) {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        };
        
        // Add authorization token if exists
        const token = localStorage.getItem('resq_token');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            console.log(`📡 API Call: ${method} ${url}`);
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error('❌ API Error:', error.message);
            // Fallback to localStorage
            return { success: false, offline: true, error: error.message };
        }
    },
    
    // Auth endpoints
    async register(userData) {
        return this.request('/auth/register', 'POST', userData);
    },
    
    async login(credentials) {
        return this.request('/auth/login', 'POST', credentials);
    },
    
    // SOS endpoints
    async sendSOS(sosData) {
        return this.request('/sos', 'POST', sosData);
    },
    
    async getSOSHistory(userId) {
        return this.request(`/sos/history/${userId}`);
    },
    
    // Profile endpoints
    async saveProfile(profileData) {
        return this.request('/auth/questionnaire', 'POST', profileData);
    },
    
    async getProfile(userId) {
        return this.request(`/auth/profile?userId=${userId}`);
    }
};

// Authentication helper (NO CHANGES)
const Auth = {
    getToken() {
        return localStorage.getItem('resq_token');
    },
    
    setToken(token) {
        localStorage.setItem('resq_token', token);
    },
    
    removeToken() {
        localStorage.removeItem('resq_token');
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // Add authorization header to requests
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// Hybrid Data Service (Backend + LocalStorage fallback) - NO CHANGES
const DataService = {
    // Save SOS (try backend first, fallback to localStorage)
    async saveSOS(sosData) {
        console.log('💾 Saving SOS...');
        
        // 1. Try backend
        const backendResult = await ApiService.sendSOS(sosData);
        
        if (backendResult.success) {
            console.log('✅ SOS saved to backend:', backendResult.alert);
            
            // Also save to localStorage for offline access
            const localHistory = JSON.parse(localStorage.getItem('sos_history') || '[]');
            localHistory.unshift({
                ...sosData,
                id: backendResult.alert.id || `local_${Date.now()}`,
                timestamp: new Date().toISOString(),
                source: 'backend'
            });
            localStorage.setItem('sos_history', JSON.stringify(localHistory));
            
            return backendResult;
        } else {
            // 2. Fallback to localStorage
            console.log('⚠️ Backend offline, saving to localStorage');
            
            const localHistory = JSON.parse(localStorage.getItem('sos_history') || '[]');
            const localSOS = {
                ...sosData,
                id: `local_${Date.now()}`,
                timestamp: new Date().toISOString(),
                source: 'local'
            };
            
            localHistory.unshift(localSOS);
            localStorage.setItem('sos_history', JSON.stringify(localHistory));
            
            return {
                success: true,
                offline: true,
                message: 'SOS saved locally (offline mode)',
                data: localSOS
            };
        }
    },
    
    // Get SOS history (combine backend + local)
    async getHistory(userId) {
        let backendHistory = [];
        
        // Try backend first
        try {
            const result = await ApiService.getSOSHistory(userId);
            if (result.success) {
                backendHistory = result.history || [];
            }
        } catch (error) {
            console.log('⚠️ Cannot fetch backend history:', error.message);
        }
        
        // Get local history
        const localHistory = JSON.parse(localStorage.getItem('sos_history') || '[]')
            .filter(item => !item.userId || item.userId === userId);
        
        // Combine and sort by timestamp
        const allHistory = [...backendHistory, ...localHistory]
            .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
        
        return {
            success: true,
            history: allHistory,
            backendCount: backendHistory.length,
            localCount: localHistory.length
        };
    },
    
    // Save user profile
    async saveProfile(profileData) {
        // Always save to localStorage first (immediate)
        localStorage.setItem('resq_user_profile', JSON.stringify(profileData));
        
        // Try to save to backend if we have userId
        if (profileData.userId) {
            try {
                const result = await ApiService.saveProfile(profileData);
                if (result.success) {
                    console.log('✅ Profile synced to backend:', result.user);
                    // Update localStorage with backend data
                    localStorage.setItem('resq_user_profile', JSON.stringify(result.user || profileData));
                }
            } catch (error) {
                console.log('⚠️ Profile saved locally only');
            }
        }
        
        return { success: true };
    },
    
    // Get user profile
    getProfile() {
        const profile = localStorage.getItem('resq_user_profile');
        return profile ? JSON.parse(profile) : null;
    }
};

// =========================================
// DATA: First Aid Content (NO CHANGES)
// =========================================
const emergencyGuides = {
    'allergic': {
        title: 'Allergic Reactions',
        icon: '🤧',
        steps: [
            'Remove the allergen if known',
            'Call emergency services immediately',
            'Use epinephrine injector if available',
            'Lay the person flat and raise legs',
            'Monitor breathing and pulse',
            'Be ready to start CPR if unconscious'
        ]
    },
    'heart-attack': {
        title: 'Heart Attack',
        icon: '❤️',
        steps: [
            'Call emergency services immediately',
            'Help the person sit and rest',
            'Loosen tight clothing',
            'Give aspirin to chew if not allergic',
            'Keep the person calm',
            'Monitor breathing until help arrives'
        ]
    },
    'stroke': {
        title: 'Stroke',
        icon: '🧠',
        steps: [
            'Check face for drooping',
            'Ask the person to raise both arms',
            'Check for slurred speech',
            'Call emergency services immediately',
            'Keep the person still and comfortable'
        ]
    },
    'asthma': {
        title: 'Asthma Attack',
        icon: '😮‍💨',
        steps: [
            'Help the person sit upright',
            'Use inhaler as prescribed',
            'Encourage slow, deep breathing',
            'Avoid lying flat',
            'Call emergency services if breathing worsens'
        ]
    },
    'seizures': {
        title: 'Seizures',
        icon: '⚡',
        steps: [
            'Clear objects around the person',
            'Protect the head with soft padding',
            'Do not restrain movements',
            'Do not put anything in the mouth',
            'Time the seizure',
            'Call emergency if it lasts more than 5 minutes'
        ]
    },
    'fainting': {
        title: 'Fainting',
        icon: '😵',
        steps: [
            'Lay the person flat on their back',
            'Raise legs above heart level',
            'Loosen tight clothing',
            'Check breathing',
            'Seek medical help if fainting repeats'
        ]
    },
    'burns': {
        title: 'Burns',
        icon: '🔥',
        steps: [
            'Cool the burn under running water for 20 minutes',
            'Remove tight items near the burn',
            'Cover with clean cling film',
            'Do not apply ice or creams',
            'Seek medical help if severe'
        ]
    },
    'bleeding': {
        title: 'Severe Bleeding',
        icon: '🩸',
        steps: [
            'Apply firm direct pressure',
            'Raise injured area if possible',
            'Use a clean bandage',
            'Do not remove embedded objects',
            'Call emergency services immediately'
        ]
    },
    'fractures': {
        title: 'Fractures',
        icon: '🦴',
        steps: [
            'Immobilize the injured area',
            'Apply ice wrapped in cloth',
            'Do not straighten the limb',
            'Support with padding',
            'Call emergency services'
        ]
    },
    'sprains': {
        title: 'Sprains',
        icon: '🤕',
        steps: [
            'Rest the injured limb',
            'Apply ice for 20 minutes',
            'Compress with bandage',
            'Elevate the limb',
            'Avoid strenuous activity'
        ]
    },
    'dislocation': {
        title: 'Dislocation',
        icon: '🦾',
        steps: [
            'Do not move the joint',
            'Immobilize with sling or padding',
            'Apply ice to reduce swelling',
            'Seek immediate medical help'
        ]
    },
    'fire': {
        title: 'Fire Safety',
        icon: '🧯',
        steps: [
            'Raise the alarm',
            'Evacuate immediately',
            'Stay low under smoke',
            'Call the fire department'
        ]
    },
    'floods': {
        title: 'Floods',
        icon: '🌊',
        steps: [
            'Move to higher ground',
            'Avoid flood water',
            'Turn off electricity if safe',
            'Follow emergency instructions'
        ]
    },
    'earthquake': {
        title: 'Earthquake',
        icon: '🌍',
        steps: [
            'Drop, cover, and hold',
            'Stay away from windows',
            'Exit after shaking stops',
            'Check for injuries'
        ]
    },
    'storm': {
        title: 'Severe Storm',
        icon: '⛈️',
        steps: [
            'Stay indoors',
            'Avoid windows',
            'Unplug electrical devices',
            'Follow weather updates'
        ]
    },
    'car-accident': {
        title: 'Car Accident',
        icon: '🚗',
        steps: [
            'Turn off the engine',
            'Check for injuries',
            'Call emergency services',
            'Do not move seriously injured persons'
        ]
    },
    'drowning': {
        title: 'Drowning',
        icon: '🏊',
        steps: [
            'Remove from water if safe',
            'Check breathing',
            'Start CPR immediately',
            'Call emergency services'
        ]
    }
};

// =========================================
// USER DATA MANAGEMENT (LocalStorage) - NO CHANGES
// =========================================
const UserData = {
    get: function() {
        const data = localStorage.getItem('resq_user_profile') || localStorage.getItem('resqplus_user_data');
        return data ? JSON.parse(data) : null;
    },
    
    set: function(data) {
        localStorage.setItem('resq_user_profile', JSON.stringify(data));
        localStorage.setItem('resqplus_user_data', JSON.stringify(data));
    },
    
    clear: function() {
        localStorage.removeItem('resq_user_profile');
        localStorage.removeItem('resqplus_user_data');
    },
    
    isRegistered: function() {
        return localStorage.getItem('resqplus_registered') === 'true';
    },
    
    markRegistered: function() {
        localStorage.setItem('resqplus_registered', 'true');
    }
};

// =========================================
// SOS HISTORY MANAGEMENT (LocalStorage) - NO CHANGES
// =========================================
const SOSHistory = {
    get: function() {
        const history = localStorage.getItem('resqplus_sos_history');
        return history ? JSON.parse(history) : [];
    },
    
    add: function() {
        const now = new Date();
        const event = {
            date: now.toLocaleDateString('en-GB'),
            time: now.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}),
            timestamp: now.toISOString()
        };
        
        const history = this.get();
        history.unshift(event);
        localStorage.setItem('resqplus_sos_history', JSON.stringify(history));
        
        return event;
    },
    
    clear: function() {
        localStorage.removeItem('resqplus_sos_history');
    }
};

// =========================================
// MAIN DOCUMENT READY FUNCTION - WITH HISTORY FIX
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if user is already logged in
    const token = localStorage.getItem('resq_token');
    const user = localStorage.getItem('resq_user');
    
    if (token && user) {
        console.log('✅ User already logged in');
        
        // If on login page, redirect to home
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('index.html')) {
            setTimeout(() => {
                if (UserData.isRegistered()) {
                    window.location.href = 'home.html';
                } else {
                    window.location.href = 'questionnaire.html';
                }
            }, 500);
        }
    }
    
    // --- 1. INDEX PAGE (index.html) ---
    const continueBtn = document.getElementById('myButton');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            continueBtn.innerHTML = 'Loading...';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
        });
    }

    // --- 2. LOGIN PAGE (login.html) ---
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && document.body.classList.contains('auth-page')) {
        // UPDATED LOGIN FUNCTION - USES REAL BACKEND (NO CHANGES)
        window.login = async function() {
            const email = document.getElementById('nameInput').value;
            const password = document.getElementById('passwordInput').value;
            
            if(!email || !password) { 
                alert('Please enter email and password.'); 
                return; 
            }
            
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            loginBtn.disabled = true;
            
            try {
                // Call real backend API
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }
                
                // Save token and user data
                localStorage.setItem('resq_token', data.token);
                localStorage.setItem('resq_user', JSON.stringify(data.user));
                localStorage.setItem('resq_user_id', data.user.id);
                
                console.log('✅ Login successful:', data.user.email);
                
                // Redirect based on registration status
                setTimeout(() => {
                    if (!UserData.isRegistered()) {
                        window.location.href = 'questionnaire.html';
                    } else {
                        window.location.href = 'home.html';
                    }
                }, 500);
                
            } catch (error) {
                console.error('❌ Login error:', error);
                alert('Login failed: ' + error.message);
                loginBtn.innerHTML = 'Login';
                loginBtn.disabled = false;
            }
        };
        
        window.continueWithoutAccount = function() {
            // Create a temporary guest user
            const guestUser = {
                id: 'guest_' + Date.now(),
                email: 'guest@resqplus.com',
                fullName: 'Guest User'
            };
            
            localStorage.setItem('resq_user', JSON.stringify(guestUser));
            localStorage.setItem('resq_user_id', guestUser.id);
            
            window.location.href = 'questionnaire.html';
        };
    }

    // --- 3. QUESTIONNAIRE PAGE (questionnaire.html) ---
    // UPDATED SAVE QUESTIONNAIRE FUNCTION - USES REAL BACKEND (NO CHANGES)
    window.saveQuestionnaire = async function() {
        const fullName = document.getElementById('fullName').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const address = document.getElementById('address').value;
        const bloodGroup = document.getElementById('bloodGroup').value;
        const allergies = document.getElementById('allergies').value;
        const conditions = document.getElementById('conditions').value;
        const emergencyName = document.getElementById('emergencyName').value;
        const emergencyPhone = document.getElementById('emergencyPhone').value;
        
        if (!fullName) {
            alert('Please enter your full name.');
            return;
        }
        
        // Get current user
        const storedUser = JSON.parse(localStorage.getItem('resq_user') || '{}');
        const userId = storedUser.id;
        
        if (!userId) {
            alert('Please login first.');
            window.location.href = 'login.html';
            return;
        }
        
        const submitBtn = document.querySelector('.submit-questionnaire');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to server...';
        submitBtn.disabled = true;
        
        try {
            // Prepare profile data
            const profileData = {
                userId: userId,
                fullName: fullName,
                age: age || null,
                gender: gender || '',
                address: address || '',
                bloodGroup: bloodGroup || '',
                allergies: allergies || 'None',
                medicalConditions: conditions || 'None',
                emergencyName: emergencyName || '',
                emergencyPhone: emergencyPhone || ''
            };
            
            // Save using DataService (tries backend first, falls back to localStorage)
            const result = await DataService.saveProfile(profileData);
            
            if (result.success) {
                // Mark as registered
                UserData.markRegistered();
                
                alert('✅ Profile saved successfully!');
                
                // Redirect to home
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            } else {
                throw new Error('Failed to save profile');
            }
            
        } catch (error) {
            console.error('❌ Save error:', error);
            alert('Save failed: ' + error.message + '\nSaving locally instead.');
            
            // Fallback to localStorage only
            const userData = {
                userId: userId,
                fullName: fullName,
                age: age || 'Not provided',
                gender: gender || 'Not provided',
                address: address || 'Not provided',
                bloodGroup: bloodGroup || 'Not provided',
                allergies: allergies || 'None',
                conditions: conditions || 'None',
                emergencyName: emergencyName || 'Not provided',
                emergencyPhone: emergencyPhone || 'Not provided',
                completedAt: new Date().toISOString()
            };
            
            UserData.set(userData);
            UserData.markRegistered();
            
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Saved Locally';
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        }
    };

    // --- 4. HOME PAGE (home.html) ---
    window.triggerSOS = async function() {
        const sosBtn = document.getElementById('sosButton');
        if (!sosBtn) return;
        
        if (!confirm('🚨 CONFIRM EMERGENCY ALERT?\n\nThis will send your location to emergency services.')) {
            return;
        }
        
        // Get user data
        const storedUser = JSON.parse(localStorage.getItem('resq_user') || '{}');
        const userProfile = DataService.getProfile();
        const userId = storedUser.id || userProfile?.userId || `user_${Date.now()}`;
        const userName = userProfile?.fullName || storedUser.fullName || 'Emergency User';
        
        // Prepare SOS data
        const sosData = {
            userId: userId,
            userName: userName,
            location: 'Emana, Yaoundé', // In real app, get from GPS
            emergencyType: 'Medical',
            coordinates: {
                latitude: 3.8480,
                longitude: 11.5021
            }
        };
        
        // Visual feedback
        sosBtn.style.background = '#ff4444';
        sosBtn.innerHTML = '<div class="sos-content"><i class="fas fa-spinner fa-spin sos-icon"></i><span class="sos-label">SENDING...</span></div>';
        sosBtn.disabled = true;
        
        try {
            // Save SOS using DataService
            const result = await DataService.saveSOS(sosData);
            
            if (result.success) {
                // Success
                sosBtn.style.background = '#2ecc71';
                sosBtn.innerHTML = '<div class="sos-content"><i class="fas fa-check sos-icon"></i><span class="sos-label">SOS SENT</span></div>';
                
                // Show alert based on source
                if (result.offline) {
                    alert('⚠️ SOS SAVED OFFLINE\n\nYour emergency alert has been saved locally. It will sync when you have internet.');
                } else {
                    alert(`🚨 EMERGENCY ALERT SENT!\n\nTracking Code: ${result.alert?.trackingCode || 'N/A'}\nHelp is on the way!`);
                }
                
                // Update history page if open
                if (typeof loadHistory === 'function') {
                    loadHistory();
                }
            } else {
                throw new Error('Failed to save SOS');
            }
            
        } catch (error) {
            // Error
            sosBtn.style.background = '#ff9500';
            sosBtn.innerHTML = '<div class="sos-content"><i class="fas fa-exclamation-triangle sos-icon"></i><span class="sos-label">ERROR</span></div>';
            alert('❌ Failed to send SOS. Please try again.');
            
        } finally {
            // Reset button after 3 seconds
            setTimeout(() => {
                sosBtn.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
                sosBtn.innerHTML = '<div class="sos-content"><i class="fas fa-exclamation-triangle sos-icon"></i><span class="sos-label">SOS EMERGENCY</span></div>';
                sosBtn.disabled = false;
            }, 3000);
        }
    };
    
    window.findHospitals = function() {
        alert('Opening Maps to find nearest hospital...');
        window.open('https://www.google.com/maps/search/hospital/', '_blank');
    };

    // --- 5. HISTORY PAGE (history.html) - FIXED VERSION ---
    window.loadHistory = async function() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        // Show loading state
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading history...</p>
            </div>
        `;
        
        // Get user ID
        const storedUser = JSON.parse(localStorage.getItem('resq_user') || '{}');
        const userProfile = DataService.getProfile();
        const userId = storedUser.id || userProfile?.userId;
        
        if (!userId) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-user-slash"></i>
                    <p>Please login to view history</p>
                    <p class="empty-sub">Login to see your SOS events</p>
                </div>
            `;
            return;
        }
        
        try {
            // DIRECT API CALL (not through DataService for now)
            console.log(`📡 Loading history for user: ${userId}`);
            
            const response = await fetch(`http://localhost:8080/api/sos/history/${userId}`);
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to load history');
            }
            
            if (!result.history || result.history.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-history">
                        <i class="fas fa-history"></i>
                        <p>No SOS events recorded yet</p>
                        <p class="empty-sub">Press the SOS button on home page to create your first event</p>
                    </div>
                `;
                return;
            }
            
            // Display history from database
            let html = '';
            result.history.forEach((item, index) => {
                const date = new Date(item.createdAt || item.timestamp);
                const formattedDate = date.toLocaleDateString('en-GB');
                const formattedTime = date.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Create history item HTML
                html += `
                    <div class="history-item">
                        <div class="history-header">
                            <div class="history-type">${item.emergencyType || 'Emergency'}</div>
                            <div class="history-status ${item.status || 'active'}">${item.status || 'active'}</div>
                        </div>
                        <div class="history-date-time">${formattedDate} at ${formattedTime}</div>
                        <div class="history-location">📍 ${item.location || 'Unknown location'}</div>
                        <div class="history-id">ID: ${item.id?.toString().substring(0, 12)}...</div>
                    </div>
                `;
            });
            
            historyList.innerHTML = html;
            
            console.log(`✅ Loaded ${result.history.length} SOS records from database`);
            
        } catch (error) {
            console.error('❌ History load error:', error);
            
            // Fallback: Check localStorage
            const localHistory = JSON.parse(localStorage.getItem('sos_history') || '[]')
                .filter(item => item.userId === userId);
            
            if (localHistory.length > 0) {
                let html = '';
                localHistory.forEach(item => {
                    const date = new Date(item.timestamp);
                    const formattedDate = date.toLocaleDateString('en-GB');
                    const formattedTime = date.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    html += `
                        <div class="history-item offline">
                            <div class="history-date-time">${formattedDate} at ${formattedTime}</div>
                            <div class="history-location">📍 ${item.location || 'Local Save'}</div>
                            <div class="history-offline">📱 Offline (Not Synced)</div>
                        </div>
                    `;
                });
                historyList.innerHTML = html;
            } else {
                historyList.innerHTML = `
                    <div class="empty-history">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Could not load history</p>
                        <p class="empty-sub">${error.message || 'Please try again later'}</p>
                    </div>
                `;
            }
        }
    };
    
    window.clearHistory = function() {
        if(confirm('Are you sure you want to clear all SOS history?')) {
            SOSHistory.clear();
            localStorage.removeItem('sos_history');
            if (typeof loadHistory === 'function') {
                loadHistory();
            }
            alert('History cleared successfully.');
        }
    };
    
    // Load history on page load
    if (window.location.pathname.includes('history.html')) {
        setTimeout(loadHistory, 100);
    }

    // --- 6. FIRST AID PAGE (firstaid.html) - NO CHANGES ---
    const searchInput = document.getElementById('guideSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.guide-item');
            
            items.forEach(item => {
                const name = item.querySelector('.guide-name').innerText.toLowerCase();
                item.style.display = name.includes(term) ? 'block' : 'none';
            });
        });
    }

    const modal = document.getElementById('guideModal');
    
    window.openGuide = function(key) {
        const data = emergencyGuides[key];
        if(!data || !modal) return;
        
        const contentDiv = document.getElementById('modalContent');
        
        let stepsHtml = data.steps.map((s, i) => 
            `<div class="step-item"><strong>Step ${i+1}:</strong> ${s}</div>`
        ).join('');

        contentDiv.innerHTML = `
            <div style="text-align:center; font-size: 50px; margin-bottom:15px">${data.icon}</div>
            <h2 style="color:#4fc3f7; text-align:center; margin-bottom:20px">${data.title}</h2>
            <div>${stepsHtml}</div>
            <div style="margin-top:20px; font-size:12px; color:#aaa; text-align:center">Always call professional help for serious injuries.</div>
        `;
        
        modal.style.display = 'block';
    };

    window.closeModal = function() {
        if(modal) modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // --- 7. PROFILE PAGE (profile.html) - NO CHANGES ---
    if (window.location.pathname.includes('profile.html')) {
        // Try to get latest data
        const userProfile = DataService.getProfile();
        const storedUser = JSON.parse(localStorage.getItem('resq_user') || '{}');
        
        // Combine data
        const userData = {
            ...storedUser,
            ...userProfile
        };
        
        if (userData.fullName || storedUser.fullName) {
            // Update profile fields with user data
            document.getElementById('profileName').textContent = userData.fullName || storedUser.fullName || 'User';
            document.getElementById('profileAge').textContent = userData.age || storedUser.age || 'Not provided';
            document.getElementById('profileGender').textContent = userData.gender || storedUser.gender || 'Not provided';
            document.getElementById('profileBlood').textContent = userData.bloodGroup || storedUser.bloodGroup || 'Not provided';
            document.getElementById('profileAllergies').textContent = userData.allergies || storedUser.allergies || 'None';
            document.getElementById('profileConditions').textContent = userData.medicalConditions || userData.conditions || storedUser.conditions || 'None';
            
            const contactText = (userData.emergencyName && userData.emergencyPhone) 
                ? `${userData.emergencyName} (${userData.emergencyPhone})`
                : (storedUser.emergencyName && storedUser.emergencyPhone)
                ? `${storedUser.emergencyName} (${storedUser.emergencyPhone})`
                : 'Not provided';
            document.getElementById('profileContact').textContent = contactText;
            
            document.getElementById('profileAddress').textContent = userData.address || storedUser.address || 'Not provided';
        }
    }
    
    window.editProfile = function() {
        window.location.href = 'questionnaire.html';
    };
    
    window.logout = function() {
        if(confirm('Are you sure you want to log out?')) {
            // Clear all auth data
            localStorage.removeItem('resq_token');
            localStorage.removeItem('resq_user');
            localStorage.removeItem('resq_user_id');
            localStorage.removeItem('resqplus_registered');
            window.location.href = 'index.html';
        }
    };

    // --- 8. NAVIGATION ACTIVE STATE - NO CHANGES ---
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
