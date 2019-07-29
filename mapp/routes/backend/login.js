var express = require('express');
var router = express.Router();
//var bodyParser = require('body-parser');

var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var md5           = require('md5');
var UserModel       = require(__path_models    + 'users');
const validateItems = require(__path_validates + 'login');
const notify       = require(__path_configs   + 'notify');
var systemConfig   = require(__path_configs + 'system');
const link         = '/'+ systemConfig.prefixAdmin + '/users';
const linkIndex    = '/'+ systemConfig.prefixAdmin + '/auth' ;
const folderView   = __path_views_admin + 'pages/login/';
const layoutFrontend = __path_views_admin + 'login';

router.get('/logout',(req, res, next)=> {  
	req.logout();
	res.redirect(linkIndex)
	
});  
  
/* GET home page. */
router.get('/',(req, res, next)=> {  	
	//kiểm tra xem đã có người ddawng nhập chưa? nếu có chuyển về trang link
	
	if (req.isAuthenticated()) 	res.redirect(link)
	
	//khai báo người đăng nhập
	let item ={username: 'trandiep43tp', password: 'thucpham43tp'}		
	res.render(folderView+ 'index',{
		layout: layoutFrontend,   //định lại đường dẫn cho layout	
		errors: false, 
		item 
	});
});  

router.get('/no-permission', function(req, res, next) {
	res.render(folderView + 'no-permission', { title: 'No Permission' });
  });

router.post('/submit', (req, res, next)=> {
	
	const item       = Object.assign(req.body); 
	const errors = validateItems.validator(req);	
	if (errors.length >0) {	
		res.render(folderView+ 'index',{
			layout: layoutFrontend,   //định lại đường dẫn cho layout			
			errors: errors, 
			item 
		});
		
	}else{				
		//LOGIN
		passport.authenticate('local', {
			successRedirect: link,
			failureRedirect: linkIndex,
			failureFlash   : true
         })(req, res, next);	
	} 
 
});

// passport.use(new LocalStrategy({
//     usernameField: 'email',        //định nghĩa lại tên trong ô input trên form
//     passwordField: 'passwd'
//   },
// 	function(username, password, done) {
// 		UserModel.getItembyUsername(username, null).then((user)=>{								
// 			if (!user) {				
// 				return done(null, false, { message: notify.ERROR_LOGIN } );
// 			}else{  //tên đúng
// 				if(md5(password) != user.password){					
// 					return done(null, false, { message: notify.ERROR_LOGIN } )
// 				}else{					
// 					return done(null, user) //sau đó sẽ nhảy đến hàm serializeUser
// 				}
// 			}
			
// 		})
// 	}
// ));

// passport.serializeUser(function(user, done) {
// 	console.log(user)
// 	done(null, user.id);  //lưu id của user dăng nhập
// }); 
  
// passport.deserializeUser(function(id, done) {
// 	UserModel.getItem(id, null).then(( user)=>{
// 		done(null, user);
// 	});	
// });

module.exports = router;
