const express = require('express');
const passport = require('passport');
require('../services/passport');

const router = express.Router();
const DebugController = require('../controllers/debug_controller');

const requireAuth = passport.authenticate('jwt', { session: false });

// GET /api/v1/debug/whoami
router.get('/whoami', requireAuth, DebugController.whoami);

module.exports = router;
