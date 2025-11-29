const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
// Configure CORS to allow Authorization header and common methods
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Simple request logger to help debug incoming requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} -> ${req.method} ${req.path}`);
    next();
});

console.log('Setting up routes...');
console.log('Available routes will be registered below:');

const PORT = process.env.PORT || 8000;

const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const notesRouter = require('./routes/notes');
const debugRouter = require('./routes/debug');

const passport = require('passport');

console.log(process.env);
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/notes';

mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to MongoDB database'));

app.use(express.json());
// Initialize passport (required for passport.authenticate to work)
app.use(passport.initialize());
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/notes', notesRouter);
app.use('/api/v1/debug', debugRouter);

// Simple ping for debug route sanity check
app.get('/api/v1/debug/ping', (req, res) => res.json({ ok: true }));

// Public debug info for local troubleshooting
app.get('/api/v1/debug/info', (req, res) => {
    try {
        const info = { env: process.env.NODE_ENV || 'development', routes: [] };
        if (app && app._router && Array.isArray(app._router.stack)) {
            app._router.stack.forEach((layer) => {
                if (layer && layer.route && layer.route.path) info.routes.push(layer.route.path);
            });
        }
        return res.json(info);
    } catch (e) {
        return res.status(500).json({ error: 'failed to gather info' });
    }
});

// Log registered routes for debugging purposes
try {
    const routes = [];
    if (app && app._router && Array.isArray(app._router.stack)) {
        app._router.stack.forEach((layer) => {
            try {
                if (layer.route && layer.route.path) {
                    routes.push({ path: layer.route.path, methods: layer.route.methods });
                } else if (layer.name === 'router' && layer.handle && layer.handle.stack && Array.isArray(layer.handle.stack)) {
                    layer.handle.stack.forEach((l) => {
                        if (l.route && l.route.path) routes.push({ path: l.route.path, methods: l.route.methods });
                    });
                } else if (layer.name) {
                    routes.push({ name: layer.name });
                }
            } catch (inner) { /* ignore layer errors */ }
        });
    } else {
        console.log('No router stack available to list routes yet');
    }
    console.log('Registered routes (partial):', JSON.stringify(routes.slice(0, 200), null, 2));
} catch (e) {
    console.log('Error listing routes (fatal):', e && e.stack ? e.stack : e);
}

// 404 handler for API routes - placed after all API routes
app.use((req, res, next) => {
    console.log('404 handler hit:', req.method, req.path);
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ 
            error: 'API endpoint not found', 
            method: req.method, 
            path: req.path 
        });
    } else {
        next();
    }
});

// General 404 handler for non-API routes
app.use((req, res) => {
    console.log('General 404 handler hit:', req.method, req.path);
    if (!req.path.startsWith('/api/')) {
        res.status(404).json({ 
            error: 'Route not found', 
            method: req.method, 
            path: req.path 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

module.exports = app;