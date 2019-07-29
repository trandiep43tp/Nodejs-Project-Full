
const  {check} = require('express-validator/check');

const util = require('util');    //đây là thư viện của nodejs
var notify = require("../configs/notify");

const option = {
	name    : { min: 1, max: 20 },
	ordering: {min: 1, max: 100},
	status  : ['novalue'] ,
	content : {min: 1, max: 100},
}
module.exports = {
	validator: (req) =>{		
		//NAME
		req.checkBody('name',util.format(notify.ERROR_NAME, option.name.min, option.name.max)).isLength({min: option.name.min, max: option.name.max}),
		//ORDERING
		req.checkBody('ordering','Phai la so lon hon 0').isInt({gt: 0, lt: 100}),
		//STATUS
		req.checkBody('status', 'Chọn một trạng thái').not().isIn(option.status),
		//GROUP_ACP
		req.checkBody('group_acp', 'Chọn một trạng thái').not().isEmpty(),
		//CONTENT
		req.checkBody('content',util.format(notify.ERROR_NAME, option.content.min, option.content.max)).isLength({min: option.content.min, max: option.content.max})
		
		let errors = (req.validationErrors() != false)? req.validationErrors(): [];
		return errors;				
	}
};
 



            
	

