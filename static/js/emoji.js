/*
Jinzhong_Nest Web emoji.js
Modified from github.com/iamcal/js-emoji
By @Phy25 - 2015/3/17
Other credits left through the script
*/
;(function() {

/**
 * @global
 * @namespace
 */
function emoji(){}
	/**
	 * The set of images to use got graphical emoji.
	 *
	 * @memberof emoji
	 * @type {string}
	 */
	//emoji.img_set = 'apple';
	emoji.img_path = 'http://img.t.sinajs.cn/t4/appstyle/expression/emimage/';

	/**
	 * Configuration details for different image sets. This includes a path to a directory containing the
	 * individual images (`path`( and a URL to sprite sheets (`sheet`). All of these images can be found
	 * in the [emoji-data repository]{@link https://github.com/iamcal/emoji-data}. Using a CDN for these
	 * is not a bad idea.
	 *
	 * @memberof emoji
	 * @type {
	 */
	/*emoji.img_sets = {
		'apple'    : {'path' : '/emoji-data/img-apple-64/'   , 'sheet' : '/emoji-data/sheet_apple_64.png'    },
		'google'   : {'path' : '/emoji-data/img-google-64/'  , 'sheet' : '/emoji-data/sheet_google_64.png'   },
		'twitter'  : {'path' : '/emoji-data/img-twitter-64/' , 'sheet' : '/emoji-data/sheet_twitter_64.png'  },
		'emojione' : {'path' : '/emoji-data/img-emojione-64/', 'sheet' : '/emoji-data/sheet_emojione_64.png' }
	};*/

	/**
	 * Use a CSS class instead of specifying a sprite or background image for
	 * the span representing the emoticon. This requires a CSS sheet with
	 * emoticon data-uris.
	 *
	 * @memberof emoji
	 * @type bool
	 * @todo document how to build the CSS stylesheet this requires.
	 */
	emoji.use_css_imgs = false;

	/**
	 * Instead of replacing emoticons with the appropriate representations,
	 * replace them with their colon string representation.
	 * @memberof emoji
	 * @type bool
	 */
	emoji.colons_mode = false;
	emoji.text_mode = false;

	/**
	 * If true, sets the "title" property on the span or image that gets
	 * inserted for the emoticon.
	 * @memberof emoji
	 * @type bool
	 */
	emoji.include_title = false;

	/**
	 * If the platform supports native emoticons, use those instead
	 * of the fallbacks.
	 * @memberof emoji
	 * @type bool
	 */
	emoji.allow_native = true;

	/**
	 * Set to true to use CSS sprites instead of individual images on 
	 * platforms that support it.
	 *
	 * @memberof emoji
	 * @type bool
	 */
	emoji.use_sheet = false;

	// Keeps track of what has been initialized.
	/** @private */
	emoji.inits = {};
	emoji.map = {};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing ascii emoticons
	 * (ie. `:)`)
	 *
	 * @returns {string} A new string with all emoticons in `str`
	 * replaced by a representatation that's supported by the current
	 * environtment.
	 */
	emoji.replace_emoticons = function(str){
		emoji.init_emoticons();
		return str.replace(emoji.rx_emoticons, function(m, $1, $2){
			var val = emoji.map.emoticons[$2];
			return val ? $1+emoji.replacement(val, $2) : m;
		});
	};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing ascii emoticons
	 * (ie. `:)`)
	 *
	 * @returns {string} A new string with all emoticons in `str`
	 * replaced by their colon string representations (ie. `:smile:`)
	 */
	emoji.replace_emoticons_with_colons = function(str){
		emoji.init_emoticons();
		return str.replace(emoji.rx_emoticons, function(m, $1, $2){
			var val = emoji.data[emoji.map.emoticons[$2]][3][0];
			return val ? $1+':'+val+':' : m;
		});
	};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing colon string
	 * representations of emoticons (ie. `:smile:`)
	 *
	 * @returns {string} A new string with all colon string emoticons replaced
	 * with the appropriate representation.
	 */
	emoji.replace_colons = function(str){
		emoji.init_colons();
		return str.replace(emoji.rx_colons, function(m){
			var idx = m.substr(1, m.length-2);
			var val = emoji.map.colons[idx];
			return val ? emoji.replacement(val, idx, ':') : m;
		});
	};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing unified unicode
	 * emoticons. (ie. 😄)
	 *
	 * @returns {string} A new string with all unicode emoticons replaced with
	 * the appropriate representation for the current environment.
	 */
	emoji.replace_unified = function(str){
		emoji.init_unified();
		return str.replace(emoji.rx_unified, function(m){
			var val = emoji.map.unified[m];
			return val ? emoji.replacement(val) : m;
		});
	};

	emoji.unicode2utf8 = function(char){
		var code = char.charCodeAt();
		// It must be between 0000 0800-0000 FFFF
		code = 14712960 + ((code & 61440) << 4) + ((code & 4032) << 2) + (code & 63);
		return code.toString(16);
	};

	// Does the actual replacement of a character with the appropriate
	/** @private */
	emoji.replacement = function(idx, actual, wrapper){
		wrapper = wrapper || '';
		if (emoji.colons_mode) return ':'+emoji.data[idx][3][0]+':';
		var text_name = (actual) ? wrapper+actual+wrapper : wrapper+emoji.data[idx][3][0]+wrapper;
		if (emoji.text_mode) return text_name;
		emoji.init_env();
		if (emoji.replace_mode == 'unified'  && emoji.allow_native && emoji.data[idx][0][0]) return emoji.data[idx][0][0];
		if (emoji.replace_mode == 'softbank' && emoji.allow_native && emoji.data[idx][1]) return emoji.data[idx][1];
		if (emoji.replace_mode == 'google'   && emoji.allow_native && emoji.data[idx][2]) return emoji.data[idx][2];
		
		if(!emoji.data[idx][1]) return '<span class="emoji">'+text+'</span>';
		var img = emoji.img_path+unicode2utf8(emoji.data[idx][1])+'.png';
		var title = emoji.include_title ? ' title="'+(actual || emoji.data[idx][3][0])+'"' : '';
		var text  = emoji.include_text  ? wrapper+(actual || emoji.data[idx][3][0])+wrapper : '';
		
		if (emoji.supports_css) {
			if (emoji.use_css_imgs){
				return '<span class="emoji emoji-'+idx+'"'+title+'>'+text+'</span>';
			}else{
				return '<span class="emoji emoji-sizer" style="background-image:url('+img+')"'+title+'>'+text+'</span>';
			}
		}else{
			return '<img src="'+img+'" class="emoji" '+title+'/>';
		}
	};

	// Initializes the text emoticon data
	/** @private */
	emoji.init_emoticons = function(){
		if (emoji.inits.emoticons) return;
		emoji.init_colons(); // we require this for the emoticons map
		emoji.inits.emoticons = 1;
		
		var a = [];
		emoji.map.emoticons = {};
		for (var i in emoji.emoticons_data){
			// because we never see some characters in our text except as entities, we must do some replacing
			var emoticon = i.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
			
			if (!emoji.map.colons[emoji.emoticons_data[i]]) continue;

			emoji.map.emoticons[emoticon] = emoji.map.colons[emoji.emoticons_data[i]];
			a.push(emoji.escape_rx(emoticon));
		}
		emoji.rx_emoticons = new RegExp(('(^|\\s)('+a.join('|')+')(?=$|[\\s|\\?\\.,!])'), 'g');
	};

	// Initializes the colon string data
	/** @private */
	emoji.init_colons = function(){
		if (emoji.inits.colons) return;
		emoji.inits.colons = 1;
		emoji.rx_colons = new RegExp('\:[a-zA-Z0-9-_+]+\:', 'g');
		emoji.map.colons = {};
		for (var i in emoji.data){
			for (var j=0; j<emoji.data[i][3].length; j++){
				emoji.map.colons[emoji.data[i][3][j]] = i;
			}
		}
	};

	// initializes the unified unicode emoticon data
	/** @private */
	emoji.init_unified = function(){
		if (emoji.inits.unified) return;
		emoji.inits.unified = 1;

		var a = [];
		emoji.map.unified = {};

		for (var i in emoji.data){
			for (var j=0; j<emoji.data[i][0].length; j++){
				a.push(emoji.data[i][0][j]);
				emoji.map.unified[emoji.data[i][0][j]] = i;
			}
		}

		emoji.rx_unified = new RegExp('('+a.join('|')+')', "g");
	};

	// initializes the environment, figuring out what representation
	// of emoticons is best.
	/** @private */
	emoji.init_env = function(){
		if (emoji.inits.env) return;
		emoji.inits.env = 1;
		emoji.replace_mode = 'img';
		emoji.supports_css = false;
		var ua = navigator.userAgent;
		if (window.getComputedStyle){
			var st = window.getComputedStyle(document.body);
			if (st['background-size'] || st['backgroundSize']){
				emoji.supports_css = true;
			}
		}
		if (ua.match(/(iPhone|iPod|iPad|iPhone\s+Simulator)/i)){
			if (ua.match(/OS\s+[12345]/i)){
				emoji.replace_mode = 'softbank';
				return;
			}
			if (ua.match(/OS\s+[6789]/i)){
				emoji.replace_mode = 'unified';
				return;
			}
		}
		if (ua.match(/Mac OS X 10[._ ](?:[789]|1\d)/i)){
			if (!ua.match(/Chrome/i)){
				emoji.replace_mode = 'unified';
				return;
			}
		}
		if (ua.match(/Windows NT 6.[1-9]/i)){
			if (!ua.match(/Chrome/i)){
				emoji.replace_mode = 'unified';
				return;
			}
		}
		// Need a better way to detect android devices that actually
		// support emoji.
		if (false && ua.match(/Android/i)){
			emoji.replace_mode = 'google';
			return;
		}
		if (emoji.supports_css){
			emoji.replace_mode = 'css';
		}
		// nothing fancy detected - use images
	};
	/** @private */
	emoji.escape_rx = function(text){
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	emoji.sheet_size = 35;
	/** @private */
	emoji.data = {
		"00a9":[["\u00A9\uFE0F","\u00A9"],"\uE24E","\uDBBA\uDF29",["copyright"]],
		"00ae":[["\u00AE\uFE0F","\u00AE"],"\uE24F","\uDBBA\uDF2D",["registered"]],
		"203c":[["\u203C\uFE0F","\u203C"],"","\uDBBA\uDF06",["bangbang"]],
		"2049":[["\u2049\uFE0F","\u2049"],"","\uDBBA\uDF05",["interrobang"]],
		"2122":[["\u2122\uFE0F","\u2122"],"\uE537","\uDBBA\uDF2A",["tm"]],
		"2139":[["\u2139\uFE0F","\u2139"],"","\uDBBA\uDF47",["information_source"]],
		"2194":[["\u2194\uFE0F","\u2194"],"","\uDBBA\uDEF6",["left_right_arrow"]],
		"2195":[["\u2195\uFE0F","\u2195"],"","\uDBBA\uDEF7",["arrow_up_down"]],
		"2196":[["\u2196\uFE0F","\u2196"],"\uE237","\uDBBA\uDEF2",["arrow_upper_left"]],
		"2197":[["\u2197\uFE0F","\u2197"],"\uE236","\uDBBA\uDEF0",["arrow_upper_right"]],
		"2198":[["\u2198\uFE0F","\u2198"],"\uE238","\uDBBA\uDEF1",["arrow_lower_right"]],
		"2199":[["\u2199\uFE0F","\u2199"],"\uE239","\uDBBA\uDEF3",["arrow_lower_left"]],
		"21a9":[["\u21A9\uFE0F","\u21A9"],"","\uDBBA\uDF83",["leftwards_arrow_with_hook"]],
		"21aa":[["\u21AA\uFE0F","\u21AA"],"","\uDBBA\uDF88",["arrow_right_hook"]],
		"231a":[["\u231A\uFE0F","\u231A"],"","\uDBB8\uDC1D",["watch"]],
		"231b":[["\u231B\uFE0F","\u231B"],"","\uDBB8\uDC1C",["hourglass"]],
		"23e9":[["\u23E9"],"\uE23C","\uDBBA\uDEFE",["fast_forward"]],
		"23ea":[["\u23EA"],"\uE23D","\uDBBA\uDEFF",["rewind"]],
		"23eb":[["\u23EB"],"","\uDBBA\uDF03",["arrow_double_up"]],
		"23ec":[["\u23EC"],"","\uDBBA\uDF02",["arrow_double_down"]],
		"23f0":[["\u23F0"],"\uE02D","\uDBB8\uDC2A",["alarm_clock"]],
		"23f3":[["\u23F3"],"","\uDBB8\uDC1B",["hourglass_flowing_sand"]],
		"24c2":[["\u24C2\uFE0F","\u24C2"],"\uE434","\uDBB9\uDFE1",["m"]],
		"25aa":[["\u25AA\uFE0F","\u25AA"],"\uE21A","\uDBBA\uDF6E",["black_small_square"]],
		"25ab":[["\u25AB\uFE0F","\u25AB"],"\uE21B","\uDBBA\uDF6D",["white_small_square"]],
		"25b6":[["\u25B6\uFE0F","\u25B6"],"\uE23A","\uDBBA\uDEFC",["arrow_forward"]],
		"25c0":[["\u25C0\uFE0F","\u25C0"],"\uE23B","\uDBBA\uDEFD",["arrow_backward"]],
		"25fb":[["\u25FB\uFE0F","\u25FB"],"\uE21B","\uDBBA\uDF71",["white_medium_square"]],
		"25fc":[["\u25FC\uFE0F","\u25FC"],"\uE21A","\uDBBA\uDF72",["black_medium_square"]],
		"25fd":[["\u25FD\uFE0F","\u25FD"],"\uE21B","\uDBBA\uDF6F",["white_medium_small_square"]],
		"25fe":[["\u25FE\uFE0F","\u25FE"],"\uE21A","\uDBBA\uDF70",["black_medium_small_square"]],
		"2600":[["\u2600\uFE0F","\u2600"],"\uE04A","\uDBB8\uDC00",["sunny"]],
		"2601":[["\u2601\uFE0F","\u2601"],"\uE049","\uDBB8\uDC01",["cloud"]],
		"260e":[["\u260E\uFE0F","\u260E"],"\uE009","\uDBB9\uDD23",["phone","telephone"]],
		"2611":[["\u2611\uFE0F","\u2611"],"","\uDBBA\uDF8B",["ballot_box_with_check"]],
		"2614":[["\u2614\uFE0F","\u2614"],"\uE04B","\uDBB8\uDC02",["umbrella"]],
		"2615":[["\u2615\uFE0F","\u2615"],"\uE045","\uDBBA\uDD81",["coffee"]],
		"261d":[["\u261D\uFE0F","\u261D"],"\uE00F","\uDBBA\uDF98",["point_up"]],
		"263a":[["\u263A\uFE0F","\u263A"],"\uE414","\uDBB8\uDF36",["relaxed"]],
		"2648":[["\u2648\uFE0F","\u2648"],"\uE23F","\uDBB8\uDC2B",["aries"]],
		"2649":[["\u2649\uFE0F","\u2649"],"\uE240","\uDBB8\uDC2C",["taurus"]],
		"264a":[["\u264A\uFE0F","\u264A"],"\uE241","\uDBB8\uDC2D",["gemini"]],
		"264b":[["\u264B\uFE0F","\u264B"],"\uE242","\uDBB8\uDC2E",["cancer"]],
		"264c":[["\u264C\uFE0F","\u264C"],"\uE243","\uDBB8\uDC2F",["leo"]],
		"264d":[["\u264D\uFE0F","\u264D"],"\uE244","\uDBB8\uDC30",["virgo"]],
		"264e":[["\u264E\uFE0F","\u264E"],"\uE245","\uDBB8\uDC31",["libra"]],
		"264f":[["\u264F\uFE0F","\u264F"],"\uE246","\uDBB8\uDC32",["scorpius"]],
		"2650":[["\u2650\uFE0F","\u2650"],"\uE247","\uDBB8\uDC33",["sagittarius"]],
		"2651":[["\u2651\uFE0F","\u2651"],"\uE248","\uDBB8\uDC34",["capricorn"]],
		"2652":[["\u2652\uFE0F","\u2652"],"\uE249","\uDBB8\uDC35",["aquarius"]],
		"2653":[["\u2653\uFE0F","\u2653"],"\uE24A","\uDBB8\uDC36",["pisces"]],
		"2660":[["\u2660\uFE0F","\u2660"],"\uE20E","\uDBBA\uDF1B",["spades"]],
		"2663":[["\u2663\uFE0F","\u2663"],"\uE20F","\uDBBA\uDF1D",["clubs"]],
		"2665":[["\u2665\uFE0F","\u2665"],"\uE20C","\uDBBA\uDF1A",["hearts"]],
		"2666":[["\u2666\uFE0F","\u2666"],"\uE20D","\uDBBA\uDF1C",["diamonds"]],
		"2668":[["\u2668\uFE0F","\u2668"],"\uE123","\uDBB9\uDFFA",["hotsprings"]],
		"267b":[["\u267B\uFE0F","\u267B"],"","\uDBBA\uDF2C",["recycle"]],
		"267f":[["\u267F\uFE0F","\u267F"],"\uE20A","\uDBBA\uDF20",["wheelchair"]],
		"2693":[["\u2693\uFE0F","\u2693"],"\uE202","\uDBB9\uDCC1",["anchor"]],
		"26a0":[["\u26A0\uFE0F","\u26A0"],"\uE252","\uDBBA\uDF23",["warning"]],
		"26a1":[["\u26A1\uFE0F","\u26A1"],"\uE13D","\uDBB8\uDC04",["zap"]],
		"26aa":[["\u26AA\uFE0F","\u26AA"],"\uE219","\uDBBA\uDF65",["white_circle"]],
		"26ab":[["\u26AB\uFE0F","\u26AB"],"\uE219","\uDBBA\uDF66",["black_circle"]],
		"26bd":[["\u26BD\uFE0F","\u26BD"],"\uE018","\uDBB9\uDFD4",["soccer"]],
		"26be":[["\u26BE\uFE0F","\u26BE"],"\uE016","\uDBB9\uDFD1",["baseball"]],
		"26c4":[["\u26C4\uFE0F","\u26C4"],"\uE048","\uDBB8\uDC03",["snowman"]],
		"26c5":[["\u26C5\uFE0F","\u26C5"],"\uE04A\uE049","\uDBB8\uDC0F",["partly_sunny"]],
		"26ce":[["\u26CE"],"\uE24B","\uDBB8\uDC37",["ophiuchus"]],
		"26d4":[["\u26D4\uFE0F","\u26D4"],"\uE137","\uDBBA\uDF26",["no_entry"]],
		"26ea":[["\u26EA\uFE0F","\u26EA"],"\uE037","\uDBB9\uDCBB",["church"]],
		"26f2":[["\u26F2\uFE0F","\u26F2"],"\uE121","\uDBB9\uDCBC",["fountain"]],
		"26f3":[["\u26F3\uFE0F","\u26F3"],"\uE014","\uDBB9\uDFD2",["golf"]],
		"26f5":[["\u26F5\uFE0F","\u26F5"],"\uE01C","\uDBB9\uDFEA",["boat","sailboat"]],
		"26fa":[["\u26FA\uFE0F","\u26FA"],"\uE122","\uDBB9\uDFFB",["tent"]],
		"26fd":[["\u26FD\uFE0F","\u26FD"],"\uE03A","\uDBB9\uDFF5",["fuelpump"]],
		"2702":[["\u2702\uFE0F","\u2702"],"\uE313","\uDBB9\uDD3E",["scissors"]],
		"2705":[["\u2705"],"","\uDBBA\uDF4A",["white_check_mark"]],
		"2708":[["\u2708\uFE0F","\u2708"],"\uE01D","\uDBB9\uDFE9",["airplane"]],
		"2709":[["\u2709\uFE0F","\u2709"],"\uE103","\uDBB9\uDD29",["email","envelope"]],
		"270a":[["\u270A"],"\uE010","\uDBBA\uDF93",["fist"]],
		"270b":[["\u270B"],"\uE012","\uDBBA\uDF95",["hand","raised_hand"]],
		"270c":[["\u270C\uFE0F","\u270C"],"\uE011","\uDBBA\uDF94",["v"]],
		"270f":[["\u270F\uFE0F","\u270F"],"\uE301","\uDBB9\uDD39",["pencil2"]],
		"2712":[["\u2712\uFE0F","\u2712"],"","\uDBB9\uDD36",["black_nib"]],
		"2714":[["\u2714\uFE0F","\u2714"],"","\uDBBA\uDF49",["heavy_check_mark"]],
		"2716":[["\u2716\uFE0F","\u2716"],"\uE333","\uDBBA\uDF53",["heavy_multiplication_x"]],
		"2728":[["\u2728"],"\uE32E","\uDBBA\uDF60",["sparkles"]],
		"2733":[["\u2733\uFE0F","\u2733"],"\uE206","\uDBBA\uDF62",["eight_spoked_asterisk"]],
		"2734":[["\u2734\uFE0F","\u2734"],"\uE205","\uDBBA\uDF61",["eight_pointed_black_star"]],
		"2744":[["\u2744\uFE0F","\u2744"],"","\uDBB8\uDC0E",["snowflake"]],
		"2747":[["\u2747\uFE0F","\u2747"],"\uE32E","\uDBBA\uDF77",["sparkle"]],
		"274c":[["\u274C"],"\uE333","\uDBBA\uDF45",["x"]],
		"274e":[["\u274E"],"\uE333","\uDBBA\uDF46",["negative_squared_cross_mark"]],
		"2753":[["\u2753"],"\uE020","\uDBBA\uDF09",["question"]],
		"2754":[["\u2754"],"\uE336","\uDBBA\uDF0A",["grey_question"]],
		"2755":[["\u2755"],"\uE337","\uDBBA\uDF0B",["grey_exclamation"]],
		"2757":[["\u2757\uFE0F","\u2757"],"\uE021","\uDBBA\uDF04",["exclamation","heavy_exclamation_mark"]],
		"2764":[["\u2764\uFE0F","\u2764"],"\uE022","\uDBBA\uDF0C",["heart"],3,12,15,0,"<3"],
		"2795":[["\u2795"],"","\uDBBA\uDF51",["heavy_plus_sign"]],
		"2796":[["\u2796"],"","\uDBBA\uDF52",["heavy_minus_sign"]],
		"2797":[["\u2797"],"","\uDBBA\uDF54",["heavy_division_sign"]],
		"27a1":[["\u27A1\uFE0F","\u27A1"],"\uE234","\uDBBA\uDEFA",["arrow_right"]],
		"27b0":[["\u27B0"],"","\uDBBA\uDF08",["curly_loop"]],
		"27bf":[["\u27BF"],"\uE211","\uDBBA\uDC2B",["loop"]],
		"2934":[["\u2934\uFE0F","\u2934"],"\uE236","\uDBBA\uDEF4",["arrow_heading_up"]],
		"2935":[["\u2935\uFE0F","\u2935"],"\uE238","\uDBBA\uDEF5",["arrow_heading_down"]],
		"2b05":[["\u2B05\uFE0F","\u2B05"],"\uE235","\uDBBA\uDEFB",["arrow_left"]],
		"2b06":[["\u2B06\uFE0F","\u2B06"],"\uE232","\uDBBA\uDEF8",["arrow_up"]],
		"2b07":[["\u2B07\uFE0F","\u2B07"],"\uE233","\uDBBA\uDEF9",["arrow_down"]],
		"2b1b":[["\u2B1B\uFE0F","\u2B1B"],"\uE21A","\uDBBA\uDF6C",["black_large_square"]],
		"2b1c":[["\u2B1C\uFE0F","\u2B1C"],"\uE21B","\uDBBA\uDF6B",["white_large_square"]],
		"2b50":[["\u2B50\uFE0F","\u2B50"],"\uE32F","\uDBBA\uDF68",["star"]],
		"2b55":[["\u2B55\uFE0F","\u2B55"],"\uE332","\uDBBA\uDF44",["o"]],
		"3030":[["\u3030\uFE0F","\u3030"],"","\uDBBA\uDF07",["wavy_dash"]],
		"303d":[["\u303D\uFE0F","\u303D"],"\uE12C","\uDBBA\uDC1B",["part_alternation_mark"]],
		"3297":[["\u3297\uFE0F","\u3297"],"\uE30D","\uDBBA\uDF43",["congratulations"]],
		"3299":[["\u3299\uFE0F","\u3299"],"\uE315","\uDBBA\uDF2B",["secret"]],
		"1f004":[["\uD83C\uDC04\uFE0F","\uD83C\uDC04"],"\uE12D","\uDBBA\uDC0B",["mahjong"]],
		"1f0cf":[["\uD83C\uDCCF"],"","\uDBBA\uDC12",["black_joker"]],
		"1f170":[["\uD83C\uDD70\uFE0F","\uD83C\uDD70"],"\uE532","\uDBB9\uDD0B",["a"]],
		"1f171":[["\uD83C\uDD71\uFE0F","\uD83C\uDD71"],"\uE533","\uDBB9\uDD0C",["b"]],
		"1f17e":[["\uD83C\uDD7E\uFE0F","\uD83C\uDD7E"],"\uE535","\uDBB9\uDD0E",["o2"]],
		"1f17f":[["\uD83C\uDD7F\uFE0F","\uD83C\uDD7F"],"\uE14F","\uDBB9\uDFF6",["parking"]],
		"1f18e":[["\uD83C\uDD8E"],"\uE534","\uDBB9\uDD0D",["ab"]],
		"1f191":[["\uD83C\uDD91"],"","\uDBBA\uDF84",["cl"]],
		"1f192":[["\uD83C\uDD92"],"\uE214","\uDBBA\uDF38",["cool"]],
		"1f193":[["\uD83C\uDD93"],"","\uDBBA\uDF21",["free"]],
		"1f194":[["\uD83C\uDD94"],"\uE229","\uDBBA\uDF81",["id"]],
		"1f195":[["\uD83C\uDD95"],"\uE212","\uDBBA\uDF36",["new"]],
		"1f196":[["\uD83C\uDD96"],"","\uDBBA\uDF28",["ng"]],
		"1f197":[["\uD83C\uDD97"],"\uE24D","\uDBBA\uDF27",["ok"]],
		"1f198":[["\uD83C\uDD98"],"","\uDBBA\uDF4F",["sos"]],
		"1f199":[["\uD83C\uDD99"],"\uE213","\uDBBA\uDF37",["up"]],
		"1f19a":[["\uD83C\uDD9A"],"\uE12E","\uDBBA\uDF32",["vs"]],
		"1f201":[["\uD83C\uDE01"],"\uE203","\uDBBA\uDF24",["koko"]],
		"1f202":[["\uD83C\uDE02\uFE0F","\uD83C\uDE02"],"\uE228","\uDBBA\uDF3F",["sa"]],
		"1f21a":[["\uD83C\uDE1A\uFE0F","\uD83C\uDE1A"],"\uE216","\uDBBA\uDF3A",["u7121"]],
		"1f22f":[["\uD83C\uDE2F\uFE0F","\uD83C\uDE2F"],"\uE22C","\uDBBA\uDF40",["u6307"]],
		"1f232":[["\uD83C\uDE32"],"","\uDBBA\uDF2E",["u7981"]],
		"1f233":[["\uD83C\uDE33"],"\uE22B","\uDBBA\uDF2F",["u7a7a"]],
		"1f234":[["\uD83C\uDE34"],"","\uDBBA\uDF30",["u5408"]],
		"1f235":[["\uD83C\uDE35"],"\uE22A","\uDBBA\uDF31",["u6e80"]],
		"1f236":[["\uD83C\uDE36"],"\uE215","\uDBBA\uDF39",["u6709"]],
		"1f237":[["\uD83C\uDE37\uFE0F","\uD83C\uDE37"],"\uE217","\uDBBA\uDF3B",["u6708"]],
		"1f238":[["\uD83C\uDE38"],"\uE218","\uDBBA\uDF3C",["u7533"]],
		"1f239":[["\uD83C\uDE39"],"\uE227","\uDBBA\uDF3E",["u5272"]],
		"1f23a":[["\uD83C\uDE3A"],"\uE22D","\uDBBA\uDF41",["u55b6"]],
		"1f250":[["\uD83C\uDE50"],"\uE226","\uDBBA\uDF3D",["ideograph_advantage"]],
		"1f251":[["\uD83C\uDE51"],"","\uDBBA\uDF50",["accept"]],
		"1f300":[["\uD83C\uDF00"],"\uE443","\uDBB8\uDC05",["cyclone"]],
		"1f301":[["\uD83C\uDF01"],"","\uDBB8\uDC06",["foggy"]],
		"1f302":[["\uD83C\uDF02"],"\uE43C","\uDBB8\uDC07",["closed_umbrella"]],
		"1f303":[["\uD83C\uDF03"],"\uE44B","\uDBB8\uDC08",["night_with_stars"]],
		"1f304":[["\uD83C\uDF04"],"\uE04D","\uDBB8\uDC09",["sunrise_over_mountains"]],
		"1f305":[["\uD83C\uDF05"],"\uE449","\uDBB8\uDC0A",["sunrise"]],
		"1f306":[["\uD83C\uDF06"],"\uE146","\uDBB8\uDC0B",["city_sunset"]],
		"1f307":[["\uD83C\uDF07"],"\uE44A","\uDBB8\uDC0C",["city_sunrise"]],
		"1f308":[["\uD83C\uDF08"],"\uE44C","\uDBB8\uDC0D",["rainbow"]],
		"1f309":[["\uD83C\uDF09"],"\uE44B","\uDBB8\uDC10",["bridge_at_night"]],
		"1f30a":[["\uD83C\uDF0A"],"\uE43E","\uDBB8\uDC38",["ocean"]],
		"1f30b":[["\uD83C\uDF0B"],"","\uDBB8\uDC3A",["volcano"]],
		"1f30c":[["\uD83C\uDF0C"],"\uE44B","\uDBB8\uDC3B",["milky_way"]],
		"1f30d":[["\uD83C\uDF0D"],"","",["earth_africa"]],
		"1f30e":[["\uD83C\uDF0E"],"","",["earth_americas"]],
		"1f30f":[["\uD83C\uDF0F"],"","\uDBB8\uDC39",["earth_asia"]],
		"1f310":[["\uD83C\uDF10"],"","",["globe_with_meridians"]],
		"1f311":[["\uD83C\uDF11"],"","\uDBB8\uDC11",["new_moon"]],
		"1f312":[["\uD83C\uDF12"],"","",["waxing_crescent_moon"]],
		"1f313":[["\uD83C\uDF13"],"\uE04C","\uDBB8\uDC13",["first_quarter_moon"]],
		"1f314":[["\uD83C\uDF14"],"\uE04C","\uDBB8\uDC12",["moon","waxing_gibbous_moon"]],
		"1f315":[["\uD83C\uDF15"],"","\uDBB8\uDC15",["full_moon"]],
		"1f316":[["\uD83C\uDF16"],"","",["waning_gibbous_moon"]],
		"1f317":[["\uD83C\uDF17"],"","",["last_quarter_moon"]],
		"1f318":[["\uD83C\uDF18"],"","",["waning_crescent_moon"]],
		"1f319":[["\uD83C\uDF19"],"\uE04C","\uDBB8\uDC14",["crescent_moon"]],
		"1f31a":[["\uD83C\uDF1A"],"","",["new_moon_with_face"]],
		"1f31b":[["\uD83C\uDF1B"],"\uE04C","\uDBB8\uDC16",["first_quarter_moon_with_face"]],
		"1f31c":[["\uD83C\uDF1C"],"","",["last_quarter_moon_with_face"]],
		"1f31d":[["\uD83C\uDF1D"],"","",["full_moon_with_face"]],
		"1f31e":[["\uD83C\uDF1E"],"","",["sun_with_face"]],
		"1f31f":[["\uD83C\uDF1F"],"\uE335","\uDBBA\uDF69",["star2"]],
		"1f320":[["\uD83C\uDF20"],"","\uDBBA\uDF6A",["stars"]],
		"1f330":[["\uD83C\uDF30"],"","\uDBB8\uDC4C",["chestnut"]],
		"1f331":[["\uD83C\uDF31"],"\uE110","\uDBB8\uDC3E",["seedling"]],
		"1f332":[["\uD83C\uDF32"],"","",["evergreen_tree"]],
		"1f333":[["\uD83C\uDF33"],"","",["deciduous_tree"]],
		"1f334":[["\uD83C\uDF34"],"\uE307","\uDBB8\uDC47",["palm_tree"]],
		"1f335":[["\uD83C\uDF35"],"\uE308","\uDBB8\uDC48",["cactus"]],
		"1f337":[["\uD83C\uDF37"],"\uE304","\uDBB8\uDC3D",["tulip"]],
		"1f338":[["\uD83C\uDF38"],"\uE030","\uDBB8\uDC40",["cherry_blossom"]],
		"1f339":[["\uD83C\uDF39"],"\uE032","\uDBB8\uDC41",["rose"]],
		"1f33a":[["\uD83C\uDF3A"],"\uE303","\uDBB8\uDC45",["hibiscus"]],
		"1f33b":[["\uD83C\uDF3B"],"\uE305","\uDBB8\uDC46",["sunflower"]],
		"1f33c":[["\uD83C\uDF3C"],"\uE305","\uDBB8\uDC4D",["blossom"]],
		"1f33d":[["\uD83C\uDF3D"],"","\uDBB8\uDC4A",["corn"]],
		"1f33e":[["\uD83C\uDF3E"],"\uE444","\uDBB8\uDC49",["ear_of_rice"]],
		"1f33f":[["\uD83C\uDF3F"],"\uE110","\uDBB8\uDC4E",["herb"]],
		"1f340":[["\uD83C\uDF40"],"\uE110","\uDBB8\uDC3C",["four_leaf_clover"]],
		"1f341":[["\uD83C\uDF41"],"\uE118","\uDBB8\uDC3F",["maple_leaf"]],
		"1f342":[["\uD83C\uDF42"],"\uE119","\uDBB8\uDC42",["fallen_leaf"]],
		"1f343":[["\uD83C\uDF43"],"\uE447","\uDBB8\uDC43",["leaves"]],
		"1f344":[["\uD83C\uDF44"],"","\uDBB8\uDC4B",["mushroom"]],
		"1f345":[["\uD83C\uDF45"],"\uE349","\uDBB8\uDC55",["tomato"]],
		"1f346":[["\uD83C\uDF46"],"\uE34A","\uDBB8\uDC56",["eggplant"]],
		"1f347":[["\uD83C\uDF47"],"","\uDBB8\uDC59",["grapes"]],
		"1f348":[["\uD83C\uDF48"],"","\uDBB8\uDC57",["melon"]],
		"1f349":[["\uD83C\uDF49"],"\uE348","\uDBB8\uDC54",["watermelon"]],
		"1f34a":[["\uD83C\uDF4A"],"\uE346","\uDBB8\uDC52",["tangerine"]],
		"1f34b":[["\uD83C\uDF4B"],"","",["lemon"]],
		"1f34c":[["\uD83C\uDF4C"],"","\uDBB8\uDC50",["banana"]],
		"1f34d":[["\uD83C\uDF4D"],"","\uDBB8\uDC58",["pineapple"]],
		"1f34e":[["\uD83C\uDF4E"],"\uE345","\uDBB8\uDC51",["apple"]],
		"1f34f":[["\uD83C\uDF4F"],"\uE345","\uDBB8\uDC5B",["green_apple"]],
		"1f350":[["\uD83C\uDF50"],"","",["pear"]],
		"1f351":[["\uD83C\uDF51"],"","\uDBB8\uDC5A",["peach"]],
		"1f352":[["\uD83C\uDF52"],"","\uDBB8\uDC4F",["cherries"]],
		"1f353":[["\uD83C\uDF53"],"\uE347","\uDBB8\uDC53",["strawberry"]],
		"1f354":[["\uD83C\uDF54"],"\uE120","\uDBBA\uDD60",["hamburger"]],
		"1f355":[["\uD83C\uDF55"],"","\uDBBA\uDD75",["pizza"]],
		"1f356":[["\uD83C\uDF56"],"","\uDBBA\uDD72",["meat_on_bone"]],
		"1f357":[["\uD83C\uDF57"],"","\uDBBA\uDD76",["poultry_leg"]],
		"1f358":[["\uD83C\uDF58"],"\uE33D","\uDBBA\uDD69",["rice_cracker"]],
		"1f359":[["\uD83C\uDF59"],"\uE342","\uDBBA\uDD61",["rice_ball"]],
		"1f35a":[["\uD83C\uDF5A"],"\uE33E","\uDBBA\uDD6A",["rice"]],
		"1f35b":[["\uD83C\uDF5B"],"\uE341","\uDBBA\uDD6C",["curry"]],
		"1f35c":[["\uD83C\uDF5C"],"\uE340","\uDBBA\uDD63",["ramen"]],
		"1f35d":[["\uD83C\uDF5D"],"\uE33F","\uDBBA\uDD6B",["spaghetti"]],
		"1f35e":[["\uD83C\uDF5E"],"\uE339","\uDBBA\uDD64",["bread"]],
		"1f35f":[["\uD83C\uDF5F"],"\uE33B","\uDBBA\uDD67",["fries"]],
		"1f360":[["\uD83C\uDF60"],"","\uDBBA\uDD74",["sweet_potato"]],
		"1f361":[["\uD83C\uDF61"],"\uE33C","\uDBBA\uDD68",["dango"]],
		"1f362":[["\uD83C\uDF62"],"\uE343","\uDBBA\uDD6D",["oden"]],
		"1f363":[["\uD83C\uDF63"],"\uE344","\uDBBA\uDD6E",["sushi"]],
		"1f364":[["\uD83C\uDF64"],"","\uDBBA\uDD7F",["fried_shrimp"]],
		"1f365":[["\uD83C\uDF65"],"","\uDBBA\uDD73",["fish_cake"]],
		"1f366":[["\uD83C\uDF66"],"\uE33A","\uDBBA\uDD66",["icecream"]],
		"1f367":[["\uD83C\uDF67"],"\uE43F","\uDBBA\uDD71",["shaved_ice"]],
		"1f368":[["\uD83C\uDF68"],"","\uDBBA\uDD77",["ice_cream"]],
		"1f369":[["\uD83C\uDF69"],"","\uDBBA\uDD78",["doughnut"]],
		"1f36a":[["\uD83C\uDF6A"],"","\uDBBA\uDD79",["cookie"]],
		"1f36b":[["\uD83C\uDF6B"],"","\uDBBA\uDD7A",["chocolate_bar"]],
		"1f36c":[["\uD83C\uDF6C"],"","\uDBBA\uDD7B",["candy"]],
		"1f36d":[["\uD83C\uDF6D"],"","\uDBBA\uDD7C",["lollipop"]],
		"1f36e":[["\uD83C\uDF6E"],"","\uDBBA\uDD7D",["custard"]],
		"1f36f":[["\uD83C\uDF6F"],"","\uDBBA\uDD7E",["honey_pot"]],
		"1f370":[["\uD83C\uDF70"],"\uE046","\uDBBA\uDD62",["cake"]],
		"1f371":[["\uD83C\uDF71"],"\uE34C","\uDBBA\uDD6F",["bento"]],
		"1f372":[["\uD83C\uDF72"],"\uE34D","\uDBBA\uDD70",["stew"]],
		"1f373":[["\uD83C\uDF73"],"\uE147","\uDBBA\uDD65",["egg"]],
		"1f374":[["\uD83C\uDF74"],"\uE043","\uDBBA\uDD80",["fork_and_knife"]],
		"1f375":[["\uD83C\uDF75"],"\uE338","\uDBBA\uDD84",["tea"]],
		"1f376":[["\uD83C\uDF76"],"\uE30B","\uDBBA\uDD85",["sake"]],
		"1f377":[["\uD83C\uDF77"],"\uE044","\uDBBA\uDD86",["wine_glass"]],
		"1f378":[["\uD83C\uDF78"],"\uE044","\uDBBA\uDD82",["cocktail"]],
		"1f379":[["\uD83C\uDF79"],"\uE044","\uDBBA\uDD88",["tropical_drink"]],
		"1f37a":[["\uD83C\uDF7A"],"\uE047","\uDBBA\uDD83",["beer"]],
		"1f37b":[["\uD83C\uDF7B"],"\uE30C","\uDBBA\uDD87",["beers"]],
		"1f37c":[["\uD83C\uDF7C"],"","",["baby_bottle"]],
		"1f380":[["\uD83C\uDF80"],"\uE314","\uDBB9\uDD0F",["ribbon"]],
		"1f381":[["\uD83C\uDF81"],"\uE112","\uDBB9\uDD10",["gift"]],
		"1f382":[["\uD83C\uDF82"],"\uE34B","\uDBB9\uDD11",["birthday"]],
		"1f383":[["\uD83C\uDF83"],"\uE445","\uDBB9\uDD1F",["jack_o_lantern"]],
		"1f384":[["\uD83C\uDF84"],"\uE033","\uDBB9\uDD12",["christmas_tree"]],
		"1f385":[["\uD83C\uDF85"],"\uE448","\uDBB9\uDD13",["santa"]],
		"1f386":[["\uD83C\uDF86"],"\uE117","\uDBB9\uDD15",["fireworks"]],
		"1f387":[["\uD83C\uDF87"],"\uE440","\uDBB9\uDD1D",["sparkler"]],
		"1f388":[["\uD83C\uDF88"],"\uE310","\uDBB9\uDD16",["balloon"]],
		"1f389":[["\uD83C\uDF89"],"\uE312","\uDBB9\uDD17",["tada"]],
		"1f38a":[["\uD83C\uDF8A"],"","\uDBB9\uDD20",["confetti_ball"]],
		"1f38b":[["\uD83C\uDF8B"],"","\uDBB9\uDD21",["tanabata_tree"]],
		"1f38c":[["\uD83C\uDF8C"],"\uE143","\uDBB9\uDD14",["crossed_flags"]],
		"1f38d":[["\uD83C\uDF8D"],"\uE436","\uDBB9\uDD18",["bamboo"]],
		"1f38e":[["\uD83C\uDF8E"],"\uE438","\uDBB9\uDD19",["dolls"]],
		"1f38f":[["\uD83C\uDF8F"],"\uE43B","\uDBB9\uDD1C",["flags"]],
		"1f390":[["\uD83C\uDF90"],"\uE442","\uDBB9\uDD1E",["wind_chime"]],
		"1f391":[["\uD83C\uDF91"],"\uE446","\uDBB8\uDC17",["rice_scene"]],
		"1f392":[["\uD83C\uDF92"],"\uE43A","\uDBB9\uDD1B",["school_satchel"]],
		"1f393":[["\uD83C\uDF93"],"\uE439","\uDBB9\uDD1A",["mortar_board"]],
		"1f3a0":[["\uD83C\uDFA0"],"","\uDBB9\uDFFC",["carousel_horse"]],
		"1f3a1":[["\uD83C\uDFA1"],"\uE124","\uDBB9\uDFFD",["ferris_wheel"]],
		"1f3a2":[["\uD83C\uDFA2"],"\uE433","\uDBB9\uDFFE",["roller_coaster"]],
		"1f3a3":[["\uD83C\uDFA3"],"\uE019","\uDBB9\uDFFF",["fishing_pole_and_fish"]],
		"1f3a4":[["\uD83C\uDFA4"],"\uE03C","\uDBBA\uDC00",["microphone"]],
		"1f3a5":[["\uD83C\uDFA5"],"\uE03D","\uDBBA\uDC01",["movie_camera"]],
		"1f3a6":[["\uD83C\uDFA6"],"\uE507","\uDBBA\uDC02",["cinema"]],
		"1f3a7":[["\uD83C\uDFA7"],"\uE30A","\uDBBA\uDC03",["headphones"]],
		"1f3a8":[["\uD83C\uDFA8"],"\uE502","\uDBBA\uDC04",["art"]],
		"1f3a9":[["\uD83C\uDFA9"],"\uE503","\uDBBA\uDC05",["tophat"]],
		"1f3aa":[["\uD83C\uDFAA"],"","\uDBBA\uDC06",["circus_tent"]],
		"1f3ab":[["\uD83C\uDFAB"],"\uE125","\uDBBA\uDC07",["ticket"]],
		"1f3ac":[["\uD83C\uDFAC"],"\uE324","\uDBBA\uDC08",["clapper"]],
		"1f3ad":[["\uD83C\uDFAD"],"\uE503","\uDBBA\uDC09",["performing_arts"]],
		"1f3ae":[["\uD83C\uDFAE"],"","\uDBBA\uDC0A",["video_game"]],
		"1f3af":[["\uD83C\uDFAF"],"\uE130","\uDBBA\uDC0C",["dart"]],
		"1f3b0":[["\uD83C\uDFB0"],"\uE133","\uDBBA\uDC0D",["slot_machine"]],
		"1f3b1":[["\uD83C\uDFB1"],"\uE42C","\uDBBA\uDC0E",["8ball"]],
		"1f3b2":[["\uD83C\uDFB2"],"","\uDBBA\uDC0F",["game_die"]],
		"1f3b3":[["\uD83C\uDFB3"],"","\uDBBA\uDC10",["bowling"]],
		"1f3b4":[["\uD83C\uDFB4"],"","\uDBBA\uDC11",["flower_playing_cards"]],
		"1f3b5":[["\uD83C\uDFB5"],"\uE03E","\uDBBA\uDC13",["musical_note"]],
		"1f3b6":[["\uD83C\uDFB6"],"\uE326","\uDBBA\uDC14",["notes"]],
		"1f3b7":[["\uD83C\uDFB7"],"\uE040","\uDBBA\uDC15",["saxophone"]],
		"1f3b8":[["\uD83C\uDFB8"],"\uE041","\uDBBA\uDC16",["guitar"]],
		"1f3b9":[["\uD83C\uDFB9"],"","\uDBBA\uDC17",["musical_keyboard"]],
		"1f3ba":[["\uD83C\uDFBA"],"\uE042","\uDBBA\uDC18",["trumpet"]],
		"1f3bb":[["\uD83C\uDFBB"],"","\uDBBA\uDC19",["violin"]],
		"1f3bc":[["\uD83C\uDFBC"],"\uE326","\uDBBA\uDC1A",["musical_score"]],
		"1f3bd":[["\uD83C\uDFBD"],"","\uDBB9\uDFD0",["running_shirt_with_sash"]],
		"1f3be":[["\uD83C\uDFBE"],"\uE015","\uDBB9\uDFD3",["tennis"]],
		"1f3bf":[["\uD83C\uDFBF"],"\uE013","\uDBB9\uDFD5",["ski"]],
		"1f3c0":[["\uD83C\uDFC0"],"\uE42A","\uDBB9\uDFD6",["basketball"]],
		"1f3c1":[["\uD83C\uDFC1"],"\uE132","\uDBB9\uDFD7",["checkered_flag"]],
		"1f3c2":[["\uD83C\uDFC2"],"","\uDBB9\uDFD8",["snowboarder"]],
		"1f3c3":[["\uD83C\uDFC3"],"\uE115","\uDBB9\uDFD9",["runner","running"]],
		"1f3c4":[["\uD83C\uDFC4"],"\uE017","\uDBB9\uDFDA",["surfer"]],
		"1f3c6":[["\uD83C\uDFC6"],"\uE131","\uDBB9\uDFDB",["trophy"]],
		"1f3c7":[["\uD83C\uDFC7"],"","",["horse_racing"]],
		"1f3c8":[["\uD83C\uDFC8"],"\uE42B","\uDBB9\uDFDD",["football"]],
		"1f3c9":[["\uD83C\uDFC9"],"","",["rugby_football"]],
		"1f3ca":[["\uD83C\uDFCA"],"\uE42D","\uDBB9\uDFDE",["swimmer"]],
		"1f3e0":[["\uD83C\uDFE0"],"\uE036","\uDBB9\uDCB0",["house"]],
		"1f3e1":[["\uD83C\uDFE1"],"\uE036","\uDBB9\uDCB1",["house_with_garden"]],
		"1f3e2":[["\uD83C\uDFE2"],"\uE038","\uDBB9\uDCB2",["office"]],
		"1f3e3":[["\uD83C\uDFE3"],"\uE153","\uDBB9\uDCB3",["post_office"]],
		"1f3e4":[["\uD83C\uDFE4"],"","",["european_post_office"]],
		"1f3e5":[["\uD83C\uDFE5"],"\uE155","\uDBB9\uDCB4",["hospital"]],
		"1f3e6":[["\uD83C\uDFE6"],"\uE14D","\uDBB9\uDCB5",["bank"]],
		"1f3e7":[["\uD83C\uDFE7"],"\uE154","\uDBB9\uDCB6",["atm"]],
		"1f3e8":[["\uD83C\uDFE8"],"\uE158","\uDBB9\uDCB7",["hotel"]],
		"1f3e9":[["\uD83C\uDFE9"],"\uE501","\uDBB9\uDCB8",["love_hotel"]],
		"1f3ea":[["\uD83C\uDFEA"],"\uE156","\uDBB9\uDCB9",["convenience_store"]],
		"1f3eb":[["\uD83C\uDFEB"],"\uE157","\uDBB9\uDCBA",["school"]],
		"1f3ec":[["\uD83C\uDFEC"],"\uE504","\uDBB9\uDCBD",["department_store"]],
		"1f3ed":[["\uD83C\uDFED"],"\uE508","\uDBB9\uDCC0",["factory"]],
		"1f3ee":[["\uD83C\uDFEE"],"\uE30B","\uDBB9\uDCC2",["izakaya_lantern","lantern"]],
		"1f3ef":[["\uD83C\uDFEF"],"\uE505","\uDBB9\uDCBE",["japanese_castle"]],
		"1f3f0":[["\uD83C\uDFF0"],"\uE506","\uDBB9\uDCBF",["european_castle"]],
		"1f3fb":[["\uD83C\uDFFB"],"","",["skin-tone-2"]],
		"1f3fc":[["\uD83C\uDFFC"],"","",["skin-tone-3"]],
		"1f3fd":[["\uD83C\uDFFD"],"","",["skin-tone-4"]],
		"1f3fe":[["\uD83C\uDFFE"],"","",["skin-tone-5"]],
		"1f3ff":[["\uD83C\uDFFF"],"","",["skin-tone-6"]],
		"1f400":[["\uD83D\uDC00"],"","",["rat"]],
		"1f401":[["\uD83D\uDC01"],"","",["mouse2"]],
		"1f402":[["\uD83D\uDC02"],"","",["ox"]],
		"1f403":[["\uD83D\uDC03"],"","",["water_buffalo"]],
		"1f404":[["\uD83D\uDC04"],"","",["cow2"]],
		"1f405":[["\uD83D\uDC05"],"","",["tiger2"]],
		"1f406":[["\uD83D\uDC06"],"","",["leopard"]],
		"1f407":[["\uD83D\uDC07"],"","",["rabbit2"]],
		"1f408":[["\uD83D\uDC08"],"","",["cat2"]],
		"1f409":[["\uD83D\uDC09"],"","",["dragon"]],
		"1f40a":[["\uD83D\uDC0A"],"","",["crocodile"]],
		"1f40b":[["\uD83D\uDC0B"],"","",["whale2"]],
		"1f40c":[["\uD83D\uDC0C"],"","\uDBB8\uDDB9",["snail"]],
		"1f40d":[["\uD83D\uDC0D"],"\uE52D","\uDBB8\uDDD3",["snake"]],
		"1f40e":[["\uD83D\uDC0E"],"\uE134","\uDBB9\uDFDC",["racehorse"]],
		"1f40f":[["\uD83D\uDC0F"],"","",["ram"]],
		"1f410":[["\uD83D\uDC10"],"","",["goat"]],
		"1f411":[["\uD83D\uDC11"],"\uE529","\uDBB8\uDDCF",["sheep"]],
		"1f412":[["\uD83D\uDC12"],"\uE528","\uDBB8\uDDCE",["monkey"]],
		"1f413":[["\uD83D\uDC13"],"","",["rooster"]],
		"1f414":[["\uD83D\uDC14"],"\uE52E","\uDBB8\uDDD4",["chicken"]],
		"1f415":[["\uD83D\uDC15"],"","",["dog2"]],
		"1f416":[["\uD83D\uDC16"],"","",["pig2"]],
		"1f417":[["\uD83D\uDC17"],"\uE52F","\uDBB8\uDDD5",["boar"]],
		"1f418":[["\uD83D\uDC18"],"\uE526","\uDBB8\uDDCC",["elephant"]],
		"1f419":[["\uD83D\uDC19"],"\uE10A","\uDBB8\uDDC5",["octopus"]],
		"1f41a":[["\uD83D\uDC1A"],"\uE441","\uDBB8\uDDC6",["shell"]],
		"1f41b":[["\uD83D\uDC1B"],"\uE525","\uDBB8\uDDCB",["bug"]],
		"1f41c":[["\uD83D\uDC1C"],"","\uDBB8\uDDDA",["ant"]],
		"1f41d":[["\uD83D\uDC1D"],"","\uDBB8\uDDE1",["bee","honeybee"]],
		"1f41e":[["\uD83D\uDC1E"],"","\uDBB8\uDDE2",["beetle"]],
		"1f41f":[["\uD83D\uDC1F"],"\uE019","\uDBB8\uDDBD",["fish"]],
		"1f420":[["\uD83D\uDC20"],"\uE522","\uDBB8\uDDC9",["tropical_fish"]],
		"1f421":[["\uD83D\uDC21"],"\uE019","\uDBB8\uDDD9",["blowfish"]],
		"1f422":[["\uD83D\uDC22"],"","\uDBB8\uDDDC",["turtle"]],
		"1f423":[["\uD83D\uDC23"],"\uE523","\uDBB8\uDDDD",["hatching_chick"]],
		"1f424":[["\uD83D\uDC24"],"\uE523","\uDBB8\uDDBA",["baby_chick"]],
		"1f425":[["\uD83D\uDC25"],"\uE523","\uDBB8\uDDBB",["hatched_chick"]],
		"1f426":[["\uD83D\uDC26"],"\uE521","\uDBB8\uDDC8",["bird"]],
		"1f427":[["\uD83D\uDC27"],"\uE055","\uDBB8\uDDBC",["penguin"]],
		"1f428":[["\uD83D\uDC28"],"\uE527","\uDBB8\uDDCD",["koala"]],
		"1f429":[["\uD83D\uDC29"],"\uE052","\uDBB8\uDDD8",["poodle"]],
		"1f42a":[["\uD83D\uDC2A"],"","",["dromedary_camel"]],
		"1f42b":[["\uD83D\uDC2B"],"\uE530","\uDBB8\uDDD6",["camel"]],
		"1f42c":[["\uD83D\uDC2C"],"\uE520","\uDBB8\uDDC7",["dolphin","flipper"]],
		"1f42d":[["\uD83D\uDC2D"],"\uE053","\uDBB8\uDDC2",["mouse"]],
		"1f42e":[["\uD83D\uDC2E"],"\uE52B","\uDBB8\uDDD1",["cow"]],
		"1f42f":[["\uD83D\uDC2F"],"\uE050","\uDBB8\uDDC0",["tiger"]],
		"1f430":[["\uD83D\uDC30"],"\uE52C","\uDBB8\uDDD2",["rabbit"]],
		"1f431":[["\uD83D\uDC31"],"\uE04F","\uDBB8\uDDB8",["cat"]],
		"1f432":[["\uD83D\uDC32"],"","\uDBB8\uDDDE",["dragon_face"]],
		"1f433":[["\uD83D\uDC33"],"\uE054","\uDBB8\uDDC3",["whale"]],
		"1f434":[["\uD83D\uDC34"],"\uE01A","\uDBB8\uDDBE",["horse"]],
		"1f435":[["\uD83D\uDC35"],"\uE109","\uDBB8\uDDC4",["monkey_face"]],
		"1f436":[["\uD83D\uDC36"],"\uE052","\uDBB8\uDDB7",["dog"]],
		"1f437":[["\uD83D\uDC37"],"\uE10B","\uDBB8\uDDBF",["pig"]],
		"1f438":[["\uD83D\uDC38"],"\uE531","\uDBB8\uDDD7",["frog"]],
		"1f439":[["\uD83D\uDC39"],"\uE524","\uDBB8\uDDCA",["hamster"]],
		"1f43a":[["\uD83D\uDC3A"],"\uE52A","\uDBB8\uDDD0",["wolf"]],
		"1f43b":[["\uD83D\uDC3B"],"\uE051","\uDBB8\uDDC1",["bear"]],
		"1f43c":[["\uD83D\uDC3C"],"","\uDBB8\uDDDF",["panda_face"]],
		"1f43d":[["\uD83D\uDC3D"],"\uE10B","\uDBB8\uDDE0",["pig_nose"]],
		"1f43e":[["\uD83D\uDC3E"],"\uE536","\uDBB8\uDDDB",["feet","paw_prints"]],
		"1f440":[["\uD83D\uDC40"],"\uE419","\uDBB8\uDD90",["eyes"]],
		"1f442":[["\uD83D\uDC42"],"\uE41B","\uDBB8\uDD91",["ear"]],
		"1f443":[["\uD83D\uDC43"],"\uE41A","\uDBB8\uDD92",["nose"]],
		"1f444":[["\uD83D\uDC44"],"\uE41C","\uDBB8\uDD93",["lips"]],
		"1f445":[["\uD83D\uDC45"],"\uE409","\uDBB8\uDD94",["tongue"]],
		"1f446":[["\uD83D\uDC46"],"\uE22E","\uDBBA\uDF99",["point_up_2"]],
		"1f447":[["\uD83D\uDC47"],"\uE22F","\uDBBA\uDF9A",["point_down"]],
		"1f448":[["\uD83D\uDC48"],"\uE230","\uDBBA\uDF9B",["point_left"]],
		"1f449":[["\uD83D\uDC49"],"\uE231","\uDBBA\uDF9C",["point_right"]],
		"1f44a":[["\uD83D\uDC4A"],"\uE00D","\uDBBA\uDF96",["facepunch","punch"]],
		"1f44b":[["\uD83D\uDC4B"],"\uE41E","\uDBBA\uDF9D",["wave"]],
		"1f44c":[["\uD83D\uDC4C"],"\uE420","\uDBBA\uDF9F",["ok_hand"]],
		"1f44d":[["\uD83D\uDC4D"],"\uE00E","\uDBBA\uDF97",["+1","thumbsup"]],
		"1f44e":[["\uD83D\uDC4E"],"\uE421","\uDBBA\uDFA0",["-1","thumbsdown"]],
		"1f44f":[["\uD83D\uDC4F"],"\uE41F","\uDBBA\uDF9E",["clap"]],
		"1f450":[["\uD83D\uDC50"],"\uE422","\uDBBA\uDFA1",["open_hands"]],
		"1f451":[["\uD83D\uDC51"],"\uE10E","\uDBB9\uDCD1",["crown"]],
		"1f452":[["\uD83D\uDC52"],"\uE318","\uDBB9\uDCD4",["womans_hat"]],
		"1f453":[["\uD83D\uDC53"],"","\uDBB9\uDCCE",["eyeglasses"]],
		"1f454":[["\uD83D\uDC54"],"\uE302","\uDBB9\uDCD3",["necktie"]],
		"1f455":[["\uD83D\uDC55"],"\uE006","\uDBB9\uDCCF",["shirt","tshirt"]],
		"1f456":[["\uD83D\uDC56"],"","\uDBB9\uDCD0",["jeans"]],
		"1f457":[["\uD83D\uDC57"],"\uE319","\uDBB9\uDCD5",["dress"]],
		"1f458":[["\uD83D\uDC58"],"\uE321","\uDBB9\uDCD9",["kimono"]],
		"1f459":[["\uD83D\uDC59"],"\uE322","\uDBB9\uDCDA",["bikini"]],
		"1f45a":[["\uD83D\uDC5A"],"\uE006","\uDBB9\uDCDB",["womans_clothes"]],
		"1f45b":[["\uD83D\uDC5B"],"","\uDBB9\uDCDC",["purse"]],
		"1f45c":[["\uD83D\uDC5C"],"\uE323","\uDBB9\uDCF0",["handbag"]],
		"1f45d":[["\uD83D\uDC5D"],"","\uDBB9\uDCF1",["pouch"]],
		"1f45e":[["\uD83D\uDC5E"],"\uE007","\uDBB9\uDCCC",["mans_shoe","shoe"]],
		"1f45f":[["\uD83D\uDC5F"],"\uE007","\uDBB9\uDCCD",["athletic_shoe"]],
		"1f460":[["\uD83D\uDC60"],"\uE13E","\uDBB9\uDCD6",["high_heel"]],
		"1f461":[["\uD83D\uDC61"],"\uE31A","\uDBB9\uDCD7",["sandal"]],
		"1f462":[["\uD83D\uDC62"],"\uE31B","\uDBB9\uDCD8",["boot"]],
		"1f463":[["\uD83D\uDC63"],"\uE536","\uDBB9\uDD53",["footprints"]],
		"1f464":[["\uD83D\uDC64"],"","\uDBB8\uDD9A",["bust_in_silhouette"]],
		"1f465":[["\uD83D\uDC65"],"","",["busts_in_silhouette"]],
		"1f466":[["\uD83D\uDC66"],"\uE001","\uDBB8\uDD9B",["boy"]],
		"1f467":[["\uD83D\uDC67"],"\uE002","\uDBB8\uDD9C",["girl"]],
		"1f468":[["\uD83D\uDC68"],"\uE004","\uDBB8\uDD9D",["man"]],
		"1f469":[["\uD83D\uDC69"],"\uE005","\uDBB8\uDD9E",["woman"]],
		"1f46a":[["\uD83D\uDC6A"],"","\uDBB8\uDD9F",["family"]],
		"1f46b":[["\uD83D\uDC6B"],"\uE428","\uDBB8\uDDA0",["couple"]],
		"1f46c":[["\uD83D\uDC6C"],"","",["two_men_holding_hands"]],
		"1f46d":[["\uD83D\uDC6D"],"","",["two_women_holding_hands"]],
		"1f46e":[["\uD83D\uDC6E"],"\uE152","\uDBB8\uDDA1",["cop"]],
		"1f46f":[["\uD83D\uDC6F"],"\uE429","\uDBB8\uDDA2",["dancers"]],
		"1f470":[["\uD83D\uDC70"],"","\uDBB8\uDDA3",["bride_with_veil"]],
		"1f471":[["\uD83D\uDC71"],"\uE515","\uDBB8\uDDA4",["person_with_blond_hair"]],
		"1f472":[["\uD83D\uDC72"],"\uE516","\uDBB8\uDDA5",["man_with_gua_pi_mao"]],
		"1f473":[["\uD83D\uDC73"],"\uE517","\uDBB8\uDDA6",["man_with_turban"]],
		"1f474":[["\uD83D\uDC74"],"\uE518","\uDBB8\uDDA7",["older_man"]],
		"1f475":[["\uD83D\uDC75"],"\uE519","\uDBB8\uDDA8",["older_woman"]],
		"1f476":[["\uD83D\uDC76"],"\uE51A","\uDBB8\uDDA9",["baby"]],
		"1f477":[["\uD83D\uDC77"],"\uE51B","\uDBB8\uDDAA",["construction_worker"]],
		"1f478":[["\uD83D\uDC78"],"\uE51C","\uDBB8\uDDAB",["princess"]],
		"1f479":[["\uD83D\uDC79"],"","\uDBB8\uDDAC",["japanese_ogre"]],
		"1f47a":[["\uD83D\uDC7A"],"","\uDBB8\uDDAD",["japanese_goblin"]],
		"1f47b":[["\uD83D\uDC7B"],"\uE11B","\uDBB8\uDDAE",["ghost"]],
		"1f47c":[["\uD83D\uDC7C"],"\uE04E","\uDBB8\uDDAF",["angel"]],
		"1f47d":[["\uD83D\uDC7D"],"\uE10C","\uDBB8\uDDB0",["alien"]],
		"1f47e":[["\uD83D\uDC7E"],"\uE12B","\uDBB8\uDDB1",["space_invader"]],
		"1f47f":[["\uD83D\uDC7F"],"\uE11A","\uDBB8\uDDB2",["imp"]],
		"1f480":[["\uD83D\uDC80"],"\uE11C","\uDBB8\uDDB3",["skull"]],
		"1f481":[["\uD83D\uDC81"],"\uE253","\uDBB8\uDDB4",["information_desk_person"]],
		"1f482":[["\uD83D\uDC82"],"\uE51E","\uDBB8\uDDB5",["guardsman"]],
		"1f483":[["\uD83D\uDC83"],"\uE51F","\uDBB8\uDDB6",["dancer"]],
		"1f484":[["\uD83D\uDC84"],"\uE31C","\uDBB8\uDD95",["lipstick"]],
		"1f485":[["\uD83D\uDC85"],"\uE31D","\uDBB8\uDD96",["nail_care"]],
		"1f486":[["\uD83D\uDC86"],"\uE31E","\uDBB8\uDD97",["massage"]],
		"1f487":[["\uD83D\uDC87"],"\uE31F","\uDBB8\uDD98",["haircut"]],
		"1f488":[["\uD83D\uDC88"],"\uE320","\uDBB8\uDD99",["barber"]],
		"1f489":[["\uD83D\uDC89"],"\uE13B","\uDBB9\uDD09",["syringe"]],
		"1f48a":[["\uD83D\uDC8A"],"\uE30F","\uDBB9\uDD0A",["pill"]],
		"1f48b":[["\uD83D\uDC8B"],"\uE003","\uDBBA\uDC23",["kiss"]],
		"1f48c":[["\uD83D\uDC8C"],"\uE103\uE328","\uDBBA\uDC24",["love_letter"]],
		"1f48d":[["\uD83D\uDC8D"],"\uE034","\uDBBA\uDC25",["ring"]],
		"1f48e":[["\uD83D\uDC8E"],"\uE035","\uDBBA\uDC26",["gem"]],
		"1f48f":[["\uD83D\uDC8F"],"\uE111","\uDBBA\uDC27",["couplekiss"]],
		"1f490":[["\uD83D\uDC90"],"\uE306","\uDBBA\uDC28",["bouquet"]],
		"1f491":[["\uD83D\uDC91"],"\uE425","\uDBBA\uDC29",["couple_with_heart"]],
		"1f492":[["\uD83D\uDC92"],"\uE43D","\uDBBA\uDC2A",["wedding"]],
		"1f493":[["\uD83D\uDC93"],"\uE327","\uDBBA\uDF0D",["heartbeat"]],
		"1f494":[["\uD83D\uDC94"],"\uE023","\uDBBA\uDF0E",["broken_heart"],20,3,15,0,"<\/3"],
		"1f495":[["\uD83D\uDC95"],"\uE327","\uDBBA\uDF0F",["two_hearts"]],
		"1f496":[["\uD83D\uDC96"],"\uE327","\uDBBA\uDF10",["sparkling_heart"]],
		"1f497":[["\uD83D\uDC97"],"\uE328","\uDBBA\uDF11",["heartpulse"]],
		"1f498":[["\uD83D\uDC98"],"\uE329","\uDBBA\uDF12",["cupid"]],
		"1f499":[["\uD83D\uDC99"],"\uE32A","\uDBBA\uDF13",["blue_heart"],20,8,15,0,"<3"],
		"1f49a":[["\uD83D\uDC9A"],"\uE32B","\uDBBA\uDF14",["green_heart"],20,9,15,0,"<3"],
		"1f49b":[["\uD83D\uDC9B"],"\uE32C","\uDBBA\uDF15",["yellow_heart"],20,10,15,0,"<3"],
		"1f49c":[["\uD83D\uDC9C"],"\uE32D","\uDBBA\uDF16",["purple_heart"],20,11,15,0,"<3"],
		"1f49d":[["\uD83D\uDC9D"],"\uE437","\uDBBA\uDF17",["gift_heart"]],
		"1f49e":[["\uD83D\uDC9E"],"\uE327","\uDBBA\uDF18",["revolving_hearts"]],
		"1f49f":[["\uD83D\uDC9F"],"\uE204","\uDBBA\uDF19",["heart_decoration"]],
		"1f4a0":[["\uD83D\uDCA0"],"","\uDBBA\uDF55",["diamond_shape_with_a_dot_inside"]],
		"1f4a1":[["\uD83D\uDCA1"],"\uE10F","\uDBBA\uDF56",["bulb"]],
		"1f4a2":[["\uD83D\uDCA2"],"\uE334","\uDBBA\uDF57",["anger"]],
		"1f4a3":[["\uD83D\uDCA3"],"\uE311","\uDBBA\uDF58",["bomb"]],
		"1f4a4":[["\uD83D\uDCA4"],"\uE13C","\uDBBA\uDF59",["zzz"]],
		"1f4a5":[["\uD83D\uDCA5"],"","\uDBBA\uDF5A",["boom","collision"]],
		"1f4a6":[["\uD83D\uDCA6"],"\uE331","\uDBBA\uDF5B",["sweat_drops"]],
		"1f4a7":[["\uD83D\uDCA7"],"\uE331","\uDBBA\uDF5C",["droplet"]],
		"1f4a8":[["\uD83D\uDCA8"],"\uE330","\uDBBA\uDF5D",["dash"]],
		"1f4a9":[["\uD83D\uDCA9"],"\uE05A","\uDBB9\uDCF4",["hankey","poop","shit"]],
		"1f4aa":[["\uD83D\uDCAA"],"\uE14C","\uDBBA\uDF5E",["muscle"]],
		"1f4ab":[["\uD83D\uDCAB"],"\uE407","\uDBBA\uDF5F",["dizzy"]],
		"1f4ac":[["\uD83D\uDCAC"],"","\uDBB9\uDD32",["speech_balloon"]],
		"1f4ad":[["\uD83D\uDCAD"],"","",["thought_balloon"]],
		"1f4ae":[["\uD83D\uDCAE"],"","\uDBBA\uDF7A",["white_flower"]],
		"1f4af":[["\uD83D\uDCAF"],"","\uDBBA\uDF7B",["100"]],
		"1f4b0":[["\uD83D\uDCB0"],"\uE12F","\uDBB9\uDCDD",["moneybag"]],
		"1f4b1":[["\uD83D\uDCB1"],"\uE149","\uDBB9\uDCDE",["currency_exchange"]],
		"1f4b2":[["\uD83D\uDCB2"],"\uE12F","\uDBB9\uDCE0",["heavy_dollar_sign"]],
		"1f4b3":[["\uD83D\uDCB3"],"","\uDBB9\uDCE1",["credit_card"]],
		"1f4b4":[["\uD83D\uDCB4"],"","\uDBB9\uDCE2",["yen"]],
		"1f4b5":[["\uD83D\uDCB5"],"\uE12F","\uDBB9\uDCE3",["dollar"]],
		"1f4b6":[["\uD83D\uDCB6"],"","",["euro"]],
		"1f4b7":[["\uD83D\uDCB7"],"","",["pound"]],
		"1f4b8":[["\uD83D\uDCB8"],"","\uDBB9\uDCE4",["money_with_wings"]],
		"1f4b9":[["\uD83D\uDCB9"],"\uE14A","\uDBB9\uDCDF",["chart"]],
		"1f4ba":[["\uD83D\uDCBA"],"\uE11F","\uDBB9\uDD37",["seat"]],
		"1f4bb":[["\uD83D\uDCBB"],"\uE00C","\uDBB9\uDD38",["computer"]],
		"1f4bc":[["\uD83D\uDCBC"],"\uE11E","\uDBB9\uDD3B",["briefcase"]],
		"1f4bd":[["\uD83D\uDCBD"],"\uE316","\uDBB9\uDD3C",["minidisc"]],
		"1f4be":[["\uD83D\uDCBE"],"\uE316","\uDBB9\uDD3D",["floppy_disk"]],
		"1f4bf":[["\uD83D\uDCBF"],"\uE126","\uDBBA\uDC1D",["cd"]],
		"1f4c0":[["\uD83D\uDCC0"],"\uE127","\uDBBA\uDC1E",["dvd"]],
		"1f4c1":[["\uD83D\uDCC1"],"","\uDBB9\uDD43",["file_folder"]],
		"1f4c2":[["\uD83D\uDCC2"],"","\uDBB9\uDD44",["open_file_folder"]],
		"1f4c3":[["\uD83D\uDCC3"],"\uE301","\uDBB9\uDD40",["page_with_curl"]],
		"1f4c4":[["\uD83D\uDCC4"],"\uE301","\uDBB9\uDD41",["page_facing_up"]],
		"1f4c5":[["\uD83D\uDCC5"],"","\uDBB9\uDD42",["date"]],
		"1f4c6":[["\uD83D\uDCC6"],"","\uDBB9\uDD49",["calendar"]],
		"1f4c7":[["\uD83D\uDCC7"],"\uE148","\uDBB9\uDD4D",["card_index"]],
		"1f4c8":[["\uD83D\uDCC8"],"\uE14A","\uDBB9\uDD4B",["chart_with_upwards_trend"]],
		"1f4c9":[["\uD83D\uDCC9"],"","\uDBB9\uDD4C",["chart_with_downwards_trend"]],
		"1f4ca":[["\uD83D\uDCCA"],"\uE14A","\uDBB9\uDD4A",["bar_chart"]],
		"1f4cb":[["\uD83D\uDCCB"],"\uE301","\uDBB9\uDD48",["clipboard"]],
		"1f4cc":[["\uD83D\uDCCC"],"","\uDBB9\uDD4E",["pushpin"]],
		"1f4cd":[["\uD83D\uDCCD"],"","\uDBB9\uDD3F",["round_pushpin"]],
		"1f4ce":[["\uD83D\uDCCE"],"","\uDBB9\uDD3A",["paperclip"]],
		"1f4cf":[["\uD83D\uDCCF"],"","\uDBB9\uDD50",["straight_ruler"]],
		"1f4d0":[["\uD83D\uDCD0"],"","\uDBB9\uDD51",["triangular_ruler"]],
		"1f4d1":[["\uD83D\uDCD1"],"\uE301","\uDBB9\uDD52",["bookmark_tabs"]],
		"1f4d2":[["\uD83D\uDCD2"],"\uE148","\uDBB9\uDD4F",["ledger"]],
		"1f4d3":[["\uD83D\uDCD3"],"\uE148","\uDBB9\uDD45",["notebook"]],
		"1f4d4":[["\uD83D\uDCD4"],"\uE148","\uDBB9\uDD47",["notebook_with_decorative_cover"]],
		"1f4d5":[["\uD83D\uDCD5"],"\uE148","\uDBB9\uDD02",["closed_book"]],
		"1f4d6":[["\uD83D\uDCD6"],"\uE148","\uDBB9\uDD46",["book","open_book"]],
		"1f4d7":[["\uD83D\uDCD7"],"\uE148","\uDBB9\uDCFF",["green_book"]],
		"1f4d8":[["\uD83D\uDCD8"],"\uE148","\uDBB9\uDD00",["blue_book"]],
		"1f4d9":[["\uD83D\uDCD9"],"\uE148","\uDBB9\uDD01",["orange_book"]],
		"1f4da":[["\uD83D\uDCDA"],"\uE148","\uDBB9\uDD03",["books"]],
		"1f4db":[["\uD83D\uDCDB"],"","\uDBB9\uDD04",["name_badge"]],
		"1f4dc":[["\uD83D\uDCDC"],"","\uDBB9\uDCFD",["scroll"]],
		"1f4dd":[["\uD83D\uDCDD"],"\uE301","\uDBB9\uDD27",["memo","pencil"]],
		"1f4de":[["\uD83D\uDCDE"],"\uE009","\uDBB9\uDD24",["telephone_receiver"]],
		"1f4df":[["\uD83D\uDCDF"],"","\uDBB9\uDD22",["pager"]],
		"1f4e0":[["\uD83D\uDCE0"],"\uE00B","\uDBB9\uDD28",["fax"]],
		"1f4e1":[["\uD83D\uDCE1"],"\uE14B","\uDBB9\uDD31",["satellite"]],
		"1f4e2":[["\uD83D\uDCE2"],"\uE142","\uDBB9\uDD2F",["loudspeaker"]],
		"1f4e3":[["\uD83D\uDCE3"],"\uE317","\uDBB9\uDD30",["mega"]],
		"1f4e4":[["\uD83D\uDCE4"],"","\uDBB9\uDD33",["outbox_tray"]],
		"1f4e5":[["\uD83D\uDCE5"],"","\uDBB9\uDD34",["inbox_tray"]],
		"1f4e6":[["\uD83D\uDCE6"],"\uE112","\uDBB9\uDD35",["package"]],
		"1f4e7":[["\uD83D\uDCE7"],"\uE103","\uDBBA\uDF92",["e-mail"]],
		"1f4e8":[["\uD83D\uDCE8"],"\uE103","\uDBB9\uDD2A",["incoming_envelope"]],
		"1f4e9":[["\uD83D\uDCE9"],"\uE103","\uDBB9\uDD2B",["envelope_with_arrow"]],
		"1f4ea":[["\uD83D\uDCEA"],"\uE101","\uDBB9\uDD2C",["mailbox_closed"]],
		"1f4eb":[["\uD83D\uDCEB"],"\uE101","\uDBB9\uDD2D",["mailbox"]],
		"1f4ec":[["\uD83D\uDCEC"],"","",["mailbox_with_mail"]],
		"1f4ed":[["\uD83D\uDCED"],"","",["mailbox_with_no_mail"]],
		"1f4ee":[["\uD83D\uDCEE"],"\uE102","\uDBB9\uDD2E",["postbox"]],
		"1f4ef":[["\uD83D\uDCEF"],"","",["postal_horn"]],
		"1f4f0":[["\uD83D\uDCF0"],"","\uDBBA\uDC22",["newspaper"]],
		"1f4f1":[["\uD83D\uDCF1"],"\uE00A","\uDBB9\uDD25",["iphone"]],
		"1f4f2":[["\uD83D\uDCF2"],"\uE104","\uDBB9\uDD26",["calling"]],
		"1f4f3":[["\uD83D\uDCF3"],"\uE250","\uDBBA\uDC39",["vibration_mode"]],
		"1f4f4":[["\uD83D\uDCF4"],"\uE251","\uDBBA\uDC3A",["mobile_phone_off"]],
		"1f4f5":[["\uD83D\uDCF5"],"","",["no_mobile_phones"]],
		"1f4f6":[["\uD83D\uDCF6"],"\uE20B","\uDBBA\uDC38",["signal_strength"]],
		"1f4f7":[["\uD83D\uDCF7"],"\uE008","\uDBB9\uDCEF",["camera"]],
		"1f4f9":[["\uD83D\uDCF9"],"\uE03D","\uDBB9\uDCF9",["video_camera"]],
		"1f4fa":[["\uD83D\uDCFA"],"\uE12A","\uDBBA\uDC1C",["tv"]],
		"1f4fb":[["\uD83D\uDCFB"],"\uE128","\uDBBA\uDC1F",["radio"]],
		"1f4fc":[["\uD83D\uDCFC"],"\uE129","\uDBBA\uDC20",["vhs"]],
		"1f500":[["\uD83D\uDD00"],"","",["twisted_rightwards_arrows"]],
		"1f501":[["\uD83D\uDD01"],"","",["repeat"]],
		"1f502":[["\uD83D\uDD02"],"","",["repeat_one"]],
		"1f503":[["\uD83D\uDD03"],"","\uDBBA\uDF91",["arrows_clockwise"]],
		"1f504":[["\uD83D\uDD04"],"","",["arrows_counterclockwise"]],
		"1f505":[["\uD83D\uDD05"],"","",["low_brightness"]],
		"1f506":[["\uD83D\uDD06"],"","",["high_brightness"]],
		"1f507":[["\uD83D\uDD07"],"","",["mute"]],
		"1f508":[["\uD83D\uDD08"],"","",["speaker"]],
		"1f509":[["\uD83D\uDD09"],"","",["sound"]],
		"1f50a":[["\uD83D\uDD0A"],"\uE141","\uDBBA\uDC21",["loud_sound"]],
		"1f50b":[["\uD83D\uDD0B"],"","\uDBB9\uDCFC",["battery"]],
		"1f50c":[["\uD83D\uDD0C"],"","\uDBB9\uDCFE",["electric_plug"]],
		"1f50d":[["\uD83D\uDD0D"],"\uE114","\uDBBA\uDF85",["mag"]],
		"1f50e":[["\uD83D\uDD0E"],"\uE114","\uDBBA\uDF8D",["mag_right"]],
		"1f50f":[["\uD83D\uDD0F"],"\uE144","\uDBBA\uDF90",["lock_with_ink_pen"]],
		"1f510":[["\uD83D\uDD10"],"\uE144","\uDBBA\uDF8A",["closed_lock_with_key"]],
		"1f511":[["\uD83D\uDD11"],"\uE03F","\uDBBA\uDF82",["key"]],
		"1f512":[["\uD83D\uDD12"],"\uE144","\uDBBA\uDF86",["lock"]],
		"1f513":[["\uD83D\uDD13"],"\uE145","\uDBBA\uDF87",["unlock"]],
		"1f514":[["\uD83D\uDD14"],"\uE325","\uDBB9\uDCF2",["bell"]],
		"1f515":[["\uD83D\uDD15"],"","",["no_bell"]],
		"1f516":[["\uD83D\uDD16"],"","\uDBBA\uDF8F",["bookmark"]],
		"1f517":[["\uD83D\uDD17"],"","\uDBBA\uDF4B",["link"]],
		"1f518":[["\uD83D\uDD18"],"","\uDBBA\uDF8C",["radio_button"]],
		"1f519":[["\uD83D\uDD19"],"\uE235","\uDBBA\uDF8E",["back"]],
		"1f51a":[["\uD83D\uDD1A"],"","\uDBB8\uDC1A",["end"]],
		"1f51b":[["\uD83D\uDD1B"],"","\uDBB8\uDC19",["on"]],
		"1f51c":[["\uD83D\uDD1C"],"","\uDBB8\uDC18",["soon"]],
		"1f51d":[["\uD83D\uDD1D"],"\uE24C","\uDBBA\uDF42",["top"]],
		"1f51e":[["\uD83D\uDD1E"],"\uE207","\uDBBA\uDF25",["underage"]],
		"1f51f":[["\uD83D\uDD1F"],"","\uDBBA\uDC3B",["keycap_ten"]],
		"1f520":[["\uD83D\uDD20"],"","\uDBBA\uDF7C",["capital_abcd"]],
		"1f521":[["\uD83D\uDD21"],"","\uDBBA\uDF7D",["abcd"]],
		"1f522":[["\uD83D\uDD22"],"","\uDBBA\uDF7E",["1234"]],
		"1f523":[["\uD83D\uDD23"],"","\uDBBA\uDF7F",["symbols"]],
		"1f524":[["\uD83D\uDD24"],"","\uDBBA\uDF80",["abc"]],
		"1f525":[["\uD83D\uDD25"],"\uE11D","\uDBB9\uDCF6",["fire"]],
		"1f526":[["\uD83D\uDD26"],"","\uDBB9\uDCFB",["flashlight"]],
		"1f527":[["\uD83D\uDD27"],"","\uDBB9\uDCC9",["wrench"]],
		"1f528":[["\uD83D\uDD28"],"\uE116","\uDBB9\uDCCA",["hammer"]],
		"1f529":[["\uD83D\uDD29"],"","\uDBB9\uDCCB",["nut_and_bolt"]],
		"1f52a":[["\uD83D\uDD2A"],"","\uDBB9\uDCFA",["hocho","knife"]],
		"1f52b":[["\uD83D\uDD2B"],"\uE113","\uDBB9\uDCF5",["gun"]],
		"1f52c":[["\uD83D\uDD2C"],"","",["microscope"]],
		"1f52d":[["\uD83D\uDD2D"],"","",["telescope"]],
		"1f52e":[["\uD83D\uDD2E"],"\uE23E","\uDBB9\uDCF7",["crystal_ball"]],
		"1f52f":[["\uD83D\uDD2F"],"\uE23E","\uDBB9\uDCF8",["six_pointed_star"]],
		"1f530":[["\uD83D\uDD30"],"\uE209","\uDBB8\uDC44",["beginner"]],
		"1f531":[["\uD83D\uDD31"],"\uE031","\uDBB9\uDCD2",["trident"]],
		"1f532":[["\uD83D\uDD32"],"\uE21A","\uDBBA\uDF64",["black_square_button"]],
		"1f533":[["\uD83D\uDD33"],"\uE21B","\uDBBA\uDF67",["white_square_button"]],
		"1f534":[["\uD83D\uDD34"],"\uE219","\uDBBA\uDF63",["red_circle"]],
		"1f535":[["\uD83D\uDD35"],"\uE21A","\uDBBA\uDF64",["large_blue_circle"]],
		"1f536":[["\uD83D\uDD36"],"\uE21B","\uDBBA\uDF73",["large_orange_diamond"]],
		"1f537":[["\uD83D\uDD37"],"\uE21B","\uDBBA\uDF74",["large_blue_diamond"]],
		"1f538":[["\uD83D\uDD38"],"\uE21B","\uDBBA\uDF75",["small_orange_diamond"]],
		"1f539":[["\uD83D\uDD39"],"\uE21B","\uDBBA\uDF76",["small_blue_diamond"]],
		"1f53a":[["\uD83D\uDD3A"],"","\uDBBA\uDF78",["small_red_triangle"]],
		"1f53b":[["\uD83D\uDD3B"],"","\uDBBA\uDF79",["small_red_triangle_down"]],
		"1f53c":[["\uD83D\uDD3C"],"","\uDBBA\uDF01",["arrow_up_small"]],
		"1f53d":[["\uD83D\uDD3D"],"","\uDBBA\uDF00",["arrow_down_small"]],
		"1f550":[["\uD83D\uDD50"],"\uE024","\uDBB8\uDC1E",["clock1"]],
		"1f551":[["\uD83D\uDD51"],"\uE025","\uDBB8\uDC1F",["clock2"]],
		"1f552":[["\uD83D\uDD52"],"\uE026","\uDBB8\uDC20",["clock3"]],
		"1f553":[["\uD83D\uDD53"],"\uE027","\uDBB8\uDC21",["clock4"]],
		"1f554":[["\uD83D\uDD54"],"\uE028","\uDBB8\uDC22",["clock5"]],
		"1f555":[["\uD83D\uDD55"],"\uE029","\uDBB8\uDC23",["clock6"]],
		"1f556":[["\uD83D\uDD56"],"\uE02A","\uDBB8\uDC24",["clock7"]],
		"1f557":[["\uD83D\uDD57"],"\uE02B","\uDBB8\uDC25",["clock8"]],
		"1f558":[["\uD83D\uDD58"],"\uE02C","\uDBB8\uDC26",["clock9"]],
		"1f559":[["\uD83D\uDD59"],"\uE02D","\uDBB8\uDC27",["clock10"]],
		"1f55a":[["\uD83D\uDD5A"],"\uE02E","\uDBB8\uDC28",["clock11"]],
		"1f55b":[["\uD83D\uDD5B"],"\uE02F","\uDBB8\uDC29",["clock12"]],
		"1f55c":[["\uD83D\uDD5C"],"","",["clock130"]],
		"1f55d":[["\uD83D\uDD5D"],"","",["clock230"]],
		"1f55e":[["\uD83D\uDD5E"],"","",["clock330"]],
		"1f55f":[["\uD83D\uDD5F"],"","",["clock430"]],
		"1f560":[["\uD83D\uDD60"],"","",["clock530"]],
		"1f561":[["\uD83D\uDD61"],"","",["clock630"]],
		"1f562":[["\uD83D\uDD62"],"","",["clock730"]],
		"1f563":[["\uD83D\uDD63"],"","",["clock830"]],
		"1f564":[["\uD83D\uDD64"],"","",["clock930"]],
		"1f565":[["\uD83D\uDD65"],"","",["clock1030"]],
		"1f566":[["\uD83D\uDD66"],"","",["clock1130"]],
		"1f567":[["\uD83D\uDD67"],"","",["clock1230"]],
		"1f5fb":[["\uD83D\uDDFB"],"\uE03B","\uDBB9\uDCC3",["mount_fuji"]],
		"1f5fc":[["\uD83D\uDDFC"],"\uE509","\uDBB9\uDCC4",["tokyo_tower"]],
		"1f5fd":[["\uD83D\uDDFD"],"\uE51D","\uDBB9\uDCC6",["statue_of_liberty"]],
		"1f5fe":[["\uD83D\uDDFE"],"","\uDBB9\uDCC7",["japan"]],
		"1f5ff":[["\uD83D\uDDFF"],"","\uDBB9\uDCC8",["moyai"]],
		"1f600":[["\uD83D\uDE00"],"","",["grinning"],25,28,15,0,":D"],
		"1f601":[["\uD83D\uDE01"],"\uE404","\uDBB8\uDF33",["grin"]],
		"1f602":[["\uD83D\uDE02"],"\uE412","\uDBB8\uDF34",["joy"]],
		"1f603":[["\uD83D\uDE03"],"\uE057","\uDBB8\uDF30",["smiley"],25,31,15,0,":)"],
		"1f604":[["\uD83D\uDE04"],"\uE415","\uDBB8\uDF38",["smile"],25,32,15,0,":)"],
		"1f605":[["\uD83D\uDE05"],"\uE415\uE331","\uDBB8\uDF31",["sweat_smile"]],
		"1f606":[["\uD83D\uDE06"],"\uE40A","\uDBB8\uDF32",["laughing","satisfied"]],
		"1f607":[["\uD83D\uDE07"],"","",["innocent"]],
		"1f608":[["\uD83D\uDE08"],"","",["smiling_imp"]],
		"1f609":[["\uD83D\uDE09"],"\uE405","\uDBB8\uDF47",["wink"],26,2,15,0,";)"],
		"1f60a":[["\uD83D\uDE0A"],"\uE056","\uDBB8\uDF35",["blush"],26,3,15,0,":)"],
		"1f60b":[["\uD83D\uDE0B"],"\uE056","\uDBB8\uDF2B",["yum"]],
		"1f60c":[["\uD83D\uDE0C"],"\uE40A","\uDBB8\uDF3E",["relieved"]],
		"1f60d":[["\uD83D\uDE0D"],"\uE106","\uDBB8\uDF27",["heart_eyes"]],
		"1f60e":[["\uD83D\uDE0E"],"","",["sunglasses"]],
		"1f60f":[["\uD83D\uDE0F"],"\uE402","\uDBB8\uDF43",["smirk"]],
		"1f610":[["\uD83D\uDE10"],"","",["neutral_face"]],
		"1f611":[["\uD83D\uDE11"],"","",["expressionless"]],
		"1f612":[["\uD83D\uDE12"],"\uE40E","\uDBB8\uDF26",["unamused"],26,11,15,0,":("],
		"1f613":[["\uD83D\uDE13"],"\uE108","\uDBB8\uDF44",["sweat"]],
		"1f614":[["\uD83D\uDE14"],"\uE403","\uDBB8\uDF40",["pensive"]],
		"1f615":[["\uD83D\uDE15"],"","",["confused"]],
		"1f616":[["\uD83D\uDE16"],"\uE407","\uDBB8\uDF3F",["confounded"]],
		"1f617":[["\uD83D\uDE17"],"","",["kissing"]],
		"1f618":[["\uD83D\uDE18"],"\uE418","\uDBB8\uDF2C",["kissing_heart"]],
		"1f619":[["\uD83D\uDE19"],"","",["kissing_smiling_eyes"]],
		"1f61a":[["\uD83D\uDE1A"],"\uE417","\uDBB8\uDF2D",["kissing_closed_eyes"]],
		"1f61b":[["\uD83D\uDE1B"],"","",["stuck_out_tongue"],26,20,15,0,":p"],
		"1f61c":[["\uD83D\uDE1C"],"\uE105","\uDBB8\uDF29",["stuck_out_tongue_winking_eye"],26,21,15,0,";p"],
		"1f61d":[["\uD83D\uDE1D"],"\uE409","\uDBB8\uDF2A",["stuck_out_tongue_closed_eyes"]],
		"1f61e":[["\uD83D\uDE1E"],"\uE058","\uDBB8\uDF23",["disappointed"],26,23,15,0,":("],
		"1f61f":[["\uD83D\uDE1F"],"","",["worried"]],
		"1f620":[["\uD83D\uDE20"],"\uE059","\uDBB8\uDF20",["angry"]],
		"1f621":[["\uD83D\uDE21"],"\uE416","\uDBB8\uDF3D",["rage"]],
		"1f622":[["\uD83D\uDE22"],"\uE413","\uDBB8\uDF39",["cry"],26,27,15,0,":'("],
		"1f623":[["\uD83D\uDE23"],"\uE406","\uDBB8\uDF3C",["persevere"]],
		"1f624":[["\uD83D\uDE24"],"\uE404","\uDBB8\uDF28",["triumph"]],
		"1f625":[["\uD83D\uDE25"],"\uE401","\uDBB8\uDF45",["disappointed_relieved"]],
		"1f626":[["\uD83D\uDE26"],"","",["frowning"]],
		"1f627":[["\uD83D\uDE27"],"","",["anguished"]],
		"1f628":[["\uD83D\uDE28"],"\uE40B","\uDBB8\uDF3B",["fearful"]],
		"1f629":[["\uD83D\uDE29"],"\uE403","\uDBB8\uDF21",["weary"]],
		"1f62a":[["\uD83D\uDE2A"],"\uE408","\uDBB8\uDF42",["sleepy"]],
		"1f62b":[["\uD83D\uDE2B"],"\uE406","\uDBB8\uDF46",["tired_face"]],
		"1f62c":[["\uD83D\uDE2C"],"","",["grimacing"]],
		"1f62d":[["\uD83D\uDE2D"],"\uE411","\uDBB8\uDF3A",["sob"],27,3,15,0,":'("],
		"1f62e":[["\uD83D\uDE2E"],"","",["open_mouth"]],
		"1f62f":[["\uD83D\uDE2F"],"","",["hushed"]],
		"1f630":[["\uD83D\uDE30"],"\uE40F","\uDBB8\uDF25",["cold_sweat"]],
		"1f631":[["\uD83D\uDE31"],"\uE107","\uDBB8\uDF41",["scream"]],
		"1f632":[["\uD83D\uDE32"],"\uE410","\uDBB8\uDF22",["astonished"]],
		"1f633":[["\uD83D\uDE33"],"\uE40D","\uDBB8\uDF2F",["flushed"]],
		"1f634":[["\uD83D\uDE34"],"","",["sleeping"]],
		"1f635":[["\uD83D\uDE35"],"\uE406","\uDBB8\uDF24",["dizzy_face"]],
		"1f636":[["\uD83D\uDE36"],"","",["no_mouth"]],
		"1f637":[["\uD83D\uDE37"],"\uE40C","\uDBB8\uDF2E",["mask"]],
		"1f638":[["\uD83D\uDE38"],"\uE404","\uDBB8\uDF49",["smile_cat"]],
		"1f639":[["\uD83D\uDE39"],"\uE412","\uDBB8\uDF4A",["joy_cat"]],
		"1f63a":[["\uD83D\uDE3A"],"\uE057","\uDBB8\uDF48",["smiley_cat"]],
		"1f63b":[["\uD83D\uDE3B"],"\uE106","\uDBB8\uDF4C",["heart_eyes_cat"]],
		"1f63c":[["\uD83D\uDE3C"],"\uE404","\uDBB8\uDF4F",["smirk_cat"]],
		"1f63d":[["\uD83D\uDE3D"],"\uE418","\uDBB8\uDF4B",["kissing_cat"]],
		"1f63e":[["\uD83D\uDE3E"],"\uE416","\uDBB8\uDF4E",["pouting_cat"]],
		"1f63f":[["\uD83D\uDE3F"],"\uE413","\uDBB8\uDF4D",["crying_cat_face"]],
		"1f640":[["\uD83D\uDE40"],"\uE403","\uDBB8\uDF50",["scream_cat"]],
		"1f645":[["\uD83D\uDE45"],"\uE423","\uDBB8\uDF51",["no_good"]],
		"1f646":[["\uD83D\uDE46"],"\uE424","\uDBB8\uDF52",["ok_woman"]],
		"1f647":[["\uD83D\uDE47"],"\uE426","\uDBB8\uDF53",["bow"]],
		"1f648":[["\uD83D\uDE48"],"","\uDBB8\uDF54",["see_no_evil"]],
		"1f649":[["\uD83D\uDE49"],"","\uDBB8\uDF56",["hear_no_evil"]],
		"1f64a":[["\uD83D\uDE4A"],"","\uDBB8\uDF55",["speak_no_evil"]],
		"1f64b":[["\uD83D\uDE4B"],"\uE012","\uDBB8\uDF57",["raising_hand"]],
		"1f64c":[["\uD83D\uDE4C"],"\uE427","\uDBB8\uDF58",["raised_hands"]],
		"1f64d":[["\uD83D\uDE4D"],"\uE403","\uDBB8\uDF59",["person_frowning"]],
		"1f64e":[["\uD83D\uDE4E"],"\uE416","\uDBB8\uDF5A",["person_with_pouting_face"]],
		"1f64f":[["\uD83D\uDE4F"],"\uE41D","\uDBB8\uDF5B",["pray"]],
		"1f680":[["\uD83D\uDE80"],"\uE10D","\uDBB9\uDFED",["rocket"]],
		"1f681":[["\uD83D\uDE81"],"","",["helicopter"]],
		"1f682":[["\uD83D\uDE82"],"","",["steam_locomotive"]],
		"1f683":[["\uD83D\uDE83"],"\uE01E","\uDBB9\uDFDF",["railway_car"]],
		"1f684":[["\uD83D\uDE84"],"\uE435","\uDBB9\uDFE2",["bullettrain_side"]],
		"1f685":[["\uD83D\uDE85"],"\uE01F","\uDBB9\uDFE3",["bullettrain_front"]],
		"1f686":[["\uD83D\uDE86"],"","",["train2"]],
		"1f687":[["\uD83D\uDE87"],"\uE434","\uDBB9\uDFE0",["metro"]],
		"1f688":[["\uD83D\uDE88"],"","",["light_rail"]],
		"1f689":[["\uD83D\uDE89"],"\uE039","\uDBB9\uDFEC",["station"]],
		"1f68a":[["\uD83D\uDE8A"],"","",["tram"]],
		"1f68b":[["\uD83D\uDE8B"],"","",["train"]],
		"1f68c":[["\uD83D\uDE8C"],"\uE159","\uDBB9\uDFE6",["bus"]],
		"1f68d":[["\uD83D\uDE8D"],"","",["oncoming_bus"]],
		"1f68e":[["\uD83D\uDE8E"],"","",["trolleybus"]],
		"1f68f":[["\uD83D\uDE8F"],"\uE150","\uDBB9\uDFE7",["busstop"]],
		"1f690":[["\uD83D\uDE90"],"","",["minibus"]],
		"1f691":[["\uD83D\uDE91"],"\uE431","\uDBB9\uDFF3",["ambulance"]],
		"1f692":[["\uD83D\uDE92"],"\uE430","\uDBB9\uDFF2",["fire_engine"]],
		"1f693":[["\uD83D\uDE93"],"\uE432","\uDBB9\uDFF4",["police_car"]],
		"1f694":[["\uD83D\uDE94"],"","",["oncoming_police_car"]],
		"1f695":[["\uD83D\uDE95"],"\uE15A","\uDBB9\uDFEF",["taxi"]],
		"1f696":[["\uD83D\uDE96"],"","",["oncoming_taxi"]],
		"1f697":[["\uD83D\uDE97"],"\uE01B","\uDBB9\uDFE4",["car","red_car"]],
		"1f698":[["\uD83D\uDE98"],"","",["oncoming_automobile"]],
		"1f699":[["\uD83D\uDE99"],"\uE42E","\uDBB9\uDFE5",["blue_car"]],
		"1f69a":[["\uD83D\uDE9A"],"\uE42F","\uDBB9\uDFF1",["truck"]],
		"1f69b":[["\uD83D\uDE9B"],"","",["articulated_lorry"]],
		"1f69c":[["\uD83D\uDE9C"],"","",["tractor"]],
		"1f69d":[["\uD83D\uDE9D"],"","",["monorail"]],
		"1f69e":[["\uD83D\uDE9E"],"","",["mountain_railway"]],
		"1f69f":[["\uD83D\uDE9F"],"","",["suspension_railway"]],
		"1f6a0":[["\uD83D\uDEA0"],"","",["mountain_cableway"]],
		"1f6a1":[["\uD83D\uDEA1"],"","",["aerial_tramway"]],
		"1f6a2":[["\uD83D\uDEA2"],"\uE202","\uDBB9\uDFE8",["ship"]],
		"1f6a3":[["\uD83D\uDEA3"],"","",["rowboat"]],
		"1f6a4":[["\uD83D\uDEA4"],"\uE135","\uDBB9\uDFEE",["speedboat"]],
		"1f6a5":[["\uD83D\uDEA5"],"\uE14E","\uDBB9\uDFF7",["traffic_light"]],
		"1f6a6":[["\uD83D\uDEA6"],"","",["vertical_traffic_light"]],
		"1f6a7":[["\uD83D\uDEA7"],"\uE137","\uDBB9\uDFF8",["construction"]],
		"1f6a8":[["\uD83D\uDEA8"],"\uE432","\uDBB9\uDFF9",["rotating_light"]],
		"1f6a9":[["\uD83D\uDEA9"],"","\uDBBA\uDF22",["triangular_flag_on_post"]],
		"1f6aa":[["\uD83D\uDEAA"],"","\uDBB9\uDCF3",["door"]],
		"1f6ab":[["\uD83D\uDEAB"],"","\uDBBA\uDF48",["no_entry_sign"]],
		"1f6ac":[["\uD83D\uDEAC"],"\uE30E","\uDBBA\uDF1E",["smoking"]],
		"1f6ad":[["\uD83D\uDEAD"],"\uE208","\uDBBA\uDF1F",["no_smoking"]],
		"1f6ae":[["\uD83D\uDEAE"],"","",["put_litter_in_its_place"]],
		"1f6af":[["\uD83D\uDEAF"],"","",["do_not_litter"]],
		"1f6b0":[["\uD83D\uDEB0"],"","",["potable_water"]],
		"1f6b1":[["\uD83D\uDEB1"],"","",["non-potable_water"]],
		"1f6b2":[["\uD83D\uDEB2"],"\uE136","\uDBB9\uDFEB",["bike"]],
		"1f6b3":[["\uD83D\uDEB3"],"","",["no_bicycles"]],
		"1f6b4":[["\uD83D\uDEB4"],"","",["bicyclist"]],
		"1f6b5":[["\uD83D\uDEB5"],"","",["mountain_bicyclist"]],
		"1f6b6":[["\uD83D\uDEB6"],"\uE201","\uDBB9\uDFF0",["walking"]],
		"1f6b7":[["\uD83D\uDEB7"],"","",["no_pedestrians"]],
		"1f6b8":[["\uD83D\uDEB8"],"","",["children_crossing"]],
		"1f6b9":[["\uD83D\uDEB9"],"\uE138","\uDBBA\uDF33",["mens"]],
		"1f6ba":[["\uD83D\uDEBA"],"\uE139","\uDBBA\uDF34",["womens"]],
		"1f6bb":[["\uD83D\uDEBB"],"\uE151","\uDBB9\uDD06",["restroom"]],
		"1f6bc":[["\uD83D\uDEBC"],"\uE13A","\uDBBA\uDF35",["baby_symbol"]],
		"1f6bd":[["\uD83D\uDEBD"],"\uE140","\uDBB9\uDD07",["toilet"]],
		"1f6be":[["\uD83D\uDEBE"],"\uE309","\uDBB9\uDD08",["wc"]],
		"1f6bf":[["\uD83D\uDEBF"],"","",["shower"]],
		"1f6c0":[["\uD83D\uDEC0"],"\uE13F","\uDBB9\uDD05",["bath"]],
		"1f6c1":[["\uD83D\uDEC1"],"","",["bathtub"]],
		"1f6c2":[["\uD83D\uDEC2"],"","",["passport_control"]],
		"1f6c3":[["\uD83D\uDEC3"],"","",["customs"]],
		"1f6c4":[["\uD83D\uDEC4"],"","",["baggage_claim"]],
		"1f6c5":[["\uD83D\uDEC5"],"","",["left_luggage"]],
		"0023-20e3":[["\u0023\uFE0F\u20E3","\u0023\u20E3"],"\uE210","\uDBBA\uDC2C",["hash"]],
		"0030-20e3":[["\u0030\uFE0F\u20E3","\u0030\u20E3"],"\uE225","\uDBBA\uDC37",["zero"]],
		"0031-20e3":[["\u0031\uFE0F\u20E3","\u0031\u20E3"],"\uE21C","\uDBBA\uDC2E",["one"]],
		"0032-20e3":[["\u0032\uFE0F\u20E3","\u0032\u20E3"],"\uE21D","\uDBBA\uDC2F",["two"]],
		"0033-20e3":[["\u0033\uFE0F\u20E3","\u0033\u20E3"],"\uE21E","\uDBBA\uDC30",["three"]],
		"0034-20e3":[["\u0034\uFE0F\u20E3","\u0034\u20E3"],"\uE21F","\uDBBA\uDC31",["four"]],
		"0035-20e3":[["\u0035\uFE0F\u20E3","\u0035\u20E3"],"\uE220","\uDBBA\uDC32",["five"]],
		"0036-20e3":[["\u0036\uFE0F\u20E3","\u0036\u20E3"],"\uE221","\uDBBA\uDC33",["six"]],
		"0037-20e3":[["\u0037\uFE0F\u20E3","\u0037\u20E3"],"\uE222","\uDBBA\uDC34",["seven"]],
		"0038-20e3":[["\u0038\uFE0F\u20E3","\u0038\u20E3"],"\uE223","\uDBBA\uDC35",["eight"]],
		"0039-20e3":[["\u0039\uFE0F\u20E3","\u0039\u20E3"],"\uE224","\uDBBA\uDC36",["nine"]],
		"1f1e6-1f1ea":[["\uD83C\uDDE6\uD83C\uDDEA"],"","",["flag-ae","ae"]],
		"1f1e6-1f1f9":[["\uD83C\uDDE6\uD83C\uDDF9"],"","",["flag-at","at"]],
		"1f1e6-1f1fa":[["\uD83C\uDDE6\uD83C\uDDFA"],"","",["flag-au","au"]],
		"1f1e7-1f1ea":[["\uD83C\uDDE7\uD83C\uDDEA"],"","",["flag-be","be"]],
		"1f1e7-1f1f7":[["\uD83C\uDDE7\uD83C\uDDF7"],"","",["flag-br","br"]],
		"1f1e8-1f1e6":[["\uD83C\uDDE8\uD83C\uDDE6"],"","",["flag-ca","ca"]],
		"1f1e8-1f1ed":[["\uD83C\uDDE8\uD83C\uDDED"],"","",["flag-ch","ch"]],
		"1f1e8-1f1f1":[["\uD83C\uDDE8\uD83C\uDDF1"],"","",["flag-cl","cl"]],
		"1f1e8-1f1f3":[["\uD83C\uDDE8\uD83C\uDDF3"],"\uE513","\uDBB9\uDCED",["flag-cn","cn"]],
		"1f1e8-1f1f4":[["\uD83C\uDDE8\uD83C\uDDF4"],"","",["flag-co","co"]],
		"1f1e9-1f1ea":[["\uD83C\uDDE9\uD83C\uDDEA"],"\uE50E","\uDBB9\uDCE8",["flag-de","de"]],
		"1f1e9-1f1f0":[["\uD83C\uDDE9\uD83C\uDDF0"],"","",["flag-dk","dk"]],
		"1f1ea-1f1f8":[["\uD83C\uDDEA\uD83C\uDDF8"],"\uE511","\uDBB9\uDCEB",["flag-es","es"]],
		"1f1eb-1f1ee":[["\uD83C\uDDEB\uD83C\uDDEE"],"","",["flag-fi","fi"]],
		"1f1eb-1f1f7":[["\uD83C\uDDEB\uD83C\uDDF7"],"\uE50D","\uDBB9\uDCE7",["flag-fr","fr"]],
		"1f1ec-1f1e7":[["\uD83C\uDDEC\uD83C\uDDE7"],"\uE510","\uDBB9\uDCEA",["flag-gb","gb","uk"]],
		"1f1ed-1f1f0":[["\uD83C\uDDED\uD83C\uDDF0"],"","",["flag-hk","hk"]],
		"1f1ee-1f1e9":[["\uD83C\uDDEE\uD83C\uDDE9"],"","",["flag-id","id"]],
		"1f1ee-1f1ea":[["\uD83C\uDDEE\uD83C\uDDEA"],"","",["flag-ie","ie"]],
		"1f1ee-1f1f1":[["\uD83C\uDDEE\uD83C\uDDF1"],"","",["flag-il","il"]],
		"1f1ee-1f1f3":[["\uD83C\uDDEE\uD83C\uDDF3"],"","",["flag-in","in"]],
		"1f1ee-1f1f9":[["\uD83C\uDDEE\uD83C\uDDF9"],"\uE50F","\uDBB9\uDCE9",["flag-it","it"]],
		"1f1ef-1f1f5":[["\uD83C\uDDEF\uD83C\uDDF5"],"\uE50B","\uDBB9\uDCE5",["flag-jp","jp"]],
		"1f1f0-1f1f7":[["\uD83C\uDDF0\uD83C\uDDF7"],"\uE514","\uDBB9\uDCEE",["flag-kr","kr"]],
		"1f1f2-1f1f4":[["\uD83C\uDDF2\uD83C\uDDF4"],"","",["flag-mo","mo"]],
		"1f1f2-1f1fd":[["\uD83C\uDDF2\uD83C\uDDFD"],"","",["flag-mx","mx"]],
		"1f1f2-1f1fe":[["\uD83C\uDDF2\uD83C\uDDFE"],"","",["flag-my","my"]],
		"1f1f3-1f1f1":[["\uD83C\uDDF3\uD83C\uDDF1"],"","",["flag-nl","nl"]],
		"1f1f3-1f1f4":[["\uD83C\uDDF3\uD83C\uDDF4"],"","",["flag-no","no"]],
		"1f1f3-1f1ff":[["\uD83C\uDDF3\uD83C\uDDFF"],"","",["flag-nz","nz"]],
		"1f1f5-1f1ed":[["\uD83C\uDDF5\uD83C\uDDED"],"","",["flag-ph","ph"]],
		"1f1f5-1f1f1":[["\uD83C\uDDF5\uD83C\uDDF1"],"","",["flag-pl","pl"]],
		"1f1f5-1f1f7":[["\uD83C\uDDF5\uD83C\uDDF7"],"","",["flag-pr","pr"]],
		"1f1f5-1f1f9":[["\uD83C\uDDF5\uD83C\uDDF9"],"","",["flag-pt","pt"]],
		"1f1f7-1f1fa":[["\uD83C\uDDF7\uD83C\uDDFA"],"\uE512","\uDBB9\uDCEC",["flag-ru","ru"]],
		"1f1f8-1f1e6":[["\uD83C\uDDF8\uD83C\uDDE6"],"","",["flag-sa","sa"]],
		"1f1f8-1f1ea":[["\uD83C\uDDF8\uD83C\uDDEA"],"","",["flag-se","se"]],
		"1f1f8-1f1ec":[["\uD83C\uDDF8\uD83C\uDDEC"],"","",["flag-sg","sg"]],
		"1f1f9-1f1f7":[["\uD83C\uDDF9\uD83C\uDDF7"],"","",["flag-tr","tr"]],
		"1f1fa-1f1f8":[["\uD83C\uDDFA\uD83C\uDDF8"],"\uE50C","\uDBB9\uDCE6",["flag-us","us"]],
		"1f1fb-1f1f3":[["\uD83C\uDDFB\uD83C\uDDF3"],"","",["flag-vn","vn"]],
		"1f1ff-1f1e6":[["\uD83C\uDDFF\uD83C\uDDE6"],"","",["flag-za","za"]],
		"1f468-1f468-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC66"],"","",["man-man-boy"]],
		"1f468-1f468-1f466-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC66\u200D\uD83D\uDC66"],"","",["man-man-boy-boy"]],
		"1f468-1f468-1f467":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC67"],"","",["man-man-girl"]],
		"1f468-1f468-1f467-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC67\u200D\uD83D\uDC66"],"","",["man-man-girl-boy"]],
		"1f468-1f468-1f467-1f467":[["\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC67\u200D\uD83D\uDC67"],"","",["man-man-girl-girl"]],
		"1f468-1f469-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC66"],"","",["man-woman-boy"]],
		"1f468-1f469-1f466-1f466":[["\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66"],"","",["man-woman-boy-boy"]],
		"1f468-1f469-1f467":[["\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67"],"","",["man-woman-girl"]],
		"1f468-1f469-1f467-1f467":[["\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC67"],"","",["man-woman-girl-girl"]],
		"1f468-2764-fe0f-1f468":[["\uD83D\uDC68\u200D\u2764\uFE0F\u200D\uD83D\uDC68"],"","",["man-heart-man"]],
		"1f468-2764-fe0f-1f48b-1f468":[["\uD83D\uDC68\u200D\u2764\uFE0F\u200D\uD83D\uDC8B\u200D\uD83D\uDC68"],"","",["man-kiss-man"]],
		"1f469-1f469-1f466":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC66"],"","",["woman-woman-boy"]],
		"1f469-1f469-1f466-1f466":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66"],"","",["woman-woman-boy-boy"]],
		"1f469-1f469-1f467":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67"],"","",["woman-woman-girl"]],
		"1f469-1f469-1f467-1f466":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66"],"","",["woman-woman-girl-boy"]],
		"1f469-1f469-1f467-1f467":[["\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC67"],"","",["woman-woman-girl-girl"]],
		"1f469-2764-fe0f-1f469":[["\uD83D\uDC69\u200D\u2764\uFE0F\u200D\uD83D\uDC69"],"","",["woman-heart-woman"]],
		"1f469-2764-fe0f-1f48b-1f469":[["\uD83D\uDC69\u200D\u2764\uFE0F\u200D\uD83D\uDC8B\u200D\uD83D\uDC69"],"","",["woman-kiss-woman"],33,29,1,0]
	};
	/** @private */
	emoji.emoticons_data = {
		"<3":"heart",
		":o)":"monkey_face",
		":*":"kiss",
		":-*":"kiss",
		"<\/3":"broken_heart",
		"=)":"smiley",
		"=-)":"smiley",
		"C:":"smile",
		"c:":"smile",
		":D":"smile",
		":-D":"smile",
		":>":"laughing",
		":->":"laughing",
		";)":"wink",
		";-)":"wink",
		":)":"blush",
		"(:":"blush",
		":-)":"blush",
		"8)":"sunglasses",
		":|":"neutral_face",
		":-|":"neutral_face",
		":\\\\":"confused",
		":-\\\\":"confused",
		":\/":"confused",
		":-\/":"confused",
		":p":"stuck_out_tongue",
		":-p":"stuck_out_tongue",
		":P":"stuck_out_tongue",
		":-P":"stuck_out_tongue",
		":b":"stuck_out_tongue",
		":-b":"stuck_out_tongue",
		";p":"stuck_out_tongue_winking_eye",
		";-p":"stuck_out_tongue_winking_eye",
		";b":"stuck_out_tongue_winking_eye",
		";-b":"stuck_out_tongue_winking_eye",
		";P":"stuck_out_tongue_winking_eye",
		";-P":"stuck_out_tongue_winking_eye",
		"):":"disappointed",
		":(":"disappointed",
		":-(":"disappointed",
		">:(":"angry",
		">:-(":"angry",
		":'(":"cry",
		"D:":"anguished",
		":o":"open_mouth",
		":-o":"open_mouth"
	};

	if (typeof exports === 'object'){
		module.exports = emoji;
	}else if (typeof define === 'function' && define.amd){
		define(function() { return emoji; });
	}else{
		this.emoji = emoji;
	}

}).call(function(){
	return this || (typeof window !== 'undefined' ? window : global);
}());