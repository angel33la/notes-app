const express = require('express');
const passport = require('passport');

const passportService = require('../services/passport');

const protectedRoute = passport.authenticate('jwt', { session: false });

const router = express.Router();

const User = require('../models/user');
// RESTFUL API endpoints for users 
//GET, POST, PUT, DELETE



/* TODO: If you are making middleware always put in correct order  */


// Middleware: fetch a single user by ID and attach it as `res.user`.
// Used on routes that include `/:id` (PUT, PATCH, DELETE).
const getUser = async (req, res, next) => {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user === null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    res.user = user;
    next();
};

// GET ALL Users
// 🔄✅
router.get('/', protectedRoute, async (req, res) => {
    try {
        // Return all users. `getUser` is a middleware used for single-user routes.
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET A User by ID
// 🔄✅
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE a new User
// 🔄✅
router.post('/', async (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        createdAt: req.body.createdAt
    });
    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE a User by ID
// 🔄✅
router.put('/:id', getUser, async (req, res) => {
    if (req.body.username != null) {
        res.user.username = req.body.username;
    }
    if (req.body.email != null) {
        res.user.email = req.body.email;
    }
    if (req.body.createdAt != null) {
        res.user.createdAt = req.body.createdAt;
    }
    try {
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.patch('/:id', getUser, async (req, res) => {
    if (req.body.username != null) {
        res.user.username = req.body.username;
    }
    if (req.body.email != null) {
        res.user.email = req.body.email;
    }
    if (req.body.createdAt != null) {
        res.user.createdAt = req.body.createdAt;
    }
    try {
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// DELETE a User by ID
// 🔄✅
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: `Deleted user with ID ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;