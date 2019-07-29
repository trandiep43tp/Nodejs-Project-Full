var express = require('express');
var router = express.Router();
const util = require('util');    //đây là thư viện của nodejs

const { check, validationResult } = require('express-validator/check');

const ItemModels   = require(__path_models    + 'items');
const UtilsHelper  = require(__path_helpers   + 'utils');
const ParamsHelper = require(__path_helpers   + 'params');
const systemConfig = require(__path_configs   + 'system');
const notify       = require(__path_configs   + 'notify');
const validateItems = require(__path_validates + 'items');
const link         = '/'+ systemConfig.prefixAdmin + '/items';
const folderView   = __path_views_admin + 'pages/items/';

router.get('(/:status)?',async (req, res, next)=> {     //(/:status)? đây là những ký hiệu trong regularexpression nghã là có cũng được, không có cũng đươcj
	
	//tạo một đối tượng
	let objWhere ={};
	//lấy trạng thái được nhấn
	
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'all');
	//console.log(req.params)	
	//lấy điều kiện lọc		
	 objWhere      = (currentStatus === "all" )? {} : {status: currentStatus};
	//lấy query khi nhấn search
	let query = ParamsHelper.getParams(req.query, 'search', '');  //search là tên được đặt trong input search	
	if(query !== ''){
		objWhere.name = new RegExp(query, 'i');   //RegExp(query, 'i') tìm kiếm không phân biệt các chữ hoa, thường
	}
	//in ra các trạng thái filter	
	let statusFilter  = await UtilsHelper.createFilterStatus(currentStatus, 'items');
	//lấy các điều kiện sort
	//console.log(req.session)
	let sort_field = ParamsHelper.getParams(req.session, 'sort_field', 'ordering');
	let sort_type  = ParamsHelper.getParams(req.session, 'sort_type', 'asc');
	
	let sort = {};
		sort[sort_field] = sort_type;
	//phân trang
	let pagination ={
		totalItems : 0,
		totalItemsperPage: 4,
		currentPage		 : 1,
		pageRanges       : 3,    //để cấu hình khi có quá nhiều trang
	}	
	// lấy số trang hiện tại
	pagination.currentPage =  parseInt(ParamsHelper.getParams(req.query, 'page', 1));

	//đếm tỏng số bản ghi
	await ItemModels.countDocuments(objWhere).then((data)=>{
			pagination.totalItems = data;		  
		 })
	
	//lấy dữ liệu 
	ItemModels.listItems(objWhere,sort,pagination).then((items)=>{
		res.render(folderView + 'list', { 
			title: 'Item List page',
			items,
			statusFilter,
			currentStatus,
			query,
			pagination,
			sort_field,
			sort_type		
		});
	})	 
});

//thay đổi trạng thái status
router.get('/change-status/:id/:status', function(req, res, next) {
	
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let id            = ParamsHelper.getParams(req.params, 'id', '');
	let user          = req.user.username;
	
	ItemModels.changeStatus(id, currentStatus, { user }).then((result)=>{
		req.flash('success', notify.CHANGE_STATUS_SUSCCESS ); 
		res.redirect(link);
	})
});


//change status muti
router.post('/change-status/:status', function(req, res, next) {
	let user          = req.user.username;
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let ids           = req.body.cid;  //cid là tên đặt ở ô input bên layout		
	//cách 2 xử lý bên models
	ItemModels.changeStatus(ids, currentStatus,{ user, combo: 'muti' } ).then((result)=>{
		req.flash('success', util.format(notify.CHANGE_STATUS_MUTI_SUSCCESS, result.n ) , false);
		res.redirect(link);
	})
});

//change ordering
router.post('/change-ordering/', function(req, res, next) {
	let user          = req.user.username;
	let ids     = req.body.cid;
	let ordering = req.body.ordering;
	//console.log(ordering)
	if(Array.isArray(ids)){
		ItemModels.changeOrdering(ids, ordering, { user}).then((result)=>{
			req.flash('success', util.format( notify.CHANGE_ORDERING_MUTI_SUSCCESS,ids.length ), false);
			res.redirect(link);
		})		
	}else{
		ItemModels.changeOrdering(ids, ordering, {user} ).then((result)=>{
			req.flash('success', notify.CHANGE_ORDERING_SUSCCESS, false);
			res.redirect(link);
		})
	}		
});

//khi nhấn delete
router.get('/delete/:id', function(req, res, next) {	

	let id  = ParamsHelper.getParams(req.params, 'id', '');
	ItemModels.deleteItems(id ).then((result)=>{
		req.flash('success', notify.DELETE_SUSCCESS, false);
		res.redirect(link);
	})
	
});

//delete- muti
router.post('/delete', function(req, res, next) {	
	let ids = req.body.cid;    //cid là tên đặt trong ô input

	ItemModels.deleteItems(ids, 'muti').then((result)=>{
		req.flash('success', util.format( notify.DELETE_MUTI_SUSCCESS, result.n ), false);
		res.redirect(link);
	})
});
			 

//add và Edit
router.get('/form/:status/:id?', function(req, res, next) {  
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'add');
	let id 			  = ParamsHelper.getParams(req.params, 'id', '');	
	let errors = [];

	if(currentStatus == 'add'){
		let item = {name: '', ordering: 0, status: 'novalue', content: ''}			
		res.render(folderView +'form', { title: 'Item Add page', item, errors });
	}else{
		ItemModels.getItem(id).then((item)=>{
			res.render(folderView +'form', { title: 'Item Edit page', item, errors });
		})		
	}
  
});

//validate.validator() là modun mình tự viết
router.post('/save',function(req, res, next){
	
	const errors = validateItems.validator(req);
	const itemEdit       = Object.assign(req.body);  //lấy lại các thứ gửi lên
	const item = {
		id: itemEdit.id,
		name: itemEdit.name, 
		ordering: parseInt(itemEdit.ordering), 
		status: itemEdit.status, 
		content: itemEdit.content
	};
	let user        = req.user.username;
	let taskCurrent = (item.id !=='')? 'edit' : 'add';
	let title       = (taskCurrent === 'edit')? 'Item Edit page' : 'Item Add page';
	if (errors.length >0) {
		res.render(folderView +'form', { 
			title,
			item,
			errors: errors				
		});
	 }else{
		if(taskCurrent ==='edit' ){
			ItemModels.saveItems(item, {user, combo: 'edit' }).then((err, result)=>{				
				req.flash('success', notify.CHANGE_ITEM_SUSCCESS, false);
				res.redirect(link);
			})
		}else{
			ItemModels.saveItems(item, {user, combo: 'add' }).then((err, result)=>{
				req.flash('success', notify.ADD_SUSCCESS , false);
				res.redirect(link);
			})
		}
	}	
})

//SORT
router.get('/sort/:sort_field/:sort_type', function(req, res, next) {  

	let sort_field = ParamsHelper.getParams(req.params, 'sort_field', 'ordering');
	let sort_type = ParamsHelper.getParams(req.params, 'sort_type', 'asc');

	//lưu vào trong session
	req.session.sort_field = sort_field;
	req.session.sort_type = sort_type;
	res.redirect(link);
});


module.exports = router;
 