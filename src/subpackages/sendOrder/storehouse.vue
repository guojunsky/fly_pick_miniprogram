<template>
  <div class="page page-grey">
    <div class="store" v-for="(item,index) in list" :key="index" @click="currentIndex=index">
      <div class="store_mn">
        <div class="store_tt">{{ item.name }}</div>
        <div class="store_ct">
          地址：<span class="text-ct">{{ item.address }}</span>
        </div>
        <div class="store_ct">
          联系人：<span class="text-ct">{{ item.contact }}</span>
          <span class="ml-40">
            联系电话：
            <span class="text-ct">{{ item.phone }}</span>
          </span>
        </div>


      </div>
      <div class="store_sd" :class="{'store_sd-on':index===currentIndex}"></div>
    </div>
    <div class="page_tip">
      <div>特别注意:</div>
      <div>
        1.下单费用是基于您填报的物品信息和重量、尺寸得出的预估费用，实际价格以您的物品经过仓库称重、测量、查验后得出的费用为准。
      </div>
      <div>
        2.请您下单后尽快将包裹快递到选定的仓库地址。如超过2天未到达仓库，运费将按实际到达日的价格计算。
      </div>
      <div>
        3.在您寄出包裹前，请将订单标签打印出来并贴在外包装上，或者在外包装上手写订单号，否则可能产生额外操作费。
      </div>
      <div>
        4. 请您尽可能确保填报的物品信息真实准确。否则，产生的退件或加收费用将由您承担。
      </div>
    </div>
    <div class="page_ft page_ft-fixed">
      <div class="btn-confirm" @click="confirm">确认选择</div>
    </div>
  </div>
</template>

<script>
import {getTransitStoreList} from "@/api/config";

export default {
  name: "storehouse",
  data() {
    return {
      currentIndex: 0,
      list: [],
      pid: ''
    }
  },
  onLoad(option) {
    const {pid} = option
    this.pid = pid
    this.getList()
  },
  methods: {
    async getList() {
      const params = {pid: this.pid}
      const {list: stores} = await getTransitStoreList(params)
      if (Array.isArray(stores)) {
        this.list = stores
      }
    },
    confirm() {
      const current = this.list[this.currentIndex]
      if (current) {
        this.$store.commit('sendOrder/setTransitStore', current)
        uni.navigateBack()
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins";

.page {
  padding-bottom: rem(80);
  &_tip {
    margin-top: rem(160);
    margin-bottom: rem(128);
    padding: 0 rem(32);

    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    line-height: rem(36);
  }

  &_ft {
    box-sizing: border-box;
    padding: rem(32);
  }
}

.store {
  display: flex;
  align-items: center;
  padding: rem(40) rem(30) rem(18) rem(32);
  background-color: #fff;

  &:not(:last-child) {
    border-bottom: rem(1) solid #E6E6E6;
  }

  &_mn {
    flex: 1;
  }

  &_sd {
    width: rem(46);
    height: rem(46);
    border-radius: 50%;
    border: rem(1) solid #AAAAAA;

    &-on {
      border: none;

      @include image-bg(rem(50), rem(50), url('../../assets/images/icon/checked_blue.png'))
    }
  }

  &_tt {
    margin-bottom: rem(20);
    font-size: rem(32);
    font-weight: 500;
    color: #343847;
    line-height: rem(45);
  }

  &_ct {
    margin-bottom: rem(16);
    font-size: rem(24);
    font-weight: 400;
    color: #7B7D87;
    line-height: rem(33);
  }
}

.text-ct {
  color: #343847;
}

.ml-40 {
  margin-left: rem(40);
}
</style>
