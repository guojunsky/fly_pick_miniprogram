import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import user from './modules/user'
import address from './modules/address'
import sendOrder from "./modules/sendOrder";
import coupon from './modules/coupon'
import chat from  './modules/chat'
import print from  './modules/print'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        app,
        user,
        address,
        sendOrder,
        coupon,
        chat,
        print
    },
    getters
})

export default store
