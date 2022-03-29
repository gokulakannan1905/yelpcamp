// import sections
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema} = require('./schemas');

// database connection
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Connected to DB!');
}).catch(err => {
    console.log('ERROR:', err.message);
});

// middleware to use for all requests
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.get('/', (req, res) => {
    res.render('home');
})
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


// routes
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
}))
app.post('/campgrounds',validateCampground, catchAsync(async (req, res) => {
    if(!req.body.campground) throw new ExpressError('Campground is required', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))
app.put('/campgrounds/:id',validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    res.redirect(`/campgrounds/${camp._id}`);
}))
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    if(!err.message)
        err.message = 'Something went wrong';
    res.status(err.status || 500).render('error',{err});
});

// listen
app.listen(3000, () => console.log('Server started on port 3000'));