<template>
  <div class="address-list">
    <div class="address">
      <div class="address_sd icon-send-c">寄</div>
      <div class="address_mn" @click="toSenderAddress">
        <div class="address_tt" v-if="!sender">请填写寄件人信息(国内出发地)</div>
        <template v-else>
          <div class="address_tt">{{ sender.name }} <span class="address_ph address_ml" v-if="readonly">{{handlePhone(sender.phone)}}</span></div>
          <div class="address_ct">{{ sender.addr }}</div>
        </template>

      </div>
      <div class="address_r" v-if="!readonly" @click="toAddressPage(1, sender)">
        <div class="address_book"></div>
        <span>地址薄</span>
      </div>
    </div>
    <div class="address">
      <div class="address_sd icon-receive-c">收</div>
      <div class="address_mn" @click="toReceiverAddress">
        <div class="address_tt" v-if="!receiver">请填写收件人信息(国际收货地)</div>
        <template v-else>
          <div class="address_tt">{{ receiver.name }}  <span class="address_ph address_ml" v-if="readonly">{{handlePhone(receiver.phone)}}</span></div>
          <div class="address_ct">{{ receiver.addr }}</div>
        </template>
      </div>
      <div class="address_r" v-if="!readonly" @click="toAddressPage(2, receiver)">
        <div class="address_book"></div>
        <span>地址薄</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "address-list",
  props: {
    sender: {
      type: Object,
      default: null
    },
    receiver: {
      type: Object,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    fbaval:{
      type: Number,
      default: 2
    },
    goodsInfo:{
      type: Object,
      default: null
    }
  },
  methods: {
    handlePhone(data){
      if(!data) return '';
      let str = data;
      let pre =  str.substr(0,3);
      let next = str.substr(7,4);
      let result  =  pre + '****' + next;
      return result
    },
    toAddressPage(type, address) {

      if (type === 2 && this.goodsInfo && this.goodsInfo.goodsType == 2 && this.fbaval === 1) {
        uni.navigateTo({
          url: `/subpackages/sendOrder/fbaStore`
        })
        return
      }
      uni.navigateTo({
        url: `/subpackages/address/index?type=${type}&choose=${this.readonly ? '' : '1'}&defaultId=${address && address.id}`
      })
    },
    toSenderAddress() {
      const {id = ''} = this.sender || {}
      uni.navigateTo({
        url: `/subpackages/address/addSender?id=${id}&choose=1`
      })
    },
    toReceiverAddress() {
      if (this.goodsInfo && this.goodsInfo.goodsType == 2 && this.fbaval === 1) {
        uni.navigateTo({
          url: `/subpackages/sendOrder/fbaStore`
        })
        return
      }
      const {id = ''} = this.receiver || {}
      uni.navigateTo({
        url: `/subpackages/address/addAddressee?id=${id}&choose=1`
      })
    }

  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/styles/common";

.address-list {
  background-color: #fff;
  margin-bottom: rem(20);
  padding: 0 rem(24);
}

.address {
  display: flex;
  align-items: center;
  padding: rem(40) 0 rem(51);

  &:not(:last-child) {
    border-bottom: 1px solid #E6E6E6;
  }

  &_sd {
    margin-right: rem(25);
    width: rem(42);
    height: rem(52);
  }

  &_mn {
    flex: 1;

  }

  &_tt {
    font-size: rem(32);
    font-weight: 500;
    color: #343847;
    line-height: rem(45);
  }
  &_ml {
    margin-left: rem(15);
  }
  &_ph {
    font-size: rem(24);
    color: rgba(52, 56, 71, 65%);
  }

  &_ct {
    margin-top: rem(7);
    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    line-height: rem(33);
    @include text-overflow-line(2);
  }

  &_r {
    height: rem(80);
    border-left: rem(2) dashed #EAEAEA;
    padding-left: rem(23);

    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    line-height: rem(33);
  }

  &_book {
    @include image-bg(rem(27), rem(29), url('../../../assets/images/icon/book.png'));
    margin: 0 auto rem(12);
  }
}

</style>
