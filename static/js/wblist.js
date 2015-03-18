/*
Jinzhong_Nest Web wblist.js
By @Phy25 - 2014/11/14
Just copy from index.js, including #content.box styling and inline comment
Other credits left through the script
*/
$(function(){
	var timeouts = {}, fakeajax = false, sd_id = '3173227132';
	function bindWeiboCard($e){
		if($e.attr('id')){
			$e.find('a.btn.repost').click(function(){
				if($('#msg-id-inline-callback.active').length){
					return false;
					// 防止正在提交时，打开表单
				}
				if($('#inline-form').is('.active') && $('#inline-form-type').val() == 'repost'){
					// 表单打开，且是相同状况
					var $c = $(this).closest('.box, blockquote'),
						id = $c.attr('id') || $c.data('id');
					if($('#inline-form-parent-id').val() == id){
						// 只在位于当前点击的微博下，关闭表单
						closeInlineForm();
						return false;
					}
				}
				var $f = $('#inline-form').appendTo($(this).closest('.box').find('.box-upper')).show();
				initInlineForm($f, $(this).closest('.box, blockquote'), 'repost');
				return false;
			});
			$e.find('a.btn.comment').click(function(){
				if($('#msg-id-inline-callback.active').length){
					return false;
					// 防止正在提交时，打开表单
				}
				if($('#inline-form').is('.active') && $('#inline-form-type').val() == 'comment'){
					// 表单打开，且是相同状况
					var $c = $(this).closest('.box, blockquote'),
						id = $c.attr('id') || $c.data('id');
					if($('#inline-form-parent-id').val() == id){
						// 只在位于当前点击的微博下，关闭表单
						closeInlineForm();
						return false;
					}
				}
				var $f = $('#inline-form').appendTo($(this).closest('.box').find('.box-upper')).show();
				initInlineForm($f, $(this).closest('.box, blockquote'), 'comment');
				return false;
			});
		}
		
		// 后缀匹配
		var $p = $e.find('.box-content-e p');
		$p.eq(0).html(function(i, h){
			h = h.replace(/\r|\n/g, '');
			var a = h.match(/^(.*)►(.+)$/), s, t;// s = source, t = text
			if(a !== null){
				s = $.trim(a[2]);
				t = $.trim(a[1]);
			}else{
				var b = h.match(/^(.*)「(.+)」$/);// s = source, t = text
				if(b !== null){
					s = $.trim(b[2]);
					t = $.trim(b[1]);
				}else{
					s = 'Admin';
					t = h;
				}
			}
			if(s == 'wx'){
				s = 'WeChat';
			}
			if(s == 'web'){
				s = 'Web';
			}
			$e.find('span.source').text('#'+s);
			return $.trim(t);
		});

		// 续上，@ # 链接
		$p.html(function(i, h){
			h = h.replace(/https?\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/g, function(m, p1){
				return '<a href="'+m+'" target="_blank" class="url">'+m+'</a>';
			})
			.replace(/@([\u4e00-\u9fa5a-zA-Z0-9_-]{1,30})/g, function(m, p1){
				return '<a href="http://weibo.com/n/'+encodeURIComponent(p1)+'" target="_blank" class="mention">@'+p1+'</a>';
			})/*.replace(/#(.+)#/g, function(m, p1){
				return '<a href="http://huati.weibo.com/k/'+encodeURIComponent(p1)+'" target="_blank" class="tag">#'+p1+'#</a>';
			})*/
			;
			return emoji ? emoji.replace_emoticons(emoji.replace_colons(h)) : h;
		});

		var zoomIn = function(){
			var $p = $(this).wrap('<div class="wbimg-zoomdiv" />');
			var $s = $('<p class="small"></p>'), $t = $(this);

			$('<a href="javascript:void(0)">返回</a>').click(function(){$(this).closest('.wbimg-zoomdiv').find('img').click();return false;}).appendTo($s);
			$('<a href="#" target="_blank">原图</a>').attr('href', $t.data('large-img')).appendTo($s);

			$t.before($s)
				.off('click').on('click', zoomOut);

			$t.find('img:first').data('small-img', $t.find('img').attr('src'))
				.attr('src', $t.attr('href')).attr('title', '点击返回').addClass('middle');

			return false;
		}, zoomOut = function(){
			var $p = $(this).closest('.wbimg-zoomdiv'), $t = $(this).detach().off('click').on('click.zoomin', zoomIn);
			$t.find('img').attr('src', $t.find('img').data('small-img')).attr('title', '点击放大');

			$p.replaceWith($t);
			return false;
		};
		$e.find('a.wbimg-zoom').attr('title', '点击放大').on('click.zoomin', zoomIn);
	}
	function closeInlineForm(){
		$('#inline-form').removeClass('active').slideUp();
		$('#reply').blur();
	}
	function initInlineForm($e, id, type){
		if(typeof id == 'object'){
			$p = id;
			id = $p.attr('id') || $p.data('id');
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
		if($p) $e.find('a.backlink').attr('href', $p.find('a.morelink:last').attr('href')+'?type='+type);

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
	$('#reply').on('keydown change', function(){
		checkWeiboWordBG(this.value, 'cr', $(this).closest('.box'));
	});
	$('#reply-weibo-form').submit(function(e){
		if(typeof operamini !== 'undefined'){
			return true;
		}
		var $t = $(this);
		e.preventDefault();
		if(wbGetLength($('#reply').val()) == 0){
			$('#reply').val('').focus();
			return false;
		}
		if(wbGetLength($('#reply').val()) > 136){
			createMsgCard('字数过多，请不要做话痨 :)', 'new-weibo-length', 'error', 3000, $(this).closest('.box'));
			$('#reply').focus();
			return false;
		}
		var success = function(text){
			if(text == 'okay' || text == 'fakeajax'){
				$('#msg-id-inline-callback').removeClass('progress-bar-striped active')
					.addClass('success pointer')
					.click(function(){$(this).remove();return false;})
					.find('p:first').text('发布成功');

				var $p = $t.closest('.box-upper'), type = $p.find('#inline-form-type').val();
				
				$p.find('a.btn.'+type).text(function(i, t){
					var a = t.match(/^(.+)\((\d+)\)$/);
					if(a == null) return t;
					if(a[2]) return a[1]+'('+(+a[2]+1)+')';
				});

				timeouts['inline-callback'] = setTimeout(function(){
					$('#msg-id-inline-callback').remove();
				}, 5000);
				$('#reply-weibo-form')[0].reset();
			}else{
				if(text.indexOf('gap') == 0){
					var s = text.split('.')[1];
					error({}, '为防刷屏，请等待 '+s+' 秒，再发布新树洞');
					// TODO: 很粗暴，如果能在网页端做一些显示优化，如进度条提示之类的会好一些 / 当然不是很有必要
					return false;
				}
				if(text == 'other'){
					error({}, 'other');
					return false;
				}
				error({}, '程序错误：'+text);
			}
		};
		var error = function(x, t){
			if(t == 'other') t = '字数过多，或者微博系统繁忙等';
			$('#msg-id-inline-callback').removeClass('progress-bar-striped active');
			$('#inline-form').show();
			$('#reply').focus();
			$('#msg-id-inline-callback').addClass('error pointer')
				.click(function(){$(this).remove();return false;})
				.find('p:first').text('发布失败（'+t+'）');
			timeouts['inline-callback'] = setTimeout(function(){
				$('#msg-id-inline-callback').remove();
			}, 10000);
		};
		// fakeajax
		$('#msg-id-inline-callback').remove();
		$(this).closest('.box').after('<div id="msg-id-inline-callback" class="box progress-bar-striped active"><div class="box-content center"><p>正在发布</p></div></div>');
		closeInlineForm();
		clearTimeout(timeouts['inline-callback']);
		if(!fakeajax){
			$(this).ajaxSubmit({data:{'ajax': true}, dataType: 'text', success: success, error: error});
		}else{
			setTimeout(function(){
				if(Math.random() > 0.3){ // success
					success('fakeajax');
				}else{ // error
					error({}, '为防刷屏，请等待 3 秒，再发布新树洞');
				}
			}, 2000);
		}
		
		return false;
	});
	function createMsgCard(content, id, type, timeout, appendAfter){
		if(!type) var type = 'error';
		if(timeout === undefined) var timeout = 5000;
		if($('#msg-id-'+id).length){
			var $e = $('#msg-id-'+id).find('p:first').text(content).end();
			clearTimeout(timeouts['msg-id-'+id]);
			if(appendAfter){
				appendAfter.after($e);
			}
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

	function createMsgCardHTML(content, id, type, timeout, appendAfter){
		if(!type) var type = 'error';
		if(timeout === undefined) var timeout = 5000;
		if($('#msg-id-'+id).length){
			var $e = $('#msg-id-'+id).find('p:first').html(content).end();
			clearTimeout(timeouts['msg-id-'+id]);
			if(appendAfter){
				appendAfter.after($e);
			}
		}else{
			var $e = $('<div id="msg-id-'+id+'" class="box pointer '+type+'"><div class="box-content center"><p>'+content+'</p></div></div>').on('click', function(){$(this).remove();});
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

	function $ajax_init($elem){
		$('a.ajax', $elem).click(function(e){
			if(typeof operamini !== 'undefined'){
				return true;
			}
			e.preventDefault();
			if(!$('#ajaxContent').length) $('#content').before('<div id="ajaxContent"></div>');
			var $ac = $('#ajaxContent').html('<div class="box progress-bar-striped active"><div class="box-content center"><p>正在加载</p></div></div>');
			window.scrollTo(0, 0);

			var done = function(data){
					$ac.empty().hide();
					
					if(typeof data == 'object'){
						var $d = $(data);
					}else{
						// Thanks to jQuery.load(): removing the scripts
						// to avoid any 'Permission Denied' errors in IE
						var $d = $("<div>").append(data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""));				
					}
					$ac.append($ajax_init($d.find('#content').children())).slideDown();
				}, error = function(o){
					var $box = $ac.find('.box.active:first');
					$box.addClass('error pointer').removeClass('progress-bar-striped active')
						.find('p:first').text('载入错误（'+o.statusText+', '+o.status+'）');
					$box.click(function(){$(this).remove();return false;});
				};
			$.get(this.href)
				.done(done)
				.error(error);
			return false;
		});
		return $elem; 
	}
	$ajax_init(document);
});