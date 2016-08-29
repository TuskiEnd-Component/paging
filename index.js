/*
	调用方式
	var paging = new Paging({
		//分页容器ID
		pageId:'pageId',
		//头部分页容器ID（可不填）
		pageTopId: '',
		//总页数
		totals:100,
		pageSize:25,
		//显示页数（可不填）
		showPageNum:10, 
		//当前页数（可不填）
		curPageNum:1,
		//结余页数（可不填）
		overPageNum:2,
		//延时毫秒（可不填）
		delay：500,
		onLoadPage: function(page){
			console.log('现在的页数是' + page);
		}
	});
	paging.init();
*/

function Paging(opt) {
	var opt = opt || {};

	if (opt.pageId) {
		this.el = document.getElementById(opt.pageId);
	}
	else {
		throw 'Error "opt": "opt.pageId" is null';
	}

	if (opt.pageTopId) {
		this.topEl = document.getElementById(opt.pageTopId);
	}

	//数据总数
	this.totals = opt.totals || 1;

	//每页显示个数
	this.pageSize = opt.pageSize || 25;

	//总页数
	this.setAllPageNum();
	//当前页数
	this.curPageNum = opt.curPageNum || 1;
	//显示页数
	this.showPageNum = opt.showPageNum || 10;
	//结余页数
	this.overPageNum = opt.overPageNum || 2;

	//延时
	this.delay = opt.delay || 500;

	this.isflag = true;


	//加载页面回调函数
	this.onLoadPage = opt.onLoadPage || null;


	//显示页数不允许小于4
	if (this.showPageNum < 4) {
		this.showPageNum = 4
	}

	// //上一页回调函数
	// this.onPrev = null;

	// //下一页回调函数
	// this.onNext = null;

	this.pageHtml = [];
}

//初始化    
Paging.prototype.init = function () {
	var me = this;
	me.refreshDom();
	me.bingEvent();
}

//计算总页数    
Paging.prototype.setAllPageNum = function () {
	var totals = this.totals,
		pageSize = this.pageSize;
	var allPageNum = Math.floor((totals - 1) / pageSize) + 1;
	if (this.curPageNum > allPageNum) {
		this.curPageNum = 1;
	}
	this.allPageNum = allPageNum;
}

//循环增加分页
Paging.prototype.loopDom = function (start, end) {
	var me = this;
	for (; start <= end; start++) {
		if (start == me.curPageNum) {
			me.pageHtml.push('<li><a class="active" href="javascript:;" data-num="' + start + '">' + start + '</a></li>');
		}
		else {
			me.pageHtml.push('<li><a href="javascript:;" data-num="' + start + '">' + start + '</a></li>');
		}

	}
}

//刷新分页
Paging.prototype.refreshDom = function () {
	var me = this,
		pageHtml = me.pageHtml = [],
		prevBtn = me.curPageNum == 1 ? '<li><a href="javascript:;" class="disabled">&lt;</a></li>' : '<li><a href="javascript:;" data-num="' + (me.curPageNum - 1) + '">&lt;</a></li>',
		nextBtn = me.curPageNum == me.allPageNum ? '<li><a href="javascript:;" class="disabled">&gt;</a></li>' : '<li><a href="javascript:;"  data-num="' + (me.curPageNum + 1) + '">&gt;</a></li>';

	pageHtml.push('<ul class="pagination-page page">');
	pageHtml.push(prevBtn);

	if (me.allPageNum <= me.showPageNum) {
		me.loopDom(1, me.allPageNum)
	}
	else {
		if (me.overPageNum * 2 > me.showPageNum || me.showPageNum < 6) {
			me.overPageNum = 1;
		}

		//计算中间的个数
		var centerNum = me.showPageNum - (me.overPageNum * 2),
			centerLeft = Math.floor((centerNum - 1) / 2),
			centerRight = centerNum - centerLeft - 1,
			start = 0,
			end = 0;

		//右边临界点
		var rightOver = me.allPageNum - me.overPageNum + 1;

		//左边
		me.loopDom(1, me.overPageNum);

		//计算是否有左边的 (...)
		if (me.curPageNum > me.overPageNum + centerLeft + 1) {
			pageHtml.push('<li>...</li>');
		}

		//计算中间
		if (me.curPageNum <= me.overPageNum + centerLeft) {
			start = me.overPageNum + 1;
			end = me.overPageNum + centerNum;
		}
		else {
			start = me.curPageNum - centerLeft;
			end = me.curPageNum + centerRight;
		}

		if (end >= rightOver) {
			end = rightOver - 1;
			start = rightOver - centerNum;
		}

		me.loopDom(start, end);

		//计算是否有右边的 (...)
		if (end < (rightOver - 1)) {
			pageHtml.push('<li>...</li>');
		}

		//右边
		me.loopDom(rightOver, me.allPageNum);

	}
	pageHtml.push(nextBtn);
	pageHtml.push('</ul>');
	me.el.innerHTML = pageHtml.join('');
	me.refreshTop();
	me.delayFn();
}

//点击延时
Paging.prototype.refreshTop = function () {
	var me = this;
	if (!me.topEl) {
		return;
	}
	var pageHtml = [],
		prevBtn = me.curPageNum == 1 ? '<a class="iconfont disabled" href="javascript:;">&#x3437;</a>' : '<a class="iconfont" href="javascript:;" data-num="' + (me.curPageNum - 1) + '">&#x3437;</a>',
		nextBtn = me.curPageNum == me.allPageNum ? '<a class="iconfont disabled" href="javascript:;">&#x344c;</a>' : '<a class="iconfont" href="javascript:;"  data-num="' + (me.curPageNum + 1) + '">&#x344c;</a>';

	var c25 = me.pageSize == 25 ? 'class="page-current"' : '',
		c50 = me.pageSize == 50 ? 'class="page-current"' : '',
		c100 = me.pageSize == 100 ? 'class="page-current"' : '';

	pageHtml.push('<div><span class="order-list-limit"><i> 每页显示数： ');
	pageHtml.push('<a href="javascript:;" data-size="25"' + c25 + '>25</a>');
	pageHtml.push(' | <a href="javascript:;" data-size="50"' + c50 + '>50</a>');
	pageHtml.push(' | <a href="javascript:;" data-size="100"' + c100 + '>100</a>');
	pageHtml.push(' </i></span>');
	pageHtml.push(prevBtn);
	pageHtml.push('<em class="page-current"> ' + me.curPageNum + '</em> / ' + me.allPageNum + ' ');
	pageHtml.push(nextBtn);
	me.topEl.innerHTML = pageHtml.join('');
}



//点击延时
Paging.prototype.delayFn = function () {
	var me = this;
	me.isflag = false;

	if (typeof (+me.delay) != 'number') {
		me.delay = 500;
	}

	if (me.delay == 0) {
		me.isflag = true;
		return;
	}

	setTimeout(function () {
		me.isflag = true;
	}, me.delay);
}

//绑定事件
Paging.prototype.on = function (dom, e, callback) {

	if (typeof document.addEventListener != "undefined") {
		dom.addEventListener(e, callback, true);
	}
	else {
		dom.attachEvent("on" + e, callback);
	}
}


//绑定事件
Paging.prototype.off = function (dom, e, callback) {
	if (typeof document.addEventListener != "undefined") {
		dom.removeEventListener(e, callback, true);
	}
	else {
		dom.detachEvent("on" + e, callback);
	}
}


//绑定按钮事件
Paging.prototype.bingEvent = function () {
	var me = this;

	if(me.el){

		me.on(me.el, 'click', function (e) {
			var e = e || event,
				target = e.target || e.srcElement;
			if (target.tagName.toLowerCase() == "a") {
				var pageNum = target.getAttribute('data-num');
				if (pageNum !== null) {
					me.goPage(pageNum);
				}
			}
		});

	}


	if(me.topEl){

		me.on(me.topEl, 'click', function (e) {
			var e = e || event,
				target = e.target || e.srcElement;
			if (target.tagName.toLowerCase() == "a") {
				var pageNum = target.getAttribute('data-num'),
					pageSize = target.getAttribute('data-size');
				if (pageNum !== null) {
					me.goPage(pageNum);
				}
				if (pageSize !== null) {
					me.setPageSize(pageSize);
				}
			}
		});
		
	}
}


//上一页
Paging.prototype.prevPage = function () {
	var me = this,
		pageNum = me.curPageNum == 1 ? 1 : me.curPageNum - 1;
	me.goPage(pageNum);
}

//下一页
Paging.prototype.nextPage = function () {
	var me = this,
		pageNum = me.curPageNum == me.allPageNum ? me.allPageNum : me.curPageNum + 1;
	me.goPage(pageNum);
}

//设置数据总数
Paging.prototype.setTotals = function (totals) {
	var me = this,
		totals = +totals;
	if (typeof totals == 'number' && totals > 0) {
		if (totals == me.totals) {
			return;
		}
		me.totals = totals;
		me.setAllPageNum();
		me.refreshDom();
	}
}

//设置每页个数
Paging.prototype.setPageSize = function (pageSize) {
	var me = this,
		pageSize = +pageSize;
	if (typeof pageSize == 'number' && pageSize > 0) {
		if (pageSize == me.pageSize) {
			return;
		}
		me.pageSize = pageSize;
		me.setAllPageNum();
		me.goPage(me.curPageNum);
	}
}

//转跳页面
Paging.prototype.goPage = function (pageNum) {
	var me = this;
	if (!me.isflag) {
		return;
	}
	me.curPageNum = +pageNum;
	me.refreshDom();
	me.onLoadPage && me.onLoadPage.call(this, pageNum, me.pageSize);
}

module.exports = Paging;