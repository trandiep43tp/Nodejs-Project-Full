
const  {check} = require('express-validator/check');

const util = require('util');    //đây là thư viện của nodejs
var notify = require("../configs/notify");

const option = {
	username    : { min: 3, max: 15 },
	password: {min: 3, max: 15},
	
}
module.exports = {
	validator: (req) =>{		
			//NAME
			req.checkBody('username',util.format(notify.ERROR_NAME, option.username.min, option.username.max)).isLength({min: option.username.min, max: option.username.max})
			//PASS
			req.checkBody('password',util.format(notify.ERROR_PASS, option.password.min, option.password.max)).isLength({min: option.password.min, max: option.password.max})
			
			let errors = (req.validationErrors() != false)? req.validationErrors(): [];
			return errors;	
	}
};
 



            
	

