const {campgroundSchema,reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');


module.exports.isLoggedIn = (req,res,next)=>{
    //console.log(req.user);
    if(!req.isAuthenticated()){
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('/login');
    }else
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(d => d.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You are not authorized to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(d => d.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}