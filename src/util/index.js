import {
	getUser,
	wxLogin
} from "@/api/user";
import {
	CosConfigApi
} from "@/api/index.js";
import {
	appId
} from "@/util/common";
import store from '@/store/index'

var CosAuth = require('./cos-auth.min.js');

export function showToast(options) {
	uni.showToast(options)
}

//验证是否登录
export function handlerCheckLogin({
	success = null,
	fail = null,
	done = null
} = {}) {
	let myUid = uni.getStorageSync('myUid');
	let auth = uni.getStorageSync('auth');
	let expire = uni.getStorageSync('expire');
	let currentTimestamp = new Date().getTime();

	if (myUid && expire >= currentTimestamp) { //已登录
		let userInfo = JSON.parse(uni.getStorageSync('userInfo'));
		// let res = await getUser()
		// debugger
		store.dispatch("user/toggleLogin", true);
		store.dispatch("user/toggleUserInfo", userInfo);
		if (success) success({
			userInfo: userInfo
		});
		if (done) done()

	} else { //未登录
		//跳转到登录页面
		uni.navigateTo({
			url: '/pages/login/index'
		})
		if (done) done()

	}
}

export const showMessage = (message, icon, duration) => {
	uni.showToast({
		title: message ? message : 'error',
		duration: duration ? duration : 1500,
		icon: icon ? icon : 'none'
	});
}

export const isInArray = (arr, data) => {
	const status = arr.indexOf(data) > -1
	return status
}

export const timeToDate = (time, format = ['.', '.', '']) => {
	if (!time) return
	const date = new Date(time)
	let year = date.getFullYear()
	let month = date.getMonth() + 1
	let day = date.getDate()
	month = month < 10 ? '0' + month : month
	day = day < 10 ? '0' + day : day
	const result = `${year}${format[0]}${month}${format[1]}${day}${format[2]}`
	return result
}

export const timeToMinute = (time, format = ['.', '.', '']) => {
	if (!time) return
	const date = new Date(time)
	let year = date.getFullYear()
	let month = date.getMonth() + 1
	let day = date.getDate()
	let hour = date.getHours()
	let minute = date.getMinutes()
	month = month < 10 ? '0' + month : month
	day = day < 10 ? '0' + day : day
	hour = hour < 10 ? '0' + hour : hour
	minute = minute < 10 ? '0' + minute : minute
	const result = `${year}${format[0]}${month}${format[1]}${day}${format[2]} ${hour}:${minute}`
	return result
}

//更新auth,用户信息
export function updateUserInfo(res) {
	uni.setStorageSync('auth', res.auth);
	uni.setStorageSync('expire', res.expire);
	uni.setStorageSync('myUid', res.userInfo.id);
	res.userInfo['lgId'] = res.lgId
	res.userInfo['lgType'] = res.type //1是主账号,2是区域负责人，3是取货员
	uni.setStorageSync('userInfo', JSON.stringify(res.userInfo));
	store.dispatch("user/toggleUserInfo", res.userInfo);
}

export async function removeUserInfo(res) {
	uni.removeStorageSync('auth');
	uni.removeStorageSync('expire');
	uni.removeStorageSync('myUid');
	uni.removeStorageSync('userInfo');
	await store.dispatch("user/toggleLogin", false);
	await store.dispatch("user/toggleUserInfo", "");
}

// 生成随机字符串
export function createRandomStr(
	length = 32,
	chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) {
	let result = ''
	for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
	return result
}

//处理物品信息weight
export function formatWeight(data) {
	let packageDetail = [];
	if (data) {
		packageDetail = data.map(item => {
			return {
				...item,
				weight: item.weight * 1000 || 0
			}
		})
	}
	return packageDetail
}

export function updateCheckPage() {
	const pages = getCurrentPages()
	const pickup_page = pages.find((item) => item.route === 'pages/pickup/index')
	if (pickup_page) {
		pickup_page.$vm.updateData()
	}
}

var Bucket = 'sendatek-1304710895';
var Region = 'ap-shanghai';
var ForcePathStyle = false;
var prefix = 'https://' + Bucket + '.cos.' + Region + '.myqcloud.com/';

// 对更多字符编码的 url encode 格式
var camSafeUrlEncode = function(str) {
	return encodeURIComponent(str)
		.replace(/!/g, '%21')
		.replace(/'/g, '%27')
		.replace(/\(/g, '%28')
		.replace(/\)/g, '%29')
		.replace(/\*/g, '%2A');
};
// 计算签名
var getAuthorization = function(tempdata, options, callback) {
	callback({
		XCosSecurityToken: tempdata.token,
		Authorization: CosAuth({
			SecretId: tempdata.secretId,
			SecretKey: tempdata.secretKey,
			Method: options.Method,
			Pathname: options.Pathname,
		})
	});
};

//图片预览
export function handlerPreviewImage(current, list) {
	const sources = list.map((item) => {
		return {
			url: item
		}
	})
	uni.previewMedia({
		sources,
		current
	})
}

//手机号脱敏
export function phoneDeal(str) {
	if (!str) return ''
	let pat = /(\d{3})\d*(\d{4})/
	let b = str.replace(pat, '$1****$2');
	return b
}
