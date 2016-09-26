/**
 * 基于iframe实现的异步上传插件
 * https://git.oschina.net/blackfox/ajaxUpload
 * @author yangjian<yangjian102621@gmail.com>
 * @version 1.0.0
 * @since 2016.06.02
 */
(function($) {

	if ( Array.prototype.remove == undefined ) {
		Array.prototype.remove = function(item) {
			for ( var i = 0; i < this.length; i++ ) {
				if ( this[i] == item ) {
					this.splice(i, 1);
					break;
				}
			}
		}
	}
	//图片裁剪
	if ( !$.fn.imageCrop ) {
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
	}
	//单个上传文件
	$.fn.JUpload = function(__options) {
		var options = $.extend({
			src : "src",
			url : null,
			onSuccess : function(data) { //上传一张图片成功回调
				console.log(data);
			},
			onRemove : function(data) { //删除一张图片回调
				console.log(data);
			}, //删除一张图片回调
			image_container : null,
			max_filenum : 5, //最多上传图片数量
			datas : [], //初始化已上传图片
			twidth : 113,
			theight : 113
		}, __options);
		var images = []; //已经上传的图片列表
		if ( options.datas.length > 0 ) {
			//添加图片
			for ( var i = 0; i < options.datas.length; i++ ) {
				addImage(options.datas[i]);
			}
			images = options.datas;
		}
		var frameName = "iframe_"+Math.random();
		var $form = $('<form action="'+options.url+'" target="'+frameName+'" enctype="multipart/form-data" method="post"></form>');
		var $input = $('<input type="file" name="'+options.src+'" class="upload-input" />');
		var $iframe = $('<iframe name="'+frameName+'" class="upload-iframe"></iframe>');
		//给按钮绑定点击事件
		$(this).on("click", function() {
			$input.trigger("click");
		});
		//绑定上传事件
		$input.on("change", function() {
			if ( images.length >= options.max_filenum ) {
				alert("您最多允许上传"+options.max_filenum+"张图片。");
				return false;
			}
			$form[0].submit();
		});
		$iframe.on("load", function() {
			var html = this.contentWindow.document.getElementsByTagName("body")[0].innerHTML;
			if ( !html ) return false;
			try {
				var data = $.parseJSON(html);
				if ( data.code == "000" ) {
					if ( options.image_container != null ) {
						addImage(data.message);
					} else {
						options.success(data.message)
					}

				} else {
					alert(data.message);
				}

			} catch (e) {
				console.log(e);
			}
		});
		$form.append($input);
		$('body').append($form);
		$('body').append($iframe);
		if ( options.image_container ) {
			$("#"+options.image_container).addClass("clearfix");
		}

		//添加图片
		function addImage(src) {
			var builder = new StringBuilder();
			builder.append('<div class="img-wrapper"><div class="img-container" style="width: '+options.twidth+'px; height: '+options.theight+'px">');
			builder.append('<img src="'+src+'">');
			builder.append('<div class="file-opt-box clearfix"><span class="remove">删除</span></div></div></div>');
			var $image = $(builder.toString());
			$("#"+options.image_container).append($image);
			$image.find("img").imageCrop(options.twidth, options.theight);
			//$image.hover(function() {     //这里的hover效果已经通过css实现了
			//	$(this).find(".file-opt-box").show();
			//}, function() {
			//	$(this).find(".file-opt-box").hide();
			//});
			//删除图片
			$image.find(".remove").on("click", function() {
				try {
					var src = $(this).parent().prev().attr("src");
					images.remove(src);
					$image.remove();
					options.onRemove(images);
				} catch (e) {console.log(e);}
			});

			images.push(src);
			options.onSuccess(images);
		}

	}

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