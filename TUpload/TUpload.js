/**
 * 仿腾讯UI的HTML5上传插件
 *
 * @author yangjian<yangjian102621@gmail.com>
 * @version 1.0.1
 * @since 2015.09.18
 */

(function($) {

	// 加载 css 文件
	var js = document.scripts, script = js[js.length - 1], jsPath = script.src;
	var cssPath = jsPath.substring(0, jsPath.lastIndexOf("/") + 1)+"css/tupload.css"
	$("head:eq(0)").append('<link href="'+cssPath+'" rel="stylesheet" type="text/css" />');

	window.TUpload = function(options) {

		//判断浏览器是否支持html5
		if ( !window.applicationCache ) {
			alert("您当前的浏览器不支持HTML5,请先升级浏览器才能使用该上传插件!");
			return;
		}

		$.fn.imageCrop = function(__width, __height) {
			$(this).on("load", function () {

				var width, height, left, top;
				var orgRate = this.width/this.height;
				var cropRate = __width/__height;
				if ( orgRate >= cropRate ) {
					height = __height;
					width = __width * orgRate;
					top = 0;
					left = (width - __width)/2;
				} else {
					width = __width;
					height = __height / orgRate;
					left = 0;
					//top = (height - __height)/2;
					top = 0;
				}
				$(this).css({
					"position" : "absolute",
					top : -top + "px",
					left : -left + "px",
					width : width + "px",
					height : height + "px"
				});
			});
		}

		$.fn.draggable = function(options) {
			var defaults = {
				handler : null
			}
			options = $.extend(defaults, options);
			var __self = this;
			var handler = options.handler;
			if ( !handler ) handler = this;
			$(handler).mousedown(function(e) {
				var offsetLeft = e.pageX - $(__self).position().left;
				var offsetTop = e.pageY - $(__self).position().top;
				$(document).mousemove(function(e) {
					//清除拖动鼠标的时候选择文本
					window.getSelection ? window.getSelection().removeAllRanges():document.selection.empty();
					$(__self).css({
						'top'  : e.pageY-offsetTop + 'px',
						'left' : e.pageX-offsetLeft + 'px'
					});
				});

			}).mouseup(function() {
				$(document).unbind('mousemove');
			});

		}

		//default options(默认选项)
		var defaults = {
			src : "src",
			uploadUrl : null,
			dataType : "json",
			maxFileSize : 2048,    //上传文件大小
			maxFileNum : 20, //最多上传文件的个数
			extAllow : "jpg|png|gif|jpeg",
			extRefuse : "exe|txt",
			zIndex : 9999,
			top : 50,
			callback : function(imageList) {},
			onSuccess : function(e) {},
			onError : function(e) {},
			onLoadStart : function(e) {},
			onComplete : function() {
				//hide add file button（隐藏添加文件按钮）
				G(".addmore-box").hide();
				//console.log("文件上传完毕。");
			}

		}

		//错误代码和提示消息
		var codeMessageMap = {
			'000' : '文件上传成功',
			'001' : '文件上传失败',
			'002' : '文件大小超出限制',
			'003' : '非法文件名后缀'
		}

		options = $.extend(defaults, options);

		var toUploadList = new Array();   //等待上传的文件列表
		var currentUploadIndex = 0;  //当前上正在上传的文件的索引
		var uploadSuccessList = new Array(); //上传成功的文件列表
		var $dialog = null;
		var dialogSCode = Math.ceil(Math.random() * 1000000000000); //对话框的令牌，如果创建多个BUpload上传对象用来保持唯一性

		//create frame elements(创建框架元素)
		function createElements() {
			var frameElements =
				'<div class="tupload-container">'
				+ '		<div class="tupload-panel">'
				+ '         <div class="image-list-box">'
				+ '         </div>'
				+ '     </div>'
				+ '     <div class="tupload-btn-box">'
				+ '         <button class="btn-upload"></button>'
				+ '         <button class="btn-add-file"></button>'
				+ '     </div>'
				+ '     <span class="tupload-close"></span>'
				+ '</div>';
			$dialog = $(frameElements);
			$dialog.draggable();
			$('body').append($dialog);

			//append initialize upload button(初始化开始上传按钮)
			var initUploadBtn = $('<div class="init-add-file-btn"></div>');
			var uploadInput = $('<input type="file" class="input-select-file" multiple="true">');
			var addMoreImage = $('<div class="addmore-box"><span class="addmore-btn"></span></div>');
			addMoreImage.on("click", function() {
				G(".input-select-file").trigger("click");
			});

			G(".btn-add-file").on("click", function() {

				if ( toUploadList.length > 0 ) {
					alert("请先上传文件！");
					return false;
				}
				if ( uploadSuccessList.length > 0 ) {
					options.callback(uploadSuccessList);
				}
				closeDialog();
			});

			//关闭上传对话框
			G(".tupload-close").on("click", function() {
				closeDialog();
			});

			//bind start upload event(绑定开始上传事件)
			G(".btn-upload").on("click", function() {
				if (toUploadList.length == 0 ) {
					alert("请至少添加一个文件！");
					return false;
				}
				uploadFile(toUploadList.shift());
			});

			uploadInput.on("change", function() {

				//append add more image button(创建继续添加按钮)
				if ( G(".image-list-box").find(".addmore-box").length == 0 ) {
					G(".image-list-box").append(addMoreImage);
				} else {
					addMoreImage.show();
				}

				//add files to the filelist, and create file icon(添加文件到待上传文件列表)
				var list = uploadInput[0].files;
				var addedNum = G(".img-container").length;   //已经添加的文件数目
				for ( var i = addedNum; i < addedNum+list.length; i++ ) {

					if ( toUploadList.length >= options.maxFileNum ) {
						alert("您本次最多上传"+options.maxFileNum+"个文件.");
						break;
					}
					var image = $('<div class="img-container" id="img-comtainer-'+dialogSCode+i+'">'
						+ '    <div class="image">'
						+ '       <img src="'+window.URL.createObjectURL(list[i-addedNum])+'" border="0">'
						+ '       <div class="mask">等待上传……</div>'
						+ '     </div>'
						+ '     <div class="file-info">'
						+ '         <div class="tupload-progress"><span class="tupload-progress-bar" id="upload-progress-bar-'+dialogSCode+i+'"></span></div>'
						+ '         <div class="file-size">'+formatFileSize(list[i-addedNum].size)+'</div>'
						+ '     </div>'
						+ '     <span class="remove" index="'+i+'"></span>'
						+ '     <span class="success"></span>'
						+ '</div>');

					//bind ondelele event(绑定删除文件事件)
					image.find(".remove").on("click", function() {
						onDelete(this);
					});
					image.find("img").imageCrop(150, 150);
					G(".addmore-box").before(image);
					toUploadList.push(list[i-addedNum]);
				}

				G(".init-add-file-btn").hide();
			});

			initUploadBtn.append(uploadInput);
			G(".tupload-panel").append(initUploadBtn);

			//调整“选择文件”按钮位置
			initUploadBtn.css({
				top : (G(".tupload-panel").height() - initUploadBtn.height()) / 2 + "px",
				left : (G(".tupload-panel").width() - initUploadBtn.width()) / 2 + "px"
			});

			//调整插件位置，使其居中显示
			var scrollTop = window.document.body.scrollTop || window.document.documentElement.scrollTop;
			$dialog.css({
				top : scrollTop + options.top +'px',
				zIndex : options.zIndex,
				left : ($(window).width() - $dialog.width()) / 2
			});

		}

		//delete file callback(删除文件回调)
		function onDelete(obj) {
			//remove dom
			$(obj).parent().remove();
			//remove file from the filelist that to be uploaded.(从待上传队列中删除文件)
			var index = $(obj).attr("index");
			toUploadList.splice(index, 1);
			if ( G(".img-container").length == 0 ) {
				G(".init-add-file-btn").show();
				G(".addmore-box").hide();
			}
			//图片重新编号
			G(".image-list-box").find(".remove").each(function(index, element) {
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
					if ( data.code == "000" ) {
						uploadSuccessList.push(data.item);   //添加文件到上传文件列表
						//$("#img-comtainer-"+ currentUploadIndex).find("img").attr("src", data.message);
						$("#img-comtainer-"+ dialogSCode + currentUploadIndex).find(".remove").hide().next().show();
						$("#img-comtainer-"+ dialogSCode + currentUploadIndex).find(".mask").hide();
					} else {
						$("#img-comtainer-"+ dialogSCode + currentUploadIndex).find(".mask").html(codeMessageMap[data.code]).addClass("error");
					}
				}

				options.onSuccess(data.item);

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
			G("#img-comtainer-"+ dialogSCode+ currentUploadIndex).find(".mask").html(message).addClass("error");
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
				G("#upload-progress-bar-"+dialogSCode+ currentUploadIndex).css({"width" : (e.loaded/e.total)*100+'%'});
			}
		}

		function G(selector) {
			return $dialog.find(selector);
		}
		//关闭对话框
		function closeDialog() {
			$dialog.remove();
			try {JDialog.lock.hide();} catch (e) {}
		}

		createElements();

	};

})(jQuery);