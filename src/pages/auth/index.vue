<template>
  <div class="auth">
    <div class="auth-hd">
      <!--      todo      -->
      <!--      <img src="" class="auth-logo">-->
      <div class="auth-logo"></div>
      <p class="auth-logo_tt">数达取货</p>
    </div>

    <div class="auth-bd">
<!--      <button class="login_btn stat_login" type="primary" v-if="!hid1" open-type="getUserInfo"-->
<!--              @getuserinfo="bindGetUserInfo">-->
<!--        微信快捷登录-->
<!--      </button>-->
      <button class="login_btn stat_login" type="primary" v-if="!hid2" open-type="getPhoneNumber"
              @getphonenumber="handlerLogin">
        微信手机号一键登录
      </button>
    </div>

    <div class="auth-ft">
      <p class="auth-ft_ct">
        若您微信手机号未注册将直接注册
      </p>
      <p class="auth-ft_ct">
        注册即视为同意 <span class="auth-ft_blue" @click="toLink(1)">《用户协议》</span> 和 <span class="auth-ft_blue" @click="toLink(2)">《隐私政策》</span>
      </p>
    </div>

  </div>
</template>

<script>
import {wxDecryptLogin, updateUser, wxLogin} from '@/api/user';
import {showMessage, updateUserInfo} from "@/util";
import store from "@/store";
import {appId} from "@/util/common";

export default {
  data() {
    return {
      nickName: "",
      avatarUrl: "",
      hid1: false,
      hid2: true
    }
  },
  onLoad(option) {
    //调用登录接口，判断用户是否有头像及昵称
    uni.login({
      success: (resc) => {

        if (resc.code) {
          wxLogin({
            code: resc.code,
            appid: appId
          }).then(res => {

            if (res.ret_code == '0000') {
              if (!res.unionId) { //已注册
                store.dispatch("user/toggleLogin", true);
                updateUserInfo(res)
                //判断用户是否有头像及昵称
                if (!res.user.avatar || !res.user.nickname) {
                  this.hid1 = false
                  this.hid2 = true
                } else {
                  this.hid1 = true
                  this.hid2 = false

                  //授权成功，暂存昵称和头像
                  this.nickName = res.user.nickname;
                  this.avatarUrl = res.user.avatar;
                }
              } else {
                this.hid1 = false
                this.hid2 = true
              }
            }
          }).catch(e => {
            console.log('登录失败！' + e)

          })
        } else {
          console.log('登录失败！' + resc.errMsg)

        }
      }
    })
  },
  methods: {
    bindGetUserInfo(e) {
      console.log(e.detail)
      if (e.detail.errMsg == "getUserInfo:fail auth deny") {
        showMessage("需要授权您的用户信息！")
      } else {
        //授权成功，暂存昵称和头像
        this.nickName = e.detail.userInfo.nickName;
        this.avatarUrl = e.detail.userInfo.avatarUrl;
        this.hid1 = true;
        this.hid2 = false;
      }

    },
    async handlerLogin(e) {
      if (e.detail.errMsg == "getPhoneNumber:fail user deny") {       //用户决绝授权
        showMessage("需要授权您的手机号！")
      } else {
        console.log('授权信息', e.detail)
        let unionId = uni.getStorageSync('unionId');
        if (unionId) {
          console.log("未注册")
          wxDecryptLogin({
            "encryptedData": e.detail.encryptedData,
            "iv": e.detail.iv,
            "unionId": unionId
          }).then(async (res) => {
            console.log("解密", res)
            if (res.ret_code === "0000") {
              store.dispatch("user/toggleLogin", true);
              updateUserInfo(res)

              //更新用户昵称和头像
              await this.handleUserInfo()

              uni.navigateBack()
            } else {
              showMessage("获取用户手机号错误，请稍后重试！")
            }
          }).catch(e => {
            showMessage("授权错误，请稍后重试！")
          })
        } else {
          console.log("已注册")

          //更新用户昵称和头像
          await this.handleUserInfo()

          uni.navigateBack()


        }
      }
    },
    async handleUserInfo() {
      await updateUser({
        nickname: this.nickName,
        avatar: this.avatarUrl
      }).then((res) => {

        if (res.ret_code === "0000") {
          let userInfoStr = uni.getStorageSync('userInfo')
          let userInfo = JSON.parse(userInfoStr)

          userInfo = {...userInfo, nickname: this.nickName, avatar: this.avatarUrl}
          uni.setStorageSync('userInfo', JSON.stringify(userInfo));
          store.dispatch("user/toggleUserInfo", userInfo);
        }

      })
    },

    toLink(tag){
      //1用户协议  2隐私政策
      showMessage('todo')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/mixins";

.auth {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  &-hd {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    margin: rem(80) 0;
  }

  &-logo {
    width: rem(200);
    height: rem(200);
    background: #7B7D87;
    border-radius: 100%;

    &_tt {
      font-size: rem(30);
      font-weight: bold;
      color: #333333;
      margin-top: rem(20);
    }
  }

  &-ft {
    position: absolute;
    bottom: rem(20);
    margin-bottom: rem(20);
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &_ct {
      color: #999999;
      font-size: rem(30);
    }
    &_blue {
      color: #0CA4F9;
    }
  }

}

.login_btn {
  position: relative;
  width: rem(625);
  height: rem(95);
  line-height: rem(95);
  font-size: rem(33);
  color: #fff;
  //background-color: #317DE6;
  border-radius: rem(50);
  z-index: 9;
  border: none;
}

button.login_btn::after {
  border: none;
}
</style>
