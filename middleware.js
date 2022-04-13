module.exports.isLoggedIn = (req,res,next)=>{
    //console.log(req.user);
    if(!req.isAuthenticated()){
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('/login');
    }else
    next();
}