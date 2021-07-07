import {
    CosConfigApi
} from "@/api/index.js";

var CosAuth = require('./cos-auth.min.js');
var Bucket = 'sendatek-1304710895';
var Region = 'ap-shanghai';
var ForcePathStyle = true;
var prefix = 'https://' + Bucket + '.cos.' + Region + '.myqcloud.com/';
let durationSeconds = 0;
let saveTemp = ''
let expiredTime = ''
const fileRoot = 'mini/'
if (ForcePathStyle) {
    // 后缀式请求在签名时域名使用地域域名，而不是存储桶域名，具体说明见本文上述“3.后缀式请求”
    prefix = 'https://cos.' + Region + '.myqcloud.com/' + Bucket + '/';
}

// 对更多字符编码的 url encode 格式
var camSafeUrlEncode = function (str) {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
};

//获取临时密钥
const upload = async (filePath, callback) => {
    if (saveTemp && Date.now() / 1000 < (expiredTime + durationSeconds - 60)) {
        uploadFile(filePath, saveTemp, callback)
    } else {
        const res = await CosConfigApi({
            dir: 'mini'
        })
        if (res.ret_code == '0000') {
            durationSeconds = res.durationSeconds || 0
            saveTemp = res
            expiredTime = Date.now() / 1000
            uploadFile(filePath, res, callback)
        } else {
            callback(false)
        }
    }
}
// 计算签名
var getAuthorization = function (tempdata, options, callback) {
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
// 上传文件
var uploadFile = function (filePath, tempdata, callback) {
    var Key = filePath.substr(filePath.lastIndexOf('/') + 1); // 这里指定上传的文件名
    var signPathname = '/'; // PostObject 接口 Key 是放在 Body 传输，所以请求路径和签名路径是 /
    if (ForcePathStyle) {
        // 后缀式请求在签名时用的路径，要包含存储桶名称，具体说明见本文上述“3.后缀式请求”
        signPathname = '/' + Bucket + '/' + fileRoot;
    }
    const prefixUrl = prefix + fileRoot
    getAuthorization(tempdata, {
        Method: 'POST',
        Pathname: signPathname
    }, function (AuthData) {
        var requestTask = uni.uploadFile({
            url: prefixUrl,
            name: 'file',
            filePath: filePath,
            formData: {
                'key': fileRoot + Key,
                'success_action_status': 200,
                'Signature': AuthData.Authorization,
                'x-cos-security-token': AuthData.XCosSecurityToken,
                'Content-Type': '',
            },
            success: function (res) {
                var url = prefixUrl + camSafeUrlEncode(Key).replace(/%2F/g, '/');
                console.log(res.statusCode);
                console.log(url);
                if (/^2\d\d$/.test('' + res.statusCode)) {
                    if (callback) callback(url)
                } else {
                    console.log('res ==>', res.data)
                    wx.showModal({
                        title: '上传失败',
                        content: JSON.stringify(res),
                        showCancel: false
                    });
                    if (callback) callback(false)
                }
            },
            fail: function (res) {
                wx.showModal({
                    title: '上传失败',
                    content: JSON.stringify(res),
                    showCancel: false
                });
                if (callback) callback(false)
            }
        });
        requestTask.onProgressUpdate(function (res) {
            console.log('进度:', res);
        });
    });
};

export function uploadToCos(callback) {
    var that = this;
    // 选择上传的图片
    uni.chooseImage({
        sizeType: ['original', 'compressed'], // 图片类型 original 原图，compressed 压缩图，默认二者都有
        success: function (res) {
            // 获取文件路径
            var file = res.tempFiles[0];
            upload(file.path, callback);
        }
    })

}
