const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

const tokenForUser = (user) => {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user._id, iat: timestamp }, config.secret);
};

exports.signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({ error: 'Email and password are required.' });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(422).json({ error: 'Email is already in use.' });
        }
        
        const user = new User({
            email: email,
            password: password
        });

        await user.save();
        
        res.status(201).json({ 
            message: 'User created successfully.', 
            user_id: user._id, 
            token: tokenForUser(user) 
        });
    } catch (error) {
        next(error);
    }
};

exports.signin = (req, res, next) => {
    const user = req.user;
    console.log('Signin controller called for user id:', user ? user._id : null);
    res.status(200).json({ token: tokenForUser(user), user_id: user._id });
};