<template>
	<view class="content">
		<view class="wrap">
			<image class="icon" src="../../static/index/success.png"></image>
			<text class="txt">申请成功</text>
			<text class="info">发票将发送至您的邮箱：{{email}}</text>
			<text class="info">请注意查收</text>
		</view>
		<view class="btn" @click="handlerDone">完成</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	export default {
		name: 'success',
		data() {
			return {
				from: 1
			}
		},
		computed: {
			...mapGetters(['email'])
		},
		onLoad(options) {
			this.from = options.from || 1
			this.updateBillList()
		},
		methods: {
			handlerDone() {
				const delta = parseInt(this.from)
				uni.navigateBack({
					delta
				})
			},
			updateBillList() {
				const pages = getCurrentPages()
				const bill_page = pages.find((item) => item.route === 'pages/bill/index')
				if (bill_page) {
					bill_page.$vm.updateBill()
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	.content {
		width: 100%;
		height: 100%;
		background-color: #F7F8F9;
	}

	.wrap {
		margin: 20rpx 32rpx;
		border-radius: 8rpx;
		background-color: #FFFFFF;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: 43rpx;
	}

	.icon {
		width: 68rpx;
		height: 68rpx;
		margin: 40rpx 0 21rpx 0;
	}

	.txt {
		color: #343847;
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
	}

	.info {
		font-size: 24rpx;
		color: #7A7D86;
	}

	.btn {
		width: 457rpx;
		height: 80rpx;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		box-shadow: 0 0 4rpx 0 #0060DC;
		border-radius: 44rpx;
		color: #FFFFFF;
		text-align: center;
		line-height: 80rpx;
		font-size: 32rpx;
		position: fixed;
		left: 146rpx;
		bottom: 148rpx;
	}
</style>
