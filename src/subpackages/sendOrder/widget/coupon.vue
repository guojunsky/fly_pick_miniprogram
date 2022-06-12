<template>
  <div class="coupon" :class="{coupo}">
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
    <div class="coupon_r" v-if="index===currentIndex">
      <div class="icon-checked"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "coupon",
  props: {
    coupon: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/styles/mixins";

.coupon {
  display: flex;
  align-items: center;

  margin-top: rem(32);
  height: rem(160);
  box-sizing: border-box;

  padding: rem(44) rem(20) rem(38) rem(30);

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
}
</style>
