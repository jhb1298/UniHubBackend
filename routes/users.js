const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Registration route
router.post('/register', async (req, res) => {
    const { userName, name, email, password, profilePic, profile, university, dept, role } = req.body;
    try {
        let user = await User.findOne({ $or: [{ email: email }, { userName: userName }] });  
        if (user) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        user = new User({ userName, name, email, password, profilePic, profile, university, dept, role });
        await user.save();

        const payload = {
            user: {
                userName: user.userName,
                role:user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user route
/*router.post('/updateUser', async (req, res) => {
    const { userName, name, email, password, profilePic, profile, university, dept, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        user = new User({ userName, name, email, password, profilePic, profile, university, dept, role });
        await user.findOneAndUpdate({ userName:userName })

        const payload = {
            user: {
                userName: user.userName
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});*/

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Not matched")
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            user: {
                userName: user.userName,
                role:user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/userInfo/:userName',auth, async (req, res) => {
    const { userName } = req.params;
    try {
        const user = await User.findOne({ userName: userName }).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        console.error('Fetching user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/updateUserInfo/:userName', auth, async (req, res) => {
    const {userName} = req.params; 
    const updates = req.body; 

    if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);
    }


    try {
        const updatedUser = await User.findOneAndUpdate(
            { userName: userName },
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
