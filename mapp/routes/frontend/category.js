var express = require('express');
var router = express.Router();

const CategoryModel  = require(__path_models  + 'category');
const ArticleModel   = require(__path_models  + 'article');
const ParamsHelper   = require(__path_helpers   + 'params');

const folderView = __path_views_frontend + 'pages/category/';
const layoutFrontend = __path_views_frontend + 'frontend';


router.get('/:id', async (req, res, next)=> {
    let idCategory            = ParamsHelper.getParams(req.params, 'id', '');    
    //let itemsCategory = [];
    let itemsInCategory = [];
    let itemsRandom = [];
    let view = '';
    //await  CategoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items)=>{itemsCategory = items; }); 
    await  ArticleModel.listItemsFrontend({id: idCategory}, {task: 'items-in-category'}).then((items)=>{itemsInCategory = items; });    
    await  ArticleModel.listItemsFrontend( null, {task: 'items-random'}).then((items)=>{ itemsRandom = items; });
    await CategoryModel.getViewCategory(idCategory).then( item => a = item.view);
    //view = itemsCategory.find(x => x.id === idCategory).view;
    
   console.log("view: " + a)
	res.render(folderView +'index', { 
        
           layout: layoutFrontend,   //định lại đường dẫn cho layout
           top_post: false,            
           //itemsCategory,
           itemsInCategory,
           itemsRandom,
           view
    });
});


module.exports = router;