// middleware/authMiddleware.js - Authentication Middleware
const authMiddleware = {
    // Verify JWT token
    verifyToken: (req, res, next) => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No valid token provided.'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        // For demo - accept any token
        // In production: verify with JWT library
        try {
            // Mock token verification
            req.user = {
                id: 'user_' + Date.now(),
                email: 'demo@resqplus.com',
                role: 'user'
            };
            
            console.log('🔐 Token accepted for user:', req.user.id);
            next();
            
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
    },
    
    // Validate request body
    validateRequest: (requiredFields = []) => {
        return (req, res, next) => {
            const missingFields = [];
            
            requiredFields.forEach(field => {
                if (!req.body[field] && req.body[field] !== 0) {
                    missingFields.push(field);
                }
            });
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required fields: ${missingFields.join(', ')}`
                });
            }
            
            next();
        };
    },
    
    // Request logger
    logger: (req, res, next) => {
        const start = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
        });
        
        next();
    },
    
    // Rate limiter (simple version)
    rateLimiter: {
        requests: {},
        limit: 100, // requests per window
        window: 15 * 60 * 1000, // 15 minutes
        
        check: (req, res, next) => {
            const ip = req.ip;
            const now = Date.now();
            
            if (!this.requests[ip]) {
                this.requests[ip] = [];
            }
            
            // Clean old requests
            this.requests[ip] = this.requests[ip].filter(time => now - time < this.window);
            
            if (this.requests[ip].length >= this.limit) {
                return res.status(429).json({
                    success: false,
                    error: 'Too many requests. Please try again later.'
                });
            }
            
            this.requests[ip].push(now);
            next();
        }
    }
};

module.exports = authMiddleware;