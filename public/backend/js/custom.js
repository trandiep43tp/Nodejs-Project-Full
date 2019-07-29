


$(document).ready(function () {
    var ckbAll = $(".cbAll");
    var fmAdmin = $("#zt-form");

    // CKEDITOR
    if ($('textarea#content_ck').length) {
        CKEDITOR.replace('content_ck');
    }

    //call active menu (hàm này viết ở bên dưới)
    activeMenu();
    
    //check selectbox
    change_form_action("#zt-form .slbAction", "#zt-form","#btn-action");

    //check all checkbox
    ckbAll.click(function () {
        $('input:checkbox').not(this).prop('checked', this.checked);   //tất cả các thẻ input đều được cchecked
        if($(this).is(':checked')){
            $('.ordering').attr("name", "ordering");  //nếu nút ckbAll được nhấn thì tất cả các class ordering sẽ được thêm thuộc tính name= "odering"        
        }else{
            $(".ordering").removeAttr("name", "ordering"); //nếu nút ckbAll bỏ nhấn thì tất cả các class ordering sẽ bỏ thuộc tính name = "odering"
        }
       
    });
    // hiden notify
    hiddenNotify(".close-btn");
    
    setTimeout(function(){ 
        $(".close-btn").parent().css({'display':'none'})
    }, 7000);

    //click checkbox từng cái thì hàm này được chạy
    $("input[name=cid]").click(function () {
        if ($(this).is(':checked')) {
            $(this).parents("tr").find('.ordering').attr("name", "ordering");
        }else{
            $(this).parents("tr").find('.ordering').removeAttr("name");
        }
    });

    // CONFIRM DELETE  Đây là nút delete sát edit 
    $('a.btn-delete').on('click', () => {
        if (!confirm("Bạn muốn xóa không?")) return false;
    });

    //SELECT trong form user được chọn
    $('select[name="group_id"]').change(function(){
        var group_name = $(this).find('option:selected').text();    //lấy tên khi thay đổi select       
        $("input[name='group_name']").val(group_name)               //gán vào cho thẻ input có name = group_name
       
    });

    //SELECT trong form article được chọn
    $('select[name="category_id"]').change(function(){        
         var category_name = $(this).find('option:selected').text();    //lấy tên khi thay đổi select       
         $("input[name='category_name']").val(category_name)               //gán vào cho thẻ input có name = category_name
    });

     //SELECT trong list user được chọn
     $('select[name="select_box_group"]').change(function(){
        //phân tách đường dẫn url thành 1 mảng
        var path = window.location.pathname.split("/");
        var linkRedirect = '/' + path[1] + '/' + path[2];
        
        linkRedirect += '/filter-group/' + $(this).val(); 
        window.location.pathname = linkRedirect;        
    });

    //SELECT trong list artile được chọn
    $('select[name="select_box_category"]').change(function(){
        //phân tách đường dẫn url thành 1 mảng
        var path = window.location.pathname.split("/");
        var linkRedirect = '/' + path[1] + '/' + path[2];
        
        linkRedirect += '/filter-category/' + $(this).val(); 
        window.location.pathname = linkRedirect;        
    });

    $('input#name_slug').keyup(function(){
        $('input[name="slug"]').val(to_slug($(this).val()));
    });

    //xử lý khi form user submit. do có hình nên k lấy được các trường dữ liệu khác được
    $('form[name = form_upload]').submit(function(){       
       // alert("123");
       let avatar = $(this).find("input[name = avatar]");  //lấy các thông tin thẻ input có name = avatar       
       $(this).find("input[name = avatar]").remove();     // xóa thẻ input đó đi
       $(this).append(avatar).css({'display': 'none'});   //thêm vào sau cùng
    });
   
   
    //active menu function
    function activeMenu() {
        var arrPathname = window.location.pathname.split('/');
        var pattern = (typeof arrPathname[2] !== 'undefined') ? arrPathname[2] : '';

        if (pattern != '') {
            $('#side-menu li a').each(function (index) {
                var subject = $(this).attr("href");
                if (subject != "#" && subject.search(pattern) > 0) {
                    $(this).closest("li").addClass("active");
                    if ($(this).parents("ul").length > 1) {
                        $("#side-menu ul").addClass('in').css("height", "auto");
                        $("#side-menu ul").parent().addClass('active');
                    }
                    return; 
                }
            });
        } else {
            $('#side-menu li').first().addClass("active");
        }
    }

    // hàm này chạy khi selector trong list được chọn
    function change_form_action(slb_selector, form_selector, id_btn_action) {

        var optValue;
        var isDelete = false;
        var pattenCheckDelete = new RegExp("delete", "i");

        $(slb_selector).on("change", function () {            
            optValue = $(this).val();            
           // optValue.test            
            if(optValue !== "") {
                $(id_btn_action).removeAttr('disabled');
            } else {
                $(id_btn_action).attr('disabled', 'disabled');
            }
            $(form_selector).attr("action", optValue);
        });

        $(form_selector + " .btnAction").on("click", function () {
            isDelete = pattenCheckDelete.test($(slb_selector).val());
            if(isDelete){
                var confirmDelete = confirm('Are you really want to delete?');
                if(confirmDelete === false){
                    return;
                }
            }
            isDelete = pattenCheckDelete
            var numberOfChecked = $(form_selector + ' input[name="cid"]:checked').length;
            if (numberOfChecked == 0) {
                alert("Please choose some items Vui lòng chọn các item ");
                return;
            } else {
                var flag = false;
                var str = $(slb_selector + " option:selected").attr('data-comfirm');
                if (str != undefined) {

                    //Kiểm tra giá trị trả về khi user nhấn nút trên popup
                    flag = confirm(str);
                    if (flag == false) {
                        return flag;
                    } else {
                        $(form_selector).submit();
                    }

                } else {
                    if (optValue != undefined) {
                        $(form_selector).submit();
                    }
                }
            }

        });
    }

    // hidden parent (hidden message notify)
    function hiddenNotify(close_btn_selector){
        $(close_btn_selector).on('click', function(){
            $(this).parent().css({'display':'none'});
        })    
    }

    //create slug input
    function to_slug(str){
        // Chuyển hết sang chữ thường
        str = str.toLowerCase();     
    
        // xóa dấu
        str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
        str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
        str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
        str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
        str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
        str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
        str = str.replace(/(đ)/g, 'd');
    
        // Xóa ký tự đặc biệt
        str = str.replace(/([^0-9a-z-\s])/g, '');
    
        // Xóa khoảng trắng thay bằng ký tự -
        str = str.replace(/(\s+)/g, '-');
    
        // xóa phần dự - ở đầu
        str = str.replace(/^-+/g, '');
    
        // xóa phần dư - ở cuối
        str = str.replace(/-+$/g, '');
    
        // return
        return str;
    }   

});
