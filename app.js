// import sections
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');


// database connection
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
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
app.use(session({
    secret: '#yelpcamp#',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires:Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: (1000 * 60 * 60 * 24 * 7)
    }
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// routes
app.get('/',(req, res) => {   
    res.render('home');
})
app.use('/campgrounds', require('./routes/campgrounds'));
app.use('/campgrounds/:id/reviews', require('./routes/reviews'));
// all other routes
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