const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

// Email validation function
const validateEmail = (email) => {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email);
};

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        sparse: true  // Allows multiple documents with null values
    },
    email: {
        type: String,
        required: 'Email address is required.',
        unique: true,
        lowercase: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', function (next) {
    const user = this;

    if (user.isNew || user.isModified('password')) {
        // run hashing and salting
        bcrypt.genSalt(10, (err, salt) => {
            if (err) { return next(err)}            
            bcrypt.hash(user.password, salt, null, (err, hash) =>{
                if (err) { return next(err)}
                user.password = hash;
                next();
                })
        });
    } else {
        // skip hashing and salting
        next();
    }
});

userSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) { return callback(err); }
        callback(null, isMatch);
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;