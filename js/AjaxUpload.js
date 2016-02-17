/**
 * Ajax upload plugin
 *
 * @author      yangjian102621@163.com
 * @version     1.0.0
 * @since       2015.09.18
 */

(function($) {

	//import css
	$('head').append('<link type="text/css" rel="stylesheet" href="skin/ajax-upload.css">');
	$.fn.ajaxUpload = function(options) {

		//default options(默认选项)
		var defaults = {
			src : "src",
			uploadUrl : null,
			dataType : "json",
			maxFileSize : 2048,
			onSuccess : function(e) {

			},
			onError : function(e) {},
			onLoadStart : function(e) {},
			onComplete : function() {
				//hide add file button（隐藏添加文件按钮）
				$("#jupload-btn-box").find(".btn-add-file").remove();
				$("#addmore-box").hide();
				console.log("文件上传完毕。");
			}

		}

		options = $.extend(defaults, options);
		//files list to upload(等待上传的文件列表)
		var fileList = new Array();
		//current upload file index(当前上正在上传的文件的索引)
		var uploadIndex = 0;

		//create frame elements(创建框架元素)
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
			+ '</div>';

		$(this).append(frameElements);

		//append initialize upload button(初始化开始上传按钮)
		var initUploadBtn = $('<div class="init-add-file-btn" id="init-add-file-btn"></div>');
		var uploadInput = $('<input type="file" class="input-select-file" id="input-select-file" multiple="true">');
		var addMoreImage = $('<div class="addmore-box" id="addmore-box"><span class="addmore-btn"></span></div>');
		addMoreImage.on("click", function() {
			$("#input-select-file").trigger("click");
		});

		$("#jupload-btn-box"+" .btn-add-file").on("click", function() {
			$("#input-select-file").trigger("click");
		});

		//bind start upload event(绑定开始上传事件)
		$("#jupload-btn-box"+" .btn-upload").on("click", function() {
			if ( fileList.length == 0 ) {
				alert("请至少添加一个文件！");
				return false;
			}
			uploadFile(fileList.shift());
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
			var toUploadNum = $(".img-container").length;
			for ( var i = toUploadNum; i < toUploadNum+list.length; i++ ) {

				var image = $('<div class="img-container" id="img-comtainer-'+i+'">'
							+ '    <div class="image">'
							+ '       <img src="" width="150px;" border="0">'
							+ '       <div class="mask">等待上传……</div>'
							+ '     </div>'
							+ '     <div class="file-info">'
							+ '         <div class="progress"><span class="progress-bar" id="upload-progress-bar-'+i+'"></span></div>'
							+ '         <div class="file-size">'+formatFileSize(list[i-toUploadNum].size)+'</div>'
							+ '     </div>'
							+ '     <span class="remove" index="'+i+'"></span>'
							+ '     <span class="success"></span>'
							+ '</div>');

				//bind ondelele event(绑定删除文件事件)
				image.find(".remove").on("click", function() {

					onDelete(this);

				});
				$("#addmore-box").before(image);
				fileList.push(list[i-toUploadNum]);
			}

			$("#init-add-file-btn").hide();
		});

		initUploadBtn.append(uploadInput);
		$("#jupload-panel").append(initUploadBtn);

		//adjust the upload button's position(调整“选择文件”按钮位置)
		setTimeout(function() {
			initUploadBtn.css({
				top : ($("#jupload-panel").height() - initUploadBtn.height()) / 2 + "px",
				left : ($("#jupload-panel").width() - initUploadBtn.width()) / 2 + "px"
			});
		}, 100);

		//delete file callback(删除文件回调)
		function onDelete(obj) {
			//remove dom
			$(obj).parent().remove();
			//remove file from the filelist that to be uploaded.(从待上传队列中删除文件)
			var index = $(obj).attr("index");
			fileList.splice(index, 1);
			if ( $(".img-container").length == 0 ) {
				$("#init-add-file-btn").show();
				addMoreImage.hide();
			}
			//图片重新编号
			$("#image-list-box").find(".remove").each(function(index, element) {
				$(element).attr("index", index);
			});
			//console.log(fileList.length);
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
				uploadIndex++;
				uploadNextFile();   //skip the file and upload the next file
				return;
			}

			// prepare XMLHttpRequest
			var xhr = new XMLHttpRequest();
			xhr.open('POST', options.uploadUrl);
			//upload successfully
			xhr.addEventListener('load',function(e) {

				if ( options.dataType == "json" ) {
					var data = $.parseJSON(e.explicitOriginalTarget.responseText);
					if ( data.code == 1 ) {
						$("#img-comtainer-"+uploadIndex).find("img").attr("src", data.message);
						$("#img-comtainer-"+uploadIndex).find(".remove").hide().next().show();
						$("#img-comtainer-"+uploadIndex).find(".mask").hide();
					} else {
						var message = data.message || "上传失败！";
						$("#img-comtainer-"+uploadIndex).find(".mask").html(message).addClass("error");
					}
				}

				options.onSuccess(e);

			}, false);

			// file upload complete
			xhr.addEventListener('loadend', function () {

				console.log("loadend");
				//upload the next file
				uploadIndex++;
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

			//check the size
			var maxsize = options.maxFileSize * 1024;
			if ( maxsize > 0 && file.size > maxsize ) {
				$("#img-comtainer-"+uploadIndex).find(".mask").html("文件大小不能超过 "+options.maxFileSize + " KB").addClass("error");
				return false;
			}

			//check the extension here

			return true;

		}

		//upload next file(上传下一个文件)
		function uploadNextFile() {

			if ( fileList.length ) {
				var nextFile = fileList.shift();
				uploadFile(nextFile);
			} else {
				//all file upload completed
				options.onComplete();
				//initalize the data
				uploadIndex = 0;
				fileList = new Array();
			}
		}

		// progress handler(文件上传进度控制)
		function updateProgress(e) {
			console.log(uploadIndex);
			if ( e.lengthComputable ) {
				$("#upload-progress-bar-"+uploadIndex).css({"width" : (e.loaded/e.total)*100+'%'});
			}
		}


	}

})(jQuery);