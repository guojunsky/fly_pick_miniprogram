<template>
  <div class="page">
    <div class="insurance">
      <div class="insurance_bd">
        <div class="insurance_name">声明价值</div>
        <input type="number" class="insurance_input" placeholder="¥：1-20000的整数" maxlength="5" v-model="insuranceVal">
      </div>
      <div class="insurance_ft">
        费用：
        <div class="insurance_price">¥{{ insuranceCharge }}元</div>
      </div>
    </div>
    <div class="tip">
      <div class="tip_tt">
        保价说明：
      </div>
      <div class="tip_ct">
        <div>1、您交寄的贵重物品，建议事先声明价值；</div>
        <div>2、若您未选择保价，如有遗失或损坏，则在100美金/票或20美金/公斤两者取小值的限额内向您赔偿托寄物的实际损失；</div>
        <div>3、若您已选择保价并支付了保价费用，如有遗失或损坏，则顺丰按照保价金额和托寄物实际现金价值两者取低(即决定价值)和实际损失的比例向您赔偿，最高不超过决定价值；</div>
        <div>4、仅支持单票声明价值为20000元人民币以内的货物，如货值超出该标准，则不予理赔；</div>
        <div>5、保价费用计算规则:大陆至海外流向保价费用=声明价值*1%费率，最低收取1分。</div>
      </div>
    </div>
    <div class="page_ft page_ft-fixed">
      <div class="btn-border" @click="cancel">不保价</div>
      <div class="btn-confirm" @click="confirm">保价</div>
    </div>
  </div>
</template>

<script>
import {showMessage} from "@/util";
import {valueAddedServiceCalc} from '@/api/order'

const delay = (function () {
  let timer = 0
  return function (callback, ms) {
    clearTimeout(timer)
    timer = setTimeout(callback, ms)
  }
})()
export default {
  name: "valueInsurance",
  data() {
    return {
      insuranceVal: "",
      insuranceCharge: '--'
    }
  },
  // 本地计算保价费用
  // computed: {
  //   insuranceCharge() {
  //     let txt = '--'
  //     let val = Number(this.insuranceVal);
  //     if (!val) {
  //       txt = '--'
  //     } else {
  //       txt = (val * 0.002).toFixed(2) //千分之2 最低1分
  //       if (txt * 100 < 1) {
  //        txt = 0.01
  //       }
  //     }
  //     return txt
  //   }
  // },
  watch: {
    insuranceVal() {
      this.calCharge()
    }
  },
  methods: {
    calCharge() {
      let val = Number(this.insuranceVal);
      if (!val) {
        this.insuranceCharge = '--'
        return
      }

      //请求接口计算保价费用
      delay(() => {
        this.getInsurCharge()
      }, 300)

    },
    async getInsurCharge() {
      var params = {
        "vasList":
            [{
              selected: 1,
              type: 0,
              price: this.insuranceVal * 100
            }]
      }
      try {
        let res = await valueAddedServiceCalc(params);
        if (res && res.ret_code === '0000' && res.vasList.length) {
          if (res.vasList[0]['charge']) {
            this.insuranceCharge = parseFloat((res.vasList[0]['charge'] / 100).toFixed(2))
          } else {
            this.insuranceCharge = '--'
          }
        } else {
          this.insuranceCharge = '--'
        }
      } catch (e) {
        this.insuranceCharge = '--'
      }
    },
    cancel() {
      this.$store.commit('sendOrder/setCurrentInsur', null)
      uni.navigateBack()
    },
    confirm() {
      if(!this.insuranceVal){
        showMessage("请输入声明价值")
        return
      }
      let val = Number(this.insuranceVal);
      if (!val && val !== 0) {
        showMessage("请输入数字")
        return
      }
      if (!Number.isInteger(val)) {
        showMessage("请输入整数")
        return
      }
      if (val < 1) {
        showMessage("请输入大于等于1整数")
        return
      }
      if (val > 20000) {
        showMessage("请输入小于等于20000整数")
        return
      }

      console.log('insuranceVal', this.insuranceVal)
      this.$store.commit('sendOrder/setCurrentInsur', {val: this.insuranceVal, charge: this.insuranceCharge})
      uni.navigateBack()

    }
  }
}
</script>

<style scoped lang="scss">
.page {
  padding: rem(32) rem(32) rem(128);

  &_ft {
    box-sizing: border-box;
    padding: rem(32);
  }
}

.insurance {
  &_bd {
    display: flex;
    align-items: center;
  }

  &_name {
    margin-right: rem(45);
    font-size: rem(32);
    font-weight: 500;
    color: #343847;
    line-height: rem(45);
  }

  &_input {
    flex: 1;
    height: rem(86);
    padding: 0 rem(28);
    background: #F6F6F6;
    border-radius: rem(4);

  }

  &_ft {
    margin-top: rem(32);
    display: flex;
    align-items: center;
    justify-content: flex-end;

    font-size: rem(28);
    font-weight: 400;
    color: #343847;
    line-height: rem(40);
  }

  &_price {
    margin-left: rem(5);
    font-weight: 500;
    color: #E8011B;
  }
}

.tip {
  &_tt {
    margin-bottom: rem(32);
    font-size: rem(28);
    font-weight: 500;
    color: #343847;
    line-height: rem(40);
  }

  &_ct {
    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    line-height: rem(40);
  }
}

.btn-border {
  flex: 1;
  margin-right: rem(20);
  width: rem(333);
  height: rem(80);
  line-height: rem(76);
  border-radius: rem(44);
  border: rem(2) solid #056BF1;
  text-align: center;


  font-size: rem(32);
  font-weight: 400;
  color: #056BF1;
}

</style>
