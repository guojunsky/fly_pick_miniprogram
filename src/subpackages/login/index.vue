<template>
  <div class="page">
    <div class="page_hd">
      <div class="page_hd-logo">
        <img src="../../assets/images/icon/mine_default_avatar.png" class="logo-ic">
      </div>
    </div>
    <div class="page_bd">
      <tab :tabList="tabList" :currentIndex.sync="currentIndex" :cTag="true" :disabled="isFocus"></tab>
      <div class="container">
        <div class="container_bd" v-if="currentIndex===0">
          <loginFormItem class="form-item_ext" v-model="l.phone" placeholder="手机号" @onFocus="changeFocus"
                         @onBlur="changeBlur">
            <template slot="ic">
              <div class="icon_phone"></div>
            </template>
          </loginFormItem>

          <loginFormItem class="form-item_ext" v-model="l.password" placeholder="密码" type="password"
                         @onFocus="changeFocus" @onBlur="changeBlur">
            <template slot="ic">
              <div class="icon_password"></div>
            </template>
          </loginFormItem>

          <div class="form-tt" @click="toPage">忘记密码</div>
          <button @click="toPickLogin" :disabled="!l.phone || !l.password" class="form-btn form-login_btn"
                  :class="{'form-btn_disabled':(!l.phone || !l.password)}">登录
          </button>
        </div>

        <div class="container_bd" v-if="currentIndex===1">
          <loginFormItem class="form-item_ext" v-model="r.phone" placeholder="手机号" @onFocus="changeFocus"
                         @onBlur="changeBlur">
            <template slot="ic">
              <div class="icon_phone"></div>
            </template>
          </loginFormItem>
          <loginFormItem class="form-item_ext" v-model="r.vercode" size="mini" placeholder="短信验证码"
                         @onFocus="changeFocus" @onBlur="changeBlur">
            <template slot="ic">
              <div class="icon_sms"></div>
            </template>
            <template slot="right">
              <button class="sms-btn" :class="{'sms-btn_disabled':isSMSDisabled}" @click="sendSMS"
                      :disabled="isSMSDisabled">{{ smsTxt }}
              </button>
            </template>

          </loginFormItem>
          <loginFormItem class="form-item_ext" v-model="r.password" placeholder="6-12位数字和字母密码" type="password"
                         @onFocus="changeFocus" @onBlur="changeBlur">
            <template slot="ic">
              <div class="icon_password"></div>
            </template>
          </loginFormItem>
          <button @click="toPickRegister" :disabled="isRegisterDisabled" class="form-btn form-register_btn"
                  :class="{'form-btn_disabled':isRegisterDisabled}">注册
          </button>

        </div>

      </div>
    </div>

    <div class="page_ft">
      <p class="page_ft_tt">登录即代表同意 <span class="page_ft_st" @click="toLink('register')">用户服务协议</span>和<span class="page_ft_st" @click="toLink('privacy')">隐私政策</span></p>
    </div>
  </div>
</template>

<script>
import {
  showMessage,
  updateUserInfo,
  updateCheckPage
} from '@/util/index'
import {
  mapGetters
} from 'vuex'
import tab from '@/components/tab'
import loginFormItem from '@/components/form/login-form-item'
import {
  smsSend,
  lgRegister,
  lgLogin
} from '@/api/user'
import store from "@/store";
import {wxLogin} from "../../api/user";
import {appId} from "../../util/common";

const createRegisterObj = function () {
  return {
    phone: "",
    password: "",
    vercode: ""
  }
}
export default {
  name: "login",
  components: {
    tab,
    loginFormItem
  },
  data() {
    return {
      isFocus: false,
      currentIndex: 0,
      tabList: ['登录', '注册'],
      l: {
        phone: '',
        password: ''
      },
      r: createRegisterObj(),
      smsTxt: '发送验证码',
      isSMSDisabled: false,
      smsTotalTime: 60,
      isLoading: false,
      isRegLoading: false,
      isLoginLoading: false

    }
  },
  computed: {

    ...mapGetters(['login', 'userInfo', 'globalConfig']),
    isRegisterDisabled() {
      return !this.r.phone || !this.r.vercode || !this.r.password
    }
  },

  onLoad() {

  },
  methods: {
    changeFocus() {
      this.isFocus = true;
    },
    changeBlur() {
      this.isFocus = false;
    },
    toPage() {
      if (this.isFocus) return
      uni.navigateTo({
        url: '/subpackages/login/forgetPassword'
      })
    },
    validPhone(phone) {
      // 校验手机号
      if (!phone || phone == '') {
        showMessage('请输入手机号')
        return false
      }
      if (!(/^1[34578]\d{9}$/.test(phone))) {
        showMessage('请输入正确的手机号')
        return false
      }
      return true
    },
    validPassword(password) {
      if (!password || password == '') {
        showMessage('请输入密码')
        return false
      }
      //校验规则 正则表达式  只允许输入 数字跟字母
      if (!(/^[A-Za-z0-9]{6,12}$/.test(password))) {
        showMessage('请输入6-12位数字和字母密码')
        return false
      }
      return true

    },
    sendSMS() {
      let vm = this
      let {
        phone
      } = vm.r

      if (!this.validPhone(phone)) return
      this.toSendSMS(phone)
    },
    async toSendSMS(phone, {
      type = 1
    } = {}) {
      let params = {
        phone,
        type
      }

      if (this.isLoading) return
      this.isLoading = true
      console.log("请求发送验证码")
      //mock
      // let that = this;
      // setTimeout(function () {
      //   showMessage("短信发送成功！")
      //
      //   that.handleTime()
      //   that.isLoading = false
      // }, 2000)
      // return
      try {
        const res = await smsSend(params)
        this.isLoading = false
        if (res.ret_code === '0000') {
          showMessage("短信发送成功！")
          //开始倒计时
          this.handleTime()
        } else {
          showMessage(res && res.ret_msg || "短信发送失败，请稍后重试！")
        }

      } catch (e) {
        this.isLoading = false
        console.log("短信发送失败error:", e)
        showMessage(e && e.ret_msg || "短信发送失败，请稍后重试！")
      }

    },
    handleTime() {
      this.isSMSDisabled = true;
      this.smsTxt = this.smsTotalTime + "s后重新发送";
      let clock = setInterval(() => {
        this.smsTotalTime--;
        this.smsTxt = this.smsTotalTime + "s后重新发送";
        if (this.smsTotalTime < 0) {
          clearInterval(clock);
          this.smsTxt = "重新发送";
          this.smsTotalTime = 60;
          this.isSMSDisabled = false;
        }
      }, 1000);
    },
    async toPickRegister() {
      let {
        phone,
        password,
        vercode
      } = this.r
      let params = {
        phone,
        password,
        vercode
      }
      if (!this.validPhone(phone)) return
      if (!vercode || vercode == '') {
        showMessage('请输入验证码')
        return false
      }
      if (!this.validPassword(password)) return
      uni.showLoading()
      if (this.isRegLoading) return
      this.isRegLoading = true
      //增加微信授权
      this.weixinLogin(
          {
            success: async (value) => {
              try {
                params["openId"] = value.openId;
                const res = await lgRegister(params)
                if (res.ret_code === '0000') {
                  //注册成功，可直接登录
                  showMessage("注册成功，即将登录")
                  this.handleSuccess(res)

                } else {
                  uni.hideLoading()
                  this.isRegLoading = false
                  showMessage(res && res.ret_msg || "注册失败，请稍后重试！")
                }
              } catch (e) {
                uni.hideLoading()
                this.isRegLoading = false
                console.log("注册失败error:", e)
                showMessage(e && e.ret_msg || "注册失败，请稍后重试！")
              }
            },
            fail:(res)=>{
              uni.hideLoading()
              this.isRegLoading = false
              showMessage(res && res.msg || "注册失败，请稍后重试！")
            }
          }
      );

    },
    async toPickLogin() {
      let {
        phone,
        password
      } = this.l
      let params = {
        phone,
        password
      }
      if (!this.validPhone(phone)) return

      if (!this.validPassword(password)) return
      uni.showLoading()
      if (this.isLoginLoading) return
      this.isLoginLoading = true
      //增加微信登录，获取openid
      this.weixinLogin(
          {
            success: async (value) => {
              params["openId"] = value.openId;
              try {
                const res = await lgLogin(params)
                if (res.ret_code === '0000') {
                  //保存登录数据 todo
                  showMessage("登录成功")
                  this.handleSuccess(res)

                } else {
                  uni.hideLoading()
                  this.isLoginLoading = false
                  showMessage(res && res.ret_msg || "登录失败，请稍后重试！")
                }
              } catch (e) {
                uni.hideLoading()
                this.isLoginLoading = false
                console.log("登录失败error:", e)
                showMessage(e && e.ret_msg || "登录失败，请稍后重试！")
              }
            },
            fail:(res)=>{
              uni.hideLoading()
              this.isLoginLoading = false
              showMessage(res && res.msg || "登录失败，请稍后重试！")
            }
          }
      );

    },
    weixinLogin({success = null, fail = null, done = null} = {}) {
      //调用微信登录接口，获取openid
      uni.login({
        success: (resc) => {
          if (resc.code) {
            wxLogin({
              code: resc.code,
              appid:  this.globalConfig.miniPickAppId
            }).then(res => {
              if (done) done()
              if (res.ret_code == '0000') {
                  if (success) success({
                    openId:res.openId
                  });
              } else {
                if (fail) fail({
                  code: res.ret_code,
                  msg: res.ret_msg
                });
              }

            }).catch(e => {
              if (done) done()
              console.log('登录失败！' + e)
              if (fail) fail({
                code: (e && e['ret_code']) || -1,
                msg: (e && e['ret_msg']) || "登录失败，请稍后重试！"
              });

            })
          } else {
            if (done) done()
            console.log('登录失败！' + resc.errMsg)
            if (fail) fail({
              code: resc.code,
              msg: resc.errMsg
            });

          }
        },
        fail: (err => {
          if (done) done()
          if (fail) fail(err)

        })
      })
    },
    setTab(res) {
      const pages = getCurrentPages()
      const tabList = ['pages/mine/index', 'pages/index/index', 'pages/check/index', 'pages/pickup/index']
      const tabPage = pages.map((item) => tabList.includes(item.route))
      console.log('tabPage ==>', tabPage)
      tabPage.forEach((item) => {
        if (typeof item.getTabBar === 'function' && item.getTabBar()) {
          item.getTabBar().setData({
            lgType: res.type
          })
        }
      })
    },
    async handleSuccess(res) {
      let userInfo = res['userInfo'];
      if (userInfo) {
        store.dispatch("user/toggleLogin", true);
        updateUserInfo(res)
        //获取主账号id
        if (res.type === 2 || res.type === 3) {
          await store.dispatch("user/fetchLGUserInfo", {
            leagueUserInfoId: userInfo.id
          });
        }
        uni.hideLoading()
        this.isLoginLoading = false
        this.isRegLoading = false
        this.setTab(res)
        updateCheckPage()
        uni.navigateBack()
      }
      uni.hideLoading()
      this.isLoginLoading = false
      this.isRegLoading = false
    },
    toLink(tag){
      //1用户协议  2隐私政策
      // showMessage('todo')
      uni.navigateTo({
          url: `/subpackages/protocol/protocol?filed=${tag}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/mixins";

.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;

  &_hd {
    &-logo {
      padding-top: rem(54);
      height: rem(222);
      text-align: center;
    }

    background: #317DE6;

    .logo-ic {
      width: rem(142);
      height: rem(142);
    }
  }

  &_bd {
    flex: 1;
  }

  &_ft {
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;

    position: absolute;
    bottom: rem(50);

    &_tt {
      font-size: (28);
      font-weight: 400;
      color: #979797;
    }

    &_st {
      color: #3689F3;
    }
  }

  .container {
    flex: 1;

    &_bd {
      display: flex;
      justify-content: center;
      align-items: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }


  .form {
    &-item_ext {
      padding-top: rem(38);
    }

    &-btn {
      width: rem(650);
      height: rem(96);
      line-height: rem(96);
      background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
      border-radius: rem(6);

      font-size: rem(32);
      font-weight: 500;
      color: #FFFFFF;
    }

    &-btn_disabled {

      background: #D8D8D8;
    }

    &-login_btn {
      margin-top: rem(134);
    }

    &-register_btn {
      margin-top: rem(70);
    }

    &-tt {
      width: rem(650);
      text-align: right;
      margin-top: rem(30);
      font-size: rem(28);
      font-weight: 400;
      color: #979797;
    }
  }

  .sms {
    &-btn {
      width: rem(210);
      height: rem(76);
      background-color: #3689F3;
      border-radius: rem(5);

      display: flex;
      justify-content: center;
      align-items: center;

      font-size: rem(28);
      font-weight: 400;
      color: #FFFFFF;

      margin-right: rem(10);
    }


    &-btn_disabled {
      background-color: #D8D8D8;
    }
  }

  button {
    padding: 0;
  }
}

.icon_phone {
  width: rem(28);
  height: rem(43);
  @include image-bg(rem(28), rem(43), url("../../assets/images/pick/login/phone_ic.png"));
}

.icon_password {
  width: rem(34);
  height: rem(40);
  @include image-bg(rem(34), rem(40), url("../../assets/images/pick/login/password_ic.png"));
}

.icon_sms {
  width: rem(34);
  height: rem(38);
  @include image-bg(rem(34), rem(38), url("../../assets/images/pick/login/sms_ic.png"));
}
</style>
