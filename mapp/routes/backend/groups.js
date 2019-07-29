var express = require('express');
var router = express.Router();
const util = require('util');    //đây là thư viện của nodejs

const { check, validationResult } = require('express-validator/check');
							
const GroupsModels = require(__path_models    + 'groups');
const UsersModel   = require(__path_schemas   + 'users');
const UtilsHelper  = require(__path_helpers   + 'utils');
const ParamsHelper = require(__path_helpers   + 'params'); 
const systemConfig = require(__path_configs   + 'system');
const notify       = require(__path_configs   + 'notify');
const validateGroup = require(__path_validates + 'groups');
const link          = '/'+ systemConfig.prefixAdmin + '/groups';
const folderView    = __path_views_admin + 'pages/groups/';
  

router.get('(/:status)?', async (req, res, next)=> {     
	
	
	//tạo một đối tượng
	let objWhere ={};
	//lấy trạng thái được nhấn
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'all');	
	//lấy điều kiện lọc		
	 objWhere      = (currentStatus === "all" )? {} : {status: currentStatus};

	//lấy query khi nhấn search
	let query = ParamsHelper.getParams(req.query, 'search', '');  //search là tên được đặt trong input search	
	if(query !== ''){
		objWhere.name = new RegExp(query, 'i');   //RegExp(query, 'i') tìm kiếm không phân biệt các chữ hoa, thường
	}
	//in ra các trạng thái filter	
	let statusFilter  = await UtilsHelper.createFilterStatus(currentStatus, 'groups');

	//lấy các điều kiện sort
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
	await GroupsModels.countDocuments(objWhere).then((data)=>{
			pagination.totalItems = data;		  
		 })
	
	//lấy dữ liệu 	
	GroupsModels.listItems(objWhere,sort,pagination)	
		.then((items)=> {
			res.render(folderView +'list', { 
				title: 'Groups List page',
				items,
				statusFilter,
				currentStatus,
				query,
				pagination,
				sort_field,
				sort_type		
			});
		}); 

});

//thay đổi trạng thái status
router.get('/change-status/:id/:status', function(req, res, next) {
	
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let id            = ParamsHelper.getParams(req.params, 'id', '');

	GroupsModels.changeStatus(id, currentStatus).then((result)=>{
		req.flash('success', notify.CHANGE_STATUS_SUSCCESS ); //khi k cần render thì để false
		 res.redirect(link);
	})
	
});


//change status muti
router.post('/change-status/:status', function(req, res, next) {
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let ids = req.body.cid;  //cid là tên đặt ở ô input bên layout	
	 
	GroupsModels.changeStatus(ids, currentStatus, 'muti').then((result)=>{	
		req.flash('success', util.format(notify.CHANGE_STATUS_MUTI_SUSCCESS, result.n ) );
		res.redirect(link);
	})	
});

//change ordering
router.post('/change-ordering/', function(req, res, next) {
		let ids     = req.body.cid;
		let ordering = req.body.ordering;
		
		if(Array.isArray(ids)){
			GroupsModels.changeOrdering(ids, ordering).then((result)=>{
				req.flash('success', util.format( notify.CHANGE_ORDERING_MUTI_SUSCCESS,ids.length ));
				res.redirect(link);
			})			
		}else{
			GroupsModels.changeOrdering(ids, ordering).then((result)=>{
				req.flash('success', notify.CHANGE_ORDERING_SUSCCESS);
				res.redirect(link);
			})			
		}
	
	
});

//khi nhấn delete
router.get('/delete/:id', function(req, res, next) {	

	let id  = ParamsHelper.getParams(req.params, 'id', '');
	GroupsModels.deleteItems(id).then((err, result)=>{
		req.flash('success', notify.DELETE_SUSCCESS);
		res.redirect(link);
	 })	
});

//delete- muti
router.post('/delete', function(req, res, next) {	
	let items = req.body.cid;    //cid là tên đặt trong ô input
	GroupsModels.deleteItems(id, 'muti').then((err, result)=>{	
		req.flash('success', util.format( notify.DELETE_MUTI_SUSCCESS, result.n ));
		res.redirect(link);
	})
	
});
			 

//add và Edit
router.get('/form/:status/:id?', function(req, res, next) {  
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'add');
	let id 			  = ParamsHelper.getParams(req.params, 'id', '');	
	let errors        = [];
	if(currentStatus == 'add'){
		let item = {name: '', ordering: 0, status: 'novalue', content: ''}			
		res.render(folderView +'form', { title: 'Item Add page', item, errors });
	}else{
		GroupsModels.getItem(id)
			.then((item)=>{
				res.render(folderView + 'form', { title: 'Item Edit page', item, errors });
			})
		
	}
  
});

//validate.validator() là modun mình tự viết
router.post('/save',function(req, res, next){
	
	const itemEdit       = Object.assign(req.body);  //lấy lại các thứ gửi lên
	const item = {
		id: itemEdit.id,
		name: itemEdit.name, 
		ordering: parseInt(itemEdit.ordering), 
		status: itemEdit.status, 
		group_acp: itemEdit.group_acp,
		content: itemEdit.content
	};	
	let taskCurrent = (item.id !=='')? 'edit' : 'add';
	let title       = (taskCurrent === 'edit')? 'Group Edit page' : 'Group Add page';	
	const errors    = validateGroup.validator(req);
	
	if (errors.length > 0) { 		
		res.render(folderView + 'form', {title: 'Item Edit page', item, errors: errors});
		
	}else{
		if(item.id !==''){
			GroupsModels.saveItems(item, 'edit').then((err, result)=>{
				//update lại thông tin user khi thay đổi name group
				UsersModel.updateMany({'group.id': item.id}, {group: {id: item.id, name: item.name}}, (err, result)=>{
				 
				})
				if(err) console.log(err);
				req.flash('success', notify.CHANGE_ITEM_SUSCCESS);
				res.redirect(link);
			})
		}else{
			GroupsModels.saveItems(item, 'add').then((err, result)=>{
				req.flash('success', notify.ADD_SUSCCESS );
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

//thay đổi group
router.get('/change-group/:id/:group', function(req, res, next) {
	
	let currentGroup = ParamsHelper.getParams(req.params, 'group', 'yes');
	let id            = ParamsHelper.getParams(req.params, 'id', '');
		
	GroupsModels.changeGroupACP(id, currentGroup).then((err, result)=>{
		req.flash('success', notify.CHANGE_GROUP_SUSCCESS , false); //khi k cần render thì để false
		res.redirect(link);
	})	
});

module.exports = router;
 