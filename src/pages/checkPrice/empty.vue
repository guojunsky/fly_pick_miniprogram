<template>
  <div class="empty">
    <div class="empty_icon"></div>
    <div class="empty_ct">抱歉，根据您填报的信息，暂无法为您匹配合适渠道。请您联系客服，我们将为您定制专门解决方案。</div>
    <div class="empty_btn" @click="contactService">联系客服</div>
    	<customDialog  :visible.sync="showRCode">
				<view class="rcode">
					<view class="rcode_close" @click="showRCode=false"></view>
					  <view class="rcode_footer">
							您可以添加如下客服微信，我们将竭力为您服务
						</view>
					<view class="kefu" >
	       <image src="/static/index/rcode.jpeg"></image>
					</view>
				</view>
			</customDialog>
  </div>
</template>

<script>
import {showMessage} from "@/util";
import {getFlyTIMInstance, timUserLogin} from "@/util/flyTIM";
import {FlyIMBusinessGroupId} from "@/util/common";
import {handlerCheckLogin} from "../../util";
import customDialog from '@/components/popup/dialog'

export default {
  name: "empty",
  components: {
     customDialog
  },
  data() {
    return {
      chatLoading: false,
      showRCode: false
    }
  },
  methods: {
    contactService() {
      this.showRCode = true
      // uni.showLoading()
      // handlerCheckLogin({
      //   success: (data) => {
      //     console.log("登录成功")
      //     this.openTIM()
      //   },
      //   fail: (e) => {
      //     showMessage(e && e.msg || '登录失败，请稍后重试')
      //   },
      //   done: () => {
      //     uni.hideLoading()
      //   }
      // });
    },
    //打开在线客服
    async openTIM() {
      if (this.chatLoading) return;
      this.chatLoading = true
      this.$store.commit('chat/resetCurrentConversation')
      getFlyTIMInstance()

      uni.showLoading()
      timUserLogin(FlyIMBusinessGroupId, {
        success: (res) => {
          this.chatLoading = false
          uni.hideLoading()
          uni.navigateTo({
            url: `/pages/chat/index?groupId=${FlyIMBusinessGroupId}`
          })
        },
        fail: (res) => {
          this.chatLoading = false
          uni.hideLoading()
          showMessage(res && res.ret_msg)
        }
      })

    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins";

.empty {
  margin-top: rem(241);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &_icon {
    @include image-bg(rem(96), rem(115), url('../../assets/images/icon/product_empty.png'))
  }

  &_ct {
    margin-top: rem(30);
    margin-bottom: rem(44);
    width: rem(476);
    font-size: rem(28);
    font-weight: 400;
    color: #343847;
    line-height: rem(46);
    text-align: center;
  }

  &_btn {
    width: rem(239);
    height: rem(80);
    line-height: rem(80);
    background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
    box-shadow: 0 rem(2) rem(4) 0 #0265DF;
    border-radius: rem(40);

    text-align: center;
    font-size: rem(28);
    font-weight: 400;
    color: #FFFFFF;
  }
}

.rcode{
		height: 400rpx;
		width: 400rpx;
		margin: 0 auto;
		position: relative;
		background-color: #fff;
		padding: rem(60);
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		  &_close {
    @include image-bg(rem(28), rem(28), url('../../assets/images/icon/close.png'));
    background-size: rem(28);
    width: rem(40);
    height: rem(40);
		position: absolute;
		right: 20rpx;
		top: 20rpx;
   }
	 &_footer{
		//  position: absolute;
		//  bottom: 20rpx;
		//  left: 40rpx;
		//  right: 40rpx;
		 font-size: 28rpx;
	 }
	}
	.kefu{
		width: 320rpx;
		height: 320rpx;
	}
		.kefu image{
		width: 100%;
		height:  100%;
	}

</style>
