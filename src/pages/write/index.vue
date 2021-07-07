<template>
	<scroll-view class="content" scroll-y="true">
		<view class="title">发票信息</view>
		<view class="wrap">
			<view class="line border">
				<text class="name margin_left_24">抬头类型</text>
				<view class="right">
					<radio-box title="企业单位" :checked.sync="type" value="0" right="27rpx" type="small"></radio-box>
					<radio-box title="个人/非企业单位" :checked.sync="type" value="1" type="small"></radio-box>
				</view>
			</view>
			<view class="line border">
				<view class="name"><text class="red_txt">*</text>发票抬头</view>
				<input type="text" class="inp" placeholder="请输入发票抬头" v-model="title" />
			</view>
			<view class="line border">
				<view :class="['name',type == 1 ? 'margin_left_24' : '']"><text class="red_txt" v-if="type == 0">*</text>税号</view>
				<input type="text" class="inp" placeholder="请输入纳税人识别号" v-model="taxNumber" />
			</view>
			<view :class="['line',open ? 'border' : '']" @click="handlerOpen">
				<text class="name margin_left_24">更多内容</text>
				<view class="more">
					<text class="txt" v-if="!open">展开填写更信息</text>
					<image :class="['down_arrow',open ? 'active' : '']" src="../../static/index/down_arrow.png"></image>
				</view>
			</view>
			<view class="hide_content" v-if="open">
				<vew class="line border">
					<view class="name margin_left_24">地址</view>
					<input type="text" class="inp" placeholder="请输入地址" v-model="companyAddress" />
				</vew>
				<vew class="line border">
					<view class="name margin_left_24">电话</view>
					<input type="text" class="inp" placeholder="请输入电话" v-model="telephone" />
				</vew>
				<vew class="line border">
					<view class="name margin_left_24">开户银行</view>
					<input type="text" class="inp" placeholder="请输入开户银行" v-model="bankName" />
				</vew>
				<vew class="line">
					<view class="name margin_left_24">开户行账号</view>
					<input type="text" class="inp" placeholder="请输入开户行账号" v-model="bankAccount" />
				</vew>
			</view>
		</view>
		<view class="wrap margin_top_20">
			<view class="line">
				<text class="name margin_left_24">发票金额</text>
				<text class="blue">{{totalPrice()}}元</text>
			</view>
		</view>
		<view class="wrap margin_top_20 last_box">
			<view class="line border">
				<view class="name"><text class="red_txt">*</text>接收邮箱</view>
				<input type="text" class="inp" v-model="mail" placeholder="请输入接收电子发票邮箱" />
			</view>
			<view class="line">
				<view class="name"><text class="red_txt">*</text>联系手机</view>
				<input type="number" maxlength="11" v-model="phone" class="inp" placeholder="请输入手机号" />
			</view>
		</view>
		<view class="btn" @click="handlerSure">申请开票</view>
	</scroll-view>
</template>

<script>
	import radioBox from '@/components/form/radio-box.vue'
	import {mapGetters} from 'vuex'
	import {
		showMessage
	} from '@/util/index.js'
	import {
		InvoiceGenApi
	} from '@/api/bill.js'
	export default {
		name: 'write',
		components: {
			radioBox
		},
		computed:{
		  ...mapGetters(['makeOrder'])	
		},
		data() {
			return {
				type: "0", //0:企业，1：非企业个人
				mail: '',
				title: '',
				phone: '',
				taxNumber: '',
				companyAddress: '',
				telephone: '',
				bankName: '',
				bankAccount: '',
				open: false
			}
		},
		methods:{
			handlerOpen() {
				this.open = !this.open
			},
			totalPrice() {
			   const price = this.makeOrder.reduce((prev,next) => {
				   return prev + next.amount
			   },0)	
			   const result = price / 100
			   return result
			},
			handlerSure() {
				const phonereg=/^[1][3,4,5,6,7,8,9][0-9]{9}$/;
				const emailreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
				if(!this.title) {
					showMessage('请输入发票抬头')
					return
				}
				if(!this.taxNumber && this.type == 0) {
					showMessage('请输入税号')
					return
				}
				if(!this.phone) {
					showMessage('请输入手机号')
					return
				}
				if(!this.mail) {
					showMessage('请输入接收邮箱')
					return
				}
				if(!emailreg.test(this.mail)) {
					showMessage('邮箱格式不正确')
					return
				}
				if(!phonereg.test(this.phone)) {
					showMessage('手机号格式不正确')
					return
				}
				const orderList = this.makeOrder.map((item) => item.orderNo)
				const pdata = {
					type: this.type,
					title: this.title,
					taxNumber: this.taxNumber,
					mail: this.mail,
					phone: this.phone,
					orderList
				}
				if(this.companyAddress) {
					pdata['companyAddress'] = this.companyAddress
				}
				if(this.telephone) {
					pdata['telephone'] = this.telephone
				}
				if(this.bankName) {
					pdata['bankName'] = this.bankName
				}
				if(this.bankAccount) {
					pdata['bankAccount'] = this.bankAccount
				}
				this.handlerMake(pdata)
			},
			updateBillList() {
				const pages = getCurrentPages()
				const bill_page = pages.find((item) => item.route === 'pages/bill/index')
				if (bill_page) {
					bill_page.$vm.updateBill()
				}
			},
			async handlerMake(pdata) {
				const res = await InvoiceGenApi(pdata)
				showMessage('申请成功')
				this.$store.dispatch('app/toggleEmail', pdata.mail)
				this.updateBillList()
				uni.navigateTo({
					url: '/pages/success/index?from=2'
				})
				
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

	.margin_left_24 {
		margin-left: 26rpx;
	}
	.wrap.last_box{
		margin-bottom: 220rpx;
	}

	.content {
		padding: 26rpx 32rpx 0 32rpx;
		height: calc(100vh - 26rpx);
		overflow-y: auto;
		background-color: #F7F8F9;
	}

	.red_txt {
		color: #FF0000;
		font-size: 32rpx;
		margin-right: 10rpx;
	}

	.blue {
		color: #0069FA;
		font-size: 26rpx;
	}

	.title {
		color: #000000;
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 19rpx;
	}

	.wrap {
		background-color: #FFFFFF;
		border-radius: 8rpx;
		padding: 0 24rpx;
		width: 638rpx;
	}

	.line {
		width: 638rpx;
		height: 84rpx;
		@include flexrow;
		justify-content: space-between;
	}

	.border {
		border-bottom: solid 1rpx #E7E7E7;
	}

	.name {
		color: #000000;
		font-size: 26rpx;
		vertical-align: middle;
	}

	.txt {
		color: #343847;
		font-size: 26rpx;
	}

	.inp {
		width: 300rpx;
		height: 40rpx;
		color: #343847;
		font-size: 26rpx;
		text-align: right;
	}

	.margin_top_20 {
		margin-top: 20rpx;
	}

	.right {
		@include flexrow;
	}

	.more {
		@include flexrow;
		justify-content: flex-end;
	}

	.down_arrow {
		width: 16rpx;
		height: 8rpx;
		margin-left: 12rpx;
		&.active{
			transform: rotate(180deg);
		}
	}
	.btn{
		width: 686rpx;
		height: 80rpx;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		box-shadow: 0 0 4rpx 0 #0060DC;
		border-radius: 44rpx;
		position: fixed;
		left: 32rpx;
		bottom: 68rpx;
		color: #FFFFFF;
		font-size: 32rpx;
		text-align: center;
		line-height: 80rpx;
	}
</style>
