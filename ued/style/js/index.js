
	//index---------tab切换
	$(function(){
		//tab切换
		function tabs(){
			var $tabs = $('#wra_head .tab') ;
			$tabs.click(function(){
				$(this).addClass('focus').siblings().removeClass();
			});
		}
		tabs();


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