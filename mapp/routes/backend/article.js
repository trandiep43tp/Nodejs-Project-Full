var express = require('express');
var router  = express.Router();
const util  = require('util');    //đây là thư viện của nodejs


const { check, validationResult } = require('express-validator/check');
const multer          = require("multer");
var upload = multer()

const ArticleModels  = require(__path_models    + 'article');
const CategoryModel  = require(__path_schemas   + 'category');
const UtilsHelper  = require(__path_helpers   + 'utils');
const ParamsHelper = require(__path_helpers   + 'params');
const FilesHelper  = require(__path_helpers   + 'file');
const systemConfig = require(__path_configs   + 'system');
const notify       = require(__path_configs   + 'notify');
const validateArticle = require(__path_validates + 'article');
const link         = '/'+ systemConfig.prefixAdmin + '/article';
const folderView   = __path_views_admin + 'pages/article/';

const uploadThumb = FilesHelper.upload('thumb', 'article'); //thumb là tên trong input trong form nhập file



//test upload file
router.get('/upload', function(req, res, next) {  
	let errors        = [];
	let item = {name: ''}
	res.render(folderView +'upload', { title: 'upload file', errors, item});	
});  

//test upload file
router.post('/upload', (req, res, next)=>{
	
	uploadThumb(req, res, function (err) {
		req.body = JSON.parse(JSON.stringify(req.body));		
		validateArticle.validator(req);
		let item   = Object.assign(req.body);  //lấy lại các thứ gửi lên
		let error = [];
		
		let errors = req.validationErrors();
		if(errors != false){  //có lỗi
			//res.render(folderView +'upload', { title: 'upload file', errors, item});
		}else{
			console.log('khong bi loi')
		}
				
		if (err) {
			errors.push({param: 'thumb', msg: err})
			// An unknown error occurred when uploading.// 		 
		}
		res.render(folderView +'upload', { title: 'upload file', errors, item});
	})
		
})

router.get('(/:status)?',async (req, res, next)=> {     //(/:status)? đây là những ký hiệu trong regularexpression nghã là có cũng được, không có cũng đươcj
	
	 
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
	let statusFilter  = await UtilsHelper.createFilterStatus(currentStatus, 'article');
	
	//lấy các điều kiện sort
	let sort_field = ParamsHelper.getParams(req.session, 'sort_field', 'ordering');
	let sort_type  = ParamsHelper.getParams(req.session, 'sort_type', 'asc');
	let categoryId    = ParamsHelper.getParams(req.session, 'category_id', 'novalue');
	if(categoryId != 'novalue'){
		objWhere['category.id'] =  categoryId;
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
	await ArticleModels.countDocuments(objWhere).then((data)=>{
			pagination.totalItems = data;		  
		 })
	
		 //lấy danh sách category
	let categoryItems = [];
	await CategoryModel
		.find({})
		.select('id name')
		.then((items)=>{
			categoryItems = items;			
		})
	
	//lấy dữ liệu 	
	ArticleModels.listItems(objWhere,sort,pagination).then((items)=> {		
		res.render(folderView + 'list', { 
			title: 'Article List page',
			items,
			statusFilter,
			currentStatus,
			query,
			pagination,
			sort_field,
			sort_type,
			categoryItems,
			categoryId
		});
	}); 

});

//thay đổi trạng thái status
router.get('/change-status/:id/:status', function(req, res, next) {	
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let id            = ParamsHelper.getParams(req.params, 'id', '');
		
	ArticleModels.changeStatus(id, currentStatus).then((err, result)=>{
		req.flash('success', notify.CHANGE_STATUS_SUSCCESS ); 
		res.redirect(link);
	});	
});


//change status muti
router.post('/change-status/:status', function(req, res, next) {
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let ids = req.body.cid;  //cid là tên đặt ở ô input bên layout	
	
	ArticleModels.changeStatus(ids, currentStatus, 'muti').then((result)=>{	
		req.flash('success', util.format(notify.CHANGE_STATUS_MUTI_SUSCCESS, result.n ));
		res.redirect(link);
	})	
});

//thay đổi trạng thái special
router.get('/change-special/:id/:status', function(req, res, next) {	
	let currentSpecial = ParamsHelper.getParams(req.params, 'status', 'nomal');
	let id            = ParamsHelper.getParams(req.params, 'id', '');
		
	ArticleModels.changeSpecial(id, currentSpecial).then((err, result)=>{
		req.flash('success', notify.CHANGE_SPECIAL_SUSCCESS ); 
		res.redirect(link);
	});	
});

//change special muti
router.post('/change-special/:status', function(req, res, next) {
	let currentSpecial = ParamsHelper.getParams(req.params, 'status', 'active');
	let ids = req.body.cid;  //cid là tên đặt ở ô input bên layout	
	
	ArticleModels.changeSpecial(ids, currentSpecial, 'muti').then((result)=>{	
		req.flash('success', util.format(notify.CHANGE_SPECIAL_MUTI_SUSCCESS, result.n ));
		res.redirect(link);
	})	
});

//change ordering
router.post('/change-ordering/', function(req, res, next) {
		let ids     = req.body.cid;
		let ordering = req.body.ordering;		
		if(Array.isArray(ids)){
			ArticleModels.changeOrdering(ids, ordering, 'muti').then((result)=>{
				req.flash('success', util.format( notify.CHANGE_ORDERING_MUTI_SUSCCESS,ids.length ));
				res.redirect(link);
			});
			
		}else{
			ArticleModels.changeOrdering(ids, ordering).then((result)=>{
				req.flash('success', notify.CHANGE_ORDERING_SUSCCESS);
				res.redirect(link);
			});	
		}
	
	
});

//khi nhấn delete
router.get('/delete/:id', async (req, res, next)=> {	
	let id  = ParamsHelper.getParams(req.params, 'id', '');

	ArticleModels.deleteItems(id).then((result)=>{
		req.flash('success', notify.DELETE_SUSCCESS );
	 	res.redirect(link);
	})	
});

//delete- muti
router.post('/delete', function(req, res, next) {	
	let ids = req.body.cid;    //cid là tên đặt trong ô input

	ArticleModels.deleteItems(ids, 'muti').then((result)=>{
		req.flash('success', util.format( notify.DELETE_MUTI_SUSCCESS, result.n ));
		res.redirect(link);
	})
});
			  

//add và Edit
router.get('/form/:status/:id?', async (req, res, next)=> {  
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'add');
	let id 			  = ParamsHelper.getParams(req.params, 'id', '');	
	let errors        = [];
	let cateloryItems = [];
	let item 		  ={};
	await CategoryModel
		.find({})
		.select('id name')
		.then((items)=>{
			categoryItems = items;			 
		})
	if(currentStatus == 'add'){
		let item = {name: '', thumb: '', ordering: 0, status: 'novalue', special: 'novalue', content: '', category: {id: '', name: ''}}			
		res.render(folderView +'form', { title: 'Article Add page', item, cateloryItems, errors });
	}else{
	await	ArticleModels.getItem(id)
			.then((itemArticle)=>{
				item = itemArticle;
			})
			res.render(folderView +'form', { title: 'Article Edit page', item, categoryItems, errors });
	}
  
});

//validate.validator() là modun mình tự viết
router.post('/save',  (req, res, next)=>{	
	uploadThumb(req, res, async (errThumb)=> {
		
		//console.log(req.file)		
	   	const itemEdit       = await Object.assign(req.body);  //lấy lại các thứ gửi lên			 
		let taskCurrent = (itemEdit.id !== '')? 'edit' : 'add';
		let massage = (taskCurrent === 'edit')? notify.CHANGE_ITEM_SUSCCESS : notify.ADD_SUSCCESS;
		let title   = (taskCurrent === 'edit')? 'Article Edit page' : 'Article add page';		
		let errors = validateArticle.validator(req, errThumb, taskCurrent);	
		
		//vẫn phải lấy về để khi bị lỗi vẫn có dữ liệu truyền qua
		let categoryItems = [];
		await CategoryModel.find({}).select('id name').then((items)=>{
				categoryItems = items;			
			})
			
		const item = {
			id       : itemEdit.id,
			name     : itemEdit.name, 
			ordering : parseInt(itemEdit.ordering), 
			status   : itemEdit.status, 
			special  : itemEdit.special,
			category    : {
				id   : itemEdit.category_id,
				name : itemEdit.category_name,
			}, 
			content  : itemEdit.content
		};	
		 
		
		if (errors.length > 0) { 	
			//khi chèn tấm hình lên đúng, các trường dữ liêu khác sai thì hình vần chèn. do đó phải xóa đi
		    if(req.file != undefined){
				FilesHelper.remove('public/uploads/article/', req.file.filename);  //xóa tấm hình khi file k hơp lệ. 
			} 
			item.thumb = itemEdit.image_old;
			res.render(folderView +'form', {title, item, categoryItems, errors: errors});			
		}else{						
			if(req.file === undefined){  //edit thông tin k phải edit hình
				item.thumb = itemEdit.image_old;
			}else{
				item.thumb = req.file.filename;  
				if(taskCurrent == 'edit'){
					FilesHelper.remove('public/uploads/article/', itemEdit.image_old);
				}
			} 

			ArticleModels.saveItems(item, taskCurrent).then((err, result)=>{
				req.flash('success', massage );
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

router.get('/filter-category/:category_id', function(req, res, next) { 

	let category_id = ParamsHelper.getParams(req.params, 'category_id', '');

	//lưu vào trong session
	req.session.category_id = category_id;
	
	res.redirect(link);
});




module.exports = router;
 