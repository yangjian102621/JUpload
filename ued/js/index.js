
	$(function(){
		//tab切换
		function tabs(){
			var $tabs = $('#wra_head .tab') ;
			$tabs.click(function(){
				$(this).addClass('focus').siblings().removeClass();
			});
		}
		tabs();

		$(".wrapper").find(".image-select").on("click", function() {
			$(".wrapper").find(".webuploader-element-invisible").trigger("click");
		})
		$('#wra_body').find('li#anma').on('mouseover',function(){
			$(this).find('.file-panel').css({"display":"block"});
			$(this).find('.file-panel').stop().animate({
			    height: "30px"
			  });

			
			
		}).on('mouseout',function(){
			$(this).find('.file-panel').css({"display":"none"});
			$(this).find('.file-panel').stop().animate({
		    height: "0px"
			});
			
		});
	
});