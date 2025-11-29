const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config');

const localOptions = { usernameField: 'email' };

const localLogin = new LocalStrategy(localOptions, async function (email, password, done) {
    try {
        console.log('Passport local strategy attempt - email:', email);
        const user = await User.findOne({ email: email });
        
        if (!user) {
            console.log('Passport local strategy user not found for email:', email);
            return done(null, false);
        }

        console.log('Passport local strategy found user id:', user._id);
        user.comparePassword(password, function (err, isMatch) {
            if (err) {
                console.log('Passport comparePassword error:', err);
                return done(err);
            }
            console.log('Passport comparePassword result for user', user._id, ':', isMatch);
            if (!isMatch) {
                return done(null, false);
            }
            return done(null, user);
        });
    } catch (err) {
        console.log('Passport local strategy error:', err);
        return done(err);
    }
});


const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret
};

const jwtStrategy = new JwtStrategy(jwtOptions, async function (payload, done) {
    try {
        const user = await User.findById(payload.sub);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
})

passport.use(localLogin);
passport.use(jwtStrategy);

module.exports = passport;