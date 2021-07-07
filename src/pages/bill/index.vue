<template>
	<view class="content">
		<view class="tab_content">
			<view v-for="(item,index) in statuslist" :key="index" :class="['tab',status == item.value ? 'active' : '']" @click="handlerTab(item.value)">
				<text>{{item.name}}</text>
				<view class="tab_line"></view>
			</view>
		</view>
		<!-- 可开票订单 -->
		<scroll-view class="list_content active" scroll-y="true" @scrolltolower="hanlderToLower" v-if="status == 0 && list.length">
			<view class="list_item" v-for="(item,index) in list" :key="index" @click="handlerCheck(item,index)">
				<image class="list_check" :src="checkStatus(item.orderNo) ? '../../static/index/checked_circle.png' : '../../static/index/check_circle.png'"></image>
				<view class="list_box">
					<view class="top" @click="handlerClip(item.tno)">
						<text class="send_number">运单号：</text>
						<text class="send_sort">{{item.tno}}</text>
						<image class="copy_img" src="../../static/index/copy.png"></image>
					</view>
					<view class="order_content">
						<view class="send_place">
							<view class="place">
								<text class="place_name">{{item.chinaAddress.city}}</text>
								<text class="user_name">{{item.chinaAddress.name}}</text>
							</view>
							<view class="send_status">
								<text class="status">已送达</text>
								<view class="status_line">
									<view class="status_done" :style="{'width':`100%`}"></view>
								</view>
							</view>
							<view class="place">
								<text class="place_name">{{item.abroadAddress.country}}</text>
								<text class="user_name">{{item.abroadAddress.name}}</text>
							</view>
						</view>
						<view class="send_time">
							<text class="time">送达时间：{{item.finishAt | filterDate}}</text>
							<text class="price">¥{{item.amount/100}}</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<view class="bottom" v-if="status == 0 && list.length">
			<view class="b_left">
				<view class="check_all" @click="handlerCheckAll">
					<image class="check_icon" v-if="checklist.length != list.length" src="../../static/index/check_circle.png"></image>
					<image class="check_icon" v-else src="../../static/index/checked_circle.png"></image>
					<text class="select_all">全选</text>
				</view>
				<template v-if="checklist.length">
					<text class="check_txt">{{checklist.length}}张订单，共</text>
					<text class="check_price">￥{{totalPrice()}}</text>
				</template>
			</view>
			<view class="b_right" @click="handlerNext">下一步</view>
		</view>
		<!-- 开票历史 -->
		<scroll-veiw class="list_content" scroll-y="true" @scrolltolower="hanlderToLower" v-if="status == 1 && list.length">
			<view class="lc_item" v-for="(item,index) in list" :key="index">
				<view class="lc_left">
					<view class="lc_line">
						<text class="lc_txt">发票抬头：</text><text class="lc_info">{{item.title}}</text>
					</view>
					<view class="lc_line">
						<text class="lc_txt">发票金额：</text><text class="lc_info">￥{{item.amount/100}}</text><text class="lc_txt margin_left_24">含{{item.orderList.length}}个订单</text>
					</view>
					<view class="lc_line">
						<text class="lc_txt">申请：{{item.createAt | filterDate}}</text>
					</view>
				</view>
				<view class="lc_right">
					<view class="lc_status">{{invoiceType[item.status]}}</view>
					<view class="lc_btn" v-if="item.status == 2" @click="handlerResend(item.id,item.mail)">重发发票</view>
				</view>
			</view>
		</scroll-veiw>
		<empty-box v-if="!loading && !list.length"></empty-box>
		<!-- popup -->
		<slidePopup title="接收邮箱" :show.sync="resendVisible">
			<view class="get_content">
				<view class="email_box">
					<input type="text" v-model="email" class="email" />
					<image class="clear_img" src="../../static/index/clear.png" v-if="email.length" @click="handlerClearEmail"></image>
				</view>
				<view class="send_email" @click="sureResend">提交</view>
			</view>
		</slidePopup>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import {
		timeToMinute,
		showMessage
	} from '@/util/index'
	import {
		InvoiceOrderListApi,
		InvoiceListApi,
		InvoiceReSendApi
	} from '@/api/bill.js'
	import slidePopup from '@/components/slide-popup'
	import emptyBox from '@/components/empty/index.vue'

	export default {
		name: 'bill',
		filters: {
			filterDate: function(value) {
				return timeToMinute(value)
			}
		},
		data() {
			return {
				loading: true,
				orderId: '',
				status: 0, // 状态：0可开票订单，1：开票历史
				cursor: 0,
				count: 10,
				checklist: [],
				checkOrder: [],
				resendVisible: false,
				email: '',
				resendId: '',
				invoiceType: {
					0: '已申请', //申请开票
					1: '已申请', //开票中
					2: '已开票', //已开票
					3: '已申请', //申请重发发票
					4: '已申请', //重发处理中
					5: '已开票', //已重发
				},
				statuslist: [{
						name: '可开票订单',
						value: 0,
						cursor: 0,
						list: []
					},
					{
						name: '开票历史',
						number: 0,
						value: 1,
						cursor: 0,
						list: []
					}
				]
			}
		},
		components: {
			emptyBox,
			slidePopup
		},
		computed: {
			...mapGetters(['login']),
			list() {
				const list = this.statuslist[this.status].list
				return list
			}
		},
		watch: {
			resendVisible() {
				if (!this.resendVisible) {
					this.email = ''
				}
			}
		},
		onLoad() {
			this.getOrderList()
		},
		methods: {
			async sureResend() {
				const emailreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
				const email = this.email
				if (!emailreg.test(email)) {
					showMessage('邮箱格式不正确')
					return
				}
				const res = await InvoiceReSendApi({
					id: this.resendId,
					mail: email
				})
				uni.navigateTo({
					url: '/pages/success/index'
				})
				this.$store.dispatch('app/toggleEmail', email)
				this.resendVisible = false
				if (res.ret_code === '0000') {
					uni.navigateTo({
						url: '/pages/success/index'
					})
				}
			},
			handlerResend(id, email) {
				this.resendId = id;
				this.email = email;
				this.resendVisible = true
			},
			handlerCheckAll() {
				const status = this.checklist.length == this.list.length
				if (status) {
					this.checklist = []
					this.checkOrder = []
				} else {
					const list = this.list
					this.checklist = list.map((item) => item.orderNo)
					this.checkOrder = list
				}

			},
			handlerCheck(item, index) {
				const {
					orderNo
				} = item
				const cindex = this.checklist.indexOf(orderNo)
				if (cindex == -1) {
					this.checklist.push(orderNo)
					this.checkOrder.push(item)
				} else {
					this.checklist.splice(cindex, 1)
					this.checkOrder.splice(cindex, 1)
				}
			},
			checkStatus(orderNo) {
				return this.checklist.indexOf(orderNo) > -1
			},
			handlerTab(index) {
				this.loading = true;
				this.status = index;
				this.statuslist[this.status].cursor = 0;
				this.getOrderList();
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
			updateBill() {
				this.status = 0;
				this.statuslist[this.status].cursor = 0
				this.getOrderList()
			},
			hanlderToLower() {
				this.getOrderList()
			},
			totalPrice() {
				const price = this.checkOrder.reduce((prev, next) => {
					return prev + next.amount
				}, 0)
				const result = price / 100
				return result
			},
			handlerNext() {
				if (!this.checklist.length) {
					showMessage('请选择要开票的订单')
					return
				}
				this.$store.dispatch('app/toggleMakeOrder', this.checkOrder)
				uni.navigateTo({
					url: '/pages/write/index'
				})
				setTimeout(() => {
					this.handlerClear()
				}, 500)
			},
			handlerClear() {
				this.checkOrder = []
				this.checklist = []
			},
			handlerClearEmail() {
				this.email = ''
			},
			async getOrderList() {
				const status = this.status
				const cursor = this.statuslist[status].cursor
				const postApi = this.status == 1 ? InvoiceListApi : InvoiceOrderListApi
				if (cursor <= -1) return
				const res = await postApi({
					cursor,
					count: this.count
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

<style lang="scss" scoped>
	@mixin flexrow {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.send_email {
		width: 686rpx;
		height: 80prx;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		box-shadow: 0 0 4rpx 0 #0060DC;
		border-radius: 44rpx;
		text-align: center;
		line-height: 80rpx;
		color: #FFFFFF;
		font-size: 32rpx;
		margin: 87rpx 0 68rpx 0;
	}

	.email_box {
		@include flexrow;
		height: 55rpx;
		border-bottom: solid 1rpx #1F1F1F;
		justify-content: space-between;
		margin: 28rpx 32rpx 0 32rpx;
		padding-bottom: 15rpx;
	}

	.email {
		width: 600rpx;
	}

	.clear_img {
		width: 36rpx;
		height: 36rpx;
		display: block;
	}

	.lc_item {
		margin: 20rpx 32rpx 0 32rpx;
		padding: 20rpx 24rpx;
		border-radius: 8rpx;
		background-color: #FFFFFF;

		@include flexrow;
		justify-content: space-between;
	}

	.lc_left {
		display: flex;
		flex-direction: column;
	}

	.lc_right {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 125rpx;
		align-items: flex-end;
	}

	.lc_txt {
		color: #7B7D87;
		font-size: 24rpx;
	}

	.lc_info {
		color: #071755;
		font-size: 24rpx;
	}

	.lc_line {
		@include flexrow;
		margin-bottom: 12rpx;
	}

	.lc_line:last-child {
		margin-bottom: 0;
	}

	.lc_btn {
		width: 150rpx;
		height: 52rpx;
		background: linear-gradient(90deg, #119CFF 0%, #0061DC 100%);
		border-radius: 33rpx;
		text-align: center;
		line-height: 52rpx;
		color: #FFFFFF;
		font-size: 24rpx;
	}

	.lc_status {
		color: #046CFC;
		font-size: 24rpx;
	}

	.margin_left_24 {
		margin-left: 24rpx;
	}

	.bottom {
		@include flexrow;
		justify-content: space-between;
		padding: 25rpx 32rpx;
		width: 686rpx;
		background-color: #FFFFFF;
		position: fixed;
		bottom: 0;
		left: 0;
	}

	.check_txt {
		color: #333848;
		font-size: 28rpx;
	}

	.check_price {
		color: #EA4141;
		font-size: 28rpx;
		margin-left: 10rpx;
	}

	.b_left {
		@include flexrow;
	}

	.b_right {
		width: 217rpx;
		height: 80rpx;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		box-shadow: 0 0 6rpx 0 #2E76CF;
		border-radius: 40rpx;
		color: #FFFFFF;
		font-size: 28rpx;
		text-align: center;
		line-height: 80rpx;
	}

	.check_all {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-right: 21rpx;
		border-right: solid 1rpx #E3E3E3;
		margin-right: 21rpx;
	}

	.check_icon {
		width: 40rpx;
		height: 40rpx;
		display: block;
	}

	.select_all {
		color: #343847;
		font-size: 28rpx;
		margin-top: 2rpx;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #F7F8F9;
		height: 100%;
	}

	.tab_content {
		width: 750rpx;
		height: 86rpx;
		@include flexrow;
		justify-content: center;
		background-color: #FFFFFF;
	}

	.tab {
		flex: 1;
		height: 100%;
		line-height: 86rpx;
		text-align: center;
		color: #343847;
		font-size: 30rpx;
		position: relative;

		&.active {
			color: #046CFC;

			.tab_line {
				display: block;
			}
		}
	}

	.tab_line {
		width: 50rpx;
		height: 6rpx;
		background: linear-gradient(180deg, #119CFF 0%, #0060DC 100%);
		border-radius: 3rpx;
		position: absolute;
		bottom: 0;
		left: 176rpx;
		display: none;
	}

	.list_content {
		width: 750rpx;
		display: flex;
		flex: 1;
		flex-direction: column;
		overflow-y: auto;
		padding-bottom: 20rpx;

		&.active {
			padding-bottom: 150rpx;
		}
	}

	.list_item {
		width: 686rpx;
		margin: 0 32rpx;
		background: #FFFFFF;
		border-radius: 8rpx;
		margin-top: 20rpx;
		padding-bottom: 30rpx;
		position: relative;
	}

	.list_check {
		width: 40rpx;
		height: 40rpx;
		position: absolute;
		top: 24rpx;
		right: 24rpx;
	}

	.list_box {
		width: 638rpx;
		padding: 0 24rpx;
	}

	.top {
		@include flexrow;
		font-size: 24rpx;
		padding: 21rpx 0 39rpx 0;
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

	.send_place {
		@include flexrow;
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
		@include flexrow;
		justify-content: space-between;
		font-size: 24rpx;
	}

	.time {
		color: #343847;
	}

	.price {
		color: #EA3A3E;
		font-size: 28rpx;
	}

	.word {
		color: #EA3A3E;
		font-size: 24rpx;
		margin-bottom: 24rpx;
	}
</style>
