
var md5           = require('md5');
var LocalStrategy = require('passport-local').Strategy;
const notify       = require(__path_configs   + 'notify');
var UserModel       = require(__path_models    + 'users');

 
module.exports = (passport)=>{
    passport.use(new LocalStrategy({
        usernameField: 'username',        //định nghĩa lại tên trong ô input trên form
        passwordField: 'password'
      },
        function(username, password, done) {    
            UserModel.getItembyUsername(username, null).then((user)=>{	                           							
                if (!user) {				
                    return done(null, false, { message: notify.ERROR_LOGIN } );
                }else{  //tên đúng
                   // console.log(md5(password));
                    if(md5(password) != user.password){	
                       return done(null, false, { message: notify.ERROR_LOGIN } )
                    }else{				                        
                        return done(null, user)
                    }
                }
                
            })
        }
    ));
    
    passport.serializeUser(function(user, done) {       
        done(null, user.id);  //lưu id của user dăng nhập
    });
      
    passport.deserializeUser(function(id, done) {
        UserModel.getItem(id, null).then(( user)=>{
            done(null, user);
        });	
    });
};