import {resetFlyTIMInstance} from "@/util/flyTIM";
import store from "@/store";
import {userMessageList} from "@/api/tim";
import {showMessage} from "@/util";
import dayjs from "dayjs";

export default {
    namespaced: true,
    state: {
        isSdkReady: false,
        chatToken: "",
        serviceInfo: null,//当前客服信息
        messageList: [],//聊天记录列表
    },
    getters: {
        isSdkReady: state => state.isSdkReady,
        chatToken: state => state.chatToken,
        serviceInfo: state => state.serviceInfo,
        messageList: state => state.messageList,
    },
    mutations: {
        setSdkReady(state, payload) {
            state.isSdkReady = payload
        },
        setChatToken(state, payload) {
            state.chatToken = payload
        },
        setServiceInfo(state, payload) {
            state.serviceInfo = payload
        },
        //重置当前对话
        resetCurrentConversation(state, payload) {
            state.isSdkReady = false;
            state.chatToken = "";
            state.serviceInfo = null;//当前客服信息
            state.messageList = [];//聊天记录列表
            resetFlyTIMInstance()
        },
        setMessageList(state, payload) {
            state.messageList = payload
        },
    },
    actions: {
        //获取消息记录
        async getMessageList({commit}) {
            //todo 聊天记录列表
            let myUid = uni.getStorageSync('myUid') || '';
            let token = store.state.chat.chatToken || ''
            let uid = store.state.chat.serviceInfo.id || ''
            try {
                const res = await userMessageList({token, uid: myUid})
                if (res.ret_code === '0000') {
                    console.log("消息列表", res)
                    let list = res.logSessions;
                    list.map(item => {
                        item.type = 'text';
                        item.val = '';
                        let data = item.msgBody[0].MsgContent['Text'];
                        if (data) {
                            let obj = JSON.parse(data)
                            if (obj['text']) {
                                item.type = 'text';
                                item.val = obj['text']
                            } else if (obj['img']) {
                                item.type = 'img';
                                item.val = obj['img']
                            }
                        }

                        //处理聊天时间
                        let date1 = dayjs(item.createAt).format('YYYY-MM-DD')
                        let now = dayjs(new Date().getTime(), 'YYYY-MM-DD')
                        item.createTime = ""
                        let diff = now.diff(date1, 'day')
                        if (diff) { //不是当天
                            item.createTime = dayjs(item.createAt).format('MM-DD HH:mm')
                        } else {
                            item.createTime = dayjs(item.createAt).format('HH:mm')
                        }
                    })
                    commit('setMessageList', list);
                } else {
                    showMessage(res && res.ret_msg || '获取消息失败')
                }
            } catch (e) {

                console.log(e)
                showMessage('获取消息失败')
            }

        },
        async checkoutConversation(context, conversationID) {
            return Promise.resolve()
        }
    }
}
