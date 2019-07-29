
const CategoryModel  = require(__path_models  + 'category');

module.exports =  async (req, res, next)=>{
    await  CategoryModel
            .listItemsFrontend(null, {task: 'items-in-menu'})
            .then((items)=>{  res.locals.itemsCategory = items; });     
                     
    next();     
}