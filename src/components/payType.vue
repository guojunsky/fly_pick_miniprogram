
<template>
  <Slide title="请选择支付方式" :show="visible" @update:show="handleClose">
    <view class="type-list">
      <view class="type" @click="handlePay(5)">
        <view class="icon">
          <image src='../static/index/yue.png' />
        </view>
        <view class="text">余额支付
          (<text class="yuan">￥{{balanceVal}}</text>)</view>
      </view>
      <view class="type" @click="handlePay(2)">
        <view class="icon">
          <image src='../static/index/wchat.png' />
        </view>
        <view class="text">微信支付</view>
      </view>
    </view>
  </Slide>
</template>

<script>
import Slide from './slide-popup'
import { getBalance } from '@/api/user'
export default {
  props: ['visible'],
  components: {
    Slide
  },
  data() {
    return {
      balance: 0
    }
  },
  computed: {
    balanceVal() {
      return (this.balance / 100).toFixed(2)
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handlePay(code) {
      this.$emit('pay', code)
    },
    async getBalance() {
      const { balance } = await getBalance()
      this.balance = balance
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.getBalance()
        // uni.hideTabBar()
      }else{
        // uni.showTabBar()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.type-list{
  padding-bottom: 100rpx
}
.type {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;

  &:not(:last-of-type) {
    border-bottom: 1rpx solid #e7e7e7;
  }

  .icon {
    width: 64rpx;
    height: 64rpx;
    margin-right: 24px;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .text {
    color: #333;
    font-size: 28rpx;
    .yuan{
      color: #f00;
       font-size: 24rpx
    }
  }
}
</style>
