var express = require('express');
var router = express.Router();

const middlewareUserInfo = require(__path_middleware   + '/get-user-info');
const middlewareCategory = require(__path_middleware   + '/get-category-for-menu');

router.use('/', middlewareUserInfo, middlewareCategory , require('./home')); 
router.use('/category',middlewareCategory, require('./category')); 
router.use('/about', require('./about')); 
router.use('/contact', require('./contact')); 
router.use('/article', require('./article'));
module.exports = router;