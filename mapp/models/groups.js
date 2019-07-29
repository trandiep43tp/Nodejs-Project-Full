const ItemModel    = require(__path_schemas   + 'groups');
//mục đích của models là tách các phương thức xử lý dữ liệu sau đó trả về cho routes. 
module.exports = {
    //lấy ra danh sách items
    listItems: (objWhere,sort,pagination)=>{
        return  ItemModel
                    .find(objWhere)
                    .select('name status ordering created modified group_acp')
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
    changeGroupACP: (id, currentGroup, option = null)=>{
       
        let group_acp = (currentGroup === 'yes')? 'no' : 'yes';
        let data = {
            group_acp,
            modified: {
                user_id: 0,
                user_name: 'admin',  
                time: Date.now()	
          }
        }	
        if(option === 'muti'){
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
    }    
}