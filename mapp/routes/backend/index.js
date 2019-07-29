var express = require('express');
var router = express.Router();

const systemConfig = require(__path_configs   + 'system');

const linkLogin         = '/'+ systemConfig.prefixAdmin + '/auth';
const linkNoPermission  = '/'+ systemConfig.prefixAdmin + '/auth/no-permission';
const middleware = require(__path_middleware   + 'auth');


router.use('/auth', require('./login'));
//sử dụng middleware để kiểm tra xem có đăng nhập chưa - viết trực tiếp
// router.use('(/:status)?', (req, res, next)=>{
//     if (req.isAuthenticated()){                             
//             if(req.user.username === "trandiep43tp"){               
//                 next();
//             }else{//                 
//                 res.redirect(linkNoPermission);
//             }        
//     }else{
//         res.redirect(linkLogin);
//     }    
// }); 
   
router.use('(/:status)?', middleware );   //cách viết bằng cách tách ra thành modunle khác rồi kéo vào
router.use('/dashboard', require('./dashboard'));
router.use('/category', require('./category')); 
router.use('/article', require('./article')); 
router.use('/items', require('./items')); 
router.use('/groups', require('./groups')); 
router.use('/users', require('./users')); 
module.exports = router;
 
    