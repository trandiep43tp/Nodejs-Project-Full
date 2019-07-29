var fs                = require("fs");
const multer          = require("multer");
var path              = require('path');
const randomstring    = require("randomstring");

let uploadFile = (field, forderDes = 'users/', fileNameLength = 10, filesizeMb = 1, fileExtension = 'jpeg|jpg|png|gif')=> {
    const storage=multer.diskStorage({
        destination:function(req,file,cb){  
             cb(null, _path_uploads + forderDes)
             },
        filename: (req, file, cb)=>{ 		
            cb(null, randomstring.generate(fileNameLength) + path.extname(file.originalname)) //cách đổi tên tập tin ngẫu nhiên
        }
    }); 

    //khai báo biến upload
    const upload=multer({ 
        storage: storage,
        limits: {
            fileSize: filesizeMb * 1024 * 1024
        },
        fileFilter: (req, file, cb)=>{
            const filetypes = new RegExp(fileExtension);		
            const extname   = filetypes.test(path.extname(file.originalname).toLowerCase());		
            const mimetype  = filetypes.test(file.mimetype);
            if(mimetype && extname){
                return cb(null, true)
            }else{
                cb('Phần mở rộng của tập tin không phù hợp!');   //
            }
        }
    }).single(field);
    
    return upload;

}

let removeFile = (folder, fileName)=>{
    if(fileName != '' && fileName != undefined){
        let path = folder + fileName;
        if(fs.existsSync(path)){
            fs.unlink(path,(err)=>{ if(err) throw err;});
        }
    }
}

module.exports = {
    upload: uploadFile,
    remove: removeFile
}