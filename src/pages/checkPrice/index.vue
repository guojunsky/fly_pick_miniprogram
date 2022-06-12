<template>
  <div class="page page-grey">

    <div class="filter-nav">
      <div class="filter-list">
        <div class="filter-item" :class="{'filter-item-on':sortType===item.key}" @click="toggleSortType(item.key)"
             v-for="(item,index) in filterList" :key="item.key">
          {{ item.name }}
          <div :class="[`filter-icon_1`]"></div>
        </div>
        <div class="filter-item" @click="toggleFilterWrapVisible" key="filter">
          筛选
          <div :class="[`filter-icon_2`]"></div>
        </div>

      </div>
      <div class="filter-wrap" v-show="filterWrapVisible" :key="resetCount">
        <div class="filter-wrap_bg" @click="toggleFilterWrapVisible"></div>
        <div class="filter-wrap_inner">
          <div class="filter-panel">
            <div class="filter-panel_hd">运输类型</div>
            <div class="filter-panel_bd">
              <div class="btn-border" @click="chooseDispatcherType(key)"
                   :class="{'btn-border-on':filterParams.dispatcherType.includes(dispatcherTypes[key])}"
                   v-for="(key,index) in dispatcherTypesObj" :key="index">
                {{ key }}
              </div>
            </div>
          </div>
          <div class="filter-panel filter-panel-tax">
            <div class="filter-panel_hd">是否含税</div>
            <div class="filter-panel_bd filter-panel_bd-flex">
              <customCheckbox class="mr-72" v-model="filterParams.isTax">含税</customCheckbox>
              <customCheckbox v-model="filterParams.isNoTax">不含税</customCheckbox>
            </div>
          </div>
          <div class="filter-panel">
            <div class="filter-panel_hd">参考时效</div>
            <div class="filter-panel_bd">
              <rangeSlider
                  :width="656"
                  :height="30"
                  :blockSize="34"
                  :min="1"
                  :max="21"
                  :values="filterParams.timeRange"
                  :step="1"
                  activeColor="#2550DC linear-gradient(90deg, #0060DC 0%, #19B7FF 100%);"
                  @rangechange="onRangeChange"
              >
              </rangeSlider>
              <div class="time-range">
                <div class="time-range_l">{{ filterParams.timeRange[0] }}天</div>
                <div class="time-range_r">{{ filterParams.timeRange[1] }}天</div>
              </div>

            </div>
          </div>
          <div class="filter-panel">
            <div class="filter-panel_hd">物流状态</div>
            <div class="filter-panel_bd filter-panel_bd-flex">
              <customCheckbox class="mr-72" v-model="filterParams.allTrack">全追踪</customCheckbox>
              <customCheckbox class="mr-72" v-model="filterParams.midTrack">半追踪</customCheckbox>
              <customCheckbox v-model="filterParams.noTrack">无追踪</customCheckbox>
            </div>
          </div>
          <div class="filter-wrap_ft">
            <div class="filter-wrap_reset" @click="resetFilterParams">重置</div>
            <div class="filter-wrap_confirm" @click="confirmSearch">确定</div>
          </div>
        </div>
      </div>

    </div>

    <div :class="['page_bd',showCheckBox?'page_bd_pm':'']">
      <div class="filter-result" v-if="filterResult">
        <div class="filter-result_tt">{{ filterResult }}</div>
      </div>

      <div class="product-list" v-if="productList.length">
        <div class="product-item-wrap" v-for="(item,index) in productList" :key="index">
          <div class="product-item">
            <div class="product-hd">
              <div class="product-hd_l">
                <img :src="item.dispatcherIcon" class="product-avatar" @click="handlerDetailPage(item)"
                     v-if="item.dispatcherIcon">
                <div class="product-avatar" @click="handlerDetailPage(item)" v-else></div>

                <div class="product-title">
                  <p class="product-tt" @click="handlerDetailPage(item)">{{ item.name }}</p>
                  <div class="product-score" @click="handlerCommentPage(item)" v-if="globalConfig.needComment===1">
                    <span class="product-score_tt">{{ item.star }}分</span>
                    <span class="product-score_num" >{{ item.commentCount }}条点评</span>
                  </div>
                </div>

              </div>
              <div class="product-hd_r">
                <div class="product-order_btn" v-if="!showCheckBox" @click="toOrderPage(item)">直接下单</div>
                <div :class="[item.isChecked?'product-checked':'product-check']" v-else
                     @click="changeProductStatus(item)"></div>
              </div>
            </div>

            <div class="product-line">
              <div class="product-line_left"></div>
              <div class="product-line_halving"></div>
              <div class="product-line_right"></div>
            </div>

            <div class="product-bd" @click="handlerDetailPage(item)">
              <div class="product-coupon">
                <div class="product-coupon_it" v-for="(coupon,i) in handleCouponList(item.coupons)" :key="i">
                  <div class="product-coupon_img"></div>
                  <span>{{ handleCoupon(coupon) }}</span>
                </div>
              </div>
              <div class="product-tag">
                <div class="product-tag_it" v-for="(tag,index) in item.tags" :key="index">{{ tag }}</div>
              </div>
              <div class="product-info">
                <div class="product-info_ct">
                  <p class="product-info_it product-info_it_mini">起运城市:<span>{{ city.cityName }}</span></p>
                  <p class="product-info_it">时效:<span>{{ item.agingStart }}-{{ item.agingEnd }}天送达</span></p>
                  <p class="product-info_it product-info_it_l">有效期至:<span>{{ formatValidTime(item.validTime) }}</span>
                  </p>
                </div>
                <div class="product-info_line"></div>
                <div class="product-info_ct">
                  <p class="product-info_it product-info_it_mini">
                    计费重:<span>{{ item.weightDetailVO.chargeWeight / 1000 }}KG</span></p>
                  <p class="product-info_it">单价:<span>{{ item.price / 100 }}元/KG</span></p>
                  <div class="product-info_it product-info_total">
                    总价：¥{{ item.totalPrice / 100 }}
                    <div class="icon-total" @tap.native.stop="openDetail" v-bind:id="index"></div>
                  </div>
                </div>
                <div class="product-tips" v-if="item.attention">
                  注意：{{ item.attention }}
                </div>
              </div>
            </div>

          </div>


        </div>

      </div>
      <productEmpty v-else-if="!isLoading"></productEmpty>

      <div class="page_ft page_ft-fixed" v-if="showCheckBox">
        <div class="m32 btn-confirm" @click="confirmChoose">确认选择</div>
      </div>
    </div>
    <slidePopup title="预估总价" :show.sync="totalPriceVisible">
      <totalPrice :detail="currentProduct && currentProduct.priceShows"
                  :surcharges="currentProduct && currentProduct.realSurcharges"></totalPrice>
    </slidePopup>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import {ConfigDataListApi} from '@/api/config'
import {searchProductOrder} from '@/api/product'

import radioBox from '@/components/form/radio-box.vue'
import customCheckbox from '@/components/form/check-box'
import rangeSlider from '@/components/form/range-slider'

import productEmpty from './empty'
import {mapGetters} from 'vuex'
import slidePopup from '@/components/slide-popup'
import totalPrice from '@/subpackages/sendOrder/widget/total-price'
import {showMessage, formatWeight, handlerCheckLogin} from "@/util";

const createDefaultFilterParams = () => {
  return {
    dispatcherType: [],
    isTax: false, //含税
    isNoTax: false,//不含税
    // 1全追踪 2半追踪 3无追踪
    allTrack: false,
    midTrack: false,
    noTrack: false,
    timeRange: [2, 21],
  }
}
export default {
  components: {radioBox, customCheckbox, rangeSlider, productEmpty, slidePopup, totalPrice},
  data() {
    return {
      isLoading: false,
      filterList: [
        {name: "推荐排序", ic: "1", key: 'default'},
        {name: "价格低优先", ic: "1", key: 'price'},
        {name: "时效快优先", ic: "1", key: 'agingTime'},
      ],

      productList: [],

      sortType: 'default',
      dispatcherTypes: {},
      filterWrapVisible: false,
      resetCount: 0,
      filterParams: createDefaultFilterParams(),
      showCheckBox: false,

      totalPriceVisible: false,
      currentProduct: null,
      // filterResult: "",

      fromName: "",
      toName: "",
      goodsInfo: {},
      startAreaCode: "",
      endAreaCode: "",
    }
  },
  computed: {
    ...mapGetters(['city', 'country', 'checkData', 'globalConfig']),
    dispatcherTypesObj() {
      return Object.keys(this.dispatcherTypes)
    },

    filterResult() {
      if (!this.goodsInfo) return ''
      const {goodsType, goodsValue, weight, packageDetail = []} = this.goodsInfo

      let filterType = '' //物品类型
      let filterGoodTypes = ''//特殊物品名称
      let filterWeight = `  |  重量：${weight}KG` //重量
      function sumWeight(data) {
        return data.reduce((prev, curr) => {
          return (prev.weight) * 1000 + (curr.weight) * 1000
        })
      }

      function sumVolume(data) {
        return data.reduce((prev, curr) => {
          return (((prev['length']) * 10) * ((prev['width']) * 10) * ((prev['height']) * 10)) + (((curr['length']) * 10) * ((curr['width']) * 10) * ((curr['height']) * 10))
        })
      }

      // 1文件 2包裹
      if (goodsType === 1) {
        filterType = '1份文件'
      } else if (goodsValue === 1 && packageDetail.length > 0) {
        // goodsValue 1汇总信息 2列表信息
        const {count, weight} = packageDetail[0]
        filterType = `${count}件包裹`

        filterWeight = `  |  重量：${weight}KG`
      } else {
        filterType = `${packageDetail.length}件包裹`
        if (packageDetail.length == 1) {
          filterWeight = `  |  重量：${packageDetail[0].weight}KG`
        } else if (packageDetail.length > 1) {
          //多件 多件总重量 多件总体积 特殊物品
          let tmpSumWeight = sumWeight(packageDetail) / 1000;
          filterWeight = `  |  重量：${tmpSumWeight}KG`
          //总体积单位是立方米 CBM
          let tmpVolume = parseFloat((sumVolume(packageDetail) / 1000000000).toFixed(4))
          if (tmpVolume) {
            filterWeight += `  ${tmpVolume}CBM`
          }

        } else {
          filterWeight = ""
        }

      }

      if (packageDetail.length === 1) {
        if (packageDetail[0]['goodTypes'].length) {
          filterGoodTypes = `  |  ${packageDetail[0]['goodTypes'].join('、')}`
        }

      } else if (packageDetail.length > 1) {
        let goodTypesTmp = []
        packageDetail.map(item => {
          if (item['goodTypes'].length) {
            for (let i = 0; i < item['goodTypes'].length; i++) {
              if (goodTypesTmp.indexOf(item['goodTypes'][i]) < 0) {
                goodTypesTmp.push(item['goodTypes'][i])
              }
            }
          }
        })
        if (goodTypesTmp.length) {
          filterGoodTypes = `  |  ${goodTypesTmp.join('、')}`
        }
      }

      return `${filterType}  ${filterWeight}  ${filterGoodTypes}`
    }
  },
  onLoad(option) {
    const {showCheckBox} = option
    this.showCheckBox = showCheckBox || false;
    if (this.showCheckBox) {
      //从下单页面进入
      console.log(this.$store.state.sendOrder.senderAddress, this.$store.state.sendOrder.receiverAddress, this.$store.state.sendOrder.goodsInfo)
      this.fromName = this.$store.state.sendOrder.senderAddress.city
      this.toName = this.$store.state.sendOrder.receiverAddress.country
      this.startAreaCode = this.$store.state.sendOrder.senderAddress.areaCode
      this.endAreaCode = this.$store.state.sendOrder.receiverAddress.countryCode
      //处理物品信息
      if (this.$store.state.sendOrder.goodsInfo) {
        this.goodsInfo = this.$store.state.sendOrder.goodsInfo;
      }
    } else {
      if (this.city && this.country) {
        this.fromName = this.city.cityName
        this.toName = this.country.cnName
        this.startAreaCode = this.city.areaCode
        this.endAreaCode = this.country.areaCode

        this.$store.commit('address/setDefaultCountry', {
          cnName: this.country.cnName,
          areaCode: this.country.areaCode
        })
      }
      //处理物品信息
      if (this.checkData) {
        this.goodsInfo = this.checkData;
      }
    }

    if (this.fromName && this.toName) {
      uni.setNavigationBarTitle({
        title: `${this.fromName}--${this.toName}`
      })
    }
    this.initConfigData()

  },
  methods: {
    confirmChoose() {

      let products = this.productList.filter(row => row.isChecked)
      if (products.length) {
        const product = products[0]
        this.$store.commit('sendOrder/setPid', product.id)
        this.$store.commit('sendOrder/setCurrentProduct', product)
        uni.navigateBack()
      } else {
        showMessage("请选择产品")
      }

    },
    changeProductStatus(item) {
      // item.isChecked = !item.isChecked

      if (!item) return
      item.isChecked = !item.isChecked

      this.productList.map(row => {
        if (row.id !== item.id) {
          row.isChecked = false
        }
      })
    },
    async initConfigData() {
      uni.showLoading({
        title: '加载中'
      });
      this.isLoading = true
      //从首页进入，选中的运输类型的数据从goodsInfo获取
      //从下单页面-切换产品进入，选中的运输类型的数据从checkPriceFilterParams获取
      const {dispatcherTypes: defaultDispatcherTypes} = this.goodsInfo
      const {dispatcherTypes = {}} = await ConfigDataListApi()
      if (this.showCheckBox) {

        let checkPriceFilterParams = this.$store.state.sendOrder.checkPriceFilterParams;
        let {dispatcher, logisticsInfo, agingStart, agingEnd} = checkPriceFilterParams;

        this.filterParams.dispatcherType = Array.isArray(dispatcher) ? JSON.parse(JSON.stringify(dispatcher)) : [];

        if (checkPriceFilterParams.hasOwnProperty("hasTax")) {
          if (checkPriceFilterParams.hasTax) {
            this.filterParams.isTax = true
          }
          if (!checkPriceFilterParams.hasTax) {
            this.filterParams.isNoTax = true
          }
        }
        if (Array.isArray(logisticsInfo) && logisticsInfo.length) {
          // 1全追踪 2半追踪 3无追踪
          this.filterParams.allTrack = logisticsInfo.indexOf(1) > -1
          this.filterParams.midTrack = logisticsInfo.indexOf(2) > -1
          this.filterParams.noTrack = logisticsInfo.indexOf(3) > -1
        }
        if (agingStart && agingEnd) {
          this.filterParams.timeRange = [agingStart, agingEnd]
        }

      } else {
        this.filterParams.dispatcherType = Array.isArray(defaultDispatcherTypes) ? JSON.parse(JSON.stringify(defaultDispatcherTypes)) : []
      }

      this.dispatcherTypes = dispatcherTypes
      this.search()
      uni.hideLoading();
    },
    resetFilterParams() {
      this.resetCount++
      this.filterParams = createDefaultFilterParams()
    },
    toggleFilterWrapVisible() {
      this.filterWrapVisible = !this.filterWrapVisible
    },
    confirmSearch() {
      this.filterWrapVisible = false
      this.search()
    },
    toggleSortType(key) {
      if (this.sortType === key) {
        this.sortType = 'default'
      } else {
        this.sortType = key
      }
      this.search()
    },
    chooseDispatcherType(key) {
      let val = this.dispatcherTypes[key]
      let idx = this.filterParams.dispatcherType.indexOf(val)
      if (idx > -1) {
        this.filterParams.dispatcherType.splice(idx, 1)
      } else {
        this.filterParams.dispatcherType.push(val)
      }
    },
    onRangeChange(args) {
      const {maxValue, minValue} = args
      this.filterParams.timeRange = [minValue, maxValue]
    },
    handlerDetailPage(item) {
      this.$store.dispatch('app/toggleDetail', item)
      //产品详情页
      uni.navigateTo({
        url: '/subpackages/detail/index'
      })
    },
    handlerCommentPage(item) {
      this.$store.dispatch('app/toggleComment', item)
      //评论列表
      uni.navigateTo({
        url: `/subpackages/commentList/index?pid=${item.id}`
      })
    },
    // 查询产品列表
    async search() {
      const {isTax, isNoTax, timeRange, allTrack, midTrack, noTrack, dispatcherType} = this.filterParams
      const [agingStart, agingEnd] = timeRange
      const {sortType} = this

      // 找到选中的物流状态类型
      let logisticsInfo = [1, 2, 3].filter((row, index) => {
        return [allTrack, midTrack, noTrack][index]
      })
      console.log("物品信息", this.city, this.goodsInfo)

      let packageDetail = formatWeight(this.goodsInfo.packageDetail)

      const params = {
        cursor: 0,
        count: 100,
        sort: sortType,
        queryVO: {
          // 从首页携带参数带过来
          startAreaCode: this.startAreaCode,
          endAreaCode: this.endAreaCode,
          goodsNature: this.goodsInfo.goodsNature,
          //物品信息
          goodsType: this.goodsInfo.goodsType,
          weight: this.goodsInfo.weight * 1000 || 0,
          packageDetail: packageDetail,

          dispatcher: dispatcherType,
          logisticsInfo,
          agingStart: agingStart,
          agingEnd: agingEnd,
          packageWay: this.goodsInfo.goodsValue === 1 ? 0 : 1 // 总的物品信息：1，详细物品信息：
        }
      }
      let checkPriceFilterParams = {
        dispatcher: params.queryVO.dispatcher,
        logisticsInfo,
        agingStart: params.queryVO.agingStart,
        agingEnd: params.queryVO.agingEnd
      }
      // 1含税 0不含 默认不传
      if ((isTax && !isNoTax) || (!isTax && isNoTax)) {
        params.queryVO['hasTax'] = (isTax && !isNoTax) ? 1 : 0
        checkPriceFilterParams['hasTax'] = params.queryVO['hasTax']
      }
      console.log("params : ", params)
      //存储筛选选项，算价接口需要
      this.$store.commit('sendOrder/setCheckPriceFilterParams', checkPriceFilterParams)
      this.isLoading = true
      const {list} = await searchProductOrder(params).finally(() => {
        // this.isLoading = false
      })
      if (!Array.isArray(list)){
        this.isLoading = false
        return
      }

      this.productList = list.map(row => {
        return {
          ...row,
          isChecked: false
        }
      })
      this.isLoading = false

    },
    formatValidTime(date) {
      return dayjs(date).format('YYYY.MM.DD')
    },
    handleCouponList(data) {
      if (data.length > 3) {
        let arr = data.slice(0, 3)
        return arr
      }
      return data
    },
    handleCoupon(data) {
      //0，打折；1，满减；2，每满减；3.直接减
      let obj = {
        0: `${(data.discount / 10).toFixed(1)}折`,
        1: `满${data.sourcePrice / 100}减${data.reducePrice / 100}`,
        2: `每满${data.eachPrice / 100}减${data.reducePrice / 100}`,
        3: `减${data.reducePrice / 100}`
      }
      return obj[data.type]
    },
    openDetail(e) {
      // console.log(e.target.id)
      this.currentProduct = this.productList[e.target.id];
      this.totalPriceVisible = true;
    },
    toOrderPage(item) {
      //登录判断
      uni.showLoading()
      handlerCheckLogin({
        success: (data) => {
          this.$store.dispatch('sendOrder/resetSendOrder')
          this.$store.commit('sendOrder/setGoodsInfo', this.goodsInfo)
          this.$store.commit('sendOrder/setPid', item.id)
          this.$store.commit('sendOrder/setCurrentProduct', item)

          uni.navigateTo({
            url: `/subpackages/sendOrder/index?showFba=${this.goodsInfo.fba}&pid=${item.id}`
          })
        },
        fail: (e) => {
          console.log("登录失败", e)
          showMessage(e && e.msg || '登录失败，请稍后重试')
        },
        done: () => {
          uni.hideLoading()
        }
      });

    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins";

.page {
  &_bd {
    padding: rem(88) rem(32) 0;
  }

  &_bd_pm {
    padding-bottom: rem(150);
  }


  .product {
    &-item-wrap {
      margin-bottom: rem(25);
    }

    &-item {
      width: rem(686);
      background: #FFFFFF;
      box-shadow: 0 rem(3) rem(10) 0 #E6E6E6;
      border-radius: rem(15);
      margin-bottom: rem(25);
      padding-bottom: rem(10);
    }

    &-hd {
      margin: 0 rem(22);
      // height: rem(130);
      // line-height: rem(130);
      padding: 30rpx 0  0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &_l {
        display: flex;
        justify-content: flex-start;
        align-items: center;

      }
    }

    &-avatar {
      width: rem(70);
      height: rem(70);
      background: #7B7D87;
      border-radius: rem(8);
      margin-right: rem(13);
    }

    &-title {
      // height: rem(130);
      // line-height: rem(130);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }

    &-tt {
      width: rem(382);
      height: rem(45);
      line-height: rem(45);
      font-size: rem(32);
      font-weight: 500;
      color: #343847;
      @include text-overflow()
    }

    &-score {
      line-height: rem(33);

      &_tt {
        font-size: rem(24);
        font-weight: 400;
        color: #E8011B;
      }

      &_num {
        font-size: rem(20);
        font-weight: 400;
        color: #777777;
        margin-left: rem(20);
      }
    }

    &-order_btn {
      width: rem(150);
      height: rem(52);
      line-height: rem(52);
      background: linear-gradient(90deg, #119CFF 0%, #0061DC 100%);
      border-radius: rem(33);

      font-size: rem(24);
      font-weight: 400;
      color: #FFFFFF;
      text-align: center;
    }

    &-check {
      width: rem(46);
      height: rem(46);
      background-color: #ffffff;
      border: rem(1) solid #AAAAAA;
      box-shadow: 0 rem(2) rem(4) 0 #E6E6E6;
      border-radius: rem(50);
    }

    &-checked {
      width: rem(50);
      height: rem(50);
      @include image-bg(rem(50), rem(50), url('../../assets/images/icon/checked_blue.png'));
    }

    &-line {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      &_left {
        width: rem(10);
        height: rem(20);
        border: rem(1) solid #F7F8F9;
        background-color: #F7F8F9;
        border-radius: 0 rem(20) rem(20) 0;
      }

      &_halving {
        width: rem(666);
        height: rem(2);
        text-align: center;
        border-bottom: rem(2) dotted #E8E8E8;
      }

      &_right {
        width: rem(10);
        height: rem(20);
        border: rem(1) solid #F7F8F9;
        background-color: #F7F8F9;
        border-radius: rem(20) 0 0 rem(20);

      }
    }

    &-bd {
      margin: 0 rem(21);
    }

    &-tag {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin: rem(10) 0 rem(10) rem(3);

      &_it {
        height: rem(32);
        background: #ECF4FF;
        border-radius: rem(4);

        font-size: rem(20);
        font-weight: 400;
        color: #056BF1;

        margin-right: rem(20);
        padding: rem(3) rem(10);
      }
    }

    &-info {
      &_ct {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: rem(10) 0;
      }

      &_it {
        width: rem(205);
        font-size: rem(20);
        color: #777777;
        font-weight: 400;

        span {
          color: #333333;
          margin-left: rem(4);
        }
      }

      &_it_mini {
        width: rem(190);
      }

      &_it_l {
        width: rem(230);
      }

      &_line {
        width: 100%;
        height: rem(1);
        text-align: center;
        border-bottom: rem(1) dotted #E6E6E6;
      }

      &_total {
        display: flex;
        justify-content: space-between;
        align-items: center;

        width: rem(245);
        font-size: rem(28);
        font-weight: 400;
        color: #EA3A3E;
      }
    }

    &-tips {
      margin: rem(14) 0 rem(24);
      font-size: rem(20);
      font-weight: 400;
      color: #AAAAAA;
      @include text-overflow-line(3);
    }

    &-coupon {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: wrap;
      margin: rem(10) 0;

      &_it {
        height: rem(32);
        background: rgba(234, 58, 62, 0.04);
        border-radius: rem(4);
        display: flex;
        justify-content: flex-start;
        align-items: center;

        padding: rem(2) rem(8);
        margin-right: rem(8);

        span {
          font-size: rem(20);
          font-weight: 400;
          color: #EA3A3E;
        }
      }

      &_img {
        @include image-bg(rem(27), rem(23), url('../../assets/images/icon/coupon.png'));
        margin-right: rem(8);
      }

    }
  }

}

.filter {
  &-nav {
    width: 100%;

    transform: rotate(0);
    position: fixed;
    left: 0;
  }

  &-list {
    height: rem(88);
    background: #FFFFFF;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-top: rem(1) solid #E6E6E6;
    border-bottom: rem(1) solid #E6E6E6;
  }

  &-item {
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: rem(24);
    font-weight: 500;
    color: #777777;

    &-on {
      color: #0D6FF1;

      .filter-icon_1 {
        @include image-bg(rem(17), rem(17), url('../../assets/images/icon/filter_s_on.png'));
      }
    }

  }

  &-icon_1 {
    width: rem(17);
    height: rem(17);
    @include image-bg(rem(17), rem(17), url('../../assets/images/icon/filter_s.png'));
    margin-left: rem(8);
  }

  &-icon_2 {
    width: rem(18);
    height: rem(25);
    @include image-bg(rem(18), rem(25), url('../../assets/images/icon/filter_ic.png'));
    margin-left: rem(8);
  }

  &-result {
    margin: rem(15) 0 rem(20);

    &_tt {
      font-size: rem(24);
      font-weight: 400;
      color: #056BF1;
      @include text-overflow-line(1);
    }
  }
}


.filter-wrap {
  position: fixed;
  top: rem(88);
  width: 100%;
  background-color: #ffffff;

  &_bg {
    width: 100%;
    position: absolute;
    z-index: 1;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
  }

  &_inner {
    position: relative;
    z-index: 2;
    background-color: #ffffff;
  }

  &_ft {
    padding: rem(70) 0 rem(54);
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  %btn {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: rem(266);
    height: rem(64);
    border-radius: rem(35);
    font-size: rem(26);
    font-weight: 400;
    text-align: center;
  }

  &_reset {
    @extend %btn;
    border: rem(2) solid #056BF1;
    line-height: rem(60);
    color: #056BF1;
  }

  &_confirm {
    @extend %btn;
    line-height: rem(64);
    background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
    box-shadow: 0 0 rem(3) 0 #0060DC;
    color: #fff;
  }
}

.filter-panel {
  overflow: auto;
  padding: 0 rem(30);
  margin-bottom: rem(20);

  &_hd {
    padding: rem(20) 0;
    font-size: rem(28);
    font-weight: 500;
    color: #343847;
    line-height: rem(40);
  }

  &_bd {
    &-flex {
      display: flex;
    }
  }
}

.btn-border {
  float: left;
  width: rem(143);
  height: rem(64);
  line-height: rem(60);
  border-radius: rem(4);
  border: rem(2) solid #C4C4C4;
  margin-bottom: rem(20);
  display: flex;
  align-items: center;
  justify-content: center;

  &:not(:nth-of-type(4n+4)) {
    margin-right: rem(35);
  }

  font-size: rem(26);
  font-weight: 400;
  color: #C4C4C4;
  text-align: center;

  &-on {
    border-color: #0069FA;
    color: #0069FA;
  }
}

.time-range {
  margin-top: rem(14);
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: rem(24);
  font-weight: 400;
  color: #A09D9D;
  line-height: rem(33);
}

.mr-72 {
  margin-right: rem(72);
}

.text-filter {
  font-size: rem(26);
}

.icon-total {

  @include image-bg(rem(18), rem(10), url('../../assets/images/icon/price_detail.png'));
  background-size: rem(18) rem(10);
  width: rem(36);
  height: rem(20);
}
</style>
