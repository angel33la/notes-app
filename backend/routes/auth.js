const express = require('express');
const passport = require('passport');
const passportService = require('../services/passport');

console.log('Auth routes file loaded');

const requiredLogin = passport.authenticate('local', { session: false });

const router = express.Router();
const AuthenticationController = require('../controllers/authentication_controller');


// Signup route
router.post('/', AuthenticationController.signup);

router.get('/', (req, res) => {
	res.json({ message: 'Auth endpoint is up. Use POST to /api/v1/auth to sign up.' });
});

// Sign in with Passport
router.post('/signin', (req, res, next) => {
	requiredLogin(req, res, (err) => {
		if (err) {
			return res.status(401).json({ error: 'Authentication failed', details: err.message });
		}
		if (!req.user) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}
		AuthenticationController.signin(req, res, next);
	});
});

module.exports = router;