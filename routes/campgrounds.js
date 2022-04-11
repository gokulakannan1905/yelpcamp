const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas');

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(d => d.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});
router.get('/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate('reviews');
    if(!campground){
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))
router.post('/',validateCampground, catchAsync(async (req, res) => {
    if(!req.body.campground) throw new ExpressError('Campground is required', 399);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Campground created successfully');
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id',validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    req.flash('success', 'Campground updated successfully');
    res.redirect(`/campgrounds/${camp._id}`);
}))
router.delete('/:id',catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully');
    res.redirect('/campgrounds');
}))

module.exports = router;