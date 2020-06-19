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

// @router      GET api/profile
// @desc        Get all profiles
// @access      Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error!')
    }
})

// @router      GET api/profile/user/:user_id
// @desc        Get profile by user id
// @access      Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({ msg: 'Profile not found!' });
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found!' });
        }
        res.status(500).send('Server Error!');
    }
})

// @router      DELETE api/profile
// @desc        Delete profile, user and post
// @access      Private
router.delete('/', auth, async (req, res) => {
    try {
        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted successfully!' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error!');
    }
})

// @router      ADD api/profile/experience
// @desc        Add experience field
// @access      Private

router.put('/experience', [auth, [check('title', 'Title is required!').not().isEmpty()
    , check('company', 'Company is required!').not().isEmpty()
    , check('from', 'From date is required!').not().isEmpty()]], async (req, res) => {

        const errors = validationResult();
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // pull out experience fields from request
        const { title,
            company,
            location,
            from,
            to,
            current,
            description } = req.body;

        // create object for newexp
        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };

        // profile in database
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error!')
        }

    });

// @router      DELETE api/profile/experience/:exp_id
// @desc        Deleter experience field from profile
// @access      Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.experience.map(item => item._id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error!');
    }
});

// @router      ADD api/profile/education
// @desc        Add education field
// @access      Private

router.put('/education', [auth, [check('school', 'School is required!').not().isEmpty()
    , check('degree', 'Degree is required!').not().isEmpty()
    , check('field', 'Field of study is required!').not().isEmpty()
    , check('from', 'From date is required!').not().isEmpty()]], async (req, res) => {

        const errors = validationResult();
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // pull out experience fields from request
        const { title,
            school,
            degree,
            field,
            from,
            to,
            current,
            description } = req.body;

        // create object for newexp
        const newEdu = {
            title,
            school,
            degree,
            field,
            from,
            to,
            current,
            description
        };

        // profile in database
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newEdu);
            await profile.save();
            res.json(profile);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error!')
        }

    });

// @router      DELETE api/profile/education/:edu_id
// @desc        Delete education field from profile
// @access      Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.experience.map(item => item._id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error!');
    }
});


module.exports = router;