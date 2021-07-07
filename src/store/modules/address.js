import {getChinaAddressList, /*removeChinaAddress, */getAboardAddressList} from "@/api/address";

export default {
    namespaced: true,
    state: {
        list: [], // 寄件人国内地址
        aboardList: [], // 收件人国际
        selectChinaAddress: null, //当前选择的寄件人地址
        selectAboardAddress: null, // 当前选择的收件人地址
        defaultCountry: null, // 当前选择的默认城市，在部分地址操作时需要判断并提示
    },
    mutations: {
        SET_LIST: (state, val) => {
            state.list = val
        },
        setAboardList(state, payload) {
            state.aboardList = payload
        },
        setSelectChinaAddress(state, payload) {
            state.selectChinaAddress = payload
        },
        setSelectAboardAddress(state, payload) {
            state.selectAboardAddress = payload
        },
        setDefaultCountry(state, payload) {
            state.defaultCountry = payload
        }
    },
    getters: {
        // 找到第一个默认地址
        defaultChinaAddress(state) {
            const {list} = state
            return list && list.find(row => row.defaultAt === 1)
        },
        defaultAboardAddress(state) {
            const {aboardList} = state
            return aboardList && aboardList.find(row => row.defaultAt === 1)
        }
    },
    actions: {
        updateChinaAddrList({commit}, val) {
            commit('UPDATE_LIST', val)
        },
        async getChinaAddrList({commit}, val = {page: 0, size: 10}) {
            const {list} = await getChinaAddressList(val)
            if (list && list.length) {
                //默认选中第一个地址
                list.map((item, index) => {
                    if (index === 0) {
                        item.isSelected = true
                    } else {
                        item.isSelected = false
                    }
                    return item;
                })
            }
            commit('SET_LIST', list || [])
        },
        async getAboardAddressList({commit}, payload) {
            const {list} = await getAboardAddressList(payload)
            if (Array.isArray(list)) {
                commit('setAboardList', list)
            }
        }
    },

}
