const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var AuthUser = require('../models/authUsers');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
var bcrypt = require('bcrypt');
const saltRounds = 10;


// GET ALL THE USERS FROM THE AUTHENTICATED USERS
router.get('/register', function (req, res, next) {
    AuthUser.find()
        .then(users => {
            res.status(200).send(users);
        }).catch(next);
})

// REGISTRATION SYSTEM IN EXPRESS
router.post('/register',
    [
        check('username')
            .exists().withMessage('username is required'),
            // .custom(value => {
            //     return findUserByEmail(value).then(user => {
            //         console.log('this email is already in use');
            //         throw new Error('this email is already in use');
            //     })
            // }),
        check('email')
            .exists().withMessage('email is required'),
            // .custom(value => {
            //     return findUserByEmail(value).then(user => {
            //         console.log('this email is already in use');
            //         throw new Error('this email is already in use');
            //     })
            // }),
        // General error messages can be given as a 2nd argument in the check APIs
        check('password', 'passwords must be at least 8 chars long and contain one number')
            .isLength({ min: 8 })
            .matches(/\d/),
    ],
    function (req, res, next) {
        // check for validation error server-side and throw error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() });
        }
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                // Store hash in your password DB.
                var user = {
                    username: req.body.username,
                    email: req.body.email,
                    password: hash
                }
                console.log(user);
                AuthUser.create(user)
                    .then(user => {
                        console.log(user);
                        res.status(200).send(user);
                    })
                    .catch(next)
            });
        });

    })

// LOGIN SYSTEM IN EXPRESS
router.post('/login',
    [
        check('email')
            .exists().withMessage('email is required')
        // .custom(value => {
        //     return findUserByEmail(value).then(user => {
        //         throw new Error('this email is already in use');
        //     })
        // })

        // General error messages can be given as a 2nd argument in the check APIs
        // check('password', 'passwords must be at least 8 chars long and contain one number')
        //     .isLength({ min: 8 })
        //     .matches(/\d/),
    ],
    function (req, res, next) {
        // check for validation error server-side and throw error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() });
        }

        var authuser = {
            email: req.body.email,
        }

        AuthUser.findOne(authuser)
            .then(user => {
                bcrypt.compare(req.body.password, user.password, function (err, response) {
                    if (err) {
                        console.log(err);
                    }
                    if (response == false) {
                        res.status(422).send('invalid password');
                    }
                    if (response == true) {
                        res.status(200).send(user.email);
                    }
                })
            })
            .catch(next)
    })

module.exports = router;