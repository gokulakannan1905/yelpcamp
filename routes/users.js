const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const {isLoggedIn} = require('../middleware');


router.get('/register', (req, res) => {
    res.render('users/register');
})
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password)
        req.flash('success', 'You are registered and can log in');
        res.send(registeredUser);
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }

}))


router.get('/login',(req, res) => {
    res.render('users/login');
})
router.post('/login',passport.authenticate('local',{failureRedirect:'/login', failureFlash: true}),(req, res) => {
    req.flash('success', 'You are logged in');
    res.redirect('/campgrounds');
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/campgrounds');
})
module.exports = router;