<template>
  <div class="price">
    <div class="price-row" v-for="(item,index) in list" :key="index">
      <div class="price-row_tt">{{ item.title }}</div>
      <div class="price-row_ct">¥{{ item.totalPrice / 100 }}</div>
    </div>
	<div class="price-row" v-if="couponAmount">
	  <div class="price-row_tt">优惠金额</div>
	  <div class="price-row_ct">- ¥{{ couponAmount }}</div>
	</div>
    <div class="price-row" v-if="discountAmount">
      <div class="price-row_tt">加盟商打折金额</div>
      <div class="price-row_ct">- ¥{{ discountAmount/100 }}</div>
    </div>
    <div class="price-row">
      <div class="price-row_tt price-row_tt-s">预估总价</div>
      <div class="price-row_ct price-row_ct—w text-red">¥{{ totalPrice / 100 }}</div>
    </div>

    <div class="price-tip">
      注：预估总价仅含基础运费及已勾选附加费，仅供参考。实际费用以国际件快递员或仓库揽收后确认为准。
    </div>

  </div>
</template>

<script>
export default {
  name: "total-price",
  props: {
    detail: {
      type: Array,
      default: () => {
        return []
      }
    },
    surcharges: {
      type: Array,
      default: () => {
        return []
      }
    },
    vas: { //保价
      type: Array,
      default: () => {
        return []
      }
    },
	couponAmount: {
		type:[String,Number],
		default: 0
	},
    discountAmount: {
      type:[String,Number],
      default: 0
    },
  },
  computed: {
    list() {
      if (!Array.isArray(this.detail)) return []
      // const nameMap = {
      //   1: '0.5公斤首重',
      //   2: '续重',
      //   3: '燃油附加费'
      // }
      let list = []
      this.detail.forEach(row => {
        const {type, price, totalPrice, title} = row
        list.push({
          totalPrice,
          price,
          title
        })
      })
      this.surcharges.forEach(row=>{
        const {surchargeName,price,totalPrice} =row
        list.push({
          totalPrice,
          price,
          title:surchargeName
        })
      })
      this.vas.forEach(row=>{
        const {chargeName,totalPrice} =row
        list.push({
          totalPrice,
          title:chargeName
        })
      })


      return list
    },
    totalPrice() {
      return this.list.reduce((acc, row) => {
        return acc + row.totalPrice
      }, 0)
    }
  }
}
</script>

<style scoped lang="scss">
.price {
  margin-top: rem(49);
  margin-left: rem(-32);
  margin-right: rem(-32);
  padding: 0 rem(32) rem(32);
  border-bottom: 1px solid #E6E6E6;

  &-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: rem(32);
    font-weight: 400;
    color: #343847;
    line-height: rem(75);

    &_tt {


      opacity: 0.64;

      &-s {
        opacity: 1;

      }
    }

    &_ct {
    }

    &_ct-w {
      font-weight: 500;
    }
  }

  &-tip {

    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    line-height: rem(36);
  }
}
</style>
