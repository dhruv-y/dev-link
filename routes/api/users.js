const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const brcrypt = require('bcrypt')
const config = require('config')

// @router      POST api/users
// @desc        Register User
// @access      Public
router.post('/api/users'
    , [check('name', 'Name is required!').not().isEmpty(),
    check('email', 'Include a valid email').isEmail(),
    check('password', 'Enter a password with 5 or more characters').isPassword().isLength({ min: 5 })]
    , async (req, res) => {
        // Check errors from validation result
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        // Destructuring the body
        const { name, email, password } = req.body
        try {
            // Check if user exists
            let user = await User.findOne({ email })

            if (user) {
                res.status(400).send({ errors: [{ msg: 'User exists!' }] })
            }

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                name,
                email,
                gravatar,
                password
            })

            // Encrypt password
            const salt = await brcrypt.genSalt(10);
            user.password = await brcrypt.hash(password, salt);
            await user.save()

            // Return JWT
            const payload = {
                user: {
                    id: user.id
                }
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