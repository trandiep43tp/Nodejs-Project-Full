
module.exports = (req, res, next)=>{
    let userinfo = {};
    if (req.isAuthenticated()){
        userinfo = req.user;
    }    
    res.locals.userinfo = userinfo;   
    //console.log(userinfo)
    next();     
}