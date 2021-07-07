<template>
  <div class="payment">
    <div class="option-list">
      <div class="option" :class="{'option-on':index=== typeIndex}" v-for="(item, index) in typeList" :key="index"
           @click="typeIndex = index">
        {{ item.name }}
      </div>
    </div>
    <!--    <input v-if="typeIndex === 1" v-model="monthlyNo" class="payment_input" placeholder="输入挂账账号">-->
    <template v-if="!hasTax">
      <div class="payment_tt">税金</div>
      <div class="option-list">
        <div class="option" :class="{'option-on':index===taxIndex}" v-for="(item, index) in taxList" :key="index"
             @click="taxIndex = index">
          {{ item.name }}
        </div>
      </div>
      <div class="tip">注：货物进口清关时，可能会在目的地海关产生税金</div>
    </template>
    <div class="btn-confirm btn-mt" @click="confirm">确定</div>
    <div class="tip-xs">预估总价未包含包装费等额外费用，实际总价请以快递员揽收为准</div>
  </div>
</template>

<script>

import {showMessage} from "@/util";

const findValueIndex = (list, value) => {
  const len = list.length
  for (let i = 0; i < len; ++i) {
    if (list[i].value === value) {
      return i
    }
  }
  return 0
}
export default {
  name: "payment",
  data() {
    return {
      typeIndex: 0,
      taxIndex: 0,
      monthlyNo: '',
      typeList: [{name: '寄付现结', value: 1}],
      // typeList: [{name: '寄付现结', value: 1}, {name: '挂账', value: 2}],
      // taxList: [{name: '到付', value: 1}, {name: '预付', value: 2}]
    }
  },
  computed: {
    currentProduct() {
      return this.$store.state.sendOrder.currentProduct
    },
    paymentConfig() {
      return this.$store.state.sendOrder.payment
    },
    hasTax() {
      return this.currentProduct && this.currentProduct.hasTax
    },
    // 展示不同的税金类型
    taxList() {
      const taxType = this.currentProduct && this.currentProduct.taxType
      const t1 = {name: '预付', value: 1}
      const t2 = {name: '到付', value: 2}
      if (taxType === 1) {
        return [t1]
      } else if (taxType === 2) {
        return [t2]
      }
      return [t1, t2]
    }
  },
  watch: {
    paymentConfig: {
      handler(val, oldVal) {
        if (val.payAt != oldVal.payAt) {
          this.taxIndex = findValueIndex(this.taxList, val.payAt)
        }
      },
      deep: true //true 深度监听
    }
  },
  created() {
    // 初始化参数
    const {
      paymentType,
      monthlyNo,
      payAt,
    } = this.paymentConfig
    this.monthlyNo = monthlyNo
    this.typeIndex = findValueIndex(this.typeList, paymentType)
    this.taxIndex = findValueIndex(this.taxList, payAt)
  },
  methods: {
    confirm() {
      const {value: paymentType} = this.typeList[this.typeIndex]
      const {value: payAt} = this.taxList[this.taxIndex]
      const {monthlyNo} = this
      if (paymentType === 2 && !monthlyNo) {
        showMessage("请先填写挂账账号")
        return
      }
      const params = {
        paymentType,
        monthlyNo,
        payAt,
      }
      this.$store.commit('sendOrder/setPayment', params)
      this.$emit('close')
      if (this.taxList.length == 2) {
        this.$emit('confirm')
      }

    }
  }
}
</script>

<style scoped lang="scss">
.payment {
  margin-top: rem(36);
  padding-bottom: rem(32);

  &_tt {
    margin: rem(60) 0 rem(36);

    font-size: rem(34);
    font-weight: 500;
    color: #343847;
    line-height: rem(48);
  }

  &_input {
    margin-top: rem(52);
    padding: 0 rem(12);
    height: rem(65);
    border-radius: rem(4);
    border: rem(1) solid #E3E3E3;
    font-size: rem(24);
  }
}

.option-list {
  overflow: hidden;
}

.option {
  float: left;
  margin-right: rem(20);
  width: rem(208);
  height: rem(73);
  border-radius: rem(35);
  border: rem(1) solid transparent;

  font-size: rem(28);
  font-weight: 400;
  line-height: rem(71);
  color: #343847;
  text-align: center;

  &-on {
    border: rem(1) solid #056BF1;
    color: #056BF1;

  }
}

.tip {
  margin: rem(24) auto rem(67);
  font-size: rem(24);
  font-weight: 400;
  color: #343847;
  line-height: rem(36);
}

.tip-xs {
  margin-top: rem(30);
  font-size: rem(20);
  font-weight: 400;
  color: #343847;
  line-height: rem(32);
  white-space: nowrap;
}

.btn-mt {
  margin-top: rem(30);
}
</style>
