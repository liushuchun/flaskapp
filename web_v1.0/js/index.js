var ucenter, selfWV, subWV, isOpenLogin, bodyWV, isMenuShow = false,title;
var mnum = 0;

mui.plusReady(function() {
	store.set("uid", "1");
	plus.navigator.setStatusBarBackground('#3D3E3D');
	plus.navigator.setStatusBarStyle('UIStatusBarStyleBlackOpaque')
	selfWV = plus.webview.currentWebview();

	mui.init({
		swipeBack: false
	});

	//返回按钮
	var first = null;
	mui.back = function() {

		//首次按键，提示‘再按一次退出应用’
		if (!first) {
			closeMenu();
			first = new Date().getTime();
			mui.toast('再按一次退出应用');
			setTimeout(function() {
				first = null;
			}, 1000);
		} else {
			if (new Date().getTime() - first < 1000) {

				if (mui.os.ios) {
					plus.runtime.quit();
				} else {
					plus.android.runtimeMainActivity().moveTaskToBack(false);
				}

			}
		}
	};

	message.init();
	//message.create('abc'+mnum);


	//欢迎页
	welcomekey = 'welcome1.1.2';
	if (!store.get(welcomekey)) {
		welcomeWV = plus.webview.create('./page/public/welcome.html', 'welcome');
		setTimeout(function() {
			welcomeWV.show('slide-in-bottom');
		}, 1000);
		store.set(welcomekey, true);
	}

	//主webwivew
	bodyWV = mui.preload({
		id: 'bodyWV',
		url: '/page/body/index.html',
		styles: {
			top: '44px',
			bottom: '50px',
			bounce: 'vertical'
		}
	});
	selfWV.append(bodyWV);
	bodyWV.show();

	//菜单webview
	ucenter = mui.preload({
		id: 'ucenter',
		url: './page/public/ucenter.html',
		styles: {
			left: 0,
			width: '70%',
			zindex: 9997
		}
	});
	//二级webview 
	subWV = mui.preload({
		id: 'subWV',
		url: './page/template/index.html'
	});


	//点击头像显示菜单
	mui('header').on('tap', '.ucentet-btn', function() {
		if (isMenuShow == false) {
			openMenu();
		} else {
			closeMenu();
		}
	});
	//切换底部菜单
	mui('nav').on('tap', '.mui-tab-item', function() {
		var data = this.getAttribute('data');
		document.querySelector('.nav-active').classList.remove('nav-active');
		this.classList.add('nav-active');
		data = eval('(' + data + ')');
		header(data);
		mui.fire(bodyWV, "changeBar", data);

	});
	//添加帖子
	mui('header').on('tap', '#add-shuoshuo', function() {
		if (!user.uid()) {
			indexWV = plus.webview.getLaunchWebview();
			mui.fire(indexWV, 'login');
			return false;
		}
		var subWV = plus.webview.getWebviewById('subWV');
		data = {
			url: '../blog/add.html',
			title: '添加内容'
		}
		mui.fire(subWV, "openWindow", data);
	});
	//显示菜单事件
	window.addEventListener('showMenu', function(e) {
		if (isMenuShow == false) {
			openMenu();
		} else {
			closeMenu();
		}
	});
	window.addEventListener('closeMenu', function(e) {
		if (isMenuShow == true) {
			closeMenu();
		}
	});
	//打开窗口事件
	window.addEventListener('openLocaPage', function(e) {
		mui.fire(subWV, "openWindow", e.detail);
	});
	mui('body').on('tap', '.login-btn', function() {
		login();
	});
	//登录事件
	window.addEventListener('login', function(e) {
		login();
	});
	//重载头部事件
	window.addEventListener('loadHeader', function(e) {
		var activeData = document.querySelector('.nav-active').getAttribute('data');
		data = eval('(' + activeData + ')');
		header(data);

		user.getInfo(user.uid(), function(info) {
			if (info.lv < 1 && !store.get('tip_lv1')) {
				store.set('tip_lv1', true, '80000');
				plus.nativeUI.toast('请点击左上角头像完善用户信息!');
			}
		});
	});

	setTimeout(function() {
		var activeData = document.querySelector('.nav-active').getAttribute('data');
		data = eval('(' + activeData + ')');
		header(data);

		//发送设备信息,并返回信息
		system.sendDeviceInfo(function(rs) {

			if (rs.data.title && rs.data.context) {
				noticeWV = plus.webview.getWebviewById('notice');
				if (!noticeWV) {
					noticeWV = plus.webview.create('./page/public/notice.html', 'notice');
				}
				mui.fire(noticeWV, 'open', rs.data);
			}
		});
	}, 1000);



});


function openMenu() {
	if (isMenuShow == false) {
		ucenter = plus.webview.getWebviewById('ucenter');
		if (ucenter.isVisible() == false) {
			ucenter.show();
		}
		selfWV.setStyle({
			left: '70%',
			transition: {
				duration: 150
			}
		});
		ucenter.setStyle({
			left: '0%',
			transition: {
				duration: 150
			}
		});
		mui.fire(ucenter, 'loadUserInfo');
		isMenuShow = true;
	}
}

function closeMenu() {
	if (isMenuShow == true) {
		ucenter = plus.webview.getWebviewById('ucenter');
		selfWV.setStyle({
			left: '0%',
			transition: {
				duration: 150
			}
		});
		ucenter.setStyle({
			left: '-100%',
			transition: {
				duration: 150
			}
		});
		isMenuShow = false;
	}
}

function login() {
	//防止重复点击
	if (isOpenLogin == 1) {
		return;
	}
	loginWebView = mui.openWindow({
		url: './page/public/login.html',
		id: 'loginWebView',
		show: {
			autoShow: true,
			duration: 300,
			aniShow: 'slide-in-bottom'
		},
		waiting: {
			autoShow: false
		}
	});
	isOpenLogin = 1;
	setTimeout(function() {
		isOpenLogin = 0;
	}, 3000);
}

//头部菜单
function header(data) {
	var uid = user.uid();
	user.getInfo(uid, function(info) {
		data.avatar = info.avatar;
		data.uid = info.uid;
		var html = template('tpl-header', data);
		document.querySelector('#header').innerHTML = html;
	});

}

function getNoticeNum() {
	var url = host + '?m=notice&a=countNotRead';
	var uid = user.uid();
	var utoken = cache('utoken');
	if (!uid) {
		return;
	}
	return;
	$.get(url, {
		uid: uid,
		utoken: utoken
	}, function(rs) {
		if (rs.status) {
			var num = rs.data;
			console.log('getNoticeNum：' + num);
			if (num > 0) {
				document.querySelector('#notice-num').innerHTML = '<span class="mui-badge">' + num + '</span>';
			} else {
				document.querySelector('#notice-num').innerHTML = '';
			}
		} else {
			console.log('getNoticeNum：' + rs.message);
		}
	})
}