/**
 * 百度web编辑器UI的HTML5上传插件
 *
 * @author      yangjian102621@163.com
 * @version     1.1
 * @since       2016.05.24
 */
(function($) {

	//image crop
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

	Array.prototype.remove = function(item) {
		for ( var i = 0; i < this.length; i++ ) {
			if ( this[i] == item ) {
				this.splice(i, 1);
				break;
			}
		}
	}

	window.BUpload = function(options) {

		options = $.extend({
			src : "src",
			upload_url : null,
			list_url : null,
			search_url : null,
			data_type : "json",
			max_filesize : 2048,    //unit:KB
			max_filenum : 20,
			no_data_text : "(⊙o⊙)亲，没有多数据了。",
			ext_allow : "jpg|png|gif|jpeg",
			ext_refuse : "exe|txt",
			callback : function(data) {
				console.log(data);
			}
		}, options);

		//错误代码和提示消息
		var codeMessageMap = {
			'0' : '文件上传成功',
			'1' : '文件上传失败',
			'2' : '文件大小超出限制',
			'3' : '非法文件名后缀'
		};

		var o = {};
		o.dialog = null;
		o.todoList = new Array(); //the file queue to be uploaded
		o.successList = new Array(); //the file queue upload successfully
		o.addedFileNumber = 0; //the numbers of files that has added
		o.totalFilesize = 0; //total file size
		o.uploadLock = false; //upload thread lock
		o.page = 1; //服务器图片列表页码
		o.searchPage = 1; //图片搜索页码
		o.searchText = null; //搜索文字
		o.noRecord = false;

		//close the dialog
		o.close = function () {
			o.dialog.remove();
		}

		//create dialog
		function createDialog() {

			var builder = new StringBuilder();
			builder.append('<div class="uedbody"><div class="ued_title">');
			builder.append('<div class="uedbar"><span>多图上传</span></div><div class="close_btn icon" title="关闭对话框"></div>');
			builder.append('</div><div class="wrapper"><div id="wra_head" class="wra_head"><span class="tab tab-upload focus" tab="upload-panel">本地上传</span>');
			builder.append('<span class="tab tab-online" tab="online">文件服务器</span><span class="tab tab-search" tab="searchbox">图片搜索</span></div>');
			builder.append('<div class="wra_body"><div class="tab-panel upload-panel"><div class="wra_pla"><div class="upload-image-placeholder">');
			builder.append('<div class="btn btn-primary image-select">点击选择图片</div><input type="file" name="src" class="webuploader-element-invisible" multiple="multiple">');
			builder.append('</div></div><div class="image-list-box" style="display: none;"><div class="wra_bar"><div class="info fl"></div>');
			builder.append('<div class="fr"><span class="btn btn-default btn-continue-add">继续添加</span><span class="btn btn-primary btn-start-upload">开始上传</span></div></div>');
			builder.append('<ul class="filelist"></ul></div></div><div class="tab-panel online"><div class="imagelist"><ul class="list clearfix"></ul><div class="no-data"></div></div></div>');
			builder.append('<div class="tab-panel searchbox"><div class="search-bar"><input class="searTxt" type="text" placeholder="请输入搜索关键词" />');
			builder.append('<input value="百度一下" class="btn btn-primary btn-search" type="button" /><input value="清空搜索" class="btn btn-default btn-reset" type="button" />');
			builder.append('</div><div class="search-imagelist-box"><ul class="search-list"></ul><div class="no-data"></div></div>');
			builder.append('</div><div class="loading-icon"></div></div><!-- end of wrapper --></div><div class="wra-btn-group"><span class="btn btn-primary btn-confirm">确认</span>');
			builder.append('<span class="btn btn-default btn-cancel">取消</span></div></div>');

			o.dialog = $(builder.toString());
			$("body").append(o.dialog);

		}

		//绑定元素事件
		function bindEvent() {

			//选项卡事件
			G(".tab").on("click", function() {
				var tab = $(this).attr("tab");
				G(".tab-panel").hide();
				G("."+tab).show();
				G(".tab").removeClass("focus");
				$(this).addClass("focus");
			});

			//关闭对话框
			G(".close_btn").on("click", function() {
				o.close();
			});

			//选择文件事件
			G(".webuploader-element-invisible").on("change", function() {
				addFiles(this);
			});

			//弹出上传文件选择框
			G(".image-select").on("click", function() {
				G(".webuploader-element-invisible").trigger("click");
			});
			G(".btn-continue-add").on("click", function() {
				G(".webuploader-element-invisible").trigger("click");
			});

			//开始上传按钮事件
			G(".btn-start-upload").on("click", function() {
				if ( o.uploadLock ) return;

				if ( o.todoList.length == 0 ) {
					alert("请至少添加一个文件！");
					return false;
				}
				$(this).addClass("disabled").text("正在上传");
				uploadFile(o.todoList.shift());
			});

			//点击确认|取消按钮事件
			G(".btn-confirm").on("click", function() {
				if ( o.todoList.length > 0 ) {
					alert("您还有文件没有上传!");
					return false;
				}
				options.callback(o.successList);
				o.close();
			});
			G(".btn-cancel").on("click", function() {
				o.close();
			});

			//从服务器加载文件
			G(".tab-online").on("click", function() {

				if ( G(".imagelist .list").children().length == 0 ) {
					loadFilesFromServer()
				}

			});

			//当滚动条滚到底部时自动去加载图片
			G(".imagelist").on("scroll", function() {

				if ( this.scrollTop + this.clientHeight >= this.scrollHeight ) {
					loadFilesFromServer();
				}
			});

			G(".search-imagelist-box").on("scroll", function() {

				if ( this.scrollTop + this.clientHeight >= this.scrollHeight ) {
					imageSearch();
				}
			});

			//图片搜索事件
			G(".btn-search").on("click", function() {
				var text = G(".searTxt").val().trim();
				if ( text == "" ) {
					G(".searchbox .no-data").html('<span class="error">请输入搜索关键字.</span>').show();
					G(".searTxt").focus();
					return false;
				}
				o.searchText = text;
				o.searchPage = 1;
				G(".search-imagelist-box").find(".search-list").empty();
				imageSearch();
			});
		}

		//add file to upload list
		function addFiles(input) {

			var files = input.files;
			var totalFileNum = o.successList.length + o.todoList.length + files.length; //本次上传文件总数
			for ( var i = o.addedFileNumber; i < o.addedFileNumber+files.length; i++ ) {

				if ( totalFileNum > options.max_filenum ) {
					alert("您本次最多上传"+options.max_filenum+"个文件.");
					return;
				}
				var builder = new StringBuilder();
				var tempFile = files[i- o.addedFileNumber];
				builder.append('<li id="img-comtainer-'+i+'"><div class="imgWrap"><img src="'+window.URL.createObjectURL(tempFile)+'" border="0" />');
				builder.append('</div><div class="file-opt-box clearfix"><span class="remove" index="'+i+'">删除</span><span class="rotateRight">向右旋转</span>');
				builder.append('<span class="rotateLeft">向左旋转</span></div><div class="success"></div><div class="error"></div>');
				builder.append('<div class="progress"><span style="display: none; width: 0px;"></span></div></li>');

				var $image = $(builder.toString());
				//bind onelele event
				$image.find(".remove").on("click", function() {
					$(this).parents("li").remove(); //remove element
					//remove file from todoList
					var index = $(this).attr("index");
					for ( var i = 0; i < o.todoList.length; i++ ) {
						if ( o.todoList[i].index == index ) {
							updateInfoText(o.successList.length + o.todoList.length, o.totalFilesize - o.todoList[i].file.size);
							o.todoList.splice(i, 1);
							break;
						}
					}

				});
				$image.on("mouseover", function() {
					$(this).find(".file-opt-box").show();
				}).on("mouseout", function() {
					$(this).find(".file-opt-box").hide();
				});

				G(".wra_pla").hide();
				G(".image-list-box").show();
				G(".filelist").append($image);

				o.todoList.push({index:i, file:tempFile});
				o.totalFilesize += tempFile.size;

				//console.log(tempFile);
			}
			o.addedFileNumber += files.length;
			updateInfoText(o.successList.length + o.todoList.length, o.totalFilesize);

			//缩放并裁剪图片
			$(".imgWrap img").imageCrop(113,113);

		}

		/**
		 * upload file function(文件上传主函数)
		 * @param node 数据节点
		 */
		function uploadFile(node) {

			if ( !fileCheckHandler(node) ) {
				uploadNextFile();   //skip the file and upload the next file
				return;
			}

			// prepare XMLHttpRequest
			var xhr = new XMLHttpRequest();
			xhr.open('POST', options.upload_url);
			//upload successfully
			xhr.addEventListener('load',function(e) {

				if ( options.data_type == "json" ) {
					//console.log(e);
					var data = $.parseJSON(e.target.responseText);
					if ( data.code == 0 ) {
						o.successList.push(data.message);   //添加文件到上传文件列表
						$("#img-comtainer-"+ node.index).find(".file-opt-box").remove();
						$("#img-comtainer-"+ node.index).find(".progress").remove();
						$("#img-comtainer-"+ node.index).find(".success").show();
					} else {
						__error__(codeMessageMap[data.code], node);
					}
				}

			}, false);

			// file upload complete
			xhr.addEventListener('loadend', function () {
				uploadNextFile();   //upload the next file
			}, false);

			//上传失败
			xhr.addEventListener('error', function() {
				__error__("发生异常，上传失败!", node);
			}, false);

			xhr.upload.addEventListener('progress', function(e) {
				updateProgress(e, node);
			}, false);

			// prepare FormData
			var formData = new FormData();
			formData.append(options.src, node.file);
			xhr.send(formData);

		}

		//upload next file(上传下一个文件)
		function uploadNextFile() {

			if ( o.todoList.length ) {
				var nextFile = o.todoList.shift();
				uploadFile(nextFile);
			} else {
				o.uploadLock = false; //release the upload lock
				G(".btn-start-upload").removeClass("disabled").text("开始上传");
				//console.log(o.successList);
			}
		}

		// progress handler(文件上传进度控制)
		function updateProgress(e, node) {
			if ( e.lengthComputable ) {
				$("#img-comtainer-"+ node.index).find(".progress span").css({"width" : (e.loaded/e.total)*100+'%', "display":"block"});
			}
		}

		//update file info text
		function updateInfoText(filenum, filesize) {
			G(".info").text("共选择了 "+filenum+" 张图片，共 "+formatFileSize(filesize)+"," +
				" 还可以添加 "+(options.max_filenum - filenum)+" 张图片.");
		}

		//format file size(格式化文件大小)
		function formatFileSize(size) {

			if ( size/1048576 > 1 ) {
				return (size/1048576).toFixed(2)+"MB";
			} else {
				return (size/1024).toFixed(2)+"KB";
			}

		}

		//file check handler(文件检测处理函数)
		function fileCheckHandler(node) {

			//检查文件大小
			var maxsize = options.max_filesize * 1024;
			if ( maxsize > 0 && node.file.size > maxsize ) {
				__error__("文件大小不能超过 "+options.max_filesize + " KB", node);
				return false;
			}

			//检查文件后缀名
			var ext = getFileExt(node.file.name);
			if ( ext && options.ext_allow.indexOf(ext) != -1
				&& options.ext_refuse.indexOf(ext) == -1 ) {
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

		//显示上传错误信息
		function __error__(message, node) {
			G("#img-comtainer-"+ node.index).find(".error").show().text(message);
		}

		//query
		function G(query) {
			return o.dialog.find(query);
		}

		//从服务器上获取图片地址
		function loadFilesFromServer() {
			if ( options.list_url == null ) {
				G(".online .no-data").html('<span class="error">无法获取图片，请先配置 list_url.</span>').show();
				return false;
			}
			if ( o.noRecord ) return false;

			G(".loading-icon").show(); //显示加载图标
			$.get(options.list_url, {
				page : o.page
			}, function(res) {

				G(".loading-icon").hide(); //隐藏加载图标
				if ( res.code == "0" ) {
					o.page++;
					appendFiles(res.data, "online");
				} else {
					G(".online .no-data").text(options.no_data_text).show();
					o.noRecord = true;
				}

			}, "json");
		}

		//图片搜索
		function imageSearch() {
			if ( options.search_url == null ) {
				G(".searchbox .no-data").html('<span class="error">无法进行图片搜索，请先配置 search_url.</span>').show();
				return false;
			}

			G(".loading-icon").show(); //显示加载图标
			$.get(options.search_url, {
				page : o.searchPage,
				kw : o.searchText
			}, function(res) {

				G(".loading-icon").hide(); //隐藏加载图标
				if ( res.code == "0" ) {
					G(".searchbox .no-data").hide();
					o.searchPage++;
					appendFiles(res.data, "search");
				} else {
					G(".no-data").text(options.no_data_text).show();
				}

			}, "json");
		}

		//追加元素到图片列表
		function appendFiles(data, module) {

			$.each(data, function(idx, item) {

				var builder = new StringBuilder();
				builder.append('<li><img src="'+item.thumbURL+'" data-src="'+item.oriURL+'" border="0">');
				builder.append('<span class="ic"></span></li>');
				var $image = $(builder.toString());

				//绑定选择图片事件
				$image.find(".ic").on("click", function() {
					if ( $(this).hasClass("selected") ) {
						$(this).removeClass("selected");
						o.successList.remove($(this).prev().attr("data-src"));
					} else {
						$(this).addClass("selected");
						o.successList.push($(this).prev().attr("data-src"));
					}
					console.log(o.successList);
				});
				//裁剪显示图片
				$image.find("img").imageCrop(113, 113);
				if ( module == "online" ) {
					G(".imagelist .list").append($image);
				} else if ( module == "search" ) {
					G(".search-imagelist-box .search-list").append($image);
				}
			});

		}

		//initialize dialog
		createDialog();
		bindEvent();
		return o;
	}; //end of JUpload

	//string builder
	var StringBuilder = function() {

		var buffer = new Array();
		StringBuilder.prototype.append = function(str) {
			buffer.push(str);
		}
		
		StringBuilder.prototype.toString = function () {
			return buffer.join("");
		}

	}


})(jQuery);