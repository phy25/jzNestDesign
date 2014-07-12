$(function(){
	var timeouts = {};
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
	var wbGetLength = (function(){ 
		var trim = function(h) { 
		try { 
		return h.replace(/^\s+|\s+$/g, "") 
		} catch(j) { 
		return h 
		} 
		} 
		var byteLength = function(b) { 
		if (typeof b == "undefined") { 
		return 0 
		} 
		var a = b.match(/[^\x00-\x80]/g); 
		return (b.length + (!a ? 0 : a.length)) 
		}; 

		return function(q, g) { 
		g = g || {}; 
		g.max = g.max || 140; 
		g.min = g.min || 41; 
		g.surl = g.surl || 20; 
		var p = trim(q).length; 
		if (p > 0) { 
		var j = g.min, 
		s = g.max, 
		b = g.surl, 
		n = q; 
		var r = q.match(/(http|https):\/\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+([-A-Z0-9a-z\$\.\+\!\_\*\(\)\/\,\:;@&=\?~#%]*)*/gi) || []; 
		var h = 0; 
		for (var m = 0, 
		p = r.length; m < p; m++) { 
		var o = byteLength(r[m]); 
		if (/^(http:\/\/t.cn)/.test(r[m])) { 
		continue 
		} else { 
		if (/^(http:\/\/)+(weibo.com|weibo.cn)/.test(r[m])) { 
		h += o <= j ? o: (o <= s ? b: (o - s + b)) 
		} else { 
		h += o <= s ? b: (o - s + b) 
		} 
		} 
		n = n.replace(r[m], "") 
		} 
		return Math.ceil((h + byteLength(n)) / 2) 
		} else { 
		return 0 
		} 
		} 
	})();

	$('#new-weibo-cover').click(function(){
		if(!$(this).is('.active')){
			setTimeout(function(){
				$('#new-weibo-cover').removeClass('progress-bar-striped success error');
			}, 600);
			$('#new-weibo-outer').addClass('on');
			$('#status').focus();
			if(localStorage){
				localStorage['jzth_nwopened'] = 'on';
			}
		}
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
		if(localStorage){
			localStorage['jzth_nwopened'] = 'off';
		}
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
	$('#status').on('keyup keydown paste', function(event, init){
		var l = 136 - wbGetLength(this.value);
		$('#new-weibo-counter').text(l)[l < 0 ? 'addClass':'removeClass']('warning');

		// AutoSave, 向新浪看齐，只做主微博保存，不做评论保存
		if(!init && localStorage){
			localStorage['jzth_status'] = this.value;
		}
	}).trigger('paste', [true]);

	var onPicChange = function(e){
		var ele = $('#pic')[0], filename = (ele.files && ele.files[0]) ? ele.files[0].name : ele.value;
		if(filename){
			$('#new-weibo-upload-btn')
				.addClass('selected')
				.attr('title', '已选取图片文件 ' + filename);
		}else{
			$('#new-weibo-upload-btn')
				.removeClass('selected')
				.attr('title', '上传图片文件');
		}
	};
	$('#pic').on('change', onPicChange);
	$('#new-weibo-form').on('reset', function(){ setTimeout(onPicChange, 0);});
	$('#new-weibo-upload-btn').click(function(){
		$('#pic').click();
		return false;
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
		// createMsgCard('已进入非 3D 模式。', 'non-3d', 'success', 0);
		$('#new-weibo-cover').hide();
		$('#new-weibo-cover').click(function(){
			if(!$(this).is('.active')){
				$('#new-weibo-cover').hide();
				$('#new-weibo-content').show();
			}
		});
		$('#new-weibo-close').click(function(){
			$('#new-weibo-content').hide();
			$('#new-weibo-cover').show();
		});
	}

	$('#new-weibo-form').submit(function(e){
		e.preventDefault();
		if(wbGetLength($('#status').val()) == 0){
			$('#status').val('').focus();
			e.preventDefault();
			return false;
		}
		if($('#new-weibo-counter').is('.warning')){
			createMsgCard('字数过多，请不要做话痨 :)', 'new-weibo-length', 'error', 3000);
			$('#status').focus();
			e.preventDefault();
			return false;
		}
		$('#msg-id-new-weibo-failure').remove();
		// Ajax here!
		$('#new-weibo-progress').text('正在发布');
		$('#new-weibo-cover').addClass('progress-bar-striped active');
		$('#new-weibo-close').click();
		$('#status').blur();
		clearTimeout(timeouts['new-weibo-callback']);
		setTimeout(function(){
			$('#new-weibo-cover').removeClass('progress-bar-striped active');
			if(Math.random() > 0.3){ // success
				$('#new-weibo-cover').addClass('success');
				$('#new-weibo-progress').text('发布成功');
				
				var date = new Date(), dateText = (date.getMonth()+1)+'/'+date.getDate()+' '+date.getHours()+':'+date.getMinutes();

				generateWeiboCard({content: $('#status').val(), createdAt: dateText, cmtCount: 0, repCount: 0, link: 'http://weibo.com/5186976438/BcVVLAySG', source: 'Web'}, true).hide().prependTo('#content').slideDown();
				timeouts['new-weibo-callback'] = setTimeout(function(){
					$('#new-weibo-cover').removeClass('success');
				}, 5000);// **TODO**:Timeout 清除
				$('#new-weibo-form')[0].reset();
			}else{
				$('#status').focus();
				$('#new-weibo-cover').click();
				createMsgCard('发布失败（网络错误）', 'new-weibo-failure');
				/*timeouts['new-weibo-callback'] = setTimeout(function(){
					$('#new-weibo-cover').removeClass('progress-bar-striped error');
				}, 5000);*/
			}
			
		}, 2000);
		return false;
	});

	function bindWeiboCard($e){
		$e.find('a.btn.repost').click(function(){
			if($('#msg-id-inline-callback.active').length){
				return false;
			}
			if($('#inline-form').is('.active') && $('#inline-form-type').val() == 'repost'){
				closeInlineForm();
				return false;
			}
			var $f = $('#inline-form').appendTo($(this).parents('.box-upper')).show();
			initInlineForm($f, $(this).parents('.box'), 'repost');
			return false;
		});
		$e.find('a.btn.comment').click(function(){
			if($('#msg-id-inline-callback.active').length){
				return false;
			}
			if($('#inline-form').is('.active') && $('#inline-form-type').val() == 'comment'){
				closeInlineForm();
				return false;
			}
			var $f = $('#inline-form').appendTo($(this).parents('.box-upper')).show();
			initInlineForm($f, $(this).parents('.box'), 'comment');
			return false;
		});
	}
	function closeInlineForm(){
		$('#inline-form').removeClass('active').slideUp();
		$('#reply').blur();
	}
	function initInlineForm($e, id, type){
		if(typeof id == 'object'){
			$p = id;
			id = $p.attr('id');
		}else{
			$p = false;
		}
		$e.find('#inline-form-type').val(type);
		$e.find('#inline-form-parent-id').val(id);
		$e.addClass('active');
		if(type == 'comment'){
			$e.find('span.typetext').text('评论');
			$e.find('#inline-form-submit').text('匿名评论');
		}
		if(type == 'repost'){
			$e.find('span.typetext').text('转发');
			$e.find('#inline-form-submit').text('匿名转发');
		}
		if($p) $e.find('a.backlink').attr('href', $p.find('a.morelink').attr('href')+'?type='+type);

		$('#reply').focus();
	}
	$('#reply-weibo-form').on('keydown', function(e){
		if(e.keyCode == 27){
			closeInlineForm();
			e.preventDefault();
			return false;
		}
		if(e.keyCode == 13 && e.ctrlKey == true){
			$('#reply-weibo-form').submit();
			e.preventDefault();
			return false;
		}
	});
	$('#reply-weibo-form').submit(function(e){
		if(wbGetLength($('#reply').val()) == 0){
			$('#reply').val('').focus();
			e.preventDefault();
			return false;
		}
		if(wbGetLength($('#reply').val()) > 135){
			createMsgCard('字数过多，请不要做话痨 :)', 'new-weibo-length', 'error', 3000, $(this).parents('.box'));
			$('#reply').focus();
			e.preventDefault();
			return false;
		}
		// Ajax here!
		$('#msg-id-inline-callback').remove();
		$(this).parents('.box').after('<div id="msg-id-inline-callback" class="box progress-bar-striped active"><div class="box-content center"><p>正在发布</p></div></div>');
		closeInlineForm();
		clearTimeout(timeouts['inline-callback']);
		setTimeout(function(){
			$('#msg-id-inline-callback').removeClass('progress-bar-striped active');
			if(Math.random() > 0.3){ // success
				$('#msg-id-inline-callback').addClass('success pointer').click(function(){$(this).remove();return false;})
					.find('p:first').text('发布成功');
				timeouts['inline-callback'] = setTimeout(function(){
					$('#msg-id-inline-callback').remove();
				}, 5000);
				$('#reply-weibo-form')[0].reset();
			}else{
				$('#inline-form').show();
				$('#reply').focus();
				$('#msg-id-inline-callback').addClass('error pointer').click(function(){$(this).remove();return false;})
					.find('p:first').text('发布失败（未知错误）');
				timeouts['inline-callback'] = setTimeout(function(){
					$('#msg-id-inline-callback').remove();
				}, 5000);
			}
			
		}, 2000);
		return false;
	});
	function generateWeiboCard(data, $return){
		// data: {}
		var ret = '<div class="box"><div class="box-content-e"><p>'+$('<div/>').text(data.content).html()+'</p></div><div class="box-upper"><div class="left time"><p><time>'+data.createdAt+'</time> #'+data.source+' <a href="'+data.link+'" target="_blank" class="btn morelink" title="返回微博看图、点赞">更多</a></p></div><div class="right"><p><a href="'+data.link+'?type=repost" class="btn repost">转发('+data.repCount+')</a><a href="'+data.link+'?type=comment" class="btn comment">评论('+data.cmtCount+')</a></p></div></div></div>';
		if($return){
			var $e = $(ret);
			bindWeiboCard($e);
			return $e;
		}else{
			return ret;
		}
	}
	function createMsgCard(content, id, type, timeout, appendAfter){
		if(!type) var type = 'error';
		if(timeout === undefined) var timeout = 5000;
		if($('#msg-id-'+id).length){
			var $e = $('#msg-id-'+id).find('p:first').text(content).end();
			clearTimeout(timeouts['msg-id-'+id]);
		}else{
			var $e = $('<div id="msg-id-'+id+'" class="box pointer '+type+'"><div class="box-content center"><p>'+$('<div/>').text(content).html()+'</p></div></div>').on('click', function(){$(this).remove();});
			if(!appendAfter){
				$e.prependTo('#content');
			}else{
				appendAfter.after($e);
			}
		}
		if(timeout !== 0) timeouts['msg-id-'+id] = setTimeout(function(){$e.remove();}, timeout);
	}

	$('#content .box').each(function(i, e){
		bindWeiboCard($(e));
	});

	$('a.ajax').click(function(e){
		e.preventDefault();
		if(!$('#ajaxContent').length) $('#content').before('<div id="ajaxContent"></div>');
		var $ac = $('#ajaxContent').html('<div class="box progress-bar-striped active"><div class="box-content center"><p>正在加载</p></div></div>');
		$.get(this.href)
			.done(function(data){
				$ac.empty().hide();
				// Thanks to jQuery.load(): removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				var $d = $("<div>").append(data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""));
				$ac.append($d.find('#content').children()).slideDown();
			})
			.error(function(o){
				var $box = $ac.find('.box.active:first');
				$box.addClass('error pointer').removeClass('progress-bar-striped active')
					.find('p:first').text('载入错误（'+o.statusText+', '+o.status+'）');
				$box.click(function(){$(this).remove();return false;});
			});
		return false;
	});

	// Autosave Revert
	if(localStorage){
		if(!$('#status').val()) $('#status').val(localStorage['jzth_status']);
		if(localStorage['jzth_nwopened'] == 'off') $('#new-weibo-close').click();
	}
});