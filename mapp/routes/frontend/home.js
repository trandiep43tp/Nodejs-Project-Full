var express = require('express');
var router = express.Router();

const CategoryModel  = require(__path_models  + 'category');
const ArticleModel   = require(__path_models  + 'article');
const folderView     = __path_views_frontend + 'pages/home/';
const layoutFrontend = __path_views_frontend + 'frontend';

router.get('/', async (req, res, next)=> {
    //sử dụng middlewware để truyền luôn itemincategory sang vieew luôn. các biến khác có thể lammf tương tự
    //let itemsCategory = []    //lấy ra các category đưa vào menu 
    let itemsNews = [];       // lấy ra các items mới nhất
    let itemsSpecial = [];    // lấy ra các item đặc biệt
    let itemsRandom = [];     // lấy ra các item ngẫu nhiên
    //await  CategoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items)=>{ itemsCategory = items; });
    await  ArticleModel.listItemsFrontend( null, {task: 'items-special'}).then((items)=>{ itemsSpecial = items;  });
    await  ArticleModel.listItemsFrontend( null, {task: 'items-news'}).then((items)=>{ itemsNews = items; });
    await  ArticleModel.listItemsFrontend( null, {task: 'items-random'}).then((items)=>{ itemsRandom = items; });

	res.render(folderView +'index', { 
           layout: layoutFrontend,   //định lại đường dẫn cho layout
           top_post: true,         
           itemsSpecial,
          // itemsCategory,
           itemsNews,
           itemsRandom         
    });
});

module.exports = router;