<template>
  <div class="page page-grey" v-if="order">
    <div class="page_hd">
      <div class="icon-success"></div>
      <div class="page_tt">下单成功</div>
      <template v-if="isSelfOrder">
        <div class="page_sub">
          <div>请您2个工作日内{{ pickup.type == 1 ? '国内快递' : '自送' }}到仓库地址：
          </div>
          <div>
            <div class="text-blue">{{ store.addr }}</div>
            <div class="text-blue">
              <span v-if="store.user">联系人:{{ store.user }}</span>
              <span v-if="store.phone" class="m32">联系电话:{{ store.phone }}</span>
            </div>
          </div>

          <div class="pickup-copy text-blue" @click="copyStoreInfo">复制</div>
        </div>


        <div class="page_tip">
          <div>特别注意:</div>
          <div>1.下单时费用是基于您输入的物品信息&重量预估费用，实际以您的物品到达仓库后实际称重后为准；</div>
          <div v-if="pickup.type == 1">2.下单后请尽快发国内快递到此地址，<span class="text-red text-bold">并打印运单或手写订单号在物品外包装上，您也可以在查件页面把发的国内快递单号附到此订单上，</span>否则可能会多收操作费。如超过2天物品未到达仓库，运费按实际到达日的价格计费；
          </div>
          <div v-if="pickup.type == 2">2.下单后请尽快自送到此地址，<span class="text-red text-bold">并打印运单或手写订单号在物品外包装上，</span>否则可能会多收操作费。如超过2天物品未到达仓库，运费按实际到达日的价格计费；
          </div>
          <div>3.确保您是如实输入物品信息，如到达仓库后发现和输入实际不符，-切产生的退件、加收费用都将由您承担。</div>
        </div>
      </template>
      <div class="page_sub" v-else>快递员上门时间：{{ pickupDate }}</div>

    </div>
    <div class="order-no" v-if="pickup && pickup.type != 0">
      <div class="order-no_tt">运单号：</div>
      <div class="order-no_ct">{{ order.tno }}</div>
      <div class="order-no_r text-blue" @click="printOrder">打印</div>
    </div>
    <addressList :readonly="true" :sender="sender" :receiver="receiver"></addressList>
    <div class="info-list">
      <div class="info">
        <div class="info_label">物品类型</div>
        <div class="info_ct">{{ goodsType }}</div>
      </div>
      <div class="info">
        <div class="info_label">物品件数</div>
        <div class="info_ct">{{ goods.items.length }}</div>
      </div>
      <div class="info">
        <div class="info_label">预估总价</div>
        <div class="info_ct text-red">¥{{ order.totalPrice / 100 }}</div>
      </div>
      <div class="info">
        <div class="info_label">付款方式</div>
        <div class="info_ct">{{ order.paymentType === 1 ? '现结' : '挂账' }}</div>
      </div>
    </div>

    <div class="page_ft page_ft-fixed">
      <div class="btn-border" @click="toDetail">查看详情</div>
      <div class="btn-confirm" @click="finish">完成</div>
    </div>

  </div>
</template>

<script>
import addressList from './widget/address-list'
import {
  getPreOrderDetail
} from '@/api/order'
import {
  showMessage
} from "@/util";

export default {
  name: "success",
  components: {
    addressList
  },
  data() {
    return {
      orderId: '',
      order: null
    }
  },
  computed: {
    store() {
      return this.order && this.order.store
    },
    sender() {
      return this.order && this.order.chinaAddress
    },
    receiver() {
      return this.order && this.order.abroadAddress
    },
    pickup() {
      return this.order && this.order.pickup
    },
    // 格式化上门字符串
    pickupDate() {
      if (!this.pickup) {
        return ""
      }
      let {
        date,
        end,
        begin
      } = this.pickup
      date = date.toString()

      const year = date.substr(0, 4)
      const month = date.substr(4, 2)
      const day = date.substr(6, 2)

      const parseTime = (num) => {
        num = num.toString()
        let h = num.substr(0, num.length - 2)
        let m = num.substring(num.length - 2, num.length)
        return `${h}:${m}`
      }
      return `${year}-${month}-${day} ${parseTime(begin)}-${parseTime(end)}`
    },
    // 自提order
    isSelfOrder() {
      if (!this.pickup) return false
      const {
        type
      } = this.pickup
      return type !== 0 // 0 为上门取货
    },
    goods() {
      return this.order && this.order.goods
    },
    goodsType() {
      if (!this.goods) {
        return ""
      }
      const {
        type
      } = this.goods
      return type === 1 ? '文件' : '包裹'
    },

  },
  onLoad(option) {
    const {
      orderId
    } = option
    if (!orderId) {
      showMessage('参数错误')
      uni.navigateBack()
      return
    }
    this.orderId = orderId
    this.getPreOrderDetail()
    this.updateCheckPage()
  },
  methods: {
    copyStoreInfo() {
      let str = this.store.addr;
      if (this.store.user) {
        str += `联系人:${this.store.user}`;
      }
      if (this.store.phone) {
        str += `联系电话:${this.store.phone}`;
      }
      uni.setClipboardData({
        data: str,
        success: () => {
          showMessage('已复制到剪贴板')
        }
      })
    },
    async getPreOrderDetail() {
      const params = {
        orderNo: this.orderId
      }

      const {
        order
      } = await getPreOrderDetail(params)
      this.order = order
    },
    printOrder() {
      showMessage('todo 打印运单号')
    },
    finish() {
      uni.switchTab({
        url: `/pages/index/index`
      })
    },
    toDetail() {
      uni.navigateTo({
        url: `/pages/orderDetail/index?oid=${this.orderId}`
      })
    },
    updateCheckPage() {
      const pages = getCurrentPages()
      const index = pages.findIndex((item) => item.route === 'pages/check/index')
      if (index > -1) {
        pages[index].$vm.handlerSearch()
      }
    },

  }
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins";

.page {
  padding: rem(32) rem(32) rem(128);

  &_hd {
    box-sizing: border-box;
    margin-bottom: rem(20);
    min-height: rem(260);
    padding: rem(40) rem(24) 0;

    background: #FFFFFF;
    border-radius: rem(8);
    text-align: center;
  }

  &_tip {
    padding: rem(24) 0;
    text-align: left;
    font-size: rem(20);
    font-weight: 400;
    color: #343847;
    line-height: rem(40);
  }

  &_tt {
    margin: rem(21) auto rem(6);
    font-size: rem(36);
    font-weight: 500;
    color: #343847;
    line-height: rem(50);

  }

  &_sub {
    position: relative;
    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    line-height: rem(33);
  }

  &_ft {
    box-sizing: border-box;
    padding: rem(24) rem(32);
  }
}

.order-no {
  display: flex;
  align-items: center;
  padding: rem(24);

  font-size: rem(24);
  font-weight: 400;
  color: #7B7D87;

  background: rgba(45, 125, 230, 0.09);

  &_tt {
  }

  &_ct {
    flex: 1;
    color: #343847;
  }
}

.icon-success {
  margin: 0 auto;
  @include image-bg(rem(68), rem(68), url('../../assets/images/icon/success.png'))
}

.info-list {
  padding: rem(11) rem(24);
  background: #FFFFFF;
  border-radius: rem(8);
}

.info {
  line-height: rem(55);
  display: flex;
  align-items: center;

  &_label {
    margin-right: rem(40);
    width: rem(100);
    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    opacity: 0.65;
  }

  &_ct {
    font-size: rem(24);
    font-weight: 400;
    color: #343847;
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

.pickup-copy {
  position: absolute;
  right: rem(20);
  bottom: 0;
}

.text-red {
  color: #E8011B;
}

.text-bold {
  font-weight: bold;
}
</style>
