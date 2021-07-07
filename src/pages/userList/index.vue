<template>
	<scroll-view scroll-y="true" class="content">
		<view :class="['line', activeUid === item.uid ? 'active' : '']" v-for="(item,index) in list" :key="index" @click="handlerItem(item)">
			<view class="line_left">
				<image class="avatar" src="../../static/index/mine_default_avatar.png"></image>
				<view class="right">
					<view class="top_line">
						<text class="name">{{item.name}}</text>
						<text class="phone">{{item.phone}}</text>
					</view>
					<view class="address">负责：{{item.areaSimpleName}}</view>
				</view>
			</view>
			<view class="timeout" v-if="item.curOrder">待取货{{item.curOrder}}单</view>
		</view>
		<view class="btn" @click="handlerSure">确认</view>
		<empty-box v-if="!loading && !list.length"></empty-box>
	</scroll-view>
</template>

<script>
	import {
		PickUpPersonnelListApi,
		LeagueOrderDispatchApi
	} from '@/api/pickup.js'
	import {
		showMessage,
		updateCheckPage
	} from '@/util/index'
	import emptyBox from '@/components/empty/index.vue'
	export default {
		name: 'userList',
		components: {
			emptyBox
		},
		data() {
			return {
				loading: true,
				list: [],
				oid: '',
				aid: '',//区域areaId
				redispatch: '',
				item: '',
				activeUid : ''
			}
		},
		onLoad(options) {
			this.oid = options.oid || ''
			this.aid = options.aid || ''
			this.redispatch = options.redispatch || ''
			this.getUserList()
		},
		methods: {
			handlerItem(item) {
				this.item = item
				this.activeUid = item.uid
			},
			handlerSure() {
				const {uid,name,phone} = this.item
				this.orderDispatch(uid,name,phone)
			},
			async orderDispatch(pickerUid, name, phone) {
				const pdata = {
					orderNo: this.oid,
					pickerUid,
					name,
					phone
				}
				let message = '派单成功'
				if (this.redispatch) {
					pdata['reDispatch'] = true
					message = '改派成功'
				}
				const res = await LeagueOrderDispatchApi(pdata)
				showMessage(message)
				updateCheckPage()
				setTimeout(() => {
					uni.navigateBack()
				}, 1000)
			},
			async getUserList() {
				const res = await PickUpPersonnelListApi({
					areaId: this.aid
				})
				const pickUpPersonnels = res.pickUpPersonnels || []
				this.list = pickUpPersonnels.filter((item) => item.userStatus == 1)
				this.loading = false
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		width: 750rpx;
		display: flex;
		flex: 1;
		background-color: #F7F8F9;
		height: calc(100vh - 140rpx);
		padding-bottom: 140rpx;
	}

	.line {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 20rpx 32rpx 0 32rpx;
		background-color: #FFFFFF;
		border-radius: 8rpx;
		padding: 24rpx;
		justify-content: space-between;
		&.active{
			border:solid 2rpx #0060DC;
			box-sizing: border-box;
		}
	}

	.line_left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 60rpx;
		margin-right: 30rpx;
	}

	.right {
		display: flex;
		flex-direction: column;
	}

	.top_line {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.name {
		color: #343847;
		font-size: 32rpx;
		font-weight: bold;
		margin-right: 18rpx;
	}

	.phone {
		color: #343847;
		font-size: 24rpx;
	}

	.timeout {
		width: 116rpx;
		height: 37rpx;
		background-color: #EA4141;
		border-radius: 4rpx;
		color: #FFFFFF;
		font-size: 24rpx;
		text-align: center;
		line-height: 37rpx;
		margin-left: 22rpx;
		padding: 7rpx 11rpx;
		border-radius: 8rpx;
	}
	.btn {
		color: #FFFFFF;
		font-size: 32rpx;
		width: 686rpx;
		height: 80rpx;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		border-radius: 44rpx;
		text-align: center;
		line-height: 80rpx;
		margin-bottom: 32rpx;
		position: fixed;
		bottom: 140rpx;
		left: 32rpx;
	}

	.address {
		color: #333333;
		font-size: 26rpx;
		margin-top: 14rpx;
	}
</style>
