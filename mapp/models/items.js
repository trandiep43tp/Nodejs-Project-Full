const ItemModel    = require(__path_schemas   + 'items');
//mục đích của models là tách các phương thức xử lý dữ liệu sau đó trả về cho routes. 
module.exports = {
    //lấy ra danh sách items
    listItems: (objWhere,sort,pagination)=>{
        return  ItemModel
                    .find(objWhere)
                    .select('name status ordering created modified')
                    .sort(sort)  //sắp xếp theo thứ tự
                    .skip((pagination.currentPage - 1)*pagination.totalItemsperPage)   //lấy từ vị trí
                    .limit(pagination.totalItemsperPage);

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
        console.log(option)
        let user_name = (option.user != null)? option.user : '';
        let status = (currentStatus === 'active')? 'inactive' : 'active';
        let data = {
            status,
            modified: {
                user_id: 0,
                user_name: user_name,  
                time: Date.now()	
          }
        }	    
        if(option.combo === 'muti'){
            data.status = currentStatus;
            return ItemModel.updateMany({_id: {$in: id}}, data);
        }    

        return ItemModel.updateOne({_id: id}, data);
    },

    changeOrdering: async (ids, ordering, option = null)=>{
        //console.log(ids)
        let data = {           
            modified: {
                user_id: 0,
                user_name: option.user,  
                time: Date.now()	
          } 
        }
		
		if(Array.isArray(ids)){			
            for(let index = 0; index< ids.length; index++){
                data.ordering= parseInt(ordering[index]);	
                await ItemModel.updateOne({_id: ids[index]}, data);
            }
			return Promise.resolve("success")
		}else{
			data.ordering = parseInt(ordering);				
		    return	ItemModel.updateOne({_id: ids}, data);
		}
	
    },

    deleteItems: (ids, option = null)=>{ 
                        
        if(option === 'muti'){           
            return ItemModel.deleteMany({_id: {$in: ids}});
        }    

        return  ItemModel.deleteOne({_id: ids});       
    },

    saveItems: (item, option = null)=>{
        if(option.combo === 'add'){
            item.created ={
				user_id: 0,
				user_name: option.user,
				time : Date.now()
			}
			return new ItemModel(item).save();			
        }

        if(option.combo == 'edit'){
            item.modified ={
				user_id: 0,
				user_name: option.user,
				time : Date.now()
			}
		    return	ItemModel.updateOne({_id: item.id}, item);
        }
    }    
}