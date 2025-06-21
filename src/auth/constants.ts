export const jwtConstants = {
    secret: process.env.SESSION_SECRET || 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT!, 10) || 3600000, // Default to 1 hour if not set
    frontendAuthSuccessRedirect: process.env.FRONTEND_AUTH_SUCCESS_REDIRECT || 'http://localhost:5173/dashboard',
    frontendAuthFailureRedirect: process.env.FRONTEND_AUTH_FAILURE_REDIRECT || 'http://localhost:5173/login',
    throttleTtl: parseInt(process.env.THROTTLE_TTL!, 10) || 60000, // Default to 1 minute
    throttleLimit: parseInt(process.env.THROTTLE_LIMIT!, 10) || 30, // Default to 30 requests
};
