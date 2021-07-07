<template>
	<slidePopup title="请告诉我们原因" :show.sync="cancelVisible">
		<view class="content">
			<view class="title">我们会为您提供更好的服务</view>
			<view class="line" v-for="(item,index) in list" :key="index" @click="hanlderIndex(index)">
				<text class="left">{{item}}</text>
				<view class="right">
					<image class="check_img" v-if="checkIndex === index" src="../../static/index/blue_checked.png"></image>
					<text class="circle" v-else></text>
				</view>
			</view>
			<view class="btn" @click="sureCancel">确认</view>
		</view>
	</slidePopup>
</template>

<script>
	import slidePopup from '@/components/slide-popup'
	import {
		cancelOrder
	} from '@/api/check.js'
	import {showMessage} from '@/util/index.js'
	export default {
		components: {
			slidePopup
		},
		props: {
			orderId: String
		},
		data() {
			return {
				cancelVisible: false,
				checkIndex: 0,
				list: [
					'计划有变，暂时不需要寄件了',
					'赶时间，更改为其他寄件方式',
					'预约信息有误，需要修改',
					'误发预约',
					'其他'
				]
			}
		},
		methods: {
			handlerSure() {
				this.$emit('sure');
				this.cancelVisible = false
			},
			handlerShow() {
				this.cancelVisible = true
			},
			hanlderIndex(index) {
				this.checkIndex = index
			},
			async sureCancel() {
				const reason = this.list[this.checkIndex]
				const res = await cancelOrder({
					orderNo: this.orderId,
					reason
				})
				if (res.ret_code == '0000') {
					showMessage('订单已取消')
					this.handlerSure()
				}else{
					showMessage(res.ret_msg)
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.title {
		color: #999999;
		font-size: 24rpx;
		margin-top: 10rpx;
		margin-bottom: 49rpx;
	}

	.line {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 32rpx;
	}

	.check_img {
		width: 38rpx;
		height: 38rpx;
		display: block;
	}

	.left {
		color: #343847;
		font-size: 30rpx;
	}

	.circle {
		width: 38rpx;
		height: 38rpx;
		border-radius: 20rpx;
		border: solid 1rpx #979797;
		display: block;
		box-sizing: border-box;
	}

	.btn {
		width: 686rpx;
		height: 80rpx;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		border-radius: 44rpx;
		margin-top: 70rpx;
		margin-bottom: 32rpx;
		text-align: center;
		line-height: 80rpx;
		color: #FFFFFF;
		margin-bottom: 130rpx;
	}
</style>
