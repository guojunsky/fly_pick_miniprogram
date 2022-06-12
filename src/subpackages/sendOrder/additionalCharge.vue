<template>
  <div class="page page-grey">
    <div class="page_hd">
      <div class="page_tt">您可以依据说明勾选可能产生的附加费，以获得更加准确的预估报价</div>
      <div class="page_sub">注：下列附加费在包裹入库时即可确认。跨境运输过程中，还可能产生其它附加收费（如：因客户原因未按时完成海关清关产生的滞留费），未在此列出。
      </div>
    </div>
    <!--  叠加附加费展示  -->
    <div v-for="(item,index) in overlayList" :key="index">
      <!--  只显示预收的附加费  -->
      <div class="panel" v-if="item.payType !== 2">
        <div class="panel_hd">
          <div class="panel_tt">
            <customCheckbox class="mr-72" v-model="item.selected" :edit="item.edit"
                            @input="changeSurcharge">{{
                item.surchargeName
              }}
            </customCheckbox>
          </div>
          <div class="panel_price">
            总价：
            <div class="text-red">¥{{ item.totalPrice / 100 }}元</div>
          </div>
        </div>
        <div class="panel_ft" v-if="item.desc">{{ item.desc }}</div>
        <div class="panel_bd" v-if="item.isShow">
          <counter v-model="item.counterNum" :unit="item.counterUnit"
                   @input="changeNum(item)">
            <div slot="title">
              <span>计费方式：{{ item.chargeMode }}</span>
              <span v-if="item.chargeBase || item.chargeMin">{{ item.priceDesc }}</span>
            </div>
          </counter>
        </div>
      </div>
    </div>

    <!--  不叠加附加费展示  -->
    <div class="panel" v-if="noOverlayList.length">
      <template>
        <div class="panel_hd">
          <div class="panel_tt">
            不叠加附加费
          </div>
          <div class="panel_price">
            总价：
            <div class="text-red">¥{{ noOverlayPrice }}元</div>
          </div>
        </div>
        <div class="panel_ft">如果您的包裹同时达到以下几项附加费的收费标准，计算总费用时只取其中最大值</div>
        <div v-for="(item,index) in noOverlayList" :key="index">
          <!--  只显示预收的附加费  -->
          <div class="panel" v-if="item.payType !== 2">
            <div class="panel_hd">
              <div class="panel_tt">
                <customCheckbox class="mr-72" v-model="item.selected" :edit="item.edit"
                                @input="changeSurcharge">{{
                    item.surchargeName
                  }}
                </customCheckbox>
              </div>
              <div class="panel_price">
                总价：
                <div class="text-red">¥{{ item.totalPrice / 100 }}元</div>
              </div>
            </div>
            <div class="panel_ft" v-if="item.desc">{{ item.desc }}</div>
            <!-- chargeType 计费方式 1 百分比 2固定值 3每公斤 -->
            <div class="panel_bd" v-if="item.isShow">
              <counter v-model="item.counterNum" :unit="item.counterUnit"
                       @input="changeNum(item)">
                <div slot="title">
                  <span>计费方式：{{ item.chargeMode }}</span>
                  <span v-if="item.chargeBase || item.chargeMin">{{ item.priceDesc }}</span>
                </div>
              </counter>
            </div>
          </div>
        </div>

      </template>
    </div>

    <div class="page_ft page_ft-fixed">
      <div class="btn-confirm" @click="confirm">确认</div>
    </div>
  </div>
</template>

<script>
import customSwitch from '@/components/form/custom-switch'
import counter from './widget/counter'
import customCheckbox from '@/components/form/check-box'
// import chargeList from './widget/charge-list'

export default {
  name: "additionalCharge",
  components: {
    customSwitch,
    counter,
    customCheckbox,
    // chargeList
  },
  data() {
    return {
      surchargeList: [],
      unitMap: {
        1: '票',
        2: '件',
        3: '个'
      },
    }
  },
  computed: {
    product() {
      const product = this.$store.state.sendOrder.currentProduct
      if (product && Array.isArray(product.surcharges)) {
        product.surcharges.forEach(item => {
          let tmp = this.handleShowThree(item);
          item.isShow = tmp['isShow'];//是否显示第三部分
          if (item.isShow) {
            item.chargeMode = tmp['chargeMode']; //计费方式
            item.counterNum = tmp['counterNum']; //计数组件 数值
            item.counterUnit = tmp['counterUnit']; //计数组件 单位
          }

          item.priceDesc = this.handleChargePrice(item)
        })
      }
      return product
    },
    noOverlayPrice() {
      let {noOverlayPrice} = this.product
      return noOverlayPrice / 100 || 0;
    },
    overlayList() {
      const {surcharges} = this.product
      if (Array.isArray(surcharges)) {
        return surcharges.filter(item => {
          return item.superposition && item.tax != 1
        })
      }
      return []
    },
    noOverlayList() {
      const {surcharges} = this.product
      if (Array.isArray(surcharges)) {
        return surcharges.filter(item => {
          return !item.superposition && item.tax != 1
        })
      }
      return []
    }
  },
  async onLoad(option) {
    const {pid} = option
    if (!this.product) {
      await this.$store.dispatch('sendOrder/initSendOrder', {pid})
    }

    const {surcharges} = this.product

    // this.noOverlayPrice = noOverlayPrice/100 || 0;
    if (Array.isArray(surcharges)) {
      this.surchargeList = surcharges.map(item => {
        return {...item}
      })
    }
    // this.overlayList = this.surchargeList.filter(item => {
    //   return item.superposition
    // })
    // this.noOverlayList = this.surchargeList.filter(item => {
    //   return !item.superposition
    // })
  },
  methods: {
    //是否显示第三部分
    handleShowThree(item) {
      //chargeType 计费方式 1 百分比 2固定值 3每公斤 4自行输入
      //chargeUnit 计费单位 1票 2件 3个

      //以票为单位，计费方式为百分比和固定值的，是不显示第3部分的
      if (item.chargeUnit === 1 && (item.chargeType === 1 || item.chargeType === 2)) {
        return {
          isShow: false
        };
      } else if (item.chargeType === 3) { //只要计算方式为每公斤，显示第3部分
        //YY=¥***/公斤(基值***，最低***), Z=总计费重，zz=KG，XX=max（YY*Z+基值，最低）
        return {
          isShow: true,
          chargeMode: `¥${item.price / 100}/公斤`, //计费方式
          counterNum: item.weight / 1000,
          counterUnit: "KG"
        };
      } else if ((item.chargeUnit === 2 || item.chargeUnit === 3) && item.chargeType === 2) {//以件或个为单位，计费方式为固定值,显示第3部分
        return {
          isShow: true,
          chargeMode: `¥${item.price / 100}/${this.unitMap[item.chargeUnit]}`, //计费方式
          counterNum: item.number || 1,
          counterUnit: `${this.unitMap[item.chargeUnit]}`
        };
      }

      return {
        isShow: false
      };

    },
    handleChargePrice(item) {
      let str = "";
      if (item.chargeBase && !item.chargeMin) {
        str = `(基值¥${item.chargeBase / 100})`
        return str
      }
      if (!item.chargeBase && item.chargeMin) {
        str = `(最低¥${item.chargeMin / 100})`
        return str
      }
      if (item.chargeBase && item.chargeMin) {
        str = ` (基值¥${item.chargeBase / 100}，最低¥${item.chargeMin / 100})`
        return str
      }
    },
    confirm() {
      this.handlePrice()

      uni.navigateBack()
    },
    changeNum(item) {
      if (item.counterNum < 0) {
        item.counterNum = 0
      }
      //item.selected &&
      if (item.counterNum >= 0 && item.counterNum !== "") { //请求计算价格接口
        this.handlePrice()
      }
    },
    changeSurcharge() {
      // this[flag][index].selected = !this[flag][index].selected
      this.handlePrice()
    },
    handlePrice() {
      this.surchargeList = [...this.overlayList, ...this.noOverlayList]
      this.surchargeList.forEach(item => {
        if (item.counterUnit === 'KG') {
          item.weight = item.counterNum * 1000
        } else {
          item.number = item.counterNum || 1
        }

        item.selected = item.selected ? 1 : 0
      })
      console.log("surchargeList", this.surchargeList)
      this.$store.commit('sendOrder/setSurcharges', this.surchargeList)
      this.$store.dispatch('sendOrder/getProductDetail')
    }

  }
}
</script>

<style scoped lang="scss">
.page {
  padding: rem(32) rem(32) rem(132);

  &_tt {
    margin-bottom: rem(17);
    font-size: rem(30);
    font-weight: 400;
    color: #343847;
    line-height: rem(42);
  }

  &_sub {
    font-size: rem(24);
    font-weight: 400;
    color: rgba(52, 56, 71, 0.44);
    line-height: rem(36);
  }

  &_ft {
    box-sizing: border-box;
    padding: rem(32);
  }
}

.panel {
  margin-top: rem(20);
  background: #fff;
  padding: rem(20);

  &_hd {
    margin-bottom: rem(20);
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-size: rem(30);
    font-weight: 400;
    color: #343847;
    line-height: rem(42);
  }

  &_tt {
    display: flex;
    align-items: center;

    &-inner {
      margin-right: rem(8);
    }


  }

  &_price {
    display: flex;
    align-items: center;
  }

  &_bd {
    margin-top: rem(20);
  }

  &_ft {
    margin-top: rem(10);
    font-size: rem(24);
    font-weight: 400;
    color: rgba(52, 56, 71, 0.45);
    line-height: rem(36)
  }
}

.counter {
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: rem(110);
  padding: 0 rem(20);
  background: #F6F6F6;

  &_tt {
    flex: 1;
    font-size: rem(26);
    font-weight: 400;
    color: #343847;
    line-height: rem(37);
  }

  &_mn {
    width: rem(265);
    display: flex;
    align-items: center;
    justify-content: space-around;

  }

  %btn {
    width: rem(46);
    height: rem(46);
    //background: red;
  }

  &_minus {
    @extend %btn;
    @include image-bg(rem(46), rem(46), url('../../static/index/lease.png'))
  }

  &_add {
    @extend %btn;
    @include image-bg(rem(46), rem(46), url('../../static/index/plus.png'))
  }

  &_num {
    display: flex;
    align-items: center;
  }

  &_input {
    width: rem(60);
    font-size: rem(45);
  }

  &_unit {
    font-size: rem(24);
    color: #757781;
  }
}


</style>
