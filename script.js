// DATA: First Aid Content
const emergencyGuides = {

    /* ================= MEDICAL ================= */

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

    'diabetes-low': {
        title: 'Low Blood Sugar',
        icon: '🍬',
        steps: [
            'Give sugar, honey, or sweet drink',
            'Wait 15 minutes',
            'Repeat if symptoms persist',
            'Do not give food if unconscious',
            'Call emergency services if no improvement'
        ]
    },

    'diabetes-high': {
        title: 'High Blood Sugar',
        icon: '🧃',
        steps: [
            'Give water to drink',
            'Encourage rest',
            'Check insulin use if known',
            'Monitor symptoms closely',
            'Seek urgent medical help'
        ]
    },

    'heat-exhaustion': {
        title: 'Heat Exhaustion',
        icon: '☀️',
        steps: [
            'Move to a cool shaded area',
            'Loosen or remove excess clothing',
            'Give cool water slowly',
            'Apply cool cloths to skin',
            'Rest until fully recovered'
        ]
    },

    'heatstroke': {
        title: 'Heat Stroke',
        icon: '🔥',
        steps: [
            'Call emergency services immediately',
            'Move to a cooler place',
            'Cool the body rapidly with water',
            'Remove excess clothing',
            'Do not give fluids if unconscious'
        ]
    },

    'hypothermia': {
        title: 'Hypothermia',
        icon: '❄️',
        steps: [
            'Move the person to warm shelter',
            'Remove wet clothing',
            'Wrap in dry blankets',
            'Warm gradually',
            'Call emergency services'
        ]
    },

    'poisoning': {
        title: 'Poisoning',
        icon: '☠️',
        steps: [
            'Do not induce vomiting',
            'Identify the poison if possible',
            'Call poison control or emergency services',
            'Keep the person still',
            'Follow medical instructions carefully'
        ]
    },

    'unconscious': {
        title: 'Unconscious Person',
        icon: '🛌',
        steps: [
            'Check breathing and pulse',
            'Call emergency services immediately',
            'Place in recovery position if breathing',
            'Do not give food or drink',
            'Monitor continuously'
        ]
    },

    'child-fever': {
        title: 'Child Fever',
        icon: '🌡️',
        steps: [
            'Remove excess clothing',
            'Give plenty of fluids',
            'Monitor temperature regularly',
            'Give medication if prescribed',
            'See a doctor if fever persists'
        ]
    },

    /* ================= INJURY ================= */

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

    'minor-cuts': {
        title: 'Minor Cuts',
        icon: '✂️',
        steps: [
            'Wash hands',
            'Clean wound with water',
            'Apply antiseptic',
            'Cover with sterile bandage'
        ]
    },

    'nosebleed': {
        title: 'Nosebleed',
        icon: '👃',
        steps: [
            'Sit upright and lean forward',
            'Pinch nose for 10 minutes',
            'Breathe through mouth',
            'Avoid tilting head back',
            'Seek help if bleeding continues'
        ]
    },

    'eye-injury': {
        title: 'Eye Injury',
        icon: '👁️',
        steps: [
            'Do not rub the eye',
            'Rinse gently with clean water',
            'Cover eye lightly',
            'Seek medical care immediately'
        ]
    },

    'head-injury': {
        title: 'Head Injury',
        icon: '🧠',
        steps: [
            'Keep the person still',
            'Apply ice to swelling',
            'Monitor consciousness',
            'Do not give food or drink',
            'Seek medical evaluation'
        ]
    },

    'electric-shock': {
        title: 'Electric Shock',
        icon: '⚡',
        steps: [
            'Turn off the power source',
            'Do not touch the victim directly',
            'Call emergency services',
            'Begin CPR if trained and needed'
        ]
    },

    /* ================= DISASTER & ACCIDENT ================= */

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

    'landslide': {
        title: 'Landslide',
        icon: '⛰️',
        steps: [
            'Move away quickly',
            'Avoid valleys and slopes',
            'Listen for emergency alerts'
        ]
    },

    'lightning': {
        title: 'Lightning Strike',
        icon: '⚡',
        steps: [
            'Call emergency services',
            'Check breathing and pulse',
            'Start CPR if needed',
            'Treat burns if present'
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

    'building-collapse': {
        title: 'Building Collapse',
        icon: '🏚️',
        steps: [
            'Protect your head',
            'Move carefully',
            'Avoid unstable structures',
            'Call emergency services'
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
    },

    'snake-bite': {
        title: 'Snake Bite',
        icon: '🐍',
        steps: [
            'Keep the person calm and still',
            'Immobilize the bitten limb',
            'Do not suck venom',
            'Call emergency services immediately'
        ]
    },

    'dog-bite': {
        title: 'Dog Bite',
        icon: '🐕',
        steps: [
            'Wash wound with soap and water',
            'Stop bleeding',
            'Apply antiseptic',
            'Seek medical care'
        ]
    },

    'insect-sting': {
        title: 'Insect Sting',
        icon: '🐝',
        steps: [
            'Remove stinger if present',
            'Wash the area',
            'Apply ice',
            'Watch for allergic reaction'
        ]
    },

    'jellyfish': {
        title: 'Jellyfish Sting',
        icon: '🪼',
        steps: [
            'Rinse with vinegar or seawater',
            'Do not rub the area',
            'Remove tentacles carefully',
            'Seek medical help if pain persists'
        ]
    }

};

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. LOGIN LOGIC (login.html) ---
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        window.login = function() {
            const user = document.getElementById('nameInput').value;
            const pass = document.getElementById('passwordInput').value;
            
            if(!user || !pass) { 
                alert('Please enter your name and password.'); 
                return; 
            }
            
            loginBtn.innerHTML = 'Signing in...';
            // Simulate network delay then redirect
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        };
    }

    // --- 2. INDEX LOGIC (index.html) ---
    const continueBtn = document.getElementById('myButton');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            continueBtn.innerHTML = 'Loading...';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
        });
    }

    // --- 3. DASHBOARD LOGIC (home.html) ---
    window.triggerSOS = function() {
        const sosBtn = document.getElementById('sosButton');
        if(sosBtn) {
            if(confirm('🚨 CONFIRM EMERGENCY ALERT?\n\nThis will simulate contacting 112 and your family.')) {
                // Visual feedback
                sosBtn.style.background = '#2ecc71'; // Green
                sosBtn.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center"><i class="fas fa-check" style="font-size:40px"></i><span style="font-size:24px;margin-top:5px">SENT</span></div>';
                
                // Simulate call
                window.location.href = 'tel:112'; 
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    sosBtn.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
                    sosBtn.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center"><i class="fas fa-exclamation-triangle sos-icon"></i><span class="sos-label">SOS</span></div>';
                    alert('Alert simulated successfully. Help is on the way.');
                }, 3000);
            }
        }
    };
    
    window.findHospitals = function() {
        alert('Opening Maps to find nearest hospital...');
        // Opens Google Maps searching for hospitals near user
        window.open('https://www.google.com/maps/search/hospital/', '_blank');
    };

    // --- 4. FIRST AID LOGIC (firstaid.html) ---
    
    // Search Filter
    const searchInput = document.getElementById('guideSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.guide-item');
            
            items.forEach(item => {
                const name = item.querySelector('.guide-name').innerText.toLowerCase();
                // Show/Hide based on match
                item.style.display = name.includes(term) ? 'block' : 'none';
            });
        });
    }

    // Modal Logic
    const modal = document.getElementById('guideModal');
    
    window.openGuide = function(key) {
        const data = emergencyGuides[key];
        if(!data || !modal) return;
        
        const contentDiv = document.getElementById('modalContent');
        
        // Build steps HTML
        let stepsHtml = data.steps.map((s, i) => 
            `<div class="step-item"><strong>Step ${i+1}:</strong> ${s}</div>`
        ).join('');

        // Inject content
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

    // Close modal if clicking outside box
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});
   
