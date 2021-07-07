
const state = {
  city: '',//起运城市
  country: '',//目的国家，
  checkData: '',//物品信息数据
  detail:'',//产品详情数据
  comment: '',//产品评论信息
  pickupUserId: ''//取货员id
  
}

const mutations = {
  TOGGLE_CITY: (state, val) => {
    state.city = val
  },
  TOGGLE_COUNTRY: (state, val) => {
    state.country = val
  },
  TOGGLE_CHECKDATA: (state, val) => {
    state.checkData = val
  },
  TOGGLE_DETAIL: (state, val) => {
    state.detail = val
  },
  TOGGLE_COMMENT: (state, val) => {
    state.comment = val
  },
  TOGGLE_PICKID: (state, val) => {
    state.pickupUserId = val
  }
}
const actions = {
  toggleCity({ commit }, val) {
	  if(val) {
		  uni.setStorageSync('city',JSON.stringify(val))
	  }
    commit('TOGGLE_CITY', val)
  },
  toggleCountry({ commit }, val) {
    commit('TOGGLE_COUNTRY', val)
  },
  toggleCheckData({ commit }, val) {
    commit('TOGGLE_CHECKDATA', val)
  },
  toggleDetail({ commit }, val) {
    commit('TOGGLE_DETAIL', val)
  },
  toggleComment({ commit }, val) {
    commit('TOGGLE_COMMENT', val)
  },
  togglePickId({ commit }, val) {
    commit('TOGGLE_PICKID', val)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
