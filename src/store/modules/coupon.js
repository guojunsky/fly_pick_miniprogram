import {getMyCouponList} from "@/api/coupon";

export default {
    namespaced: true,
    state: {
        availableList: []
    },
    mutations: {
        setAvailableList(state, payload) {
            state.availableList = payload
        }
    },
    actions: {
        async fetchCouponList(_, {type}) {
            const params = {
                count: 100,
                cursor: 0,
                type: type // 1可使用2已使用3已失效
            }
            const {list} = await getMyCouponList(params)
            return Array.isArray(list) ? list : []
        },
        async getAvailableCouponList({dispatch, commit}) {
            const list = await dispatch('fetchCouponList', {type: 1})
            commit('setAvailableList', list)
        }
    }
}
