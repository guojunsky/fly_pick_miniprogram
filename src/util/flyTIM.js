import TIM from 'tim-wx-sdk';
// 发送图片、文件等消息需要腾讯云即时通信IM上传插件
import TIMUploadPlugin from 'tim-upload-plugin';

import {SDKAppID, FlyIMGroupId} from '@/util/common'
import {tenantLogin, distributeMember} from "@/api/tim";
import store from '@/store/index'
import {phoneDeal} from '@/util/index'

let flyTIM = null;

export function resetFlyTIMInstance() {
    if (flyTIM) {
        flyTIM.logout();
    }

    flyTIM = null
}

//初始化及登录
export function getFlyTIMInstance() {
    if (!flyTIM) {
        let options = {
            SDKAppID: SDKAppID // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
        };

        // 创建 SDK 实例，TIM.create() 方法对于同一个 SDKAppID 只会返回同一份实例
        flyTIM = TIM.create(options); // SDK 实例通常用 tim 表示
        flyTIM.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
        // 注册腾讯云即时通信IM上传插件
        flyTIM.registerPlugin({'tim-upload-plugin': TIMUploadPlugin});
        registerEvents(flyTIM)

    }
    return flyTIM
}

//获取userSig
function getUserSig() {
    //todo 租户登录入参,暂时写死
    const appKey = "8gi93u02";
    const appSecret = "192117964382";
    return tenantLogin({
        appKey,
        appSecret
    })
}

//用户登录 开始登录 userID为base myUid
export async function timUserLogin(groupId, {success = null, fail = null} = {}) {
    //从接口获取 userSig
    try {
        const res = await getUserSig();
        console.log("租户登录", res)
        if (res.ret_code === '0000') {
            let myUid = uni.getStorageSync('myUid') || '';
            await flyTIM.login({userID: myUid, userSig: res.userSig});
            //分配客服
            store.commit('chat/setChatToken', res.token)

            //检查tim是否已经ready
            let count = 0
            let time = setInterval(() => {
                if (store.state.chat.isSdkReady) {
                    clearInterval(time)
                    //获取客服userID
                    getServiceUserID(res.token, groupId, {success, fail})
                } else {
                    count++
                }
                if (count > 20) {
                    clearInterval(time)
                    fail && fail({ret_code: -1, ret_msg: 'TIM ready超时'})
                }
            }, 500)

        } else {
            fail && fail(res)
        }

    } catch (e) {
        fail && fail({ret_code: -1, ret_msg: '登录失败'})
        console.log("租户登录error", e)
    }
}

//获取客服userID
async function getServiceUserID(token, groupId, {success = null, fail = null} = {}) {
    //先写死一个groupId 6cf401bc9dac4d07a3379d6908c2c8de
    let myUid = uni.getStorageSync('myUid') || '';

    let nickName = "";
    let avatar = ""
    let userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
        let userData = JSON.parse(userInfo)
        nickName = phoneDeal(userData.phone)
        avatar = userData.avatar
    }
    try {
        const res = await distributeMember({
            groupId,
            token,
            tenantId: myUid,
            name: nickName,
            avatar
        })
        console.log("获取客服userID", res)
        if (res.ret_code === '0000') {
            store.commit('chat/setServiceInfo', res.seatsMember)
            // success && success(res)

            // 发起会话
            createConversation({success, fail})
        } else {
            fail && fail(res)
        }
    } catch (e) {
        fail && fail({ret_code: -1, ret_msg: '分配客服失败'})
    }
}

//检查tim是否已经ready
function checkTIMReady({success = null, fail = null} = {}) {
    let count = 0
    let time = setInterval(() => {
        if (store.state.chat.isSdkReady) {
            clearInterval(time)
            // 发起会话
            createConversation({success, fail})
        } else {
            count++
        }
        if (count > 20) {
            clearInterval(time)
            fail && fail({ret_code: -1, ret_msg: 'TIM ready超时'})
        }
    }, 500)
}

//发起会话
function createConversation({success = null, fail = null} = {}) {
    console.log("发起会话", store.state.chat.serviceInfo.id)
    store.dispatch('chat/checkoutConversation')
        .then((res) => {
            success && success(res)
        })
        .catch((e) => {
            fail && fail({ret_code: -1, ret_msg: '发起会话失败'})
        })
}


// 注册监听事件
function registerEvents(tim) {
    tim.off(TIM.EVENT.SDK_READY, onReadyStateUpdate, this)
    tim.on(TIM.EVENT.SDK_READY, onReadyStateUpdate, this)
    // tim.on(TIM.EVENT.SDK_NOT_READY, onReadyStateUpdate, this)
    //
    // tim.on(TIM.EVENT.KICKED_OUT, kickOut, this)
    // tim.on(TIM.EVENT.ERROR, onError, this)
    //
    // tim.on(TIM.EVENT.MESSAGE_RECEIVED, messageReceived, this)
    // tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, convListUpdate, this)
    // tim.on(TIM.EVENT.GROUP_LIST_UPDATED, groupListUpdate, this)
    // tim.on(TIM.EVENT.BLACKLIST_UPDATED, blackListUpdate, this)
    // tim.on(TIM.EVENT.NET_STATE_CHANGE, netStateChange, this)
    // tim.on(TIM.EVENT.MESSAGE_READ_BY_PEER, onMessageReadByPeer, this)
}

function onReadyStateUpdate({name}) {
    const isSDKReady = (name === TIM.EVENT.SDK_READY)
    console.log("isSDKReady====>", isSDKReady)
    // if (isSDKReady) {
    //     wx.$app.getMyProfile().then(res => {
    //         store.commit('updateMyInfo', res.data)
    //     })
    //     wx.$app.getBlacklist().then(res => {
    //         store.commit('setBlacklist', res.data)
    //     })
    // }
    store.commit('chat/setSdkReady', isSDKReady)
}

function kickOut(event) {
    store.dispatch('resetStore')
    wx.showToast({
        title: '你已被踢下线',
        icon: 'none',
        duration: 1500
    })
    setTimeout(() => {
        wx.reLaunch({
            url: '../login/main'
        })
    }, 500)
}

function onError(event) {
    // 网络错误不弹toast && sdk未初始化完全报错
    if (event.data.message && event.data.code && event.data.code !== 2800 && event.data.code !== 2999) {
        store.commit('showToast', {
            title: event.data.message,
            duration: 2000
        })
    }
}

function checkoutNetState(state) {
    switch (state) {
        case TIM.TYPES.NET_STATE_CONNECTED:
            return {title: '已接入网络', duration: 2000}
        case TIM.TYPES.NET_STATE_CONNECTING:
            return {title: '当前网络不稳定', duration: 2000}
        case TIM.TYPES.NET_STATE_DISCONNECTED:
            return {title: '当前网络不可用', duration: 2000}
        default:
            return ''
    }
}

function netStateChange(event) {
    console.log(event.data.state)
    store.commit('showToast', checkoutNetState(event.data.state))
}

function onMessageReadByPeer(event) {
    console.log(event)
}

function messageReceived(event) {
    console.log("消息接收 messageReceived 55555555")
    // for (let i = 0; i < event.data.length; i++) {
    //     let item = event.data[i]
    //     if (item.type === TYPES.MSG_GRP_TIP) {
    //         if (item.payload.operationType) {
    //             $bus.$emit('groupNameUpdate', item.payload)
    //         }
    //     }
    // }
    // store.dispatch('onMessageEvent', event)
}

function convListUpdate(event) {
    store.commit('updateAllConversation', event.data)
}

function groupListUpdate(event) {
    store.commit('updateGroupList', event.data)
}

function blackListUpdate(event) {
    store.commit('updateBlacklist', event.data)
}
