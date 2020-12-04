const express = require('express');
const auth = require('../../middleware/auth')
const router = express.Router();
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator');
const brcrypt = require('bcrypt')

// @router      GET api/auth
// @desc        User Details using Token
// @access      Public

// Pass middleware as a second parameter  
router.get('/', auth, async (req, res) => {
    try {
        // pull out user ID from request
        // find user by ID in the database
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error!')
    }
});

// @router      POST api/auth
// @desc        Authenticate User & Get Token
// @access      Public
router.post('/'
    , [
        check('email', 'Enter valid email!').isEmail(),
        check('password', 'Password required!').exists()]
    , async (req, res) => {
        // Check errors from validation result
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        // Destructuring the body
        const { email, password } = req.body
        try {
            // Check if user exists
            let user = await User.findOne({ email })
            if (!user) {
                return res.status(400).send({ errors: [{ msg: 'Invalid Credentials!' }] })
            }

            // Match passwords
            const isMatch = await brcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).send({ errors: [{ msg: 'Invalid Credentials!' }] })
            }

            jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
                if (err) throw err
                res.json({ token })
            })

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error!');
        }
    });

module.exports = router;