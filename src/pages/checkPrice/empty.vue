<template>
  <div class="empty">
    <div class="empty_icon"></div>
    <div class="empty_ct">抱歉，根据您填报的信息，暂无法为您匹配合适渠道。请您联系客服，我们将为您定制专门解决方案。</div>
    <div class="empty_btn" @click="contactService">联系客服</div>
  </div>
</template>

<script>
import {showMessage} from "@/util";
import {getFlyTIMInstance, timUserLogin} from "@/util/flyTIM";
import {FlyIMBusinessGroupId} from "@/util/common";
import {handlerCheckLogin} from "../../util";

export default {
  name: "empty",
  data() {
    return {
      chatLoading: false
    }
  },
  methods: {
    contactService() {
      uni.showLoading()
      handlerCheckLogin({
        success: (data) => {
          console.log("登录成功")
          this.openTIM()
        },
        fail: (e) => {
          showMessage(e && e.msg || '登录失败，请稍后重试')
        },
        done: () => {
          uni.hideLoading()
        }
      });
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


</style>
