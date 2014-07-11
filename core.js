$(function(){
	function supportsTransitions() {
	    var b = document.body || document.documentElement,
	        s = b.style,
	        p = 'transition';

	    if (typeof s[p] == 'string') { return true; }

	    // Tests for vendor specific prop
	    var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
	    p = p.charAt(0).toUpperCase() + p.substr(1);

	    for (var i=0; i<v.length; i++) {
	        if (typeof s[v[i] + p] == 'string') { return true; }
	    }

	    return false;
	}

	$('#new-weibo-cover').click(function(){
		$('#new-weibo-outer').addClass('on');
		$('#status').focus();
	});
	/*
	$('#new-weibo-cover').focus(function(){
		$(this).find('small').show();
	}).blur(function(){
		setTimeout(function(){$('#new-weibo-cover small').hide();}, 300);
	});
	*/
	$('#new-weibo-close').click(function(){
		$('#new-weibo-outer').removeClass('on');
	});
	$('#new-weibo-content').on('keydown', function(e){
		if(e.keyCode == 27){
			$('#new-weibo-close').click();
			$('#new-weibo-cover').focus();
			e.preventDefault();
			return false;
		}
		if(e.keyCode == 13 && e.ctrlKey == true){
			$('#new-weibo-form').submit();
			e.preventDefault();
			return false;
		}
	});
	$('#new-weibo-close').keyup(function(e){
		if(e.keyCode == 13){
			$('#new-weibo-cover').focus();
		}
	});
	$('#new-weibo-reset').click(function(){
		$('#status').focus();
	});
	$('#new-weibo-cover').keydown(function(e){
		if(e.keyCode == 13){
			$(this).click();
			e.preventDefault();
			return false;
		}
	});
	if(!supportsTransitions()){
		$('#box-flipper-backer').hide();
		$('#new-weibo-cover').click(function(){
			$('#box-flipper-fronter').hide();
			$('#box-flipper-backer').show();
		});
		$('#new-weibo-close').click(function(){
			$('#box-flipper-backer').hide();
			$('#box-flipper-fronter').show();
		});
	}
	$('#new-weibo-form').submit(function(e){
		e.preventDefault();
		alert('Ajax here!');
		return false;
	});
});