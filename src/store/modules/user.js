import {getLeagueMainAccount,updateLgUserInfoChange} from "@/api/user";
import {showMessage} from "@/util";

const state = {
    login: false,
    userInfo: '',
    lgUserInfo: null
}
const mutations = {
    TOGGLE_LOGIN: (state, val) => {
        state.login = val
    },
    TOGGLE_USERINFO: (state, val) => {
        state.userInfo = val
    },
}
const actions = {
    toggleLogin({commit}, val) {
        commit('TOGGLE_LOGIN', val)
    },
    toggleUserInfo({commit}, val) {
        commit('TOGGLE_USERINFO', val)
    },
    async changeUserInfo({commit}, data) {
        try {
            const res = await updateLgUserInfoChange(data)
            if (res.ret_code === '0000') {
                let userInfoStr = uni.getStorageSync('userInfo')
                if (userInfoStr) {
                    let userInfo = JSON.parse(userInfoStr)
                    let key = Object.keys(data)
                    if (key.length) {
                        userInfo[key[0]] = data[key]
                        uni.setStorageSync('userInfo', JSON.stringify(userInfo))
                        commit('TOGGLE_USERINFO', userInfo)
                        showMessage("更新成功！")
                    }
                } else {
                    showMessage("更新失败，请稍后重试！")
                }

            } else {
                showMessage(res && res.ret_msg || "更新失败，请稍后重试！")
            }
        } catch (e) {
            showMessage("更新失败，请稍后重试！")
        }
    },
    async fetchLGUserInfo({commit}, data) {
        try {
            const res = await getLeagueMainAccount(data)
            if (res.ret_code === '0000') {
                uni.setStorageSync('lgMyUid',res.leagueAccount.uid)
            } else {
                showMessage(res && res.ret_msg || "获取加盟商信息失败！")
            }
        }catch (e){
            console.log(e)
        }

    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
