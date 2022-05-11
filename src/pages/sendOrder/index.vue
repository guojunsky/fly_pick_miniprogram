<template>
	<div class="page page-grey">
		<addressList :sender="senderAddress" :receiver="receiverAddress" :fbaval="fbaval" :goodsInfo="goodsInfo"></addressList>

		<div class="form">
			<div class="panel">
				<formItem label="物品&重量" labelWidth="180rpx">
					<div class="text-form text-form_goods" @click="handlerShowGoodsInfo">
						{{ goodInfoStr }}
					</div>
				</formItem>

				<template v-if="currentProduct">
					<formItem :label="fromPage !== 'confirmReceive'?'寄件方式':'取件方式'" labelWidth="180rpx">
						<div class="text-form" @click="modeVisible = true">{{ pickupTypeStr }}</div>
					</formItem>
					<formItem :label="fromPage !== 'confirmReceive'?'期望上门时间':'预约取件时间'" labelWidth="180rpx" v-if="pickupType===0">
						<div class="text-form" @click="takeTimeVisible = true">{{ pickupDateStr }}</div>
					</formItem>
					<formItem label="仓库地址" labelWidth="140rpx" v-if="pickupType===1 || pickupType===2">
						<div class="text-form" @click="toStorehousePage">
							<div class="text-form" v-if="transitStore">{{ transitStore.address }}</div>
							<div class="text-form" v-else>请选择中转仓</div>
							<!--            <div class="text-form text-form-xs text-form-gray">快递单号：402039039</div>-->
						</div>
					</formItem>
					<formItem label="物品信息" labelWidth="180rpx">
						<div @click="toCustomsPage" class="text-form text-form-gray" v-if="!customsManifest || !customsManifest.items || !customsManifest.items.length">请如实填写
						</div>
						<div @click="toCustomsPage" class="text-form" v-else>
							{{ customsManifest.items.length }}件报关物品
						</div>
					</formItem>
				</template>

			</div>
			<div class="panel" v-if="currentProduct && isShowOverheadInfo">
				<div class="panel_hd">
					<div class="panel_tt">附加信息</div>
					<div class="panel_sub" v-if="attachmentsTips">{{ attachmentsTips }}</div>
				</div>
				<div class="panel_bd">
					<div class="image-box-list">
						<div class="image-box" v-for="(item,index) in attachmentsList" :key="index" @click="pickImg(index)">
							<div v-if="!item">
								<div class="image-box_plus"></div>
							</div>

							<div class="image-box_inner" v-else>
								<div class="image-box_close" @click.stop="removeImg(index)"></div>
								<div class="image-box_ic_wrap" v-if="handleFileSuffix(item)['isImg']">
									<img :src="item" class="image-box_ic">
								</div>
								<div class="image-box_file">{{ handleFileSuffix(item)['name'] }}</div>
							</div>
						</div>
					</div>
				</div>

			</div>

			<div class="panel" v-if="currentProduct">
				<div class="panel_hd panel_hd-2">
					<div class="panel_tt">产品选择</div>
					<div class="panel_tt text-blue" @click="toChannelPage">切换产品</div>
				</div>
				<div class="channel">
					<img :src="currentProduct.dispatcherIcon" class="channel_sd" v-if="currentProduct.dispatcherIcon">
					<div class="channel_sd" v-else></div>

					<div class="channel_mn">
						<div class="channel_tt">{{ currentProduct.name }}</div>
						<div class="channel_ct">{{ currentProduct.agingStart }}-{{ currentProduct.agingEnd }}天到达
							单价¥{{ currentProduct.price / 100 }}/KG
						</div>
					</div>
					<div class="channel_r"></div>
				</div>

				<formItem label="附加费" labelWidth="130rpx" align="right" v-if="currentProduct && currentProduct.surcharges && currentProduct.surcharges.length">
					<div class="text-xs text-form-gray" @click="toAdditionalCharge" v-if="!surchargeTotalPrice">
						根据物品的不同可能产生额外的附加费， <br>
						如实填写将有助于您获得更精确的运价
					</div>
					<div class="text-form" @click="toAdditionalCharge" v-else>
						￥{{ surchargeTotalPrice }}
					</div>
				</formItem>
			</div>

			<div class="panel">
				<formItem label="优惠券" labelWidth="180rpx" v-if="currentProduct">
					<div class="text-form text-form-gray" v-if="!couponList.length && !currentCoupon">暂无优惠券</div>
					<div class="text-form" @click="couponVisible = true" v-else>
						<template v-if="!currentCoupon">
							{{ couponList.length }}张可用券
						</template>
						<template v-else>
							{{ currentCoupon.format.shortDesc }}
						</template>
					</div>
				</formItem>
<!--				<formItem label="保价" labelWidth="130rpx" v-if="currentProduct">-->
<!--					<div :class="['text-form',!currentInsur?'text-form-gray':'']" @click="toValueInsurance">-->
<!--						{{ currentInsur ? `${currentInsur.val}元` : '若物品价值超过1000元建议保价' }}-->
<!--					</div>-->
<!--				</formItem>-->
				<!--        <formItem label="增值服务" labelWidth="180rpx">-->
				<!--          <div class="text-form text-form-gray">暂无</div>-->
				<!--        </formItem>-->
				<formItem label="付款方式" labelWidth="180rpx" v-if="currentProduct">
					<div class="text-form " :class="{'text-form-gray': !paymentText}" @click="paymentVisible=true">
						{{ paymentText || '请选择支付方式' }}
					</div>
				</formItem>
				<formItem label="备注" labelWidth="180rpx">
					<input class="form-input" @input="inputRemark" v-model="form.remark" type="text" placeholder=" ">
				</formItem>
			</div>

		</div>
		<div class="footer">
			<div class="footer_mn">
				<div class="footer_ct">
					<span class="footer_text"> 应付 <span class="footer_ct_b text-red">¥{{ totalPriceTxt }}</span></span>
					<!--   优惠金额 + 代客下单加盟商打折金额 -->
					<span class="footer_text">已优惠¥{{ haveDiscountPrice }}</span>
					<span class="footer_text">|</span>
					<span class="footer_text footer_ct_w" @click="totalPriceVisible = !totalPriceVisible">明细</span>
					<div class="footer_ct_detail" v-if="!totalPriceVisible"></div>
					<div class="footer_ct_detail footer_ct_detail-2" v-else></div>
				</div>
				<div class="footer_tip" @click="agreementFlag=!agreementFlag" v-if="fromPage != 'confirmReceive'">
					<div class="footer_checkbox" :class="{'footer_checkbox-on':agreementFlag}"></div>
					阅读并同意 <span class="text-blue" @click.stop="toAgreementDetail">《用户寄件协议》</span>
				</div>
			</div>
			<div class="footer_sd">
				<div class="btn-pay" @click="confirmSubmit">{{ fromPage != 'confirmReceive' ? '下单' : '确认收货' }}</div>
			</div>
		</div>
		<slidePopup title="选择寄件方式" :show.sync="modeVisible">
			<modeList @input="changePickupType" :value="pickupTypeIndex" :list="sendTypeList"></modeList>
		</slidePopup>
		<slidePopup title="期望上门时间" :show.sync="takeTimeVisible">
			<takeTimeList @input="changePickupDate"></takeTimeList>
		</slidePopup>
		<slidePopup title="当前优惠" :show.sync="couponVisible">
			<couponList :list="couponList" :defaultIndex="defaultCouponIndex" @chooseItem="chooseCoupon"></couponList>
		</slidePopup>
		<slidePopup title="付款方式" :show.sync="paymentVisible">
			<payment @close="paymentVisible=false" @confirm="paymentConfirm"></payment>
		</slidePopup>
		<slidePopup style="top: -127rpx;" title="预估总价" :show.sync="totalPriceVisible">
			<totalPrice :detail="currentProduct && currentProduct.priceShows" :surcharges="currentProduct && currentProduct.realSurcharges"
			 :discountAmount="discountAmount" :couponAmount="discountPrice" :vas="currentProduct && currentInsurList"></totalPrice>
		</slidePopup>

		<custom-alert :visible.sync="confirmVisible" @confirm="submit" @close="confirmVisible = false" @change="changeOrderAlert">
		</custom-alert>

		<slidePopup title="物品信息" :show.sync="goodsVisible">
			<goodsInfo ref="goodsInfo" :fba="isFba" :fbaval.sync="fbaval" :send-order="true" @confirm="confirmOrderGoods"
			 :fromPage="fromPage"></goodsInfo>
		</slidePopup>
	</div>
</template>

<script>
	import {
		showMessage,
		updateCheckPage
	} from '@/util'
	import formItem from '@/components/form/form-item'
	import slidePopup from '@/components/slide-popup'

	import addressList from './widget/address-list'
	import couponList from './widget/coupon-list'
	import modeList from './widget/mode-list'
	import takeTimeList from './widget/time-panel'
	import payment from './widget/payment'
	import totalPrice from './widget/total-price'

	import customAlert from '@/components/popup/alert'
	import goodsInfo from '@/components/goodsinfo/goodsinfo.vue'
	import {
		defaultCheckPriceFilterParams
	} from '@/store/modules/sendOrder'
	import {
		leagueOrderGet
	} from "@/api";
	import {
		mapGetters
	} from "vuex";
	import {
		valueAddedServiceCalc
	} from "@/api/order";
	import {
		uploadToCos
	} from "@/util/upload";
	import deepEqual from 'deep-equal'

	export default {
		name: "index",
		components: {
			addressList,
			takeTimeList,
			couponList,
			modeList,
			totalPrice,
			formItem,
			slidePopup,
			payment,
			customAlert,
			goodsInfo
		},
		props: {
			//代客下单
			isReplace: {
				type: Boolean,
				default: true
			},
			isLoad: {
				type: Boolean,
				default: false
			},
			isUnload: {
				type: Boolean,
				default: false
			},
			isShow: {
				type: Boolean,
				default: false
			}
		},
		data() {
			// const takeTimeList = [{name: "今天8:00-9:00", value: 1}, {name: "今天9:00-0:00", value: 2}]
			return {
				fbaval: 2,
				isFba: false, // 是否是fab模式
				modeVisible: false, // 选择寄件方式
				takeTimeVisible: false, // 选择时间
				couponVisible: false, // 选择优惠券列表
				paymentVisible: false, // 支付方式
				confirmVisible: false, // 二次确认
				totalPriceVisible: false, // 总价
				agreementFlag: true, // 协议
				form: {
					remark: this.remark || ''
				},
				goodsVisible: false, // 物品信息弹窗
				fromPage: '',
				isLoading: false,
				isCouponLoading: false,
				discountPrice: 0,

				pid: "",
				insuranceCharge: '--',
				attachmentsList: [''], //附加信息
				attachmentsTips: "", //附加信息提示
			}
		},
		computed: {
			...mapGetters(['userInfo']),
			//是否展示附加信息
			isShowOverheadInfo() {
				let tmpArray = [];
				if (this.currentProduct && this.currentProduct.productSpecialGoods) {
					tmpArray = this.currentProduct.productSpecialGoods.filter(item => item.needInfo)
				}
				if (tmpArray.length) {
					this.attachmentsTips = tmpArray[0].infoDesc
				}

				return this.currentProduct && tmpArray.length;
			},
			discountAmount() {
				if (this.fromPage != 'confirmReceive') {
					if (!this.currentProduct) {
						return 0
					}

					return (this.currentProduct.discountPrice) || 0;
				}
				return 0;
			},
			//展示已优惠金额
			haveDiscountPrice() {
				//使用优惠券的金额+加盟商打折金额  仅限代客下单才加加盟商打折金额
				if (this.fromPage != 'confirmReceive') {
					if (!this.currentProduct) {
						return 0
					}
					return parseFloat(((this.discountPrice * 100 + this.currentProduct.discountPrice) / 100).toFixed(2)) || 0;
				}
				if (!this.currentProduct) {
					return 0
				}
				return this.discountPrice || 0;
			},
			//应付金额 -- 优惠券处理
			totalPriceTxt() {
				return parseFloat(((this.totalPriceInsur * 100 - this.discountPrice * 100) / 100).toFixed(2))
			},
			//应付金额 -- 保价处理
			totalPriceInsur() {
				if (!this.currentProduct) return 0;
				if (!this.currentInsur) {
					return (this.currentProduct && this.currentProduct.totalPrice || 0) / 100
				}
				return parseFloat(((this.currentProduct.totalPrice + this.currentInsur.charge * 100) / 100).toFixed(2))
			},
			// 寄件方式
			sendTypeList() {

				//fromPage: 'order'-直接下单  'confirmReceive'-确认收货 'againOrder'-重新下单
				let list = [{
					name: '国内快递到仓库',
					value: 1
				}, {
					name: '自送到仓库',
					value: 2
				}]
				if (this.fromPage != 'confirmReceive') { //代客下单，寄件方式只有上门取件
					list = []
				}
				// const list = [{name: '国内快递到仓库', value: 1}, {name: '自送到仓库', value: 2}]
				const {
					pickupConfig
				} = this.$store.state.sendOrder
				const {
					canPickUp
				} = pickupConfig
				if (canPickUp) {
					return [{
						name: '预约上门取件',
						value: 0
					}, ...list]
				} else {
					return list
				}

			},
			senderAddress() {
				return this.$store.state.sendOrder.senderAddress
			},
			receiverAddress() {
				return this.$store.state.sendOrder.receiverAddress
			},
			couponList() {
				return this.$store.state.sendOrder.couponList
			},
			currentProduct() {
				return this.$store.state.sendOrder.currentProduct
			},
			transitStore() {
				return this.$store.state.sendOrder.transitStore
			},
			surchargeTotalPrice() {
				return this.$store.getters['sendOrder/surchargeTotalPrice'] / 100
			},
			currentCoupon() {
				return this.$store.state.sendOrder.currentCoupon
			},
			defaultCouponIndex() {
				let tmpIndex = -1;
				if (this.currentCoupon && this.couponList.length) {
					for (let i = 0; i < this.couponList.length; i++) {
						if (this.couponList[i].couponId == this.currentCoupon.couponId) {
							tmpIndex = i
						}
					}
				}

				return tmpIndex
			},
			currentInsur() {
				return this.$store.state.sendOrder.currentInsur
			},
			currentInsurList() {
				return this.currentInsur && [{
					chargeName: '保价费',
					totalPrice: parseFloat((parseFloat(this.currentInsur.charge) * 100).toFixed(2))
				}] || []
			},
			customsManifest() {
				return this.$store.state.sendOrder.customsManifest
			},
			pickupType() {
				return this.$store.state.sendOrder.pickupType
			},
			pickupDate() {
				const {
					pickupDate
				} = this.$store.state.sendOrder
				return pickupDate
			},
			pickupDateStr() {
				const {
					pickupDate
				} = this
				return pickupDate && pickupDate.str || '请选择上门时间'
			},
			pickupTypeItem() {
				const item = this.sendTypeList.find(item => item.value === this.pickupType)
				return item
			},
			pickupTypeIndex() {
				return this.sendTypeList.indexOf(this.pickupTypeItem)
			},
			pickupTypeStr() {
				const item = this.pickupTypeItem
				return item && item.name || '请选择寄件方式'
			},
			goodsInfo() {
				return this.$store.state.sendOrder.goodsInfo
			},
			goodInfoStr() {
				if (!this.goodsInfo) return '请填写商品信息'
				const {
					goodsType,
					goodsValue,
					weight,
					packageDetail
				} = this.goodsInfo

				// 1文件 2包裹
				if (goodsType === 1) {
					return `文件/1件/${weight}KG`
				}

				function sumWeight(data) {
					console.log(data)
					return data.reduce((prev, curr) => {
						return (prev.weight) * 1000 + (curr.weight) * 1000
					})
				}

				// 1汇总信息 2列表信息
				if (goodsValue == 1 || packageDetail.length === 1) {
					const {
						count,
						weight
					} = packageDetail[0]
					let weightTmp = packageDetail[0].weight
					let filterGoodTypes = ""
					if (packageDetail[0]['goodTypes'].length) {
						filterGoodTypes = `${packageDetail[0]['goodTypes'].join('、')}`
					}
					if (filterGoodTypes) {
						return `包裹/${count}件/${weightTmp}KG/${filterGoodTypes}`
					}
					return `包裹/${count}件/${weightTmp}KG`
				} else if (goodsValue == 2 && packageDetail.length > 1) {
					let tmpSumWeight = sumWeight(packageDetail) / 1000;

					let filterGoodTypes = ""
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
						filterGoodTypes = `${goodTypesTmp.join('、')}`
					}
					if (filterGoodTypes) {
						return `包裹/${packageDetail.length}件/${tmpSumWeight}KG/${filterGoodTypes}`
					}
					return `包裹/${packageDetail.length}件/${tmpSumWeight}KG`
				}
			},

			remark() {
				return this.$store.state.sendOrder.remark
			},
			//  根据优惠券类型和总价计算优惠金额 todo
			// discountPrice() {
			//   const {currentCoupon} = this
			//   if (!currentCoupon) return 0
			//   return currentCoupon.format.num
			// },
			paymentText() {
				const {
					payment = {}
				} = this.$store.state.sendOrder
				const {
					paymentType
				} = payment
				const map = {
					1: '寄付现结',
					2: '挂账'
				}
				return map[paymentType] || ""
			},
			confirmReceiveData() {
				return this.$store.state.sendOrder.confirmReceiveData
			},
			hasTax() {
				return this.currentProduct && this.currentProduct.hasTax
			},

		},
		onLoad(option) {
			const {
				pid,
				showFba,
				fromPage
			} = option
			this.initOrderData(pid, showFba, fromPage)
		},
		onUnload() {
			this.$refs.goodsInfo && this.$refs.goodsInfo.initInfo()
			this.resetDefaultCountry()
		},
		onShow() {
			// this.$refs.goodsInfo.initData()
			// this.fromPage != 'confirmReceive'
			this.$store.commit('sendOrder/setFromPage', this.fromPage)
			this.$store.dispatch('sendOrder/initSendOrder')
		},
		watch: {
			isLoad(newVal) {
				this.initOrderData("", "1", "order")
			},
			isUnLoad(newVal) {
				this.$refs.goodsInfo.initInfo()

			},
			isShow(newVal) {
				this.$store.commit('sendOrder/setFromPage', this.fromPage)
				this.$store.dispatch('sendOrder/initSendOrder')
			},
			// 收货地址
			receiverAddress() {
				this.getProductDetail()
			},
			// 报关信息
			customsManifest() {
				this.getProductDetail()
			},
			// 寄件物品信息
			goodsInfo() {
				if (this.goodsInfo && this.goodsInfo.goodsNature) {
					this.fbaval = this.goodsInfo.goodsNature.indexOf(4) > -1 ? 1 : 2
				}
				this.getProductDetail()
				//重置物品信息改变值
				this.$store.commit('sendOrder/setIsChangeGoodsInfo', 0)
			},
		},
		methods: {
			handlerShowGoodsInfo() {
				this.goodsVisible = true
				this.$refs.goodsInfo.setInfos(this.goodsInfo)
			},
			//文件后缀名处理
			handleFileSuffix(name) {
				let first = name.lastIndexOf(".");
				let nameLength = name.length;
				let fileSuffix = name.substring(first + 1, nameLength);
				console.log(fileSuffix)
				// 可以上传支持图片，pdf，word，excel，zip/rar等文件格式。
				if (fileSuffix == 'jpg' || fileSuffix == 'png' || fileSuffix == 'gif') {
					return {
						isImg: true
					}
				} else {
					return {
						isImg: false,
						name: fileSuffix
					}
				}
			},
			//删除附加信息图片
			removeImg(index) {
				//先删除
				this.attachmentsList.splice(index, 1)
				//再判断数组是否为空，为空则增加一个空字符串
				if (this.attachmentsList.length <= 0) {
					this.attachmentsList = ['']
				}
				if (this.attachmentsList.length < 4 && this.attachmentsList.indexOf('') < 0) {
					this.attachmentsList.push('')
				}
			},
			//附加信息选择图片上传
			pickImg(index) {
				uploadToCos((url) => {
					if (url) {
						this.attachmentsList.splice(index, 1, url);
						if (index === this.attachmentsList.length - 1 && this.attachmentsList.length < 4) {
							this.attachmentsList.push('')
						}

					} else {
						showMessage('上传失败，请重试')
					}

				}, {
					type: 'image'
				});
			},
			resetDefaultCountry() {
				this.$store.commit('address/setDefaultCountry', null)
			},
			//处理确认收货物品信息,pid,currentProduct回填
			handlerGoods(data) {
				if (!data) return
				let {
					goodsType,
					weight,
					goodsNature,
					packageDetail,
					dispatcher,
					pid
				} = data;
				let pDetail = packageDetail.map(item => {
					return {
						...item,
						weight: item.weight / 1000,
					}
				})

				let goodsInfo = {
					goodsType,
					weight: weight / 1000,
					goodsValue: packageDetail.length > 1 ? 2 : 1, // 总的物品信息：1，详细物品信息：2
					fbaValue: 1,
					goodsNature,
					fba: false,
					dispatcherTypes: dispatcher,
					packageDetail: pDetail
				}
				this.$store.commit('sendOrder/setGoodsInfo', goodsInfo)
				this.$store.dispatch('app/toggleCheckData', goodsInfo);

				this.$store.commit('sendOrder/setCurrentProduct', data)
			},
			async initOrderData(pid, showFba, fromPage) {

				this.fromPage = fromPage

				if (this.fromPage === 'order') {
					//重置筛选条件
					this.$store.commit('sendOrder/setCheckPriceFilterParams', defaultCheckPriceFilterParams())
				}
				//重新下单
				if (this.fromPage === 'againOrder') {
					//回填报关
					if (this.currentProduct && this.currentProduct.manifest) {
						let manifest = {
							items: [],
							totalPrice: (this.currentProduct.manifest.totalPrice / 100) || 0
						};
						if (this.currentProduct.manifest.items.length) { //若没有项目明细，则没有报关信息
							manifest.items = this.currentProduct.manifest.items.map(item => {
								const {
									cnName,
									quantity,
									price
								} = item
								return {
									cnName,
									quantity,
									price: (price / 100) || 0
								}
							})
						}
						this.$store.commit('sendOrder/setCustomsManifest', manifest)
					}
				}
				//fromPage: 'order'-直接下单  'confirmReceive'-确认收货 'againOrder'-重新下单
				let crPid = ""

				if (this.fromPage === 'confirmReceive' && this.confirmReceiveData) {
					wx.setNavigationBarTitle({
						title: '确认收货'
					})

					//确认收货
					// 1.从store获取订单信息，查询订单详情 从订单详情数据中获取pid order.queryVO.pid 废弃
					// 1.从 列表数据中获取productQueryVO
					let {
						orderNo,
						chinaAddress,
						abroadAddress,
						remark,
						pickup,
						uid
					} = this.confirmReceiveData
					//todo 查询下单用户订单详情 queryVO: productQueryVO,
					const res = await leagueOrderGet({
						orderNo
					})

					let order = null;
					if (res.ret_code === '0000') {
						order = res.leagueOrder
					}
					crPid = order.queryVO.pid || ''


					// 2.根据订单数据填写寄件地址和收货地址
					this.$store.commit('address/setSelectChinaAddress', chinaAddress)
					this.$store.commit('address/setSelectAboardAddress', abroadAddress)
					// this.$store.commit('sendOrder/setSenderAddress', chinaAddress)
					// this.$store.commit('sendOrder/setReceiverAddress', abroadAddress)
					// 3.商品明细信息 物品信息
					this.handlerGoods(order.queryVO)

					// 4.回填取货方式
					//类型：0 预约上门取货；1 国内快递到仓库；2 自送到中转仓
					this.$store.commit('sendOrder/setPickupType', pickup.type)
					//  date begin end  预约时间
					let {
						date,
						begin,
						end
					} = pickup;
					let beginTmpStr = begin.toString()
					let beginStr = beginTmpStr.length < 4 ? `0${beginTmpStr}` : beginTmpStr
					let endTmpStr = end.toString()
					let endStr = endTmpStr.length < 4 ? `0${endTmpStr}` : endTmpStr
					let dateStr = date.toString()

					let year = dateStr.substring(0, 4)
					let month = dateStr.substring(4, 6)
					let day = dateStr.substring(6, 8)

					let pickupData = {
						"begin": beginStr,
						"date": dateStr,
						"end": endStr,
						"str": `${year}-${month}-${day} ${beginStr.substring(0, 2)}:${beginStr.substring(2, 4)}-${endStr.substring(0, 2)}:${endStr.substring(2, 4)}` //"明天 10:00-11:00"
					}

					this.$store.commit('sendOrder/setPickupDate', pickupData)

					//中转仓  storeId storeAddr
					let {
						storeId,
						storeAddr
					} = pickup;

					this.$store.commit('sendOrder/setTransitStore', {
						id: storeId,
						address: storeAddr
					})

					// 5.回填用户备注
					this.form.remark = remark;
					this.$store.commit('sendOrder/setRemark', remark)

					//6.记录下单用户id
					this.$store.commit('sendOrder/setOrderUserId', uid)

					//7.补充增加 报关，保价，附加费，附加信息回填
					if (order) {
						//报关
						let manifest = {
							items: [],
							totalPrice: (order.manifest.totalPrice / 100) || 0
						};
						if (order.manifest.items.length) { //若没有项目明细，则没有报关信息
							manifest.items = order.manifest.items.map(item => {
								const {
									cnName,
									quantity,
									price
								} = item
								return {
									cnName,
									quantity,
									price: (price / 100) || 0
								}
							})
						}
						this.$store.commit('sendOrder/setCustomsManifest', manifest)

						//保价
						if (order.vas.length) {
							let vas = order.vas;
							// 请求接口计算保价费用
							let data = vas[0].price / 100 || 0
							await this.getInsurCharge(data)
							this.$store.commit('sendOrder/setCurrentInsur', {
								val: data,
								charge: this.insuranceCharge
							})
						}

						//附加费
						if (order.product.surcharges) {
							this.$store.commit('sendOrder/setSurcharges', order.product.surcharges)
						}
						//附加信息
						if (order.attachments.length) {
							this.$store.commit('sendOrder/setAttachments', order.attachments)
							this.attachmentsList = order.attachments;
							if (this.attachmentsList.length < 4) {
								this.attachmentsList.push('')
							}
						}
						//获取已使用优惠券
						if (order.coupon) {
							let currentCoupon = order.coupon;
							currentCoupon['format'] = {};
							currentCoupon['format']["shortDesc"] = currentCoupon.name;
							this.$store.commit('sendOrder/setCurrentCoupon', currentCoupon)
							//回填优惠金额
							this.discountPrice = parseFloat((currentCoupon.price / 100).toFixed(2)) || 0
						}
					}

				}
				this.pid = (this.fromPage !== 'confirmReceive') ? pid : crPid

				this.$store.commit('sendOrder/setPid', this.pid)

				// this.$store.dispatch('sendOrder/getPickupConfig')

				if (!this.pid) {
					// 链接上没有携带pid，则自动弹出选择物品弹出，然后根据物品查询产品
					this.goodsVisible = true
				}

				// 直接下单和电商卖家入口才展示fba
				this.isFba = (showFba === '1' || showFba === 'true')
				if (this.goodsInfo && this.goodsInfo.goodsNature) {
					this.fbaval = this.goodsInfo.goodsNature.indexOf(4) > -1 ? 1 : 2
				}
				this.$store.commit('sendOrder/setFromPage', this.fromPage)
				this.$store.dispatch('sendOrder/initSendOrder')

				//优化： 如果是不含税产品且付税方式预付和到付都有，下单页默认选到付
				if (!this.hasTax && this.currentProduct) {
					if (this.currentProduct.taxType == 3 || this.currentProduct.taxType == 2) {
						this.$store.commit('sendOrder/setPayment', {
							payAt: 2,
							paymentType: 1,
							monthlyNo: '',
						})
					}

					if (this.currentProduct.taxType == 1) {
						this.$store.commit('sendOrder/setPayment', {
							payAt: 1,
							paymentType: 1,
							monthlyNo: '',
						})
					}

				}
			},
			//请求接口计算保价费用
			async getInsurCharge(val) {
				var params = {
					"vasList": [{
						selected: 1,
						type: 0,
						price: val * 100
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

			changeOrderAlert(val) {
				uni.setStorageSync('orderAlert', val)
			},
			getProductDetail() {
				if (!this.receiverAddress || !this.goodsInfo) return
				this.$store.dispatch('sendOrder/getProductDetail')
			},
			async changePickupType(item) {
				const {
					value
				} = item
				//填写默认仓库
				if (value != 0 && (this.pickupType != value)) {
					await this.setDefaultStore()
				}
				this.$store.commit('sendOrder/setPickupType', value)

			},
			async setDefaultStore() {
				const params = {
					pid: this.pid
				}
				const {
					stores
				} = await getTransitStoreList(params)
				if (Array.isArray(stores) && stores.length) {
					const current = stores[0]
					if (current) {
						this.$store.commit('sendOrder/setTransitStore', current)
					}
				}
			},
			changePickupDate(val) {
				this.$store.commit('sendOrder/setPickupDate', val)
			},
			async chooseCoupon(coupon) {
				this.$store.commit('sendOrder/setCurrentCoupon', coupon)
				//todo 请求计算优惠券接口

				if (this.isCouponLoading) return
				this.isCouponLoading = true
				try {
					const res = await this.$store.dispatch('sendOrder/calCoupon', this.totalPriceInsur)
					this.isCouponLoading = false

					if (res.ret_code === '0000') {
						this.discountPrice = parseFloat((res.reducePrice / 100).toFixed(2))
					} else {
						this.discountPrice = 0;
					}

				} catch (e) {
					this.discountPrice = 0;
					this.isCouponLoading = false
					console.log("获取优惠券金额失败", e)
				}
			},
			confirmOrderGoods(data) {
				this.$store.commit('sendOrder/setIsChangeGoodsInfo', deepEqual(this.goodsInfo, data) ? 0 : 1)
				this.$store.commit('sendOrder/setGoodsInfo', JSON.parse(JSON.stringify(data)))
				this.goodsVisible = false
				// 提示一下
				if (!this.receiverAddress) {
					showMessage('请选择收件地址')
				}
			},
			// 报关
			toCustomsPage() {
				uni.navigateTo({
					// url: `customs`
					url: `/pages/sendOrder/customs`,
				})
			},
			// 附加费
			toAdditionalCharge() {
				const {
					currentProduct
				} = this
				if (!currentProduct) return

				if (!this.receiverAddress) {
					showMessage('请选择收件地址')
					return
				}
				const {
					id
				} = currentProduct
				uni.navigateTo({
					// url: `additionalCharge?pid=${id}`
					url: `/pages/sendOrder/additionalCharge?pid=${id}`,
				})
			},
			// 保价
			toValueInsurance() {
				uni.navigateTo({
					// url: `valueInsurance`,
					url: `/pages/sendOrder/valueInsurance`,
				})
			},
			// 渠道产品页面
			toChannelPage() {
				//判断是否有收件人信息
				if (!this.receiverAddress) {
					showMessage('请选择收件地址')
					return
				}
				uni.navigateTo({
					url: `/pages/checkPrice/index?showCheckBox=true`,
					success: res => {},
					fail: (e) => {
						console.log(e)
					},
					complete: () => {}
				})
			},
			// 仓库选择页面
			toStorehousePage() {
				const {
					currentProduct
				} = this
				if (!currentProduct) return

				const {
					id
				} = currentProduct

				uni.navigateTo({
					// url: `storehouse?pid=${id}`,
					url: `/pages/sendOrder/storehouse?pid=${id}`,
					success: res => {},
					fail: (e) => {
						console.log(e)
					},
					complete: () => {}
				})
			},
			confirmSubmit() {
				if (!this.senderAddress) {
					showMessage('请选择寄件地址')
					return
				}
				if (!this.receiverAddress) {
					showMessage('请选择收件地址')
					return
				}
				if (!this.currentProduct) {
					showMessage('请选择产品')
					return
				}

				if (!this.pickupType && this.pickupType !== 0) {
					showMessage('请选择寄件方式')
					return
				}
				if (this.pickupType === 0) {
					if (!this.pickupDate) {
						showMessage('请选择上门时间')
						return
					}
				} else {
					if (!this.transitStore) {
						showMessage('请选择中转仓')
						return
					}
				}

				//附加信息
				let attachmentsList = this.attachmentsList.filter(item => item)
				if (this.isShowOverheadInfo && !attachmentsList.length) {
					showMessage('请上传资质文件')
					return
				}
				this.$store.commit('sendOrder/setAttachments', attachmentsList)

				//下单时如果物品是包裹，下单时报关信息需要必填
				//goodsType 1文件  2包裹
				if (this.goodsInfo.goodsType === 2 && !(this.customsManifest.items && this.customsManifest.items.length)) {
					showMessage('请填写报关信息')
					return
				}

				if (this.fromPage !== 'confirmReceive' && !this.agreementFlag) {
					showMessage('请勾选服务协议')
					return
				}

				let orderAlert = uni.getStorageSync('orderAlert')

				if (orderAlert) {
					this.submit()
				} else {
					this.confirmVisible = true
				}

			},
			inputRemark() {
				this.$store.commit('sendOrder/setRemark', this.form.remark)
			},
			toAgreementDetail() {
				// const link = 'https://sp.sendatek.com/about/send.html'
				// const url = encodeURIComponent(link)
				// uni.setStorageSync('url', url)
				uni.navigateTo({
					url: `/pages/protocol/protocol?filed=order`
				})
			},
			async submit() {
				//判断是否为确认收货  todo
				if (this.fromPage == 'confirmReceive') {
					this.confirmVisible = false
					if (this.isLoading) return
					this.isLoading = true

					try {
						const res = await this.$store.dispatch('sendOrder/confirmLeagueOrder', uid) //确认收货
						this.isLoading = false
						if (res.ret_code === '0000') {
							showMessage("确认收货成功")
							updateCheckPage()
							setTimeout(() => {
								uni.navigateBack()
							}, 500)
						} else {
							showMessage((res && res.ret_msg || "确认收货失败"))
						}
					} catch (e) {
						this.isLoading = false
						console.log('确认收货error', e)
						showMessage((e && e.ret_msg || "确认收货失败"))
					}

					return
				}


				this.confirmVisible = false
				if (this.isLoading) return
				this.isLoading = true

				let uid = this.userInfo.id
				try {
					const {
						order
					} = await this.$store.dispatch('sendOrder/createOrder', uid) //代客下单
					this.isLoading = false
					const {
						orderNo
					} = order || {}

					if (!orderNo) {
						showMessage('下单失败')
						return
					}
					this.resetDefaultCountry()
					uni.redirectTo({
						url: `success?orderId=${orderNo}` // 跳转到成功页面
					})
				} catch (e) {
					this.isLoading = false
					// showMessage('下单失败')
					console.log('下单失败error', e)
					if (e && e.ret_code === '1002') {
						showMessage(e.ret_msg && e.ret_msg || '该账号已被禁止')
					} else {
						showMessage('下单失败')
					}
				}

			},
		}
	}
</script>

<style scoped lang="scss">
	@import "../../assets/styles/mixins";

	.page {
		padding: rem(32) rem(32) rem(154);
	}

	.panel {
		margin-bottom: rem(20);
		padding: 0 rem(24);

		background: #FEFFFE;
		box-shadow: 0 rem(2) rem(4) 0 rgba(0, 0, 0, 0.05);
		border-radius: rem(8);

		&_hd {
			padding-top: rem(28);

			&-2 {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
		}

		&_tt {
			margin-bottom: rem(8);
			font-size: rem(30);
			font-weight: 400;
			color: #343847;
			line-height: rem(42);
		}

		&_sub {
			font-size: rem(22);
			font-weight: 400;
			color: #343847;
			@include text-overflow();
		}
	}

	.image-box-list {
		overflow: hidden;
		padding: rem(25) 0;
	}

	.image-box {
		float: left;
		width: rem(120);
		height: rem(120);
		border-radius: rem(4);
		background-color: #F3F3F3;
		margin-right: rem(34);
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;

		&_inner {
			width: 100%;
			height: 100%;
		}

		&_ic_wrap {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}

		&_ic {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}

		&_file {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: rem(30);
		}

		&_close {
			position: absolute;
			top: rem(-12);
			right: rem(-12);
			@include image-bg(rem(34), rem(34), url('../../assets/images/icon/order_close.png'))
		}

		&_plus {
			margin: 0 auto;

			@include image-bg(rem(32), rem(32), url('../../assets/images/icon/order_plus.png'))
		}
	}


	.channel {
		padding: rem(25) 0 rem(20);
		border-bottom: 1px solid #E6E6E6;
		display: flex;
		align-items: center;

		&_sd {
			width: rem(64);
			height: rem(64);
			margin-right: rem(12);
			border-radius: rem(64);
			background-color: #dedede;
		}

		&_mn {
			flex: 1;
		}

		&_tt {
			margin-bottom: rem(4);
			font-size: rem(24);
			font-weight: 500;
			color: #343847;
			max-width: rem(530);
			@include text-overflow;
		}

		&_ct {
			font-size: rem(22);
			font-weight: 400;
			color: rgba(52, 56, 71, 0.44);
		}

		&_r {
			@include image-bg(rem(32), rem(32), url('../../assets/images/icon/circle.png'))
		}
	}

	.footer {
		box-sizing: border-box;
		padding: rem(30) rem(32) rem(34);
		display: flex;
		align-items: center;

		position: fixed;
		left: 0;
		z-index: 2;
		bottom: 0;
		width: 100%;

		background-color: #fff;


		&_mn {
			flex: 1;

		}

		&_ct {
			margin-bottom: rem(8);
			font-size: rem(24);
			font-weight: 400;
			color: #343847;

			&_b {
				font-size: rem(28);
			}

			&_detail {
				display: inline-block;

				@include image-bg(rem(16), rem(9), url(../../assets/images/icon/detail_down.png));
				margin-bottom: rem(5);

				&-2 {
					transform: rotate(180deg);
				}
			}
		}

		&_text {
			margin-right: rem(18);
		}

		&_ct_w {
			font-weight: 500;
			margin-right: rem(8);
		}

		&_sd {}

		&_tip {
			display: flex;
			align-items: center;

			font-size: rem(24);
			font-weight: 400;
			color: #343847;
			line-height: rem(28);
		}


		&_checkbox {
			box-sizing: border-box;
			width: rem(30);
			height: rem(30);
			border: 1px solid #dedede;
			margin-right: rem(14);

			&-on {
				@include image-bg(rem(30), rem(30), url('../../assets/images/icon/checkbox_on.png'));
				border: none;
			}
		}
	}


	.text-form {
		font-size: rem(30);
		font-weight: 400;
		color: #343847;

		&-gray {
			color: rgba(52, 56, 71, 0.2)
		}

		&-xs {
			font-size: rem(20);
		}

		&_goods {
			@include text-overflow-line(1);
		}
	}

	.text-xs {
		font-size: rem(22);
		font-weight: 400;
	}

	.btn-pay {
		width: rem(239);
		height: rem(80);
		line-height: rem(80);
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		box-shadow: 0 rem(2) rem(13) 0 #0060DC;
		border-radius: rem(40);


		text-align: center;
		font-size: rem(28);
		font-weight: 400;
		color: #FFFFFF;
	}
</style>
