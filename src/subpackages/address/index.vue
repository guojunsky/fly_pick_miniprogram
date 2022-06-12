<template>
  <div class="page page-grey">
    <div class="page_hd">
      <div class="search-bar">
        <div class="search-bar_icon"></div>
        <div class="search-bar_mn">
          <input type="text" class="search-bar_input" placeholder="请输入姓名/手机号/公司名称" v-model="searchVal"
                 @change="searchAddr">
        </div>
      </div>
    </div>
    <div class="page_bd">
      <addressItem
          :isAboard="!isChinaAddress"
          :isCheckMode="isCheckMode" v-for="(item, index) in addressList" :address="item"
          @setDefault="setDefault(item,index)"
          @chooseAddr="chooseAddr(item,index)"
          @editAddr="addAddress(2,item)"
          @removeAddr="removeAddr(item)"
          :key="index"></addressItem>
      <div class="page_blank" v-if="!addressList.length">
        暂无数据
      </div>
    </div>
    <div class="page_ft page_ft-fixed">
      <div class="m32 btn-confirm" @click="confirmChoose" v-if="isCheckMode && addressList.length">确认选择</div>
      <div class="m32 btn-confirm" v-else @click="addAddress(1)">新增地址</div>
    </div>

  </div>
</template>

<script>

import {chooseCountry, saveAddress} from '@/util/eventBus'

import addressItem from './widget/address-item'

import {
  removeChinaAddress,
  editChinaAddress,
  removeAboardAddress,
  editAboardAddress
} from "@/api/address"

export default {
  name: "index",
  components: {
    addressItem
  },
  props: {
    //是否从fba来
    fromFba: {
      type: Boolean,
      default: false
    },
    // 寄件人或者收件人
    pageTypeFba: {
      type: String,
      default: "2"
    },
    // 是否是选择模式
    isCheckModeFba: {
      type: Boolean,
      default: true
    },
    //默认选中地址id
    defaultIdFba: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      pageType: '1', // 1 寄件人、2收件人
      isCheckMode: false, // 是否是选择模式
      pageIndex: 0,
      pageSize: 10,
      addressList: [],
      searchVal: '',
      allAddrList: []
    }
  },
  computed: {
    isChinaAddress() {
      return this.pageType === '1'
    },
    checkedAddress() {
      return this.addressList.find(row => row.isSelected)
    },
    defaultCountry() {
      return this.$store.state.address.defaultCountry
    },
  },
  created() {
    uni.$on(saveAddress, this.getAddressList)

    if (this.fromFba) {
      // 寄件人或者收件人
      this.pageType = this.pageTypeFba;

      // 是否是选择模式
      this.isCheckMode = this.isCheckModeFba;

      this.defaultId = this.defaultIdFba;

      //获取地址列表
      this.getAddressList()
    }

  },
  beforeDestroy() {
    uni.$off(saveAddress, this.getAddressList)
  },
  onLoad(option) {
    const {type, choose, defaultId} = option
    // 寄件人或者收件人
    this.pageType = !this.fromFba ? (type || '1') : this.pageTypeFba;

    // 是否是选择模式
    this.isCheckMode = !this.fromFba ? !!choose : this.isCheckModeFba;

    this.defaultId = !this.fromFba ? defaultId : this.defaultIdFba;

    //获取地址列表
    this.getAddressList()
  },
  methods: {
    searchAddr() {
      // 姓名/手机号/公司名称
      if (this.searchVal) {
        let val = this.searchVal
        let list = this.allAddrList.filter(item => {
          let result = item.name.indexOf(val) > -1 || item.phone.indexOf(val) > -1 || item.companyName.indexOf(val) > -1
          return result
        })
        this.handleAddrList(list)
      } else {
        this.handleAddrList(this.allAddrList)
      }
    },
    async getAddressList() {
      if (this.isChinaAddress) {
        await this.$store.dispatch('address/getChinaAddrList')
      } else {
        await this.$store.dispatch('address/getAboardAddressList')
      }

      const {list, aboardList} = this.$store.state.address
      const arr = this.isChinaAddress ? list : aboardList

      this.allAddrList = arr.map(row => {
        return {
          ...row,
          isSelected: row.id === this.defaultId
        }
      })
      this.handleAddrList(this.allAddrList)
    },
    handleAddrList(list) {
      this.addressList = list;
    },
    // 新增或编辑地址
    addAddress(type, item) {
      const id = (type === 2 && item) ? item.id : ''
      let url = this.isChinaAddress ? `/subpackages/address/addSender` : `/subpackages/address/addAddressee`
      url += `?id=${id}`

      uni.navigateTo({
        url
      })
    },
    // 删除地址
    removeAddr(addr) {
      const api = this.isChinaAddress ? removeChinaAddress : removeAboardAddress

      api({ids: [addr.id]}).then(res => {
        this.getAddressList()
      }).catch(() => {
        uni.showToast("删除失败，请稍后重试！")
      })
    },
    setDefault(addr) {
      const api = this.isChinaAddress ? editChinaAddress : editAboardAddress

      const params = {
        ...addr,
        defaultAt: !addr.defaultAt ? 1 : 0
      }
      api(params).then(res => {
        addr.defaultAt = !addr.defaultAt
        this.getAddressList()
      }).catch(e => {
        uni.showToast("设置失败，请稍后重试！")
      })
    },
    chooseAddr(addr, index) {
      if (!addr) return
      addr.isSelected = true

      this.addressList.map(item => {
        if (addr.id !== item.id) {
          item.isSelected = false
        }
      })

      if (this.isChinaAddress) {
        this.$store.commit('address/setSelectChinaAddress', addr)
      } else {
        this.$store.commit('address/setSelectAboardAddress', addr)
      }
    },
    checkCountryChange(address) {
      return new Promise((resolve, reject) => {
        uni.showModal({
          title: '确认',
          content: "您下单的产品目的地国家与您填写的收件地址所在国家不一致，可能导致下单产品变更及预估费用变化，您确认使用此地址吗？",
          success: ({confirm}) => {
            confirm ? resolve(true) : reject()
          },
          fail: reject
        })
      })
    },
    // 确认选择
    async confirmChoose() {
      if (this.checkedAddress) {
        // 与下单页面选择的国家不同，则弹出提示
        const {country, countryCode} = this.checkedAddress
        if (!this.isChinaAddress) {
          const countryChanged = this.defaultCountry && this.defaultCountry.areaCode !== countryCode

          if (countryChanged) {
            try {
              await this.checkCountryChange()
            } catch (e) {
              return // 返回重新选择
            }
          }
          // 如果之前有默认国家，则更新默认
          this.defaultCountry && this.$store.commit('address/setDefaultCountry', {
            cnName: country,
            areaCode: countryCode
          })
        }

        this.chooseAddr(this.checkedAddress)

      }
      uni.navigateBack()
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../assets/styles/mixins.scss';

.page {
  &_hd {
    position: fixed;
    z-index: 2;
    width: 100%;
    padding: rem(38) rem(32);
    background-color: #fff;
    box-sizing: border-box;
  }

  &_bd {
    padding: rem(141) 0 rem(128);
  }

  &_blank {
    display: block;
    margin-top: rem(50);
    font-size: rem(24);
    color: #3a3a3a;
    text-align: center;
  }
}

.search-bar {
  height: rem(65);
  background: #F0F1F1;
  border-radius: rem(33);

  display: flex;
  align-items: center;
  padding: 0 rem(24);

  &_icon {
    width: rem(30);
    height: rem(29);
    margin-right: rem(20);
    @include image-bg(rem(30), rem(30), url("../../assets/images/icon/search.png"))
  }

  &_mn {
    flex: 1;
  }

  &_input {
    width: 100%;

  }
}
</style>
