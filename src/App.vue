<script>
import {
  getCloudInstance
} from "@/util/wxCloud";

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
