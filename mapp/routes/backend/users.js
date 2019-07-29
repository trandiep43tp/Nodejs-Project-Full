var express = require('express');
var router  = express.Router();
const util  = require('util');    //đây là thư viện của nodejs


const { check, validationResult } = require('express-validator/check');
const multer          = require("multer");
var upload = multer()

const UsersModels  = require(__path_models    + 'users');
const GroupsModel  = require(__path_schemas   + 'groups');
const UtilsHelper  = require(__path_helpers   + 'utils');
const ParamsHelper = require(__path_helpers   + 'params');
const FilesHelper  = require(__path_helpers   + 'file');
const systemConfig = require(__path_configs   + 'system');
const notify       = require(__path_configs   + 'notify');
const validateUsers = require(__path_validates + 'users');
const link         = '/'+ systemConfig.prefixAdmin + '/users';
const folderView   = __path_views_admin + 'pages/users/';

const uploadAvatar = FilesHelper.upload('avatar', 'users'); //avatar là tên trong input trong form nhập file



//test upload file
router.get('/upload', function(req, res, next) {  
	let errors        = [];
	let item = {name: ''}
	res.render(folderView +'upload', { title: 'upload file', errors, item});	
});  

//test upload file
router.post('/upload', (req, res, next)=>{
	
	uploadAvatar(req, res, function (err) {
		req.body = JSON.parse(JSON.stringify(req.body));		
		validateUsers.validator(req);
		let item   = Object.assign(req.body);  //lấy lại các thứ gửi lên
		let error = [];
		
		let errors = req.validationErrors();
		if(errors != false){  //có lỗi
			//res.render(folderView +'upload', { title: 'upload file', errors, item});
		}else{
			console.log('khong bi loi')
		}
				
		if (err) {
			errors.push({param: 'Avatar', msg: err})
			// An unknown error occurred when uploading.// 		 
		}
		res.render(folderView +'upload', { title: 'upload file', errors, item});
	})
		
})

router.get('(/:status)?',async (req, res, next)=> {     //(/:status)? đây là những ký hiệu trong regularexpression nghã là có cũng được, không có cũng đươcj
	//kiểm tra xem có người đăng nhập không, nếu không  có quay lại trang chủ
	// if(use === ''){		
	// 	res.redirect(`/${systemConfig.prefixAdmin}`)
	// }
	 
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
	let statusFilter  = await UtilsHelper.createFilterStatus(currentStatus, 'users');
	
	//lấy các điều kiện sort
	let sort_field = ParamsHelper.getParams(req.session, 'sort_field', 'ordering');
	let sort_type  = ParamsHelper.getParams(req.session, 'sort_type', 'asc');
	let groupId    = ParamsHelper.getParams(req.session, 'group_id', 'novalue');
	if(groupId != 'novalue'){
		objWhere['group.id'] =  groupId;
	}
	 
	//console.log(objWhere)
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
	await UsersModels.countDocuments(objWhere).then((data)=>{
			pagination.totalItems = data;		  
		 })
	
		 //lấy danh sách group
	let groupsItems = [];
	await GroupsModel
		.find({})
		.select('id name')
		.then((items)=>{
			groupsItems = items;			
		})
	
	//lấy dữ liệu 	
	UsersModels.listItems(objWhere,sort,pagination).then((items)=> {
		res.render(folderView + 'list', { 
			title: 'User List page',
			items,
			statusFilter,
			currentStatus,
			query,
			pagination,
			sort_field,
			sort_type,
			groupsItems,
			groupId
		});
	}); 

});

//thay đổi trạng thái status
router.get('/change-status/:id/:status', function(req, res, next) {	
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let id            = ParamsHelper.getParams(req.params, 'id', '');
		
	UsersModels.changeStatus(id, currentStatus).then((err, result)=>{
		req.flash('success', notify.CHANGE_STATUS_SUSCCESS , false); //khi k cần render thì để false
		res.redirect(link);
	});	
});


//change status muti
router.post('/change-status/:status', function(req, res, next) {
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let ids = req.body.cid;  //cid là tên đặt ở ô input bên layout	
	
	UsersModels.changeStatus(ids, currentStatus, 'muti').then((result)=>{	
		req.flash('success', util.format(notify.CHANGE_STATUS_MUTI_SUSCCESS, result.n ) , false);
		res.redirect(link);
	})	
});

//change ordering
router.post('/change-ordering/', function(req, res, next) {
		let ids     = req.body.cid;
		let ordering = req.body.ordering;		
		if(Array.isArray(ids)){
			UsersModels.changeOrdering(ids, ordering, 'muti').then((result)=>{
				req.flash('success', util.format( notify.CHANGE_ORDERING_MUTI_SUSCCESS,ids.length ), false);
				res.redirect(link);
			});
			
		}else{
			UsersModels.changeOrdering(ids, ordering).then((result)=>{
				req.flash('success', notify.CHANGE_ORDERING_SUSCCESS, false);
				res.redirect(link);
			});	
		}
	
	
});

//khi nhấn delete
router.get('/delete/:id', async (req, res, next)=> {	
	let id  = ParamsHelper.getParams(req.params, 'id', '');

	UsersModels.deleteItems(id).then((result)=>{
		req.flash('success', notify.DELETE_SUSCCESS, false);
	 	res.redirect(link);
	})	
});

//delete- muti
router.post('/delete', function(req, res, next) {	
	let ids = req.body.cid;    //cid là tên đặt trong ô input

	UsersModels.deleteItems(ids, 'muti').then((result)=>{
		req.flash('success', util.format( notify.DELETE_MUTI_SUSCCESS, result.n ), false);
		res.redirect(link);
	})
});
			  

//add và Edit
router.get('/form/:status/:id?', async (req, res, next)=> {  
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'add');
	let id 			  = ParamsHelper.getParams(req.params, 'id', '');	
	let errors        = [];
	let groupsItems = [];
	await GroupsModel
		.find({})
		.select('id name')
		.then((items)=>{
			groupsItems = items;			
		})
	if(currentStatus == 'add'){
		let item = {name: '', avatar: '', ordering: 0, status: 'novalue', content: '', group: {id: '', name: ''}}			
		res.render(folderView +'form', { title: 'Users Add page', item, groupsItems, errors });
	}else{
		UsersModels.getItem(id)
			.then((item)=>{
				res.render(folderView +'form', { title: 'Users Edit page', item, groupsItems, errors });
			})
		
	}
  
});

//validate.validator() là modun mình tự viết
router.post('/save',  (req, res, next)=>{	
	uploadAvatar(req, res, async (errAvatar)=> {
		console.log(errAvatar)
		//console.log(req.file)		
	   	const itemEdit       = await Object.assign(req.body);  //lấy lại các thứ gửi lên	
		//console.log(itemEdit)	
		let taskCurrent = (itemEdit.id !== '')? 'edit' : 'add';
		let massage = (taskCurrent === 'edit')? notify.CHANGE_ITEM_SUSCCESS : notify.ADD_SUSCCESS;
		let title   = (taskCurrent === 'edit')? 'Users Edit page' : 'Users add page';		
		let errors = validateUsers.validator(req, errAvatar, taskCurrent);	
		
		//vẫn phải lấy về để khi bị lỗi vẫn có dữ liệu truyền qua
		let groupsItems = [];
		await GroupsModel.find({}).select('id name').then((items)=>{
				groupsItems = items;			
			   })
			
		const item = {
			id       : itemEdit.id,
			name     : itemEdit.name, 
			ordering : parseInt(itemEdit.ordering), 
			status   : itemEdit.status, 
			group    : {
				id   : itemEdit.group_id,
				name : itemEdit.group_name,
			}, 
			content  : itemEdit.content
		};	
		
		
		if (errors.length > 0) { 	
			//khi chèn tấm hình lên đúng, các trường dữ liêu khác sai thì hình vần chèn. do đó phải xóa đi
		    if(req.file != undefined){
				FilesHelper.remove('public/uploads/users/', req.file.filename);  //xóa tấm hình khi file k hơp lệ. 
			} 
			item.avatar = itemEdit.image_old;
			res.render(folderView +'form', {title, item, groupsItems, errors: errors});			
		}else{						
			if(req.file === undefined){  //edit thông tin k phải edit hình
				item.avatar = itemEdit.image_old;
			}else{
				item.avatar = req.file.filename;  
				if(taskCurrent == 'edit'){
					FilesHelper.remove('public/uploads/users/', itemEdit.image_old);
				}
			} 

			UsersModels.saveItems(item, taskCurrent).then((err, result)=>{
				req.flash('success', massage, false);
				res.redirect(link);
			})
					
		}		
	})		
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

router.get('/filter-group/:group_id', function(req, res, next) { 

	let group_id = ParamsHelper.getParams(req.params, 'group_id', '');

	//lưu vào trong session
	req.session.group_id = group_id;
	
	res.redirect(link);
});




module.exports = router;
 