var express = require('express');
var router = express.Router();

const CategoryModel  = require(__path_models  + 'category');
const ArticleModel   = require(__path_models  + 'article');
const ParamsHelper   = require(__path_helpers   + 'params');

const folderView = __path_views_frontend + 'pages/article/';
const layoutFrontend = __path_views_frontend + 'frontend';


router.get('/:id', async (req, res, next)=> {
    let idArticle           = ParamsHelper.getParams(req.params, 'id', '');    
    //let itemsCategory   = []; //do sử dụng middleware để truyền qua ngoài view rôiif
    let itemsRandom     = []; 
    let itemsInCategory = [];   
    let itemPost = {}
   // await  CategoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items)=>{itemsCategory = items; });     
    await  ArticleModel.getItem( idArticle ).then((items)=>{ itemPost = items; });
    await  ArticleModel.listItemsFrontend( null, {task: 'items-random'}).then((items)=>{ itemsRandom = items; }); 
    await  ArticleModel.listItemsFrontend(itemPost, {task: 'items-others'}).then((items)=>{itemsInCategory = items; });
     
	res.render(folderView +'index', {         
           layout: layoutFrontend,   //định lại đường dẫn cho layout
           top_post: false,            
           //itemsCategory,
           itemPost,
           itemsRandom,
           itemsInCategory
           
    });
});


module.exports = router;