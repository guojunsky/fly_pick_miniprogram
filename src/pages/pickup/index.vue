<template>
	<view class="content">
		<template v-if="login">
			<view class="tab_content">
				<template v-for="(item,index) in statuslist">
					<view :class="['tab_item',status == item.value ? 'active' : '']" :key="index" @click="handlerTab(item.value)" v-if="item.show">
						{{item.name}}
						<text class="tab_line" v-if="status == item.value"></text>
						<text class="number" v-if="item.number">{{item.number}}</text>
					</view>
				</template>
			</view>
			<view class="time_content" v-if="userType == 3 && status == 5 && statuslist[status].list.length">
				<view :class="['time_item',statuslist[status].time == item.value ? 'active' : '']" v-for="(item,index) in timelist"
				 :key="index" @click="handlerTime(item.value)">{{item.name}}</view>
			</view>
			<!-- list -->
			<scroll-view 
			class="list_content" 
			scroll-y="true" 
			@scrolltolower="hanlderToLower"
			 refresher-enabled="true" 
			 @refresherrefresh="refresh" 
			 :refresher-triggered="triggered"
			>
				<view class="list_item" v-for="(item,index) in list" :key="index">
					<view class="list_box">
						<view class="top" @click="handlerClip(item.tno)">
							<view class="top_left">
								<text class="send_number">运单号：</text>
								<text class="send_sort">{{item.tno}}</text>
								<image class="copy_img" src="../../static/index/copy.png"></image>
							</view>
							<text class="top_right">{{item.chinaAddress.city}}-{{item.abroadAddress.country}}</text>
						</view>
						<view class="order_content">
							<view class="line">
								<view class="fa_icon">发</view>
								<text class="label">发件人：</text><text class="txt_info">{{item.chinaAddress.name}}</text>
								<text class="label phone">联系电话：</text><text class="txt_info">{{item.chinaAddress.phone}}</text>
							</view>
							<view class="line">
								<text class="label address">取货地址：</text><text class="txt_info">{{item.chinaAddress.province}}{{item.chinaAddress.city}}{{item.chinaAddress.addr}}</text>
							</view>
							<view class="line" v-if="item.pickup && item.pickup.date">
								<text class="label">预约取货时间：</text><text class="txt_info">{{getDate(item.pickup.date)}}{{getTime(item.pickup.begin)}}-{{getTime(item.pickup.end)}}</text>
								<view class="timeout" v-if="isLate(item.pickup) != 1 && (status == 1 || status == 2)">{{isLate(item.pickup) == 2 ? '即将超时' : '已超时'}}</view>
							</view>
							<view class="line" v-if="item.goods">
								<text class="label">物品信息：</text><text class="txt_info">{{getGoodName(item.goods)}}</text>
							</view>
							<view class="line" v-if="item.remark">
								<text class="red">备注：{{item.remark}}</text>
							</view>
						</view>
					</view>
					<view class="get_content" v-if="status != 1 && item.pickup && item.pickup.user">
						<view class="line">
							<view class="fa_icon qu_icon">取</view>
							<text class="label">取货员：</text><text class="txt_info">{{item.pickup.user}}</text>
							<text class="label phone">联系电话：</text><text class="txt_info">{{item.pickup.phone}}</text>
						</view>
						<view class="line">
							<text class="label">派单时间：</text><text class="txt_info">{{item.pickup.sendTime | filterDate}}</text>
						</view>
						<view class="line" v-if="(status == 3 || status == 4 || status == 5) && item.pickup.pickTime">
							<text class="label">取货时间：</text><text class="txt_info">{{item.pickup.pickTime | filterDate}}</text>
						</view>
						<view class="line" v-if="status == 3 && item.pickup && (item.pickup.type == 1 || item.pickup == 2)">
							<text class="label">待出货地址：</text><text class="txt_info">{{item.pickup.storeAddr}}</text>
						</view>
					</view>
					<view :class="['btn_box','active']">
						<view class="btn_right">
							<view class="btn" @click="hanlderCall(item.chinaAddress.phone)">联系客人</view>
							<view class="btn margin_left_20 send_btn" v-if="status == 1" @click="handlerPai(item.orderNo,item)">派单</view>
							<view class="btn margin_left_20" v-if="status == 2 && userType != 3" @click="handlerGaiPai(item)">改派</view>
							<view class="btn margin_left_20" v-if="status == 2" @click="confirmGood(item)">收货</view>
							<view class="btn margin_left_20" v-if="status == 3" @click="toPrintPage(item)">打印运单</view>
							<view class="btn margin_left_20" v-if="status == 3 && item.orderStatus != 300 && item.orderStatus != 212 && userType != 3" @click="shipGood(item.orderNo)">出货</view>
							<view class="btn margin_left_20 send_btn" v-if="status == 4" @click="returnGood(item.orderNo)">退货</view>
						</view>
					</view>
				</view>
				<view class="last_height" v-if="list.length"></view>
				<empty-box v-if="!loading && !list.length"></empty-box>
			</scroll-view>
		</template>
		<!-- 未登录 -->
		<view class="no_login" v-else>
			<image class="no_img" src="../../static/index/empty.png"></image>
			<text class="no_txt">您还未登录，请先登录哦~</text>
			<view class="login_btn" @click="toLogin">登录账户</view>
		</view>
	</view>
</template>

<script>
	import emptyBox from '@/components/empty/index.vue'
	import {
		mapGetters
	} from 'vuex'
	import {
		handlerCheckLogin,
		showMessage,
		timeToMinute
	} from '@/util/index'
	import {
		LeagueOrderListApi,
		LeagueOrderShipApi,
		LeagueOrderReturnApi,
		PickUpConfigApi
	}
	from '@/api/pickup.js'
	export default {
		name: 'pickup',
		components: {
			emptyBox
		},
		filters: {
			filterDate: function(value) {
				return timeToMinute(value)
			}
		},
		computed: {
			...mapGetters(['login', 'userInfo']),
			list() {
				const list = this.statuslist[this.status].list
				return list
			},
			userType() {
				const userType = this.userInfo ? this.userInfo.lgType : ''
				this.setTab(userType)
				return userType
			}
		},
		onLoad() {
			if (this.login) {
				this.setTab(this.userType)
				this.getOrderList();
			}
			this.triggered = true
		},
		onShow() {
			if (!this.login) {
				Object.assign(this.$data, this.$options.data.call(this));
			}
			if (typeof this.$mp.page.getTabBar === 'function' && this.$mp.page.getTabBar()) {
				if (this.userInfo) {
					this.$mp.page.getTabBar().setData({
						lgType: this.userInfo.lgType,
						tab: 0
					})
				} else {
					this.$mp.page.getTabBar().setData({
						tab: 0
					})
				}
			}
		},
		watch: {
			login() {
				if (this.login) {
					this.setTab()
					this.getOrderList();
				}
			}
		},
		data() {
			return {
				loading: true,
				status: 1, // 状态：1待派单，2待取货，3待出货，4待退货，5已完成
				cursor: 0,
				count: 10,
				time: 1,
				triggered: true,
				_freshing: false,
				timelist: [{
					name: '今天',
					value: 1
				}, {
					name: '近7天',
					value: 7
				}, {
					name: '近一月',
					value: 30
				}, {
					name: '近三月',
					value: 90
				}],
				statuslist: {
					1: {
						name: '待派单',
						number: 0,
						value: 1,
						cursor: 0,
						list: [],
						time: 1,
						show: true // userType!= 3
					},
					2: {
						name: '待取货',
						number: 0,
						value: 2,
						cursor: 0,
						list: [],
						time: 1,
						show: true
					},
					3: {
						name: '待出货',
						number: 0,
						value: 3,
						cursor: 0,
						list: [],
						time: 1,
						show: true // userType!= 3
					},
					4: {
						name: '待退货',
						number: 0,
						value: 4,
						cursor: 0,
						list: [],
						time: 1,
						show: true
					},
					5: {
						name: '已完成',
						number: 0,
						value: 5,
						cursor: 0,
						list: [],
						time: 1,
						show: false // userType== 3
					}
				}
			}
		},
		methods: {
			refresh() {
				if (this._freshing) return;  
				this._freshing = true; 
				if(!this.triggered) {
					this.triggered = true
				}
				this.updateData()
				setTimeout(() => {
					this.triggered = false
					this._freshing = false; 
				}, 2000)
			},
			getGoodName(goods) {
				let name = ''
				name += (goods.type == 2 ? '包裹' : '文件') + '/'
				name += goods.items.length + '件/'
				name += this.getTotalWeight(goods.items) + 'KG'
				const props = this.getSpecial(goods.items)
				name += props ? '/' + props : ''
				return name
			},
			getTotalWeight(data) {
				let result = 0
				data.forEach((item) => {
					result += parseInt(item.weight)
				})
				const weight = result / 1000
				return weight
			},
			getSpecial(data) {
				let props = []
				data.forEach((item) => {
					props = [...item.props]
				})
				const result = props.length ? props.slice(0, 3).join('、') : ''
				return result
			},
			isLate(pickup) {
				const {
					date,
					end
				} = pickup
				const stime = this.getDate(date, ['/', '/']) + ' ' + this.getTime(end)
				const now = new Date().getTime()
				const time = new Date(stime).getTime()
				let status = (time - now) <= 30 * 60 * 1000 ? 2 : 1 //1:正常，2：即将超时，3：已超时
				status = (time - now) <= 0 ? 3 : status
				return status
			},
			setTab(userType) {
				const statuslist = this.statuslist
				for (let item in statuslist) {
					if (userType === 3) {//取货员
						if (item == 1) {
							statuslist[item].show = false
						}
						if (item == 5) {
							statuslist[item].show = true
						}
					} else {
						if (item == 5) {
							statuslist[item].show = false
						} else {
							statuslist[item].show = true
						}
					}
				}
				this.status = userType == 3 ? 2 : 1;
				this.statuslist = statuslist
			},
			handlerTab(index) {
				this.status = index;
				this.updateData()
			},
			handlerTime(time) {
				this.statuslist[this.status].time = time
				this.updateData(time)
			},
			updateData() {
				this.statuslist[this.status].cursor = 0;
				this.getOrderList();
			},
			toLogin() {
				uni.showLoading()
				handlerCheckLogin({
					success: (data) => {
						this.$store.dispatch('coupon/getAvailableCouponList')
					},
					fail: (e) => {
						showMessage(e && e.msg || '登录失败，请稍后重试')
					},
					done: () => {
						uni.hideLoading()
					}
				});
			},
			handlerClip(data) {
				uni.setClipboardData({
					data,
					success: () => {
						showMessage('已复制到剪贴板')
					}
				})
			},
			hanlderToLower() {
				this.getOrderList()
			},
			handlerPai(oid, item, redispatch = false) {
				const chinaAddress = item.chinaAddress
				const pdata = {
					leagueId: this.userInfo.lgId,
					address: chinaAddress.addr,
					province: chinaAddress.province,
					city: chinaAddress.city
				}
				this.getPickUpConfig(pdata, (aid) => {
					let url = '/pages/userList/index?oid=' + oid + '&aid=' + aid
					if (redispatch) {
						url += '&redispatch=1'
					}
					uni.navigateTo({
						url
					})
				})
			},
			handlerGaiPai(item) {
				//改派
				const oid = item.orderNo
				this.handlerPai(oid, item, true)
			},
			getDate(time, format = ['.', '.']) {
				if (!time) return
				time = time.toString()
				const year = time.substring(0, 4)
				const month = time.substring(4, 6)
				const date = time.substring(6)
				const result = `${year}${format[0]}${month}${format[1]}${date}`
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
			getDateStr(p_count) {
				const dd = new Date();
				dd.setDate(dd.getDate() + p_count); //获取p_count天后的日期
				let y = dd.getFullYear();
				let m = dd.getMonth() + 1; //获取当前月份的日期
				if (m < 10) {
					m = '0' + m;
				}
				let d = dd.getDate();
				if (d < 10) {
					d = '0' + d;
				}
				return y + "-" + m + "-" + d;
			},
			getStartEndTime(number) {
				let start = '';
				let end = this.getDateStr(0)
				if (number == 1) {
					start = this.getDateStr(0)
				} else if (number == 7) {
					start = this.getDateStr(-7)
				} else if (number == 30) {
					start = this.getDateStr(-30)
				} else if (number == 90) {
					start = this.getDateStr(-90)
				}
				const result = {
					start,
					end
				}
				return result
			},
			//打印运单
			toPrintPage(item) {
				this.$store.dispatch('print/updatePrintOrder', item)

				//判断本地是否有存deviceId
				let str = uni.getStorageSync("deviceInfo");
				if (str) {
					let deviceInfo = JSON.parse(str)
					this.$store.commit('print/setDeviceInfo', deviceInfo)

					uni.navigateTo({
						url: `/pages/print/index`,
					})
					return
				}
				uni.navigateTo({
					url: `/pages/print/deviceList`,
				})
			},
			confirmGood(item) { //确认收货
				this.$store.dispatch('sendOrder/resetSendOrder')
				this.$store.commit('sendOrder/setConfirmReceiveData', item)
				uni.navigateTo({
					url: `/pages/sendOrder/index?fromPage=confirmReceive`
				})
			},
			hanlderCall(phone) {
				const phoneNumber = String(phone)
				if (!phoneNumber) return
				uni.makePhoneCall({
					phoneNumber
				})
			},
			async getPickUpConfig(data, callback) {
				const res = await PickUpConfigApi(data)
				const canPickUp = res.canPickUp
				if (!canPickUp) {
					showMessage('不可上门取货')
					return
				}
				const pickUpConfig = res.pickUpConfig
				if (callback) callback(pickUpConfig.areaId)
			},
			async getOrderList() {
				const status = this.status
				const uid = this.userInfo.id
				const userType = this.userType
				let {
					time,
					cursor
				} = this.statuslist[status]
				if (cursor <= -1) return
				let pdata = {
					status,
					cursor,
					userType,
					uid,
					count: this.count
				}
				if (userType == 3 && status == 5) {
					const timeStr = this.getStartEndTime(time)
					pdata['beginTime'] = timeStr.start
					pdata['endTime'] = timeStr.end
				}
				const res = await LeagueOrderListApi(pdata)
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
			},
			async shipGood(orderNo) { //出货
				const res = await LeagueOrderShipApi({
					orderNo
				})
				showMessage('出货成功')
				this.updateData()
			},
			async returnGood(orderNo) { //退货
				const res = await LeagueOrderReturnApi({
					orderNo
				})
				showMessage('退货成功')
				this.updateData()
			}
		}
	}
</script>

<style scoped lang="scss">
	$fontSize:24rpx;

	@mixin flexrow {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.red {
		color: #EA3A3E;
		font-size: $fontSize;
	}

	.timeout {
		width: 116rpx;
		height: 37rpx;
		background-color: #EA3A3E;
		border-radius: 4rpx;
		color: #FFFFFF;
		font-size: 24rpx;
		text-align: center;
		line-height: 37rpx;
		margin-left: 22rpx;
	}

	.address {
		width: 130rpx;
	}

	.line {
		@include flexrow;
		padding-top: 23rpx;
		justify-content: flex-start;
	}

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
		padding-bottom: 110rpx;
	}

	.list_item {
		width: 686rpx;
		margin: 0 32rpx;
		background: #FFFFFF;
		border-radius: 8rpx;
		margin-top: 20rpx;
		padding-bottom: 30rpx;
	}
	.last_height{
		width: 100%;
		height: 20rpx;
	}

	.list_box {
		width: 638rpx;
		padding: 0 24rpx;
	}

	.top {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		font-size: 24rpx;
		padding: 21rpx 0 20rpx 0;
		border-bottom: dashed 1px #DADADA;
	}

	.top_left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.top_right {
		color: #056BF1;
		font-size: $fontSize;
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

	.btn_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		border-top: dashed 1rpx #DADADA;
		margin: 20rpx 24rpx 0 24rpx;
		padding: 24rpx 0;

		&.active {
			justify-content: flex-end;
		}
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

	.send_btn {
		color: #FFFFFF;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
	}

	.label {
		color: #7E8089;
		font-size: 26rpx;
	}

	.txt_info {
		color: #343847;
		font-size: 26rpx;
	}

	.phone {
		margin-left: 24rpx;
	}

	.fa_icon {
		width: 35rpx;
		height: 35rpx;
		background: #056BF1;
		border-radius: 5rpx;
		color: #FFFFFF;
		font-size: 22rpx;
		text-align: center;
		line-height: 35rpx;
		margin-right: 15rpx;
	}

	.qu_icon {
		background: #343847;
	}

	.get_content {
		margin: 24rpx 24rpx 0 24rpx;
		border-top: dashed 1rpx #DADADA;
	}

	.time_content {
		width: 686rpx;
		padding: 23rpx 32rpx;
		@include flexrow;
	}

	.time_item {
		width: 124rpx;
		height: 53rpx;
		border-radius: 26rpx;
		border: 1rpx solid #056BF1;
		color: #056BF1;
		font-size: 26rpx;
		text-align: center;
		line-height: 53rpx;
		margin-right: 27rpx;

		&.active {
			border: none;
			color: #FFFFFF;
			background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		}
	}
</style>
