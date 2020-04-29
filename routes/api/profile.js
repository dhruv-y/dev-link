const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Profile = require('../../models/Profile')
const { check, validationResult } = require('express-validator');

// @router      GET api/profile/me
// @desc        Get current user profile
// @access      Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'Profile does not exist for this user!' });
        }
        res.json(profile)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error!')
    }
});

// @router      POST api/profile
// @desc        Create or update user profile
// @access      Private

router.post('/', [auth, [check('status', 'Status is required!').not().isEmpty()
    , check('skills', 'Skills are required!').not().isEmpty()]]
    , async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { company, website, status, location, bio, githubusername, skills,
            twitter, facebook, instagram, linkedin } = req.body

        // Build profile object
        const profileFields = {};
        profileFields.user = req.user.id
        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (status) profileFields.status = status
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (githubusername) profileFields.githubusername = githubusername
        if (company) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        profileFields.social = {};
        if (twitter) profileFields.social.twitter = twitter
        if (facebook) profileFields.social.facebook = facebook
        if (instagram) profileFields.social.instagram = instagram
        if (linkedin) profileFields.social.linkedin = linkedin

        try {

            const profile = await Profile.findOne({ user: req.user.id })

            // Update existing profile
            if (profile) {
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
                return res.json(profile);
            }

            // Create New Profile
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error!')
        }

    })




module.exports = router;