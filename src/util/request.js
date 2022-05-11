import md5 from 'md5';
import {
    appId,
    cloudEnvId
} from '@/util/common';
import {
    showMessage
} from '@/util/index.js'
import {
    getCloudInstance
} from "@/util/wxCloud";
import {
    context
} from './context'
import {
    sassInterceptor
} from './sassInterceptor'
// const baseUrl = 'http://sendatek-2gp430wnd7fb8cb3-1304710895.ap-shanghai.app.tcloudbase.com/gateway'
const baseUrl = 'https://test.sendatek.com/gateway'


// const baseUrl = 'http://127.0.0.1:7654/gateway/' // mock server
let getHeaders = (headers) => {
    let params = headers['X-Ca-Signature-Headers'].split(',');
    let result = '';
    for (let i = 0; i < params.length; i++) {
        let headerKey = params[i];
        result += headerKey + ":" + headers[headerKey] + "\n";

    }
    return result;
}

let getSignature = (headers) => {
    let Headers = getHeaders(headers);
    let Path = '/gateway';
    let Accept = headers['Accept'];
    let ContentType = headers['Content-Type'];
    //浏览器不能传Date
    let dateTime = '';
    let ContentMD5 = headers['Content-MD5'];
    let appSecret = '5gT3hfB5';
    let stringToSign = 'POST' + "\n" +
        Accept + "\n" +
        ContentMD5 + "\n" +
        ContentType + "\n" +
        dateTime + "\n" +
        Headers +
        Path;
    return md5(stringToSign + appSecret);
}

function createHeaders(api, data) {
    let header = {
        'Content-Type': 'application/json',
        'Content-MD5': md5(JSON.stringify(data)),
        'Accept': 'application/json',
        'X-Ca-Api': api,
        'X-Ca-Appid': 'wuliu',
        'X-Ca-Version': '1.0',
        'X-Ca-Timestamp': new Date().getTime(),
        'X-Ca-Nonce': 'e807f1fcf82d132f9byh987bjn98', //随便给个
        'X-Ca-Signature-Headers': 'X-Ca-Appid,X-Ca-Nonce,X-Ca-Timestamp,X-Ca-Version',
    }
    let sign = getSignature(header);
    return Object.assign(header, {
        "X-Ca-Signature": sign
    })
}

function request(url, data = {}, autoAlert = true, noProxy = false, needValid = true) {
    if (!noProxy) {
        const proxy = sassInterceptor.pre(url, data)
        if (proxy) {
            return proxy
        }
    }

    if (needValid === true) {

        if (uni.getStorageSync('auth') === '') {
            uni.navigateTo({
                url: '/pages/login/index'
            })
            return
        }
    }


    // 处理一些基础参数 mock
    const baseInfo = {
        "channel": appId,
        "loginChannel": 2,
        "bzChannel": 1,
        "myUid": uni.getStorageSync('myUid') || '',
        "auth": uni.getStorageSync('auth') || '',
        // "leagueId": 'c15401476795495ab01db96c1885e4cb',// test 加盟商id
        "leagueId": uni.getStorageSync('userInfo') && (JSON.parse(uni.getStorageSync('userInfo'))['lgId'] || ''),
        "lgMyUid": uni.getStorageSync('lgMyUid') || '' //加盟商主账号id
    }

    if (context.baseParam) {
        Object.assign(baseInfo, context.baseParam)
    }

    // todo remove 测试账号
    // if(process.env.NODE_ENV === 'development'){
    // Object.assign(baseInfo, {"myUid":"1e74f7c6cef24f80b88dcdcda42d35d4","auth":"5n68djeVEYG+cI/yrvkmoi96H4/hXa8WsWZncCyQYg8=.COb7OTNQo2qi67+8R3Q5FBAgtdtUCLYHcSJGK12Sw085fTOAKSsqLKLrv7xHdDkUECC121QItgfBsKO7bips/a+O8s4WJZ+oTdZtAfa+kbHBzJXwpuEaVZe7YNhAR3wSmI8a71zDM2sKofzX+/TvmDiSZ+fqoycYJ39x/AQweep8tqOSdSUpzg==.e1b9f552eef473a8b62784c0e74cba7a237cbd04"})
    // }

    let headers = createHeaders(url, data)
    console.log("请求url", url)
    console.log("请求参数", {
        base: baseInfo,
        ...data
    })
    console.log("1请求参数", JSON.stringify({
        base: baseInfo,
        ...data
    }))


    return new Promise(async (resolve, reject) => {
        //修改为云托管 wx.cloud.callContainer
        let params = {
            method: 'POST',
            data: {
                base: baseInfo,
                ...data
            },
            header: headers,
            success: (res) => {
                const data = res.data
                console.log(`${url}  success`, res)
                if (autoAlert) {
                    if (data.ret_code === '0000') {
                        resolve(data)
                    } else {
                        showMessage(data.ret_msg)
                        reject(data)
                    }
                } else {
                    resolve(data)
                }
            },
            fail: (err) => {
                console.log(`${url} fail`, err)
                reject(err)
            }
        }

        if (process.env.IN_HOSTING === 'mp-weixin-cloud') {
            console.log("request mp-weixin-cloud")
            params['path'] = '/gateway/';
            let c1 = await getCloudInstance()
            await c1.init({
                env: cloudEnvId
            })
            await c1.callContainer(params)
        } else {
            params['url'] = baseUrl;
            uni.request(params);
        }
    })
}


export default request
