<script>
import {
  getCloudInstance
} from "@/util/wxCloud";
import { sassInterceptor } from './util/sassInterceptor'
export default {
  onLaunch: async function () {
    //设置首页默认跳转index标识
    if (wx.getStorageSync("homeIndex") === "") {
      console.log("设置首页默认跳转index标识")
      wx.setStorageSync("homeIndex", 1)
    }
    if (process.env.IN_HOSTING === 'mp-weixin-cloud') {
      console.log("onLaunch mp-weixin-cloud")
      await getCloudInstance()
    }
    uni.showLoading({
        title: '加载中...'
    })
    try{
        const config =  await sassInterceptor.login()
        this.$store.dispatch('user/setConfig', config)
    }
   finally{
       uni.hideLoading()
   }
    
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
page {
  width: 100%;
  height: 100%;
}

@import "./assets/styles/global.scss";
</style>
