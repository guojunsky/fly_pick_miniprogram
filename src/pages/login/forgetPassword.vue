<template>
  <div class="page">
    <div class="page_hd">
      <p class="page_hd-tt">忘记密码</p>
      <p class="page_hd-st">请重新设置密码</p>
    </div>
    <div class="page_bd">
      <loginFormItem class="form-item_ext" v-model="phone" placeholder="手机号">
        <template slot="ic">
          <div class="icon_phone"></div>
        </template>
      </loginFormItem>
      <loginFormItem class="form-item_ext" v-model="vercode" size="mini" placeholder="短信验证码">
        <template slot="ic">
          <div class="icon_sms"></div>
        </template>
        <template slot="right">
          <button class="sms-btn" :class="{'sms-btn_disabled':isSMSDisabled}" @click="sendSMS" :disabled="isSMSDisabled">{{ smsTxt }}</button>
        </template>

      </loginFormItem>
      <loginFormItem class="form-item_ext" v-model="newPwd" placeholder="新的6-12位数字和字母密码" type="password">
        <template slot="ic">
          <div class="icon_password"></div>
        </template>
      </loginFormItem>

      <loginFormItem class="form-item_ext" v-model="confirmPassword" placeholder="确认密码" type="password">
        <template slot="ic">
          <div class="icon_password"></div>
        </template>
      </loginFormItem>

      <button @click="submitPwd" :disabled="isDisabled" class="form-btn form-forget_btn"
              :class="{'form-btn_disabled':isDisabled}">修改密码
      </button>

    </div>
  </div>
</template>

<script>
import {lgPwdForget, smsSend} from '@/api/user'
import loginFormItem from '@/components/form/login-form-item'
import {showMessage} from "@/util";

export default {
  name: "forgetPassword",
  components: {
    loginFormItem
  },
  data() {
    return {
      phone: "",
      vercode: "",
      newPwd: "",
      confirmPassword: "",

      smsTxt: '发送验证码',
      isSMSDisabled: false,
      smsTotalTime: 60,

      isLoading:false,isPwdLoading:false
    }
  },
  computed: {
    isDisabled() {
      return !this.phone || !this.vercode || !this.newPwd || !this.confirmPassword;
    }
  },
  methods: {
    submitPwd(){
      let {phone,vercode,newPwd,confirmPassword} = this;
      if(!this.validPhone(phone))return
      if (!vercode || vercode == '') {
        showMessage('请输入验证码')
        return false
      }
      if(!this.validPassword(newPwd))return

      if(newPwd != confirmPassword){
        showMessage('两次密码不一致')
        return
      }

      this.comfirmPwd(phone,vercode,newPwd)
    },
    async comfirmPwd(phone,vercode,newPwd) {
      let params = {
        phone,
        vercode,
        newPwd,
      }

      if (this.isPwdLoading) return
      this.isPwdLoading = true

      try {
        const res = await lgPwdForget(params)
        this.isPwdLoading = false
        if (res.ret_code === '0000') {
          showMessage("修改密码成功！")
          uni.navigateBack()
        } else {
          showMessage(res && res.ret_msg || "修改密码失败，请稍后重试！")
        }

      } catch (e) {
        this.isPwdLoading = false
        console.log("修改密码失败error:", e)
        showMessage(e && e.ret_msg || "修改密码失败，请稍后重试！")
      }
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
      let {phone} = vm

      if (!this.validPhone(phone)) return
      this.toSendSMS(phone,{type:2})
    },
    async toSendSMS(phone, {type = 1} = {}) {
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
          this.smsTxt = "重新发送验证码";
          this.smsTotalTime = 60;
          this.isSMSDisabled = false;
        }
      }, 1000);
    },
  },
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;

  &_hd {
    width: rem(650);
    margin-top: rem(65);
    margin-bottom: rem(90);
    &-tt {
      font-size: rem(41);
      font-weight: 500;
      color: #343847;
    }

    &-st {
      font-size: rem(28);
      font-weight: 400;
      color: #979797;
    }
  }
  &_bd {
    display: flex;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

    &-forget_btn {
      margin-top: rem(96);
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
