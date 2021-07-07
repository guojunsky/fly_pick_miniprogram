<template>
  <div>
    <div class="tab_content">
      <div :class="['tab_item',status === item.value ? 'active' : '']" v-for="(item,index) in tabList" :key="index"
           @click="handlerTab(item.value)">
        {{ item.name }}
        <span class="tab_line" v-if="status === item.value"></span>
      </div>
    </div>
    <div class="list_content">
      <CouponList :list="couponList" :showHead="false" :isCouponList="true"></CouponList>
    </div>
    <empty-box v-if="!loading && !couponList.length"></empty-box>
  </div>
</template>

<script>
import CouponList from '../sendOrder/widget/coupon-list'
import {
  getMyCouponList
} from '@/api/coupon'
import {
  formatCoupon
} from '@/store/modules/sendOrder'
import emptyBox from '@/components/empty/index.vue'

export default {
  name: 'mineCoupon',
  components: {
    CouponList,
    emptyBox
  },
  data() {
    return {
      loading: true,
      status: 1,
      tabList: [{
        name: "可使用",
        value: 1
      }, {
        name: "已使用",
        value: 2
      }, {
        name: "已失效",
        value: 3
      }],
      couponList: []
    }
  },
  onLoad() {
    this.getList()
  },
  methods: {
    async getList() {
      const list = await this.$store.dispatch('coupon/fetchCouponList', {type:this.status})
      if (Array.isArray(list)) {
        list.forEach(coupon => {
          coupon.format = formatCoupon(coupon)
          coupon.format.status = this.status
        })
        this.couponList = list
        this.loading = false
      }
    },
    handlerTab(status) {
      this.status = status
      this.couponList = []
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
.tab_content {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: rem(686);
  padding: 0 rem(32);
  justify-content: space-between;
  background-color: #FFFFFF;
}

.tab_item {
  color: #343847;
  font-size: rem(30);
  position: relative;
  padding: rem(27) 0;
}

.tab_item.active {
  color: #056BF1;
}

.tab_line {
  width: rem(60);
  height: rem(4);
  background-color: #056BF1;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
}

.list_content {
  padding: 0 rem(32);
}
</style>
