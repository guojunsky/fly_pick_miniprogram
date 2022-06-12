<template>
	<view class="container">
		<view class="content" v-if="!loading">
			<!-- 地址 -->
			<view class="address">
				<view class="send_box" @click="handlerClip(detail.tno)">
					<text class="send_number">运单号：</text>
					<text class="send_sort">{{ detail.tno }}</text>
					<image class="copy_img" src="../../static/index/copy.png"></image>
				</view>
				<view class="send_line">
					<view class="icon_box">
						<image class="send_img" src="../../static/detail/send.png"></image>
						<text class="icon_txt">寄</text>
					</view>
					<view class="send_right">
						<view class="user_top">
							<text class="user_name">{{ detail.chinaAddress.name }}</text>
							<text class="phone">{{ detail.chinaAddress.phone }}</text>
						</view>
						<view class="address_txt">
							{{ detail.chinaAddress.province }}{{ detail.chinaAddress.city }}{{ detail.chinaAddress.town }}{{ detail.chinaAddress.ext }}
						</view>
					</view>
				</view>
				<view class="send_line">
					<view class="icon_box">
						<image class="send_img" src="../../static/detail/receive.png"></image>
						<text class="icon_txt">收</text>
					</view>
					<view class="send_right">
						<view class="user_top">
							<text class="user_name">{{ detail.abroadAddress.name }}</text>
							<text class="phone">{{ detail.abroadAddress.phone }}</text>
						</view>
						<view class="address_txt">
							{{ detail.abroadAddress.country }}{{ detail.abroadAddress.city }}{{ detail.abroadAddress.addr }}{{ detail.abroadAddress.companyName }}{{ detail.abroadAddress.ext }}
						</view>
					</view>
				</view>
			</view>
			<!-- 物品类型 -->
			<view class="type_content">
				<view class="line">
					<text class="title">物品类型</text>
					<text class="name">{{ detail.goods.type == 1 ? '文件' : '包裹' }}</text>
				</view>
				<view class="line">
					<text class="title">物品件数</text>
					<text class="name">{{ detail.goods.items.length }}</text>
				</view>
				<view class="line">
					<text class="title">预估总价</text>
					<text class="red">￥{{ detail.totalPrice / 100 }}</text>
				</view>
				<view class="line">
					<text class="title">付款方式</text>
					<text class="name">{{ detail.paymentType == 1 ? '现金' : '挂账' }}</text>
				</view>
				<view class="line" v-if="detail.paidAmount">
					<text class="title">已预付</text>
					<text class="name">￥{{ detail.paidAmount / 100 }}</text>
				</view>
			</view>
			<!-- 包裹物流 -->
			<view class="way_content" v-if="timelist.length">
				<view :class="['way_line', timeIndex == index ? 'active' : '']" v-for="(item, index) in timelist" :key="index">
					<view :class="['way_left', index == timelist.length - 1 ? 'last' : '']">
						<text class="way">{{ item.scene }}</text>
						<view class="circle">
							<text class="center_circle"></text>
						</view>
					</view>
					<view class="way_right">
						<text class="way_time">{{ item.createAt | filterDate }}</text>
						<text class="way_desc">{{ item.msg }}</text>
					</view>
				</view>
			</view>
			<!-- 按钮 -->
			<view class="btn_box" v-if="detail.orderStatus == 300 || detail.canPay">
				<view class="b_left">
					<text class="txt">应付</text>
					<text class="red">￥{{ detail.totalPrice / 100 }}</text>
					<text class="less" v-if="couponAmount">已优惠￥{{ couponAmount / 100 }}</text>
					<view class="order_detail" @click="handlerShowDetail">
						<text class="txt">明细</text>
						<image :class="['arrow_img', totalPriceVisible ? 'up_arrow' : '']" src="../../static/detail/dwon_arrow.png">
						</image>
					</view>
				</view>
				<view class="btn" @click="hanlderPay(detail)">确认支付</view>
			</view>
		</view>
		<slidePopup style="top: -127rpx;" title="预估总价" :show.sync="totalPriceVisible">
			<totalPrice :detail="priceDetails" :surcharges="surcharges" :vas="vas" :coupon-amount="couponAmount"></totalPrice>
		</slidePopup>
		<PayType :visible.sync="payVis" @close="payVis = false" @pay="handlePay" />
	</view>
</template>

<script>
import totalPrice from '../sendOrder/widget/total-price'
import slidePopup from '@/components/slide-popup'
import {
	showMessage,
	timeToMinute
} from '@/util/index.js'
import {
	OrderGetApi
} from '@/api/index.js'
import {
	toPayOrder
} from "@/util/pay";
import { getBalance } from '@/api/user.js'
import payType from '@/components/payType'


export default {
	filters: {
		filterDate: function (value) {
			return timeToMinute(value)
		}
	},
	name: 'orderDetail',
	components: {
		totalPrice,
		slidePopup,
		payType
	},
	data() {
		return {
			totalPriceVisible: false,
			loading: true,
			oid: '',
			timeIndex: 0,
			timelist: [],
			priceDetails: [],
			surcharges: [],
			vas: [],
			couponAmount: 0,
			detail: {
				chinaAddress: {},
				abroadAddress: {},
				goods: {
					items: []
				}
			}
		}
	},
	onLoad(options) {
		this.oid = options.oid || ''
		this.getDetail();
	},
	methods: {
		async hanlderPay(order) {
			const { balance } = await getBalance()
			if (balance > 0) {
				this.currentOrder = order
				this.payVis = true
			} else {
				toPayOrder(order,
					{
						suc: () => {
							// this.statuslist[this.status].cursor = 0;
							// this.getOrderList()
							this.updateCheckPage()
							this.getDetail()
						}
					}, 2)
			}
			// if()
			// toPayOrder(order, {
			// 	suc: () => {
			// 		this.statuslist[this.status].cursor = 0;
			// 		this.getOrderList()
			// 	}
			// })

		},
		handlePay(code) {
			this.payVis = false
			// if (code === 2) {
			toPayOrder(this.currentOrder, {
				suc: () => {
					// this.statuslist[this.status].cursor = 0;
					this.updateCheckPage()
					this.getDetail()
					// this.getOrderList()
					this.currentOrder = null
				}
			}, code)
			// }
		},
		// hanlderPay(order) {
		// 	toPayOrder(order, {
		// 		suc: () => {
		// 			console.log("支付成功")
		// 			this.updateCheckPage()
		// 			this.getDetail()
		// 		}
		// 	})
		// },
		handlerClip(data) {
			uni.setClipboardData({
				data,
				success: () => {
					showMessage('已复制到剪贴板')
				}
			})
		},
		handlerShowDetail() {
			this.totalPriceVisible = true
		},
		updateCheckPage() {
			const pages = getCurrentPages()
			const index = pages.findIndex((item) => item.route === 'pages/check/index')
			if (index > -1) {
				pages[index].$vm.handlerSearch()
			}
		},
		async getDetail() {
			const res = await OrderGetApi({
				orderNo: this.oid
			})
			const order = res.order || {}
			const unpaidBills = order.unpaidBills || []
			let priceDetails = []
			let surcharges = []
			let vas = []
			// let couponAmount = 0
			unpaidBills.map((item) => {
				priceDetails = [...item.priceShows]
				surcharges = [...item.surcharges]
				// couponAmount += item.couponAmount
				const vdata = item.vas
				vdata.map((vitem) => {
					const vasInfo = { chargeName: '保价费', totalPrice: vitem.charge }
					vas.push(vasInfo)
				})
			})
			this.priceDetails = priceDetails
			this.surcharges = surcharges
			this.vas = vas
			this.couponAmount = order.discountPrice
			this.detail = order || {}
			this.timelist = order.trackingList || []
			this.loading = false
		}
	}
}
</script>

<style scoped lang="scss">
@mixin flexrow {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.container {
	background-color: #F7F8F9;
	height: calc(100vh - 150rpx);
	padding-bottom: 150rpx;
	overflow-y: auto;
}

.content {
	margin: 21rpx 32rpx;

	.order_detail {
		@include flexrow;
		margin-left: 18rpx;
		border-left: solid 1rpx #D8D8D8;
		padding-left: 18rpx;
	}

	.red {
		color: #EA3A3E;
		font-size: 24rpx;
	}

	.txt {
		color: #343847;
		font-size: 24rpx;
	}

	.less {
		margin-left: 18rpx;
	}

	.arrow_img {
		width: 16rpx;
		height: 9rpx;
		margin-left: 11rpx;
	}

	.up_arrow {
		transform: rotate(-180deg);
	}

	.way_left::after {
		content: '';
		width: 2rpx;
		background-color: #E6E6E6;
		position: absolute;
		left: 118rpx;
		top: 27rpx;
		height: 110rpx;
		margin: auto;
	}

	.last::after {
		background-color: transparent;
	}

	.btn_box {
		@include flexrow;
		position: fixed;
		width: 100vw;
		height: 127rpx;
		justify-content: space-between;
		bottom: 0;
		left: 0;
		background-color: #FFFFFF;

		.b_left {
			@include flexrow;
			margin-left: 32rpx;
			color: #343847;
			font-size: 24rpx;
		}

		.btn {
			width: 239rpx;
			height: 80rpx;
			background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
			box-shadow: 0 0 5rpx 0 #0265DF, 0px 0px 6px 0px #2E76CF;
			border-radius: 40rpx;
			margin-right: 32rpx;
			text-align: center;
			line-height: 80rpx;
			color: #FFFFFF;
			font-size: 28rpx;
		}
	}

	.way_content {
		padding: 34rpx 24rpx;
		background-color: #FFFFFF;
		margin-top: 20rpx;

	}

	.way_line:last-child {
		padding-bottom: 0;
	}

	.way_line.active {
		.way_left {
			.circle {
				border-color: #056BF1;
			}

			.center_circle {
				background-color: #056BF1;
			}

			.way,
			.way_time,
			.way_desc {
				color: #343847;
			}

		}
	}

	.way_line {
		@include flexrow;
		padding-bottom: 40rpx;

		.way_left {
			position: relative;
			@include flexrow;

			.way {
				width: 96rpx;
				color: #666666;
				font-size: 24rpx;
			}

			.circle {
				width: 18rpx;
				height: 18rpx;
				border-radius: 10rpx;
				border: 1rpx solid #E6E6E6;
				margin-left: 16rpx;
				display: flex;
				@include flexrow;
				justify-content: center;
			}

			.center_circle {
				width: 10rpx;
				height: 10rpx;
				border-radius: 10rpx;
				background-color: #CCCCCC;
			}
		}

		.way_right {
			display: flex;
			flex-direction: column;
			justify-content: center;
			margin-left: 24rpx;
		}

		.way_time {
			color: #666666;
			font-size: 24rpx;
		}

		.way_desc {
			color: #666666;
			font-size: 24rpx;
			margin-top: 8rpx;
		}
	}

	.type_content {
		padding: 24rpx;
		margin-top: 20rpx;
		background-color: #FFFFFF;

		.line {
			@include flexrow;
			margin-bottom: 22rpx;
		}

		.line:last-child {
			margin-bottom: 0;
		}

		.title {
			width: 96rpx;
			margin-right: 42rpx;
			color: #666666;
			font-size: 24rpx;
		}

		.name {
			color: #343847;
			font-size: 24rpx;
		}
	}

	.send_right {
		width: 552rpx;
		display: flex;
		flex-direction: column;
	}

	.user_top {
		@include flexrow;
	}

	.user_name {
		color: #343847;
		font-size: 28rpx;
		margin-right: 18rpx;
	}

	.address_txt {
		color: #666666;
		font-size: 24rpx;
		line-height: 33rpx;
		margin-top: 10rpx;
	}

	.phone {
		color: #343847;
		font-size: 24rpx;
	}

	.send_line {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx;
		border-bottom: solid 1rpx #E6E6E6;
	}

	.send_line:last-child {
		border-bottom: none;
	}

	.icon_box {
		width: 42rpx;
		height: 53rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.send_img {
		width: 42rpx;
		height: 53rpx;
		position: absolute;
		left: 0;
		top: 0;
	}

	.icon_txt {
		color: #FFFFFF;
		font-size: 24rpx;
		position: relative;
		z-index: 2;
		top: -6rpx;
	}

	.address {
		background-color: #FFFFFF;
	}

	.send_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 24rpx;
		padding: 23rpx 24rpx;
		background-color: rgba(49, 125, 230, .1);
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
}
</style>
