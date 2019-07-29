var express = require('express');
var router = express.Router();

const CategoryModel  = require(__path_models  + 'category');
const ArticleModel   = require(__path_models  + 'article');
const ParamsHelper   = require(__path_helpers   + 'params');

const folderView = __path_views_frontend + 'pages/about/';
const layoutFrontend = __path_views_frontend + 'frontend';

router.get('/', async (req, res, next)=> {   
   // let itemsCategory = [];  do đã sử dụng midddlewarre để truyền ra ngoài view
    let itemsRandom = [];
    
    await   CategoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items)=>{itemsCategory = items; });        
    await  ArticleModel.listItemsFrontend( null, {task: 'items-random'}).then((items)=>{ itemsRandom = items; });
    
	res.render(folderView +'index', { 
           layout: layoutFrontend,   //định lại đường dẫn cho layout
           top_post: false,            
          // itemsCategory,
           itemsRandom                         
    });
});


module.exports = router;