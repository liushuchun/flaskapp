var utoken, uid;
var host = 'http://120.25.237.19:8080';


//var static_host = 'http://app-img.fengqiaoju.com';

var animationIn = 'fade-in';
var animationOut = 'fade-out';
var appinfo = {};
mui.plusReady(function() {

	if (mui.os.ios) {
		animationIn = 'pop-in';
		animationOut = 'pop-out';
	}
	plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
		//appid属性
		appinfo.appid = wgtinfo.appid;
		//version属性
		appinfo.version = wgtinfo.version;
		//name属性
		appinfo.name = wgtinfo.name;
	});
});

//保存数据
function cache(key, val) {
	if (key == 'clear') {
		localStorage.clear();
	} else if (val === null) {
		window.localStorage.removeItem(key);
	} else if (val) {
		window.localStorage[key] = val;

	} else {
		return window.localStorage[key];
	}
}

//本地存储
var store = {
	set: function(key, val, exp) {
		var obj = plus.storage;
		var nowtime = new Date().getTime() / 1000;

		exp = exp ? exp : 3600 * 24 * 7; //默认有效期7天
		val = JSON.stringify({
			val: val,
			exp: exp,
			time: nowtime
		});
		obj.setItem(key, val);
	},

	get: function(key) {
		var obj = plus.storage;
		var info = obj.getItem(key);
		var nowtime = new Date().getTime() / 1000;
		var network = plus.networkinfo.getCurrentType();
		if (!info) {
			return null;
		}
		info = JSON.parse(info);

		//没网络不判断过期时间
		if (network <= 1) {
			return info.val
		}
		if (nowtime - info.time > info.exp) {
			this.delete(key);
			return null;
		}

		return info.val;
	},
	delete: function(key) {
		var obj = plus.storage;
		obj.removeItem(key);
		this.set(key, null, 0);
	},
	clear: function(key) {
		var obj = plus.storage;
		obj.clear();
	}
}

//获取url参数
function get(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}

function alert(msg) {
	plus.nativeUI.alert(msg);
}

//获取图片,优先从缓存获取
function getImg(src) {
	return src;
}

//获取用户信息,并执行函数
function getUserInfo(uid, obj) {
	info = cache('userinfo_' + uid);
	if (info) {
		info = JSON.parse(info);
		if (isJson(info)) {
			obj(info);
			return;
		}
	}

	var url = host + '?m=user&a=userInfo';
	$.get(url, {
		uid: uid
	}, function(rs) {
		if (rs.status) {
			info = rs.data;
			cache('userinfo_' + uid, JSON.stringify(info));
			obj(info);
			return;
		}
	});
}

var user = {
	'uid': function() {
		return store.get('uid');
	},
	'utoken': function() {
		return store.get('utoken');
	},
	'uploadAvatar': function(base64, obj) {
		var url = host + '?m=upload&a=avatar';
		ajax.post(url, {
			uid: this.uid(),
			file: base64
		}, obj);
	},
	'updateAvatar': function(avatarUrl, obj) {
		var url = host + '?m=user&a=updateAvatar';
		var uid = this.uid();
		ajax.post(url, {
			uid: uid,
			utoken: this.utoken(),
			avatar: avatarUrl
		}, obj);
		this.deleteCache(uid);
	},
	'updateAddr': function(addr, obj) {
		var url = host + '?m=user&a=updateAddr';
		var uid = this.uid();
		ajax.post(url, {
			uid: uid,
			utoken: this.utoken(),
			addr: addr,
		}, obj);
		this.deleteCache(uid);
	},
	'updateEmail': function(email, password, obj) {
		var url = host + '?m=user&a=sendUpdateEmail';
		var uid = this.uid();
		ajax.post(url, {
			uid: uid,
			password: password,
			utoken: this.utoken(),
			email: email,
		}, obj);
		//console.log(url+'&uid='+uid+'&password='+password+'&utoken='+this.utoken()+"&email="+email);
		this.deleteCache(uid);
	},
	'updateSex': function(sex, obj) {
		var url = host + '?m=user&a=updateSex';
		var uid = this.uid();
		ajax.post(url, {
			uid: uid,
			utoken: this.utoken(),
			sex: sex,
		}, obj);
		this.deleteCache(uid);
	},
	'updatePhone': function(phone, password, phonecode, obj) {
		var url = host + '?m=user&a=updatePhone';
		var uid = this.uid();
		ajax.post(url, {
			uid: uid,
			utoken: this.utoken(),
			phone: phone,
			password: password,
			phonecode: phonecode,
		}, obj);
		this.deleteCache(uid);
	},
	'getInfo': function(uid, obj) {
		var key = 'user@info_' + uid;
		info = store.get(key);
		if (info) {
			obj(info);
			return;
		}
		var url = host + '?m=user&a=userInfo';
		ajax.get(url, {
			uid: uid
		}, function(rs) {
			if (rs.status) {
				info = rs.data;
				store.set(key, info);
				obj(info);
				return;
			}
		});
	},
	'deleteCache': function(uid) {
		var uid = uid ? uid : this.uid();
		var key = 'user@info_' + uid;
		store.delete(key);
	},
	'login': function(username, password, obj) {
		var url = host + '?m=user&a=login';
		if (!username) {
			alert('请填写用户名');
			return;
		}
		if (!password) {
			alert('请填写密码');
			return;
		}
		ajax.post(url, {
			username: username,
			password: password
		}, obj)
	},
	'register': function(username, password, email, sex, longitude, latitude, obj) {
		var url = host + '/api/v1.0/register/';
		if (username.length < 4 || username.length > 30) {
			alert('账号必须4~30字符内,现在:' + username.length);
			return false;
		}
		if (password.length < 6 || password.length > 50) {
			alert('密码必须为6~50个字符内,现在:' + password.length);
			return false;
		}
		ajax.post(url, {
			name: username,
			password: password,
			email: email,
			longitude: longitude,
			latitude:latitude,
			sex: sex,
		}, obj)
	},
	'logout': function() {
		uid = this.uid();
		user.deleteCache(uid); //清空缓存 
		store.delete('uid');
		store.delete('utoken');
	},
	'updateLV': function(obj) {
		var url = host + '?m=user&a=updateLV';
		ajax.get(url, {
			uid: this.uid(),
			utoken: this.utoken()
		}, obj);
	},
	'checkUsername': function(username, obj) {
		var url = host + '?m=validation&a=checkUsername';
		ajax.get(url, {
			username: username,
		}, obj);
	}
}

var baike = {
	'getInfo': function(id, obj) {
		var key = 'baike@info_' + id;
		info = store.get(key);
		if (info) {
			if (isJson(info)) {
				obj(info);
				return;
			}
		}
		var url = host + '?m=baike&a=info';
		ajax.get(url, {
			id: id
		}, function(rs) {
			if (rs.status) {
				info = rs.data;
				store.set(key, info);
				obj(info);
				return;
			}
		});
	},
	'list': function(surl, keyword, page, obj) {
		var key = 'baike@surl:' + surl + ';keyword:' + keyword + ';page:' + page;
		var data = store.get(key);

		if (isJson(data)) {
			if (data.total_num > 0) {
				obj(data);
				return;
			}
		}

		var url = host + '?m=baike&a=search';
		ajax.get(url, {
			surl: surl,
			page: page,
			'key': keyword
		}, function(rs) {
			if (rs.status) {
				data = rs.data;
				store.set(key, data, 600);
				obj(data);
				return;
			}
		});
	},
	'addView': function(id) {
		var arr = new Array();
		if (!id) {
			return false;
		}

		var key = 'baike@addview';
		var str = store.get(key) ? store.get(key) : '0';

		if (str.indexOf(',' + id + ',') > 0) {
			//存在返回true
			return true;
		} else {
			//不存在+1
			var val = str + ',' + id + ',';
			store.set(key, val, 3600 * 24 * 30); //30天不重复统计
			var url = host + '?m=baike&a=addViewnum';
			ajax.get(url, {
				id: id
			}, function(rs) {
				if (rs.status) {

				} else {
					console.log(rs.message)
				}
			});
		}
	}
}

var article = {
	'getInfo': function(id, obj) {
		var key = 'article@info_' + id;
		info = store.get(key);
		if (info) {
			if (isJson(info)) {
				obj(info);
				return;
			}
		}
		var url = host + '?m=article&a=info';
		ajax.get(url, {
			id: id
		}, function(rs) {
			if (rs.status) {
				info = rs.data;
				store.set(key, info);
				obj(info);
				return;
			}
		});
	},
	'list': function(surl, page, obj) {
		var key = 'article@surl:' + surl + ';page:' + page;
		var data = store.get(key);
		if (isJson(data)) {
			if (data.total_num > 0) {
				obj(data);
				return;
			}
		}

		var url = host + '?m=article&a=search';
		ajax.get(url, {
			surl: surl,
			page: page
		}, function(rs) {
			if (rs.status) {
				data = rs.data;
				store.set(key, data, 60);
				obj(data);
				return;
			}
		});
	},
	'addView': function(id) {
		var arr = new Array();
		if (!id) {
			return false;
		}

		var key = 'article@addview';
		var str = store.get(key) ? store.get(key) : '0';

		if (str.indexOf(',' + id + ',') > 0) {
			//存在返回true
			return true;
		} else {
			//不存在+1
			var val = str + ',' + id + ',';
			store.set(key, val, 3600 * 24 * 30); //30天不重复统计
			var url = host + '?m=article&a=addViewnum';
			ajax.get(url, {
				id: id
			}, function(rs) {
				if (rs.status) {

				} else {
					console.log(rs.message)
				}
			});
		}
	}
}

//开始网络请求
function startNetwork() {
	var n = plus.networkinfo.getCurrentType();
	watingSec = 30000;
	if (n <= 1) {
		alert('请检查网络设置');
		return false;
	}
	var w = plus.nativeUI.showWaiting();
	w.background = '#ffffff';
	setTimeout(function() {
		plus.nativeUI.closeWaiting();
	}, watingSec);
}


//网络请求结束
function endNetwork() {
	plus.nativeUI.closeWaiting();
}

//判断是否json格式
function isJson(obj) {
	var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length
	return isjson;
}

//获取url参数
function get(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}


//读取缓存图片
function getImg(src) {
	//var doc = plus.io.PRIVATE_DOC;;
	return src;
}

//封装ajax方法
function ajaxGet(url, data, obj) {
	$.get(url, data, obj);
}

var ajax = {
	'post': function(url, data, obj) {
		//startNetwork();
		data=JSON.stringify(data);
		console.log(data);
		$.ajax({
			type: 'POST',
			url: url,
			contentType: "application/json",
            accepts: "application/json",
            cache: false,
            dataType: 'json',
			data: data,
			timeout: 300 * 1000,
			success: obj,
			complete: function() {
				endNetwork();
			},
			error: function(e, type) {
				endNetwork();
				plus.nativeUI.toast("数据加载失败，请返回重试!(" + type + ")");
				console.log('ajax 错误(' + type + '):' + url);
			}
		})
	},
	'get': function(url, data, obj) {
		startNetwork();
		data=JSON.stringify(data);
		$.ajax({
			type: 'get',
			url: url,
			data: data,
			contentType: "application/json",
            accepts: "application/json",
            cache: false,
			dataType: 'json',
			timeout: 300 * 1000,
			success: obj,
			complete: function() {},
			error: function(e, type) {
				plus.nativeUI.toast("数据加载失败，请返回重试!(" + type + ")");
				console.log('ajax 错误(' + type + '):' + url);
				console.log(type);
				console.log(type.readyState);
			}
		});
	}
}

var blog = {
	'add': function(context, photo, obj) {
		var url = host + '?m=blog&a=add';
		ajax.post(url, {
			uid: user.uid(),
			utoken: user.utoken(),
			photo: photo,
			context: context
		}, obj);
	},
	'my': function(page, obj, clearcache) {
		if (!user.uid()) {
			indexWV = plus.webview.getLaunchWebview();
			mui.fire(indexWV, 'login');
			return false;
		}
		var key = 'blog@my-page:' + page;
		if (!clearcache) {
			var data = store.get(key);
			if (isJson(data)) {
				if (data.total_num > 0) {
					obj(data);
					return;
				}
			}
		}
		var url = host + '?m=blog&a=my';
		ajax.get(url, {
			uid: user.uid(),
			page: page,
			utoken: user.utoken()
		}, function(rs) {
			if (rs.status) {
				data = rs.data;
				store.set(key, data, 1);
				obj(data);
				return;
			} else {
				obj({});
			}
		});
	},
	'hot': function(page, obj) {
		var key = 'blog@hot-page:' + page;

		var data = store.get(key);
		if (isJson(data)) {
			if (data.total_num > 0) {
				obj(data);
				return;
			}
		}

		var url = host + '?m=blog&a=hot';
		ajax.get(url, {
			page: page
		}, function(rs) {
			if (rs.status) {
				data = rs.data;
				store.set(key, data, 60);
				obj(data);
				return;
			} else {
				obj({});
			}
		});
	},
	'getInfo': function(id, obj) {
		var key = 'blog@info_' + id;
		info = store.get(key);
		if (info) {
			if (isJson(info)) {
				obj(info);
				return;
			}
		}
		var url = host + '?m=blog&a=info';
		ajax.get(url, {
			id: id
		}, function(rs) {
			if (rs.status) {
				info = rs.data;
				store.set(key, info);
				obj(info);
				return;
			}
		});
	},
	'delete': function(id, obj) {
		var url = host + '?m=blog&a=delete';
		ajax.get(url, {
			uid: user.uid(),
			id: id,
			utoken: user.utoken()
		}, obj);
	},
	'addComment': function(context, fid, obj) {
		var uid = user.uid();
		if (!uid) {
			indexWV = plus.webview.getLaunchWebview();
			mui.fire(indexWV, 'login');
			return false;
		}
		var url = host + '?m=blog&a=addComment';
		ajax.post(url, {
			uid: uid,
			utoken: user.utoken(),
			fid: fid,
			context: context
		}, obj);
	},
	'commentList': function(id, page, obj, clearcache) {

		var key = 'blog@comment-id:' + id + ';page:' + page;
		if (!clearcache) {
			var data = store.get(key);
			if (isJson(data)) {
				if (data.total_num > 0) {
					obj(data);
					return;
				}
			}
		}
		var url = host + '?m=blog&a=searchComment';
		ajax.get(url, {
			id: id
		}, function(rs) {
			if (rs.status) {
				data = rs.data;
				store.set(key, data, 300);
				obj(data);
				return;
			} else {
				obj({});
			}
		});
	}
};

var question = {
	'add': function(objType, photo, context, surl, obj) {
		var url = host + '?m=question&a=add';
		ajax.post(url, {
			type: objType,
			uid: user.uid(),
			utoken: user.utoken(),
			photo: photo,
			context: context,
			surl: surl
		}, obj);
	},
	'my': function(surl, page, obj) {
		var key = 'question@my-surl:' + surl + ';page:' + page;
		var data = store.get(key);

		if (isJson(data)) {
			if (data.total_num > 0) {
				obj(data);
				return;
			}
		}

		var url = host + '?m=question&a=my';
		ajax.get(url, {
			uid: user.uid(),
			utoken: user.utoken()
		}, function(rs) {
			if (rs.status) {
				data = rs.data;
				store.set(key, data, 1);
				obj(data);
				return;
			}
		});
	},
	'getInfo': function(id, obj) {
		var key = 'question@info_' + id;
		info = store.get(key);
		if (info) {
			if (isJson(info)) {
				obj(info);
				return;
			}
		}
		var url = host + '?m=question&a=info';
		ajax.get(url, {
			id: id
		}, function(rs) {
			if (rs.status) {
				info = rs.data;
				store.set(key, info);
				obj(info);
				return;
			}
		});
	},
	'list': function(surl, type, page, obj) {
		var key = 'question@list-surl:' + surl + ';type:' + type + ';page:' + page;
		var data = store.get(key);
		data = null;
		if (isJson(data)) {
			if (data.total_num > 0) {
				obj(data);
				return;
			}
		}

		var url = host + '?m=question&a=search';
		ajax.get(url, {
			surl: surl,
			type: type,
			page: page
		}, function(rs) {
			if (rs.status) {
				data = rs.data;
				store.set(key, data, 60);
				obj(data);
				return;
			}
		});
	}
};
var answer = {
	'add': function(qid, context, obj) {
		var url = host + '?m=answer&a=add';
		var uid = user.uid();
		if (!uid) {
			indexWV = plus.webview.getLaunchWebview();
			mui.fire(indexWV, 'login');
			return false;
		}
		if (!system.allCHN(context) || context.length > 8) {
			alert('花卉名字必须是1~8个字的全中文');
			return false;
		}
		if (context.indexOf('不知') >= 0 || context.indexOf('不清') >= 0 || context.indexOf('什么') >= 0 || context.indexOf('好像') >= 0 || context.indexOf('这是') >= 0) {
			alert('请回答正确的名字');
			return false;
		}
		ajax.post(url, {
			uid: uid,
			utoken: user.utoken(),
			qid: qid,
			context: context
		}, obj);
	},
	'my': function(page, obj) {
		var key = 'anwer@my-page:' + page;
		var data = store.get(key);

		if (isJson(data)) {
			if (data.total_num > 0) {
				obj(data);
				return;
			}
		}

		var url = host + '?m=answer&a=my';
		ajax.get(url, {
			uid: user.uid(),
			utoken: user.utoken()
		}, function(rs) {
			if (rs.status) {
				data = rs.data;
				store.set(key, data, 1);
				obj(data);
				return;
			}
		});
	},
	'hasAnswer': function(id, obj) {
		var url = host + '?m=answer&a=hasAnswer';
		ajax.get(url, {
			id: id,
			uid: user.uid()
		}, obj);
	},
	'getInfo': function(id, obj) {
		var key = 'answer@info_' + id;
		info = store.get(key);
		if (info) {
			if (isJson(info)) {
				obj(info);
				return;
			}
		}
		var url = host + '?m=anser&a=info';
		ajax.get(url, {
			id: id
		}, function(rs) {
			if (rs.status) {
				info = rs.data;
				store.set(key, info);
				obj(info);
				return;
			}
		});
	},
	'list': function(qid, page, obj) {
		var key = 'question@list-qid:' + qid + 'page:' + page;
		var data = store.get(key);
		if (isJson(data)) {
			if (data.total_num > 0) {
				obj(data);
				return;
			}
		}

		var url = host + '?m=answer&a=search';
		ajax.get(url, {
			qid: qid,
			page: page
		}, function(rs) {
			if (rs.status) {
				data = rs.data;
				store.set(key, data, 60);
				obj(data);
				return;
			}
		});
	}
};
var system = {
	'upload': function(file, dir, obj) {
		var url = host + '?m=upload&a=upload';
		ajax.post(url, {
			uid: user.uid(),
			utoken: user.utoken(),
			dir: dir,
			file: file
		}, obj);
	},
	'get': function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]);
		return null;
	},
	//建议反馈
	'addGuestbook': function(context, info, obj) {
		var url = host + '?m=guestbook&a=add';
		ajax.get(url, {
			uid: user.uid(),
			context: context,
			info: info
		}, obj);
	},
	'open': function(url, id, extras) {
		mui.openWindow({
			id: id,
			url: url,
			show: {
				autoShow: false,
				duration: 1
			},
			waiting: {
				autoShow: false
			},
			extras: extras
		});
	},
	'allCHN': function(str) {
		var reg = /^[\u0391-\uFFE5]{1,8}$/;
		if (!reg.test(str)) {
			return false;
		} else {
			return true;

		}
	},
	'sendDeviceInfo': function(obj) {
		var url = host + '?m=device&a=add';
		var types = {};
		types[plus.networkinfo.CONNECTION_UNKNOW] = "未知";
		types[plus.networkinfo.CONNECTION_NONE] = "未连接网络";
		types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
		types[plus.networkinfo.CONNECTION_WIFI] = "WiFi网络";
		types[plus.networkinfo.CONNECTION_CELL2G] = "2G蜂窝网络";
		types[plus.networkinfo.CONNECTION_CELL3G] = "3G蜂窝网络";
		types[plus.networkinfo.CONNECTION_CELL4G] = "4G蜂窝网络";
		var network = types[plus.networkinfo.getCurrentType()];
		var uid = user.uid();
		var key = 'user@info_' + uid;
		var u = store.get(key);
		var username = u ? u.username : '';
		setTimeout(function() {
			ajax.post(url, {
				uid: uid,
				username: username,
				app_id: appinfo.appid,
				app_name: appinfo.name,
				app_version: appinfo.version,
				device_model: plus.device.model, //设备型号
				device_vendor: plus.device.vendor, //厂商
				device_imei: plus.device.imei,
				device_uuid: plus.device.uuid,
				device_screen: plus.screen.resolutionWidth * plus.screen.scale + "x" + plus.screen.resolutionHeight * plus.screen.scale, //分辨率
				os_name: plus.os.name,
				os_version: plus.os.version,
				os_language: plus.os.language,
				os_vendor: plus.os.vendor,
				network: network

			}, obj);
		}, 100);
	}
}

var message = {
	'init': function() {
		// 监听点击消息事件
		plus.push.addEventListener("click", function(msg) {
			// 判断是从本地创建还是离线推送的消息
			switch (msg.payload) {
				case "LocalMSG":
					//点击本地创建消息启动
					break;
				default:
					//点击离线推送消息启动
					break;
			}
			plus.nativeUI.alert(msg.content);
		}, false);
	},
	'create': function(context) {
		plus.push.createMessage(context, "LocalMSG", {
			cover: true
		});
	}
}