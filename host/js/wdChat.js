/**
 * Created by XY on 2016/1/13.
 */
var history_time;
var new_time;
localStorage.page_return = 'wd_list.html';
initPageReturn();
var needPay;

var doctorCard = localStorage.docCard;
var page = 0;
var code = '';
var openid = '';
$(function(){
	if(is_weixn()) {//如果是微信端
		var url = window.location.href;//获取当前页面的URL
		var Request=new UrlSearch();
		if(Request['code']) {//有参数并且含有code参数=>获取openid
			code = Request['code'];
			getOpenidByCode(code);
		} else {//如果没有参数或者参数中没有code
			$.get('../api/wx_ali_pay.php?act=getURL',{baseUrl:url},function(data) {//baseUrl:url
				var rst = $.parseJSON(data);
				if (checkResponse(rst, 'patient/wd_detail_h.html'))
					return false;
				if(rst.result == 1) {
					url = rst.url;
					window.location.href = url;
				}
			});
		}
	}



	//1.发送按钮，验证是否为空
	$("#Button1").click(function(){
		//alert(localStorage.docCard);
		//localStorage.removeItem('docCard');
		var $content = $("#txtContent");
		if ($content.val() != ""){
			SendContent($content.val(),doctorCard);
		}else{
			alert("发送内容不能为空！");
			$content.focus();
			return false;
		}
	});

	//发送内容，获取问答信息
	function SendContent(content,doctorCard){
		$.ajax({
			type:"POST",
			url:"../api/wd.php?act=post_ask",
			//data:"action=SendContent&d=" + new Date() + "&content" + content,
			data:{content:content,doctorCard:doctorCard},
			success: function(data){
				var rst = $.parseJSON(data);
				console.log("发送内容")
				console.log(rst);
				if(rst.result == 1) {
					$("#txtContent").val("");
					getNewMsg();



				}else {
					alert(rst.descrip);
				}
				//if (data == "1"){
				//	GetMessageList();
				//	$("#txtContent").val("");
				//}else{
				//	alert("发送失败！");
				//	return false;
				//}
			}
		});
	}

	//首次获取问答信息
	firstGetData();
	function firstGetData(){
		$.ajax({
			type:"GET",
			url:"../api/wd.php?act=get_newCommunication_byPatient",
			data:{doctorCard:doctorCard},
			success: function(data){
				var rst = $.parseJSON(data);
				//检查是否登录
				if (checkResponse(rst, 'patient/wd_detail_h.html'))
					return false;
				console.log(rst);
				history_time = rst.history_time;
				new_time = rst.new_time;
				if(rst.communications.length) {
					var len = rst.communications.length;
					var arr = rst.communications;
					postAllData(rst.communications);
					//显示页面
				}else {
						//显示历史记录
					getOldMsg();
				}
			}
		});
	}

	//载入旧信息
	function getOldMsg(){
		if(page==-1) {alert('已经是最后一页');return;}
		var req = $.ajax({
			url:'../api/wd.php?act=get_history_chat',
			data:{doctorCard:doctorCard,page:page,history_time:history_time},
			success: function(data) {
				var rst = $.parseJSON(data);
				if (checkResponse(rst, 'patient/wd_detail_h.html'))
					return false;
				if(page<(rst.page.pageCount-1)) {
					page++;
				} else {
					page = -1;
				}
				console.log('刷新加载');
				console.log(rst);
				postOldMsg(rst.communications);
			}
		});
		addRequest(req);
	}

	//载入新信息
	function getNewMsg(){
		var req = $.ajax({
			url:'../api/wd.php?act=get_now_chat',
			data:{doctorCard:doctorCard,page:page,new_time:new_time},
			success: function(data) {
				var rst = $.parseJSON(data);
				if (checkResponse(rst, 'patient/wd_detail_h.html'))
					return false;
				console.log('载入新信息');
				console.log(rst);
				if(rst.communications.length) {
					new_time = rst.communications[0].posttime;
					postNewMsg(rst.communications);
				}else{

				}
			}
		});
		addRequest(req);
	}

	//第一次post信息
	function postAllData(arr) {
		$("#divContent").html("");
		for(var i=arr.length-1; i>=0; i--){
			var Your = '<ul class="qaf cb ui-listview" style="clear: both;"  data-role="listview" cmid='+arr[i].cmid+' is_payed='+arr[i].is_payed+' need_pay='+arr[i].need_pay+' order_number='+arr[i].order_number+' price='+arr[i].price+' state='+arr[i].state+'>'+
				'<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">'+arr[i].posttime+'</li>'+
				'<div class="cb" style="width: 17%;clear: both;"><div class="txM">'+
				'<img src="img/icon/xr.png" alt=""><p>'+arr[i].doctor.truename +'</p></div></div>'+
				'<div class="text" style="width: 66%;"><div class="speech left" >'+arr[i].content +'</div></div>'+
				'<div class="btn" style="width: 17%;height: 1em;"></div></ul>';
			var MyYes =  '<ul class="qaf cb ui-listview"  data-role="listview" cmid='+arr[i].cmid+' is_payed='+arr[i].is_payed+' need_pay='+arr[i].need_pay+' order_number='+arr[i].order_number+' price='+arr[i].price+' state='+arr[i].state+'>'+
				'<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">'+arr[i].posttime+'</li>'+
				'<div class="btn cb jg" style="width: 17%;height: 2.5em;"></div>'+
				'<div class="text" style="width: 66%;">'+
				'<div class="speech right" >'+arr[i].content +'</div>'+
				'</div><div class="" style="width: 17%;">'+
				'<div class="txY"><img src="img/icon/xr.png" alt=""><p>'+arr[i].user.truename +'</p></div></div>'+
				'<div class="cb"></div></ul>';
			var MyNo =  '<ul class="qaf cb ui-listview"  data-role="listview" cmid='+arr[i].cmid+' is_payed='+arr[i].is_payed+' need_pay='+arr[i].need_pay+' order_number='+arr[i].order_number+' price='+arr[i].price+' state='+arr[i].state+'>'+
				'<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">'+arr[i].posttime+'</li>'+
				'<div class="btn cb jg" style="width: 17%;height: 2.5em;">' +
				'<img src="img/icon/jg.png" alt=""><li class="cb">余额不足</li></div>'+
				'<div class="text" style="width: 66%;">'+
				'<div class="speech right" >'+arr[i].content +'</div>'+
				'<div class="twoBtn"><a href="#" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">撤回</a>'+
				'<a href="#"  onclick="btnPay($(this))" class="ui-btn ui-btn-inline ui-corner-all ui-shadow ui-icon-arrow-r ui-btn-icon-right ui-alt-icon btnPay">立即付费</a></div>'+
				'</div><div class="" style="width: 17%;">'+
				'<div class="txY"><img src="img/icon/xr.png" alt=""><p>'+arr[i].user.truename +'</p></div></div>'+
				'<div class="cb"></div></ul>';
			if(arr[i].identity == 1){
				$(Your).appendTo("#divContent");
			}else{
				if(arr[i].is_payed == 1){
					$(MyYes).appendTo("#divContent")
				}else{
					$(MyNo).appendTo("#divContent")
				}
			}
		}
	}

	function postOldMsg(arr) {
		for(var i=0; i<arr.length; i++){
			var Your = '<ul class="qaf cb ui-listview" style="clear: both;"  data-role="listview" cmid='+arr[i].cmid+' is_payed='+arr[i].is_payed+' need_pay='+arr[i].need_pay+' order_number='+arr[i].order_number+' price='+arr[i].price+' state='+arr[i].state+'>'+
				'<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">'+arr[i].posttime+'</li>'+
				'<div class="cb" style="width: 17%;clear: both;"><div class="txM">'+
				'<img src="img/icon/xr.png" alt=""><p>'+arr[i].doctor.truename +'</p></div></div>'+
				'<div class="text" style="width: 66%;"><div class="speech left" >'+arr[i].content +'</div></div>'+
				'<div class="btn" style="width: 17%;height: 1em;"></div></ul>';
			var MyYes =  '<ul class="qaf cb ui-listview"  data-role="listview" cmid='+arr[i].cmid+' is_payed='+arr[i].is_payed+' need_pay='+arr[i].need_pay+' order_number='+arr[i].order_number+' price='+arr[i].price+' state='+arr[i].state+'>'+
				'<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">'+arr[i].posttime+'</li>'+
				'<div class="btn cb jg" style="width: 17%;height: 2.5em;"></div>'+
				'<div class="text" style="width: 66%;">'+
				'<div class="speech right" >'+arr[i].content +'</div>'+
				'</div><div class="" style="width: 17%;">'+
				'<div class="txY"><img src="img/icon/xr.png" alt=""><p>'+arr[i].user.truename +'</p></div></div>'+
				'<div class="cb"></div></ul>';
			var MyNo =  '<ul class="qaf cb ui-listview"  data-role="listview" cmid='+arr[i].cmid+' is_payed='+arr[i].is_payed+' need_pay='+arr[i].need_pay+' order_number='+arr[i].order_number+' price='+arr[i].price+' state='+arr[i].state+'>'+
				'<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">'+arr[i].posttime+'</li>'+
				'<div class="btn cb jg" style="width: 17%;height: 2.5em;">' +
				'<img src="img/icon/jg.png" alt=""><li class="cb">余额不足</li></div>'+
				'<div class="text" style="width: 66%;">'+
				'<div class="speech right" >'+arr[i].content +'</div>'+
				'<div class="twoBtn"><a href="#" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">撤回</a>'+
				'<a href="#" onclick="btnPay($(this))" class="ui-btn ui-btn-inline ui-corner-all ui-shadow ui-icon-arrow-r ui-btn-icon-right ui-alt-icon btnPay">立即付费</a></div>'+
				'</div><div class="" style="width: 17%;">'+
				'<div class="txY"><img src="img/icon/xr.png" alt=""><p>'+arr[i].user.truename +'</p></div></div>'+
				'<div class="cb"></div></ul>';
			if(arr[i].identity == 1){
				$("#divContent").html(Your + $("#divContent").html());
			}else{
				if(arr[i].is_payed == 1){
					$("#divContent").html(MyYes + $("#divContent").html())
				}else{
					$("#divContent").html(MyNo + $("#divContent").html())
				}
			}
		}
	}

	function postNewMsg(arr) {
		for(var i=arr.length-1; i>=0; i--){
			var Your = '<ul class="qaf cb ui-listview" style="clear: both;"  data-role="listview" cmid='+arr[i].cmid+' is_payed='+arr[i].is_payed+' need_pay='+arr[i].need_pay+' order_number='+arr[i].order_number+' price='+arr[i].price+' state='+arr[i].state+'>'+
				'<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">'+arr[i].posttime+'</li>'+
				'<div class="cb" style="width: 17%;clear: both;"><div class="txM">'+
				'<img src="img/icon/xr.png" alt=""><p>'+arr[i].doctor.truename +'</p></div></div>'+
				'<div class="text" style="width: 66%;"><div class="speech left" >'+arr[i].content +'</div></div>'+
				'<div class="btn" style="width: 17%;height: 1em;"></div></ul>';
			var MyYes =  '<ul class="qaf cb ui-listview"  data-role="listview" cmid='+arr[i].cmid+' is_payed='+arr[i].is_payed+' need_pay='+arr[i].need_pay+' order_number='+arr[i].order_number+' price='+arr[i].price+' state='+arr[i].state+'>'+
				'<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">'+arr[i].posttime+'</li>'+
				'<div class="btn cb jg" style="width: 17%;height: 2.5em;"></div>'+
				'<div class="text" style="width: 66%;">'+
				'<div class="speech right" >'+arr[i].content +'</div>'+
				'</div><div class="" style="width: 17%;">'+
				'<div class="txY"><img src="img/icon/xr.png" alt=""><p>'+arr[i].user.truename +'</p></div></div>'+
				'<div class="cb"></div></ul>';
			var MyNo =  '<ul class="qaf cb ui-listview"  data-role="listview" cmid='+arr[i].cmid+' is_payed='+arr[i].is_payed+' need_pay='+arr[i].need_pay+' order_number='+arr[i].order_number+' price='+arr[i].price+' state='+arr[i].state+'>'+
				'<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">'+arr[i].posttime+'</li>'+
				'<div class="btn cb jg" style="width: 17%;height: 2.5em;">' +
				'<img src="img/icon/jg.png" alt=""><li class="cb">余额不足</li></div>'+
				'<div class="text" style="width: 66%;">'+
				'<div class="speech right" >'+arr[i].content +'</div>'+
				'<div class="twoBtn"><a href="#" class="ui-btn ui-btn-inline ui-corner-all ui-shadow">撤回</a>'+
				'<a href="#" onclick="btnPay($(this))" class="ui-btn ui-btn-inline ui-corner-all ui-shadow ui-icon-arrow-r ui-btn-icon-right ui-alt-icon ">立即付费</a></div>'+
				'</div><div class="" style="width: 17%;">'+
				'<div class="txY"><img src="img/icon/xr.png" alt=""><p>'+arr[i].user.truename +'</p></div></div>'+
				'<div class="cb"></div></ul>';
			if(arr[i].cmid != $('.qaf:last-child').attr('cmid')){
				if(arr[i].identity == 1){
					$(Your).appendTo("#divContent");
				}else{
					if(arr[i].is_payed == 1){
						$(MyYes).appendTo("#divContent")
					}else{
						$(MyNo).appendTo("#divContent")
					}
				}
			}
		}
	}

	//获取免费信息条数
	getFreeCount();
	function getFreeCount(){
		var req = $.ajax({
			url:'../api/wd.php?act=get_last_freeCount',
			data:{doctorCard:doctorCard},
			success: function(data) {
				var rst = $.parseJSON(data);
				console.log('载入免费信息条数');
				console.log(rst);
			}
		});
		addRequest(req);
	}

	<!--向上滚动载入效果-->
	var list = document.getElementById("divContent"),
		loader = document.getElementById("divMsg"),
		isTouched = false,
		isMovedDown = false,
		isMovedUp = false;
	// list列表距离body的距离.

	//    alert(list.offsetTop);
	var prevY = parseInt(list.offsetTop);
	// list绝对定位的高度
	var cssY = list.style.top;
	cssY = parseInt(cssY.substring(0, cssY.length - 2));

	//添加手机触摸事件
	list.addEventListener("touchstart", function (e) {
		isTouched = true;
		//初始化触摸的位置
		prevY = e.changedTouches[0].clientY;
		//添加 css3 效果
		list.style.transition = "";
//        e.preventDefault();
	}, false);

	list.addEventListener("touchmove", function (e) {
		if (isTouched) {
//     到达屏幕顶端执行下拉 及底端上拉
			if($(document).scrollTop() <= 0){
				if (e.changedTouches[0].clientY > prevY) {
					var change = e.changedTouches[0].clientY - prevY;
					list.style.top = cssY + change + 'px';
					$("#divMsg").html("loading...");
					isMovedDown = true;
				}}
			if($(document).scrollTop() >= $(document).height() - $(window).height()){
				if (e.changedTouches[0].clientY < prevY) {
					var change = prevY - e.changedTouches[0].clientY;
					list.style.top = cssY - change + 'px';
					$("#divMsgD").html("loading...");
					isMovedUp = true;
				}}
		}
//        e.preventDefault();
	}, false);

	list.addEventListener("touchend", function (e) {
		// 取消向上划屏是的触摸事件
		isTouched = false;
		// 如果列表向下拉了，向上放回去有个css3的过渡效果
		list.style.transition = "top 1s";
		if (isMovedDown) {
			////显示加载的元素
			//page ++;
			////alert(page);
			isMovedDown = false;
			list.style.top = cssY + 'px';
			getOldMsg();
			$("#divMsg").html("");
		}

		if (isMovedUp) {
			//显示加载的元素
			getNewMsg();
			isMovedUp = false;
			list.style.top = cssY + 'px';
			setTimeout("autoScroll()",300);
			$("#divMsgD").html("");
		}


//        e.preventDefault();
	}, false);

	//绑定鼠标事件让在电脑浏览器里也能用
	//list.addEventListener("mousedown", function (e) {
	//	isTouched = true;
	//	prevY = e.clientY;
	//	list.style.transition = "";
	//	e.preventDefault();
	//}, false);
	//list.addEventListener("mouseup", function (e) {
	//	isTouched = false;
	//
	//	list.style.transition = "top 1s";
	//	if (isMoved) {
	//		loader.style.display = "block";
	//		loadNewData();
	//	}
	//	list.style.top = cssY + 'px';
	//	isMoved = false;
	//	e.preventDefault();
	//}, false);
	//list.addEventListener("mousemove", function (e) {
	//	if (isTouched) {
	//		if (e.clientY > prevY) {
	//			var change = e.clientY - prevY;
	//			list.style.top = cssY + change + 'px';
	//			isMoved = true;
	//		}
	//	}
	//	e.preventDefault();
	//}, false);

	//测试载入新数据
	function loadNewData() {
		setTimeout(function () {
			list.innerHTML = '<li>新加的元素</li><li>new user 2</li>' + list.innerHTML;
		}, 1000);
	}


	//定时载入信息
	//var interval = setInterval(getNewMsg,10000);
});
//支付按钮
function btnPay(obj){
	//alert(123);
	var parent = $(obj).parents('ul.qaf');
	var cmid = parent.attr('cmid');
	//alert(cmid);
	var req = $.get('../api/wd.php?act=getCommunication',{cmid:cmid},function(data) {
		var rst = $.parseJSON(data);
		if (checkResponse(rst, 'patient/wd_detail_h.html'))
			return false;
		console.log('获取单条记录');
		console.log(rst);
		if(rst.result == 1) {
			var needpay = rst.communication.need_pay;
			var subject = '医患问答';
			if(needpay <= 0) {//余额充足
				$.ajax({
					type:'POST',
					url:'../api/wd.php?act=pay',
					data:{cmid:cmid},
					success:function(data) {
						var rst = $.parseJSON(data);
						if(rst.result == 1) {
							alert('支付成功');
						}else{
							alert(rst.descrip);
						}
					}
				})
			}else {//余额不足=>充值
				//alert('余额不足');
				if(is_weixn()) {//微信支付
					$.get('../api/wd.php?act=wxpay',{cmid:cmid,orderno:rst.communication.order_number,money:needpay,subject:subject,openid:openid},function(data) {
						var rst = $.parseJSON(data);
						if(rst.result == 1) {
							$("#needPay").text(need_pay);
							$('#runpay').html(rst.rst);
							window.location.href = '#page_wxpay';
						}else {
							alert(rst.descrip);
						}
					});
				}else {//alipay
					//alert('alipay');
					$.post('../api/wd.php?act=pay_recharge',{cmid:cmid,orderno:rst.communication.order_number,money:needpay,subject:subject,return_url:'fd/m/patient/dqy.html#page_pay_result'},function(data) {
						$('#dopay').html(data);
					});
				}
			}
		}
	});
	addRequest(req);
}


<!--页面加载完成时自动跳转至底部-->
function autoScroll () {
	$('body').scrollTop( $('body')[0].scrollHeight );
}

$(document).ready(function(){
	setTimeout("autoScroll()",1000);
});

//元素绑定全局ajaxStart事件
$(document).ajaxStart(function(){
	$("#divMsgU").show().html("正在传输数据...");//显示元素
});
//元素绑定全局ajaxStop事件
$(document).ajaxStop(function(){
	$("#divMsgU").html("已完成").slideUp(1000,function(){});
});

//通过code获取openID
function getOpenidByCode(code) {
	$.ajax({
		type:'GET',
		url:'../api/wx_ali_pay.php?act=getOpenidByCode',
		data:{code:code},
		async : false,
		success:function(data) {
			var rst = $.parseJSON(data);
			if (rst.result == 1) {
				openid = rst.code;
				alert(openid);
			} else {
				alert(rst.descrip);
			}
		}
	});
}


