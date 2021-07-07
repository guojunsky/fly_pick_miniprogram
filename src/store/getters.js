

const getters = {
  city: (state) => {
	  const city = uni.getStorageSync('city') || ''
	  if(city) {
		 state.app.city = JSON.parse(city)
	  }
	  return state.app.city
  },
  country: state => state.app.country,
  checkData: state => state.app.checkData,
  detail: state => state.app.detail,
  comment: state => state.app.comment,
  pickupUserId: state => state.app.pickupUserId,
  login: (state) => {
	  const expire = uni.getStorageSync('expire')
	  const login = expire && expire > new Date().getTime()
	  if(login) {
		  state.user.login = login
	  }
	  return state.user.login
  },
  userInfo: (state) => {
	  const userInfo = uni.getStorageSync('userInfo')
	  if(userInfo) {
		  state.user.userInfo = JSON.parse(userInfo)
	  }
	  return state.user.userInfo
  }
}
export default getters
