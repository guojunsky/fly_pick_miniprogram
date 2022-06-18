<template>
  <div class="page">
    <formItem label="头像" labelWidth="180rpx">
      <img :src="userInfo.avatar" class="avatar" alt="">
    </formItem>
    <formItem label="昵称" labelWidth="180rpx">
      <div class="text-form text-form-gray">{{ userInfo.nickname }}</div>
    </formItem>
    <formItem label="性别" labelWidth="180rpx">
      <picker @change="bindPickerSexChange" :value="sexIndex" :range="sexArray">
        <view :class="['text-form', (sexIndex == 0 || sexIndex == 1) ? '':'text-form-blue']">
          {{ (sexIndex == 0 || sexIndex == 1) ? sexArray[sexIndex] : '待完善' }}
        </view>
      </picker>
    </formItem>
    <!--        <formItem label="生日" labelWidth="180rpx">-->
    <!--          <div class="text-form text-form-blue">-->
    <!--            待完善-->
    <!--          </div>-->
    <!--        </formItem>-->
    <formItem label="生日" labelWidth="180rpx">
      <picker mode="date" :value="birthdayVal" start="1900-01-01" :end="endDay" @change="bindDateChange">
<!--        <view class="picker">-->
<!--          当前选择: {{ birthdayVal }}-->
          <view :class="['text-form' ,!birthdayVal? 'text-form-blue':'']">
            {{ birthdayVal && birthdayVal || '待完善' }}
          </view>
<!--        </view>-->
      </picker>
    </formItem>

    <formItem label="手机号" labelWidth="180rpx" v-if="userInfo">
      <div :class="['text-form' ,!userInfo.phone? 'text-form-blue':'text-form-gray']">
        {{ userInfo.phone && userInfo.phone || '待完善' }}
      </div>
    </formItem>

    <div class="page_ft page_ft-fixed">
      <div class="btn-confirm" @click="logout">退出登录</div>
    </div>
  </div>
</template>

<script>
import formItem from '@/components/form/form-item'
import {removeUserInfo, showMessage} from "@/util";
import dayjs from "dayjs";

export default {
  name: "userDetail",
  components: {
    formItem
  },
  data() {
    return {
      sexArray: ['女', '男'],
      endDay:dayjs(new Date()).format('YYYY-MM-DD')
    }
  },
  onLoad() {

  },
  computed: {
    // ...mapGetters(['login','userInfo']),
    login() {
      return this.$store.getters.login
    },
    userInfo() {
      return this.$store.state.user.userInfo || null
    },
    sexIndex() {
      return this.userInfo && this.userInfo.sex
    },
    birthdayVal() {
      if(!this.userInfo)return ""
      if(!this.userInfo.birthday)return ""
      let birthday = this.userInfo.birthday.toString()
      let year = birthday.substring(0,4)
      let month = birthday.substring(4,6)
      let day = birthday.substring(6,8)
      return `${year}-${month}-${day}`
    }
  },
  methods: {
    bindPickerSexChange: async function (e) {
      let val = e.detail.value
      this.$store.dispatch('user/changeUserInfo', {sex:val})

    },
    bindDateChange: function(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      // this.birthdayVal = e.detail.value
      let val = e.detail.value;
      let birthday = val.split('-').join('')

      this.$store.dispatch('user/changeUserInfo', {birthday},)
    },
    async logout() {
      await removeUserInfo()
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding: 0 rem(32);

  &_ft {
    padding: rem(32);
    box-sizing: border-box;
  }
}

.btn-confirm {
  background: #EA4141;
  box-shadow: none;
}

.avatar {
  display: block;
  width: rem(64);
  height: rem(64);
  border-radius: rem(64);
}

.text-form {
  font-size: rem(30);
  font-weight: 400;
  color: #343847;

  &-gray {
    color: rgba(52, 56, 71, 0.2)
  }

  &-blue {
    color: #056AF0;
  }

  &-xs {
    font-size: rem(20);
  }
}

</style>
