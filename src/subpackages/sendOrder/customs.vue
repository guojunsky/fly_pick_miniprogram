<template>
  <div class="page page-grey">
    <div class="history" v-if="historyRecord.length">
      <div class="history_mn">
        <div class="history_item" @click="addRowByRecord(item)" v-for="(item, index) in historyRecord" :key="index">
          {{ item.cnName }}
        </div>
      </div>
      <div class="history_sd" @click="clearRecord">
        <div class="icon-clear"></div>
        清空历史
      </div>

    </div>
    <div class="panel" v-for="(item, index) in list" :key="index">
      <div class="panel_hd">
        <div class="panel_tt">申报物品{{ index + 1 }}</div>
        <div class="panel_remove" @click="removeRow(index)"></div>
      </div>
      <div class="panel_bd">
        <div class="panel_row">
          <div class="panel_name">物品名称：</div>
          <div class="panel_ct">
            <input type="text" v-model="item.cnName" placeholder="请填写物品名称，比如男士帽子">
          </div>
        </div>
        <div class="panel_row">
          <div class="panel_name">物品数量：</div>
          <div class="panel_ct">
            <input type="text" v-model="item.quantity" placeholder="数量">
          </div>
        </div>
        <div class="panel_row">
          <div class="panel_name">物品单价：</div>
          <div class="panel_ct">
            <input type="text" v-model="item.price" placeholder="$/个">
          </div>
        </div>
      </div>
    </div>
    <div class="btn-add" @click="addRow">
      <div class="icon-add"></div>
      添加新的申报信息
    </div>
    <div class="tip">
      <div>
        <span class="tip_tt">请您尽量如实填写物品信息及合理的市场价值</span>
        <span class="tip_ct">，以降低因申报品名不完整或错误及申报价值不符等原因导致的清关风险。关税说明：</span>
      </div>
      <div class="tip_ct">
        <div>1.您的包裹到达目的地国后，当地海关有权决定是否对其征收关税和税费。</div>
        <div>2. 当一般包裹的申报价值低于寄件目的地国关税起征点时，通常不会被征税（非如实申报的情况除外）。</div>
        <div>3. 在您选择非包税产品的情况下，如果包裹被征税，需要您自行缴税并协助清关。</div>
        <div>4. 如果由于您未如实申报造成查验延误，产生的额外费用将与相关税费一道向您收取。</div>
      </div>
    </div>
    <div class="page_ft page_ft-fixed">
      <div class="price">
        申报金额：<span class="text-red">${{ totalPrice }}</span>
      </div>
      <div class="btn-confirm" @click="submit">确认</div>
    </div>
  </div>
</template>

<script>
import {customsModel} from '@/util/storage'
import {showMessage} from "@/util";

const createRow = () => {
  return {
    cnName: '',
    quantity: '',
    price: ''
  }
}
export default {
  name: "customs",
  data() {
    return {
      historyRecord: customsModel.get() || [],
      list: []
    }
  },
  computed: {
    customsManifest() {
      return this.$store.state.sendOrder.customsManifest
    },
    totalPrice() {
      return this.list.reduce((acc, row) => {
        return acc + (parseFloat((parseFloat(row.price) * 100).toFixed(2))) * row.quantity
      }, 0).toFixed(2) / 100 || 0
    },
  },
  created() {
    const {items = []} = this.customsManifest || {}
    this.list = [...items]
    if (!this.list.length) {
      this.addRow()
    }
  },
  methods: {
    addRow() {
      this.list.push(createRow())
    },
    addRowByRecord(record) {
      this.list.push({...record})
    },
    removeRow(index) {
      this.list.splice(index, 1)
    },
    clearRecord() {
      customsModel.remove()
      this.historyRecord = []
    },
    checkEmpty() {
      const isEmpty = (row) => {
        const {cnName, quantity, price} = row
        return !cnName || !quantity || !price
      }
      return this.list.some(isEmpty)
    },
    uniqueList() {
      let list = [...this.historyRecord, ...this.list]
      let map = {}
      let ans = []
      list.forEach(item => {
        const {cnName} = item
        if (cnName && !map[cnName]) {
          ans.push(item)
          map[cnName] = true
        }
      })
      return ans
    },
    submit() {
      if (this.checkEmpty()) {
        showMessage('请补全每一项信息')
        return
      }
      customsModel.update(() => {
        // let list = [...this.historyRecord, ...this.list]
        // return list.filter(row => row.cnName)
        return this.uniqueList()
      }, [])

      const params = {
        items: this.list,
        totalPrice: this.totalPrice
      }
      this.$store.commit('sendOrder/setCustomsManifest', params)
      uni.navigateBack()
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins";

.page {
  padding: rem(32) rem(32) rem(128);

  &_ft {
    box-sizing: border-box;
    padding: rem(24) rem(32);
  }
}

.history {
  display: flex;
  margin-bottom: rem(25);

  &_mn {
    flex: 1;
    overflow: auto;
    white-space: nowrap;
    margin-right: rem(30);
  }

  &_item {
    display: inline-block;
    border-radius: rem(8);
    border: rem(1) solid #056BF1;

    padding: rem(10) rem(27);

    font-size: rem(24);
    font-weight: 400;
    color: #056BF1;
    margin-right: rem(30);
  }

  &_sd {
    display: flex;
    align-items: center;

    font-size: rem(24);
    font-weight: 400;
    color: #7A7D86;
    line-height: rem(33);
  }
}

.panel {
  box-sizing: border-box;
  padding: 0 rem(24);
  margin-bottom: rem(20);

  height: rem(345);
  background: #FFFFFF;
  border-radius: rem(8);

  &_hd {
    padding-top: rem(24);
    display: flex;
    align-items: center;
    justify-content: space-between;

  }

  &_tt {
    font-size: rem(32);
    font-weight: 500;
    color: #343847;
  }

  &_remove {
    @include image-bg(rem(40), rem(40), url(../../assets/images/icon/trash.png))

  }

  &_ct {
    flex: 1;
  }


  &_row {
    height: rem(80);
    margin-bottom: rem(10);
    display: flex;
    align-items: center;

    &:not(:last-child) {
      border-bottom: 1px solid #E6E6E6;
    }
  }

  &_name {
    font-size: rem(28);
    font-weight: 400;
    color: #343847;
  }
}

.btn-add {
  margin: rem(52) auto;
  width: rem(533);
  height: rem(75);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
  box-shadow: 0 0 rem(4) 0 #0060DC;
  border-radius: rem(44);

  font-size: rem(28);
  font-weight: 400;
  color: #FFFFFF;
}

.price {
  width: rem(447);
  font-size: rem(30);
  font-weight: 500;
  color: #343847;
  line-height: rem(42);
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
</style>
