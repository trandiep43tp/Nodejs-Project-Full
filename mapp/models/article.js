
var fs      = require("fs");
const ItemModel    = require(__path_schemas   + 'article');
const FilesHelper  = require(__path_helpers   + 'file'); 
const forderArticle = 'public/uploads/article/';

//mục đích của models là tách các phương thức xử lý dữ liệu sau đó trả về cho routes. 
module.exports = {
    //lấy ra danh sách items
    listItems: (objWhere, sort, pagination)=>{
        return  ItemModel
                    .find(objWhere)
                    .select('name thumb status special ordering created modified category.name')
                    .sort(sort)  //sắp xếp theo thứ tự
                    .skip((pagination.currentPage - 1)*pagination.totalItemsperPage)   //lấy từ vị trí
                    .limit(pagination.totalItemsperPage);

    }, 
 
    //lấy ra danh sách  item có special = top_post
    listItemsFrontend: (parram = null, option = null)=>{
        if(option.task == 'items-special'){ 
            return  ItemModel
                    .find({status: 'active', special: 'top_post'})
                    .select('name thumb created category.name') 
                    .sort({ordering: 'asc'})                 
                    .limit(3);
        }

        if(option.task == 'items-news'){
            return  ItemModel
                    .find({status: 'active'})
                    .select('name thumb created category.name content') 
                    .sort({'created.time': 'desc'});                
                    
        }

        if(option.task == 'items-in-category'){
            return  ItemModel
                    .find({status: 'active', 'category.id' : parram.id})
                    .select('name thumb created category.name content') 
                    .sort({'created.time': 'desc'});           
        }

        if(option.task == 'items-random'){
            return  ItemModel.aggregate([
                { $match: {status: 'active'}},
                { $project: {id: 1, name: 1, created: 1, thumb: 1 }},
                { $sample: {size: 3}}
            ])                              
        }  
        
        if(option.task == 'items-others'){
           // console.log(parram.id )
            return  ItemModel
                    .find({status: 'active', _id: {$ne: parram.id}, 'category.id' : parram.category.id})
                    .select('name thumb created category.name content') 
                    .sort({'created.time': 'desc'});           
        }
       
    }, 
    //đếm items   
    countDocuments: (objWhere, option = null)=>{
        return ItemModel.countDocuments(objWhere);
    },

    //lấy ra 1 items
    getItem: (id, option =  null)=>{
        return ItemModel.findById(id);
    },

    changeStatus: (id, currentStatus, option = null)=>{
       
        let status = (currentStatus === 'active')? 'inactive' : 'active';
        let data = {
            status,
            modified: {
                user_id: 0,
                user_name: 'admin',  
                time: Date.now()	
          }
        }	    
        if(option === 'muti'){
            data.status = currentStatus;
            return ItemModel.updateMany({_id: {$in: id}}, data);
        }    

        return ItemModel.updateOne({_id: id}, data);
    },

    changeSpecial: (id, currentSpecial, option = null)=>{
       
        let special = (currentSpecial === 'nomal')? 'top_post' : 'nomal';
        let data = {
            special,
            modified: {
                user_id: 0,
                user_name: 'admin',  
                time: Date.now()	
          }
        }	    
        if(option === 'muti'){
            data.special = currentSpecial;
            return ItemModel.updateMany({_id: {$in: id}}, data);
        }    

        return ItemModel.updateOne({_id: id}, data);
    },


    changeOrdering: async (ids, ordering, option = null)=>{
        let data = {           
            modified: {
                user_id: 0,
                user_name: 'admin',  
                time: Date.now()	
          }
        }
		
		if(Array.isArray(ids)){			
            for(let index = 0; index< ids.length; index++){
                data.ordering= parseInt(ordering[index]);	
                await ItemModel.updateOne({_id: ids[index]}, data);
            }
			return Promise.resolve("success");  //sau khi thực hiện xong mới return một trạng thái
		}else{
			data.ordering = parseInt(ordering);				
		    return	ItemModel.updateOne({_id: ids}, data);
		}
	
    },

    deleteItems: async(ids, option = null)=>{ 
                        
        if(option === 'muti'){ 
            //thực hiện xóa hình
            for(let index = 0; index < ids.length; index++){
                await ItemModel.findById(ids[index]).then((item)=>{   
                    FilesHelper.remove(forderArticle, item.thumb);                   
                });
            }         
            return ItemModel.deleteMany({_id: {$in: ids}});
        }    

        //lấy lại thông tin item để lấy tên thumb              
        await ItemModel.findById(ids).then((item)=>{    
            FilesHelper.remove(forderArticle, item.thumb);       
        });
        return  ItemModel.deleteOne({_id: ids});       
    },

    saveItems: (item, option = null)=>{
        if(option == 'add'){
            item.created ={
				user_id: 0,
				user_name: "admin",
				time : Date.now()
			}
			return new ItemModel(item).save();			
        }

        if(option == 'edit'){
            item.modified ={
				user_id: 0,
				user_name: "admin",
				time : Date.now()
			}
		    return	ItemModel.updateOne({_id: item.id}, item);
        }
    },

    itemUpdateName: (item, option = null)=>{          
        return ItemModel.updateMany({'category.id': item.id}, {category: {id: item.id, name: item.name}})      
    }
}