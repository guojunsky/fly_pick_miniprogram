<template>
  <div class="coupon-list">
    <div class="coupon-list_hd" v-if="showHead">可使用优惠券</div>
    <div class="coupon-list_bd">
      <div class="coupon" v-for="(coupon,index) in renderList" :key="index" :class="{'coupon-on':index===currentIndex}"
           @click="chooseItem(index)">
        <div class="coupon_sd">
          <div class="coupon_price">
            <div class="coupon_price-yen">{{ coupon.unit }}</div>
            {{ coupon.num }}
          </div>
          <div class="coupon_type">{{ coupon.typeName }}</div>
        </div>
        <div class="coupon_mn">
          <div class="coupon_tt">{{ coupon.title }}</div>
          <div class="coupon_ct">{{ coupon.expireMsg }}</div>
          <div class="coupon_ct" v-if="coupon.expireTips">{{ coupon.expireTips }}</div>
        </div>
        <template v-if="isCouponList">
          <div class="coupon_btn coupon_btn-use" v-if="coupon.status === 1" @click="useCoupon">去使用</div>
          <div class="coupon_btn coupon_btn-disabled" v-else-if="coupon.status === 2">已使用</div>
          <div class="coupon_btn coupon_btn-disabled" v-else-if="coupon.status === 3">已失效</div>
        </template>
        <div class="coupon_r" v-else-if="index===currentIndex">
          <div class="icon-checked"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "coupon-list",
  props: {
    list: {
      type: Array,
      default: () => {
        return []
      }
    },
    defaultIndex: {
      type: Number,
      default: -1
    },
    showHead: {
      type: Boolean,
      default: true
    },
    isCouponList: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentIndex: this.defaultIndex
    }
  },
  computed: {
    renderList() {
      return this.list.map(coupon => {
        return coupon.format
      })
    },
  },
  methods: {
    chooseItem(index) {
      if(this.isCouponList) return
      let item = null;
      if(index === this.currentIndex){
        this.currentIndex = this.defaultIndex
        item = null
      }else {
        this.currentIndex = index
        item = this.list[index]
      }
      this.$emit('chooseItem', item)
    },
    useCoupon() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style scoped lang="scss">

@import "../../../assets/styles/mixins";

.coupon-list {
  padding-top: rem(49);
  padding-bottom: rem(32);

  &_hd {
    font-size: rem(32);
    font-weight: 400;
    color: #343847;
    line-height: rem(45);
  }

  &_bd {
  }
}

.coupon {
  display: flex;
  align-items: center;

  margin-top: rem(32);
  height: rem(160);
  box-sizing: border-box;

  padding: rem(44) 0 rem(38) rem(30);

  border-radius: rem(8);
  border: 1px solid #AAAAAA;

  &-on {
    border: 1px solid #E8011B;
  }

  &_sd {
    width: rem(155);

  }

  &_price {
    display: flex;
    align-items: center;
    padding-left: rem(17);
    margin-bottom: rem(8);

    font-weight: 400;
    color: #E8011B;
    line-height: rem(33);
    font-size: rem(48);

    &-yen {
      font-size: rem(24);
    }
  }

  &_type {
    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    line-height: rem(33);
  }

  &_mn {
    flex: 1;
    padding-left: rem(32);
    border-left: 1px solid #ccc;
  }

  &_tt {
    margin-bottom: rem(9);
    font-size: rem(28);
    font-weight: 500;
    color: #343847;
    line-height: rem(40);

  }

  &_ct {
    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    line-height: rem(33);
  }

  &_btn {
    margin: 0 rem(20);
    width: rem(104);
    height: rem(48);
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: rem(4);
    font-size: rem(24);
    font-weight: 400;

    &-use {
      background: #E8011B;
      color: #FFFFFF;
    }

    &-disabled {
      background: #CCCCCC;
      color: #fff;
    }
  }
  &_r {
    margin-right: rem(48);
  }
}

.icon-checked {
  @include image-bg(rem(54), rem(54), url('../../../assets/images/icon/checked_red.png'))
}
</style>
