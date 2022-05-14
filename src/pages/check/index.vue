<template>
	<view class="content">
		<view class="search_box">
			<view class="s_box">
				<image class="s_img" src="/static/index/simg.png"></image>
				<input class="inp" type="text" placeholder="输入运单号、姓名、手机号查找" v-model="searchValue" @blur="handlerSearch" />
			</view>
		</view>
		<view class="tab_content">
			<view :class="['tab_item',status == item.value ? 'active' : '']" v-for="(item,index) in statuslist" :key="index"
			 @click="handlerTab(item.value)">
				{{item.name}}
				<text class="tab_line" v-if="status == item.value"></text>
				<text class="number" v-if="item.number">{{item.number}}</text>
			</view>
		</view>
		<!-- list -->
		<template v-if="login">
			<scroll-view class="list_content" scroll-y="true" @scrolltolower="hanlderToLower">
				<view class="list_item" v-for="(item,index) in list" :key="index">
					<view class="list_box">
						<view class="top">
							<view class="top_left">
								<view class="copy_content" @click="handlerClip(item.tno)">
									<text class="send_number">运单号：</text>
									<text class="send_sort">{{item.tno}}</text>
									<image class="copy_img" src="../../static/index/copy.png"></image>
								</view>
								<image class="print_img" src="../../static/index/print.png" v-if="item.pickup.type !== 0" @click="toPrintPage(item)"></image>
							</view>
						</view>
						<view class="order_content" @click="handlerOrderDetail(item.orderNo)">
							<view class="send_place">
								<view class="place">
									<text class="place_name">{{item.chinaAddress.city}}</text>
									<text class="user_name">{{item.chinaAddress.name}}</text>
								</view>
								<view class="send_status">
									<text class="status">{{orderStatusObj[item.orderStatus]}}</text>
									<view class="status_line">
										<view class="status_done" :style="{'width':`${orderProcess[item.orderStatus]}%`}"></view>
									</view>
								</view>
								<view class="place">
									<text class="place_name">{{item.abroadAddress.country}}</text>
									<text class="user_name">{{item.abroadAddress.name}}</text>
								</view>
							</view>
							<view class="word" v-if="item.orderStatus == 300 && item.totalPrice">
								快递员/仓库已经收到物品，经过实际称重后该订单实际运费为：¥{{item.totalPrice/100}}，请您尽快确认并支付。
							</view>
							<view class="word" v-else-if="item.orderStatus == 200 && item.pickup">
								请您尽快发国内快递到仓库(地址：{{item.pickup.storeAddr}},联系人：{{item.store && item.store.user ? item.store.user : '-'}} 联系电话：{{item.store && item.store.phone ? item.store.phone : '-'}}),并把运单打印或手写在物品外包装上{{item.pickup === 2 ? '，您也可以附上国内快递单号。' : '。'}}逾期到达仓库将有可能运价发生变化。
							</view>
							<view class="word" v-else-if="item.orderStatus == 102">
								拒绝原因：{{item.rejectReason ? item.rejectReason : '无'}}
							</view>
							<view class="send_time">
								<text class="time" v-if="item.orderStatus == 900">送达时间：{{item.finishAt | filterDate}}</text>
								<text class="time" v-else-if="item.orderStatus == 211 && item.pickup.type == 1">预约取货时间：{{getDate(item.pickup.date)}}{{getTime(item.pickup.begin)}}
									- {{getTime(item.pickup.end)}}</text>
								<text class="time" v-else-if="item.orderStatus == 999">取消时间：{{item.cancelAt | filterDate}}</text>
								<text class="time" v-else>下单时间：{{item.createAt | filterDate}}</text>
								<text class="price" v-if="item.paidAmount">已付¥{{item.paidAmount/100}}</text>
							</view>
						</view>
					</view>
					<view class="['btn_box']" v-if="item.orderStatus != 600">
						<text class="wait_pay" v-if="item.unpaidAmount && item.orderStatus != 999 || item.orderStatus == 300">{{item.unpaidAmount && item.orderStatus != 999 || item.orderStatus == 300 ? ((item.orderStatus < 212 ? '预估总价' : '待支付') + `：￥${item.unpaidAmount/100}`) : ''}}</text>
						<view class="btn_right">
							<view class="btn" @click="handlerFeedback(item.orderNo)" v-if="canComplain(item.orderStatus)">投诉</view>
							<view class="btn margin_left_20" @click.stop="hanlderPay(item)" v-if="item.orderStatus == 300 && item.canPay">确认支付</view>
							<view class="btn margin_left_20" v-else-if="globalConfig.needComment===1 && item.orderStatus == 999" @click="handlerComment(item.orderNo,item.productId)">去评价</view>
							<view class="btn margin_left_20" v-else-if="item.orderStatus == 999 || item.orderStatus == 102" @click="handlerAgain(item)">重新下单</view>
							<view class="btn margin_left_20" @click.stop="hanlderCancelOrder(item.orderNo)" v-if="canCancel(item.orderStatus)">取消订单</view>
						</view>
					</view>
				</view>
				<empty-box v-if="!loading && !list.length"></empty-box>
			</scroll-view>
		</template>
		<!-- 未登录 -->
		<view class="no_login" v-else>
			<image class="no_img" src="../../static/index/empty.png"></image>
			<text class="no_txt">您还未登录，请先登录哦~</text>
			<view class="login_btn" @click="toLogin">登录账户</view>
		</view>
		<cancel-modal :order-id="orderId" ref="cancelmodal" @sure="handlerCancelSure"></cancel-modal>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import {
		handlerCheckLogin,
		timeToMinute,
		showMessage
	} from '@/util/index'
	import {
		OrderListApi
	} from '@/api/index.js'
	import cancelModal from '@/components/order/cancelModal.vue'
	import emptyBox from '@/components/empty/index.vue'
	import {
		toPayOrder
	} from '@/util/pay'
	import {
		orderStatusObj,
		orderProcess
	} from '../../common/helper.js';

	export default {
		filters: {
			filterDate: function(value) {
				return timeToMinute(value)
			}
		},
		data() {
			return {
				loading: true,
				orderId: '',
				status: 0, // 状态：0查所有，1待支付，2运送中，3已送达
				cursor: 0,
				count: 10,
				searchValue: '', //搜索key
				orderStatusObj,
				orderProcess,
				statuslist: [{
						name: '全部',
						number: 0,
						value: 0,
						cursor: 0,
						list: []
					},
					{
						name: '待支付',
						number: 0,
						value: 1,
						cursor: 0,
						list: []
					},
					{
						name: '运送中',
						number: 0,
						value: 2,
						cursor: 0,
						list: []
					},
					{
						name: '已送达',
						number: 0,
						value: 3,
						cursor: 0,
						list: []
					}
				]
			}
		},
		components: {
			cancelModal,
			emptyBox
		},
		computed: {
			...mapGetters(['login','userInfo', 'globalConfig']),
			list() {
				const list = this.statuslist[this.status].list
				return list
			}
		},
		onLoad() {
			this.getOrderList()
		},
		onShow() {
			this.handlerSearch()
			if (typeof this.$mp.page.getTabBar === 'function' && this.$mp.page.getTabBar()) {
				if (this.userInfo) {
					this.$mp.page.getTabBar().setData({
						lgType: this.userInfo.lgType,
						tab: 2
					})
				} else {
					this.$mp.page.getTabBar().setData({
						tab: 2
					})
				}
			}
		},
		methods: {
			handlerTab(index) {
				this.status = index;
				this.statuslist[this.status].cursor = 0;
				this.getOrderList();
			},
			toLogin() {
				uni.showLoading()
				handlerCheckLogin({
					success: () => {
						console.log("登录成功")
						this.getOrderList()
					},
					fail: (e) => {
						console.log("登录失败", e)
						showMessage(e && e.msg || '登录失败，请稍后重试')
					},
					done: () => {
						uni.hideLoading()
					}
				});
			},
			hanlderCancelOrder(id) {
				this.orderId = id;
				this.$refs.cancelmodal.handlerShow()
			},
			handlerCancelSure() {
				this.handlerSearch();
			},
			handlerClip(data) {
				uni.setClipboardData({
					data,
					success: () => {
						showMessage('已复制到剪贴板')
					}
				})
			},
			getDate(time) {
				if (!time) return
				time = time.toString()
				const year = time.substring(0, 4)
				const month = time.substring(4, 6)
				const date = time.substring(6)
				const result = `${year}.${month}.${date}`
				return result
			},
			getTime(time) {
				if (!time) return
				time = time.toString()
				const minute = time.substr(time.length - 2, 2)
				const hour = time.length >= 4 ? time.substring(0, 2) : time.substring(0, 1)
				const result = ` ${hour}:${minute}`
				return result
			},
			canCancel(orderStatus) {
				return orderStatus == 100 || orderStatus == 211 || orderStatus == 200 || orderStatus == 210 || orderStatus == 220 ||
					orderStatus == 230 || orderStatus == 300 || orderStatus == 301 || orderStatus == 330 || orderStatus == 400
			},
			canComplain(orderStatus) {
				return orderStatus != 600 && orderStatus != 999
			},
			hanlderPay(order) {
				toPayOrder(order, {
					suc: () => {
						this.statuslist[this.status].cursor = 0;
						this.getOrderList()
					}
				})
			},
			handlerOrderDetail(id) {
				uni.navigateTo({
					url: '../orderDetail/index?oid=' + id
				})
			},
			handlerComment(id, pid) {
				uni.navigateTo({
					url: `../comment/index?oid=${id}&pid=${pid}`
				})
			},
			handlerSearch() {
				this.statuslist[this.status].cursor = 0
				console.log('查询订单列表')
				this.getOrderList()
			},
			handlerAgain(item) {
				let {
					goodsType,
					weight,
					goodsNature,
					packageDetail,
					dispatcher,
					pid
				} = item.queryVO;
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
				this.$store.dispatch('sendOrder/resetSendOrder')
				this.$store.commit('sendOrder/setGoodsInfo', goodsInfo)
				this.$store.dispatch('app/toggleCheckData', goodsInfo);
				this.$store.commit('sendOrder/setPid', pid)

				//寄件及收件人地址填写
				this.$store.commit('sendOrder/setSenderAddress', item.queryVO.chinaAddress)
				this.$store.commit('sendOrder/setReceiverAddress', item.queryVO.internationalAddress)
				this.$store.commit('address/setSelectChinaAddress', item.queryVO.chinaAddress)
				this.$store.commit('address/setSelectAboardAddress', item.queryVO.internationalAddress)
				this.$store.commit('sendOrder/setCurrentProduct', item.queryVO)
				uni.navigateTo({
					url: `/pages/sendOrder/index?showFba=${goodsInfo.fba}&pid=${pid}&fromPage=againOrder`
				})
			},
			handlerFeedback(oid) {
				uni.navigateTo({
					url: '../orderFeedback/index?oid=' + oid
				})
			},
			hanlderToLower() {
				this.getOrderList()
			},
			//打印运单
			toPrintPage(item) {
				showMessage('跳转打印设置页面')
			},
			async getOrderList() {
				const status = this.status
				const cursor = this.statuslist[status].cursor
				if (cursor <= -1) return
				const res = await OrderListApi({
					status,
					cursor,
					count: this.count,
					key: this.searchValue
				})
				this.loading = false
				this.statuslist[status].cursor = res.nextCursor
				let list = []
				if (cursor === 0) {
					list = res.list || []
				} else {
					const olist = this.statuslist[status].list
					const addlist = res.list || [];
					list = [...olist, ...addlist]
				}
				this.statuslist[status].list = list
			}

		}
	}
</script>

<style scoped lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #F7F8F9;
		height: 100%;
	}

	.margin_left_20 {
		margin-left: 20rpx;
	}

	.btn_right {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
	}

	.no_login {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		margin-top: 208rpx;
	}

	.no_img {
		width: 130rpx;
		height: 112rpx;
	}

	.no_txt {
		color: #797B85;
		font-size: 28rpx;
		margin-top: 30rpx;
	}

	.login_btn {
		width: 239rpx;
		height: 80rpx;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		box-shadow: 0 2rpx 4rpx 0 #0265DF;
		border-radius: 40rpx;
		text-align: center;
		line-height: 80rpx;
		color: #FFFFFF;
		font-size: 28rpx;
		margin-top: 40rpx;
	}

	.search_box {
		width: 686rpx;
		background-color: #FFFFFF;
		padding: 30rpx 32rpx 16rpx 32rpx;
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.s_box {
		width: 686rpx;
		height: 65rpx;
		border-radius: 33rpx;
		background-color: #F0F1F1;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.s_img {
		width: 34rpx;
		height: 34rpx;
		margin-left: 24rpx;
		margin-right: 15rpx;
	}

	.inp {
		height: 60rpx;
		margin-right: 24rpx;
		font-size: 24rpx;
		color: #343847;
		width: 600rpx;
	}

	.tab_content {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 686rpx;
		padding: 0 32rpx;
		justify-content: space-between;
		background-color: #FFFFFF;
	}

	.tab_item {
		color: #343847;
		font-size: 30rpx;
		position: relative;
		padding: 27rpx 0;
	}

	.tab_item.active {
		color: #056BF1;
	}

	.tab_line {
		width: 60rpx;
		height: 4rpx;
		background-color: #056BF1;
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translate3d(-50%, 0, 0);
	}

	.number {
		width: 32rpx;
		height: 32rpx;
		border-radius: 20rpx;
		color: #FFFFFF;
		font-size: 20rpx;
		text-align: center;
		line-height: 32rpx;
		position: absolute;
		top: 16rpx;
		right: -30rpx;
		background-color: #EA3A3E;
	}

	.list_content {
		width: 750rpx;
		display: flex;
		flex: 1;
		flex-direction: column;
		overflow-y: auto;
		padding-bottom: 20rpx;
	}

	.list_item {
		width: 686rpx;
		margin: 0 32rpx;
		background: #FFFFFF;
		border-radius: 8rpx;
		margin-top: 20rpx;
		padding-bottom: 30rpx;
	}

	.list_box {
		width: 638rpx;
		padding: 0 24rpx;
	}

	.top {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 24rpx;
		padding: 21rpx 0 39rpx 0;
		justify-content: space-between;
	}

	.top_left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.right_tno {
		font-size: 28rpx;
		color: #056BF1;
	}

	.copy_content {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.send_number {
		color: #7B7D87;
	}

	.send_sort {
		color: #071755;
	}

	.copy_img {
		width: 24rpx;
		height: 24rpx;
		margin-left: 15rpx;
	}

	.print_img {
		width: 35rpx;
		height: 35rpx;
		margin-left: 15rpx;
	}

	.send_place {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 36rpx;
	}

	.place {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.place_name {
		color: #343847;
		font-size: 34rpx;
		font-weight: 600;
	}

	.user_name {
		font-size: 24rpx;
		color: #999999;
		margin-top: 5rpx;
	}

	.send_status {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 13rpx;
	}

	.status {
		color: #056BF1;
		font-size: 28rpx;
		font-weight: 500;
		margin-bottom: 11rpx;
	}

	.status_line {
		width: 200rpx;
		height: 6rpx;
		background: #E6E6E6;
		border-radius: 3rpx;
		margin-top: 10rpx;
	}

	.status_done {
		width: 0;
		height: 6rpx;
		background: linear-gradient(90deg, #0CA4F9 0%, #056BF1 100%);
		border-radius: 3rpx;
	}

	.send_time {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		font-size: 24rpx;
		margin-bottom: 32rpx;
	}

	.time {
		color: #343847;
	}

	.price {
		color: #EA3A3E;
	}

	.btn_box {
		display: flex;
		flex-direction: column;
		justify-content: center;
		// align-items: center;
		// justify-content: space-between;
		border-top: solid 1rpx #E6E6E6;
		padding: 24rpx 24rpx 0 24rpx;
	}

	.wait_pay {
		color: #EA3A3E;
		font-size: 24rpx;
		padding-bottom: 20rpx;
	}

	.btn {
		width: 180rpx;
		height: 65rpx;
		border-radius: 4rpx;
		border: 1px solid #056BF1;
		color: #056BF1;
		font-size: 28rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.word {
		color: #EA3A3E;
		font-size: 24rpx;
		margin-bottom: 24rpx;
	}
</style>
