import store from "@/store";
import {userMessageList} from "@/api/tim";
import {showMessage} from "@/util";
import dayjs from "dayjs";
import {resetFlyTIMInstance} from "@/util/flyTIM";

export default {
    namespaced: true,
    state: {
        printOrder: null,//需要打印的订单信息
        deviceInfo: null,//设备信息
    },
    getters: {
        printOrder: state => state.printOrder,
        deviceInfo: state => state.deviceInfo
    },
    mutations: {
        setPrintOrder(state, payload) {
            state.printOrder = payload
        },
        setDeviceInfo(state, payload) {
            state.deviceInfo = payload
        },
        //重置打印相关信息
        resetPrintInfo(state, payload) {
            state.printOrder = null;
            state.deviceInfo = null;
        },
    },
    actions: {
        updatePrintOrder({state, commit}, data) {
            if (data.goods && data.goods.items && data.goods.items.length) {
                for (let i = 0; i < data.goods.items.length; i++) {
                    if(typeof data.goods.items[i]["selected"] == 'undefined'){
                        //默认选中
                        data.goods.items[i]["selected"] = true;
                    }
                }
            }
            commit('setPrintOrder', data)
        }
    }
}
