/**
 * 仿腾讯UI的HTML5上传插件
 *
 * @author yangjian<yangjian102621@gmail.com>
 * @version 1.0.1
 * @since 2015.09.18
 */

var TUpload = function(options) {

	//判断浏览器是否支持html5
	if ( !window.applicationCache )
		throw new Error("Your browser version is too low, do not support html5, can not be used AjaxUpload upload the plugin, please upgrade your browser!");

	//default options(默认选项)
	var defaults = {
		src : "src",
		uploadUrl : null,
		dataType : "json",
		maxFileSize : 2048,    //上传文件大小
		maxFileNum : 20, //最多上传文件的个数
		extAllow : "jpg|png|gif|jpeg",
		extRefuse : "exe|txt",
		callback : function(imageList) {},
		onSuccess : function(e) {},
		onError : function(e) {},
		onLoadStart : function(e) {},
		onComplete : function() {
			//hide add file button（隐藏添加文件按钮）
			$("#addmore-box").hide();
			//console.log("文件上传完毕。");
		}

	}

	//错误代码和提示消息
	var codeMessageMap = {
		'0' : '文件上传成功',
		'1' : '文件上传失败',
		'2' : '文件大小超出限制',
		'3' : '非法文件名后缀'
	}

	options = $.extend(defaults, options);

	var toUploadList = new Array();   //等待上传的文件列表
	var currentUploadIndex = 0;  //当前上正在上传的文件的索引
	var uploadSuccessList = new Array(); //上传成功的文件列表

	//create frame elements(创建框架元素)
	function createElements() {
		var frameElements =
			'<div class="jupload-container" id="jupload-container">'
			+ '		<div class="jupload-panel" id="jupload-panel">'
			+ '         <div class="image-list-box" id="image-list-box">'
			+ '         </div>'
			+ '     </div>'
			+ '     <div class="jupload-btn-box" id="jupload-btn-box">'
			+ '         <button class="btn-upload"></button>'
			+ '         <button class="btn-add-file"></button>'
			+ '     </div>'
			+ '     <span class="jupload-close"></span>'
			+ '</div>';

		$('body').append(frameElements);

		//append initialize upload button(初始化开始上传按钮)
		var initUploadBtn = $('<div class="init-add-file-btn" id="init-add-file-btn"></div>');
		var uploadInput = $('<input type="file" class="input-select-file" id="input-select-file" multiple="true">');
		var addMoreImage = $('<div class="addmore-box" id="addmore-box"><span class="addmore-btn"></span></div>');
		addMoreImage.on("click", function() {
			$("#input-select-file").trigger("click");
		});

		$("#jupload-btn-box  .btn-add-file").on("click", function() {

			if ( toUploadList.length > 0 ) {
				alert("请先上传文件！");
				return false;
			}
			if ( uploadSuccessList.length > 0 ) {
				options.callback(uploadSuccessList);
			}
			$('#jupload-container').remove();
			//console.log("close the window.");
		});

		//关闭上传对话框
		$("#jupload-container .jupload-close").on("click", function() {
			$('#jupload-container').remove();
		});

		//bind start upload event(绑定开始上传事件)
		$("#jupload-btn-box"+" .btn-upload").on("click", function() {
			if (toUploadList.length == 0 ) {
				alert("请至少添加一个文件！");
				return false;
			}
			uploadFile(toUploadList.shift());
		});

		uploadInput.on("change", function() {

			//append add more image button(创建继续添加按钮)
			if ( $("#image-list-box").find(".addmore-box").length == 0 ) {
				$("#image-list-box").append(addMoreImage);
			} else {
				addMoreImage.show();
			}

			//add files to the filelist, and create file icon(添加文件到待上传文件列表)
			var list = uploadInput[0].files;
			var addedNum = $("#jupload-container .img-container").length;   //已经添加的文件数目
			for ( var i = addedNum; i < addedNum+list.length; i++ ) {

				if ( toUploadList.length >= options.maxFileNum ) {
					alert("您本次最多上传"+options.maxFileNum+"个文件.");
					break;
				}
				var image = $('<div class="img-container" id="img-comtainer-'+i+'">'
					+ '    <div class="image">'
					+ '       <img src="'+window.URL.createObjectURL(list[i-addedNum])+'" width="150" border="0">'
					+ '       <div class="mask">等待上传……</div>'
					+ '     </div>'
					+ '     <div class="file-info">'
					+ '         <div class="progress"><span class="progress-bar" id="upload-progress-bar-'+i+'"></span></div>'
					+ '         <div class="file-size">'+formatFileSize(list[i-addedNum].size)+'</div>'
					+ '     </div>'
					+ '     <span class="remove" index="'+i+'"></span>'
					+ '     <span class="success"></span>'
					+ '</div>');

				//bind ondelele event(绑定删除文件事件)
				image.find(".remove").on("click", function() {

					onDelete(this);

				});
				$("#jupload-container  #addmore-box").before(image);
				toUploadList.push(list[i-addedNum]);
			}

			$("#init-add-file-btn").hide();
		});

		initUploadBtn.append(uploadInput);
		$("#jupload-panel").append(initUploadBtn);

		//调整“选择文件”按钮位置
		initUploadBtn.css({
			top : ($("#jupload-panel").height() - initUploadBtn.height()) / 2 + "px",
			left : ($("#jupload-panel").width() - initUploadBtn.width()) / 2 + "px"
		});

		//调整插件位置，使其居中显示
		var scrollTop = window.document.body.scrollTop || window.document.documentElement.scrollTop;
		var frameBox = $('#jupload-container');
		frameBox.css({
			top : scrollTop + 20 +'px',
			left : ($(window).width() - frameBox.width()) / 2
		});

	}

	//delete file callback(删除文件回调)
	function onDelete(obj) {
		//remove dom
		$(obj).parent().remove();
		//remove file from the filelist that to be uploaded.(从待上传队列中删除文件)
		var index = $(obj).attr("index");
		toUploadList.splice(index, 1);
		if ( $(".img-container").length == 0 ) {
			$("#init-add-file-btn").show();
			addMoreImage.hide();
		}
		//图片重新编号
		$("#image-list-box").find(".remove").each(function(index, element) {
			$(element).attr("index", index);
		});
		//console.log(toUploadList.length);
	}

	//format file size(格式化文件大小)
	function formatFileSize(size) {

		if ( size/1048576 > 1 ) {
			return (size/1048576).toFixed(2)+"MB";
		} else {
			return (size/1024).toFixed(2)+"KB";
		}

	}

	//upload file function(文件上传主函数)
	function uploadFile(file) {

		if ( !fileCheckHandler(file) ) {
			currentUploadIndex++;
			uploadNextFile();   //skip the file and upload the next file
			return;
		}

		// prepare XMLHttpRequest
		var xhr = new XMLHttpRequest();
		xhr.open('POST', options.uploadUrl);
		//upload successfully
		xhr.addEventListener('load',function(e) {

			if ( options.dataType == "json" ) {
				//console.log(e);
				var data = $.parseJSON(e.target.responseText);
				if ( data.code == 0 ) {
					uploadSuccessList.push(data.message);   //添加文件到上传文件列表
					//$("#img-comtainer-"+ currentUploadIndex).find("img").attr("src", data.message);
					$("#img-comtainer-"+ currentUploadIndex).find(".remove").hide().next().show();
					$("#img-comtainer-"+ currentUploadIndex).find(".mask").hide();
				} else {
					$("#img-comtainer-"+ currentUploadIndex).find(".mask").html(codeMessageMap[data.code]).addClass("error");
				}
			}

			options.onSuccess(e);

		}, false);

		// file upload complete
		xhr.addEventListener('loadend', function () {

			//upload the next file
			currentUploadIndex++;
			uploadNextFile();

		}, false);

		xhr.addEventListener('error', function(e) {
			options.onError(e);
		}, false);

		xhr.upload.addEventListener('progress', function(e) {
			updateProgress(e);
		}, false);

		xhr.upload.addEventListener('loadstart', function(e) {
			options.onLoadStart(e);
		}, false);

		// prepare FormData
		var formData = new FormData();
		formData.append(options.src, file);
		xhr.send(formData);

	}

	//file check handler(文件检测处理函数)
	function fileCheckHandler(file) {

		//检查文件大小
		var maxsize = options.maxFileSize * 1024;
		if ( maxsize > 0 && file.size > maxsize ) {
			__error__("文件大小不能超过 "+options.maxFileSize + " KB");
			return false;
		}

		//检查文件后缀名
		var ext = getFileExt(file.name);
		if ( ext && options.extAllow.indexOf(ext) != -1
			&& options.extRefuse.indexOf(ext) == -1 ) {
			return true;
		} else {
			__error__("非法的文件后缀 "+ext);
			return false;
		}

	}

	//获取文件后缀名
	function getFileExt(filename) {

		var position = filename.lastIndexOf('.')
		if ( position != -1 ) {
			return filename.substr(position+1).toLowerCase();
		}
		return false;
	}

	//显示错误信息
	function __error__(message) {
		$("#img-comtainer-"+ currentUploadIndex).find(".mask").html(message).addClass("error");
	}

	//upload next file(上传下一个文件)
	function uploadNextFile() {

		if ( toUploadList.length ) {
			var nextFile = toUploadList.shift();
			uploadFile(nextFile);
		} else {
			//all file upload completed
			options.onComplete();
			//initalize the data
			currentUploadIndex = 0;
			toUploadList = new Array();
		}
	}

	// progress handler(文件上传进度控制)
	function updateProgress(e) {
		//console.log(currentUploadIndex);
		if ( e.lengthComputable ) {
			$("#upload-progress-bar-"+ currentUploadIndex).css({"width" : (e.loaded/e.total)*100+'%'});
		}
	}

	createElements();

};