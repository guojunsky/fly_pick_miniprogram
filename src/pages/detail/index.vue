<template>
	<view class="container">
		<view class="content">
			<!-- 名称 -->
			<view class="place" v-if="city && country">
				<image class="place_bg" mode="center" src="/static/index/map.png"></image>
				<view class="place_content">
					<view class="from">{{city ? city.cityName : '城市'}}</view>
					<image class="center_arrow" src="/static/index/right_arrow.png"></image>
					<view class="to">{{country ? country.cnName : '国家'}}</view>
				</view>
			</view>
			<!-- 渠道 -->
			<view class="detail">
				<view class="channel">
					<image class="detail_img" mode="center" src="/static/index/map.png"></image>
					<view class="channel_content">
						<view class="detail_title">产品名称：{{detail.name}}</view>
						<view class="detail_score">
							<image class="star_img" v-for="(item,index) in getStar(detail.star)" :key="index" src="../../static/detail/redstar.png"></image>
							<text class="score" v-if="detail.star">{{detail.star}}</text>
							<text class="comment_number">{{detail.commentCount}}条点评</text>
						</view>
						<view class="detail_score">
							<text class="txt">服务：{{detail.serviceStar}}分</text>
							<text class="txt">时效：{{detail.effectiveStar}}分</text>
							<text class="txt">安全：{{detail.securityStar}}分</text>
						</view>
						<view class="detail_score" v-if="detail.tags.length">
							<view class="tag_item" v-for="(item,index) in detail.tags" :key="index">{{item}}</view>
						</view>
						<view class="center_line"></view>
						<view class="accept_content" v-if="detail.goodsTypes && detail.goodsTypes.length">
							<view class="acc_left">可接物品：</view>
							<view class="acc_right"><text v-for="(item,index) in detail.goodsTypes" :key="index">{{item}}{{index != detail.goodsTypes.length - 1 ? '、' : ''}}</text></view>
						</view>
						<view class="time_content">
							<view class="time_box">
								<view class="time_content">
									<text class="time_left">运输时效：</text>
									<text class="time_right">{{detail.agingStart}}-{{detail.agingEnd}}天到达</text>
								</view>
								<view class="time_content">
									<text class="time_left">计费重：</text>
									<text class="time_right">{{detail.weightDetailVO.chargeWeight/1000}}KG</text>
								</view>
							</view>
							<view class="time_box">
								<view class="time_content">
									<text class="time_left">线路有效期至：</text>
									<text class="time_right">{{detail.validTime | formatTime}}</text>
								</view>
								<view class="time_content">
									<text class="time_left">运费单价：</text>
									<text class="time_right">{{detail.price/100}}元/KG</text>
								</view>
							</view>
						</view>
						<view class="send_price" @click="handlerShowDetail">
							<view class="flex_row">
								<text class="black_txt">预估运费：</text>
								<text class="red_txt">￥{{detail.totalPrice/100}}</text>
							</view>
							<image :class="['arrow_img',showtable ? 'down_arrow' : '']" src="/static/detail/right_arrow.png"></image>
						</view>
						<view class="table" v-show="showtable">
							<view class="tr">
								<text class="td">费用项</text>
								<text class="td">价格</text>
								<text class="td">小计</text>
							</view>
							<view class="tr" v-for="(item,index) in detail.priceShows" :key="index">
								<text class="td">{{item.title}}</text>
								<text class="td">{{item.formula}}</text>
								<text class="td">¥{{item.totalPrice/100}}</text>
							</view>
							<template v-for="(item,index) in detail.surcharges">
								<view class="tr" v-if="item.selected == 1 && item.totalPrice > 0" :key="index">
									<text class="td">{{item.surchargeName}}</text>
									<text class="td">{{item.priceText}}</text>
									<text class="td">¥{{item.totalPrice/100}}</text>
								</view>
							</template>
						</view>
						<view class="coupon_content" @click="handlerShowCoupon" v-if="detail.coupons.length">
							<view class="coupon_line">
								<view class="coupon_item" v-for="(item,index) in (detail.coupons.slice(0,3))">
									<image class="coupon_img" src="../../static/detail/redcoupon.png"></image>
									<text class="coupon_txt">{{handleCoupon(item)}}</text>
								</view>
							</view>
							<view class="get_coupon">
								<text class="get_txt">领券</text>
								<image class="get_img" src="../../static/detail/blue_arrow.png"></image>
							</view>
						</view>
					</view>
				</view>
			</view>
			<!-- 附加费用 -->
			<view class="other_content" v-if="otherList.length">
				<view class="other">
					<view class="other_title">如果您的包裹符合以下情况，将产生相应附加费</view>
					<template v-for="(item,index) in otherList">
						<view class="other_line">
							<text class="other_txt">{{item.surchargeName}}</text>
							<view class="other_right">
								<text class="other_txt" v-if="item.priceText">{{item.priceText}}</text>
							</view>
						</view>
					</template>
				</view>
			</view>
			<!-- 介绍、评价 -->
			<view class="intro_content">
				<view class="intro">
					<view class="tab_content">
						<view :class="['tab_item',activeIndex == 0 ? 'active' : '']" @click="handlerIndex(0)">注意事项</view>
						<view :class="['tab_item',activeIndex == 1 ? 'active' : '']" @click="handlerIndex(1)">评价{{detail.commentCount ? `(${detail.commentCount})` : ''}}</view>
					</view>
					<view class="tab_intro" v-show="activeIndex === 0">
						<rich-text :nodes="detail.introduce | formatRichText"></rich-text>
					</view>
				</view>
				<view class="comment_content" v-show="activeIndex === 1">
					<view class="comment_line" v-for="(item,index) in list" :key="index">
						<view class="comment_user">
							<view class="comment_left">
								<image class="comment_head" mode="aspectFill" :src="item.avatar ? item.avatar : '../../static/detail/mine_default_avatar.png'"></image>
								<view class="comment_name">
									<text class="comment_username">{{item.nickname ? item.nickname : dealPhone(item.leaguePhone)}}</text>
									<view class="comment_stars">
										<image class="comment_star" v-for="(sitem,sindex) in getStar(item.star)" :key="sindex" src="/static/comment/blue_star.png"></image>
										<image class="comment_star" v-for="(sitem,sindex) in getGrayStar(item.star)" :key="sindex" src="/static/comment/gray_star.png"></image>
										<text class="comment_score">{{item.star}}分</text>
									</view>
								</view>
							</view>
							<text class="comment_time">{{timeFromNow(item.createAt)}}</text>
						</view>
						<view class="comment_info">{{item.content}}</view>
						<view class="comment_images">
							<image class="comment_img" v-for="(sitem,sindex) in item.urlList" :key="sindex" mode="aspectFill" :src="sitem" @click="previewImage(sindex,item.urlList)"></image>
						</view>
					</view>
					<view class="no_comment" v-if="!list.length">暂无评价</view>
				</view>
			</view>
			<!-- 下单 -->
			<view class="btn_box">
				<view class="btn" @click="handlerOrderPage">立即下单</view>
			</view>
		</view>
		<!-- popup -->
		<slidePopup title="当前优惠" :show.sync="couponVisible">
			<couponList :list="detail.coupons" @update="handlerUpdateCoupon"></couponList>
		</slidePopup>
	</view>
</template>

<script>
	import slidePopup from '@/components/slide-popup'
	import couponList from './widget/coupon-list'
	import {
		timeToDate,
		handlerCheckLogin,
		showMessage,
		handlerPreviewImage,
		phoneDeal
	} from '@/util/index.js'
	import {
		CommentListApi
	} from '@/api/comment.js'
	import {
		mapGetters
	} from 'vuex'
	import moment from 'moment'
	moment.locale('zh-cn')
	export default {
		components: {
			slidePopup,
			couponList
		},
		computed: {
			...mapGetters(['detail', 'city', 'country', 'checkData']),
			otherList() {
				const data = this.detail.surcharges.filter((item) => item.selected == 0 || item.totalPrice <= 0)
				return data
			}
		},
		data() {
			return {
				list: [],
				showtable: false,
				activeIndex: 0,
				couponVisible: false,
				cursor: 0,
				count: 10,
				pid: ''
			}
		},
		onLoad() {
			this.pid = this.detail.id || ''
			this.getCommentList()
		},
		onShow() {},
		filters: {
			formatTime: (value) => {
				if (!value) return ''
				return timeToDate(value)
			},
			formatRichText(html) { //控制小程序中图片大小
				let newContent = html.replace(/<img[^>]*>/gi, function(match, capture) {
					match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');
					match = match.replace(/width="[^"]+"/gi, '').replace(/width='[^']+'/gi, '');
					match = match.replace(/height="[^"]+"/gi, '').replace(/height='[^']+'/gi, '');
					return match;
				});
				newContent = newContent.replace(/style="[^"]+"/gi, function(match, capture) {
					match = match.replace(/width:[^;]+;/gi, 'max-width:100%;').replace(/width:[^;]+;/gi, 'max-width:100%;');
					return match;
				});
				newContent = newContent.replace(/<br[^>]*\/>/gi, '');
				newContent = newContent.replace(/\<img/gi,
					'<img style="max-width:100%;height:auto;display:inline-block;margin:10rpx auto;"');
				return newContent;
			}
		},
		methods: {
			dealPhone(value) {
				return phoneDeal(value)
			},
			previewImage(index, urls) {
				handlerPreviewImage(index, urls)
			},
			handlerShowDetail() {
				this.showtable = !this.showtable;
			},
			handlerShowCoupon() {
				this.couponVisible = true
			},
			handlerOrderPage() {
				this.toLogin(() => {
					//下单页面
					//处理物品信息
					if (this.checkData) {
						this.goodsInfo = this.checkData;
					}
					this.$store.dispatch('sendOrder/resetSendOrder')
					this.$store.commit('sendOrder/setGoodsInfo', this.goodsInfo)
					this.$store.commit('sendOrder/setPid', this.detail.id)
					this.$store.commit('sendOrder/setCurrentProduct', this.detail)
					uni.navigateTo({
						url: `/pages/sendOrder/index?showFba=${this.goodsInfo.fba}&pid=${this.detail.id}`
					})
				})
			},
			getStar(number) {
				number = parseInt(number) || 0
				return new Array(number)
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
			handlerIndex(index) {
				this.activeIndex = index
			},
			timeFromNow(time) {
				const format = "YYYY-MM-DD HH:mm:ss";
				const formatDate = "YYYY-MM-DD";
				const formatTime = "HH:mm:ss";
				let timeStr = moment(time).format(format);
				if (moment(time).format(formatDate) === moment().format(formatDate)) {
					const fromNowStr = moment(time).fromNow(true);
					if (fromNowStr.indexOf("小时") > 0 && parseInt(fromNowStr) > 5) {
						timeStr = "今天 " + moment(time).format(formatTime);
					} else {
						timeStr = fromNowStr + "前"
					}
				}
				return timeStr
			},
			handlerUpdateCoupon(id) {
				const detail = this.detail
				const coupons = this.detail.coupons || []
				coupons.forEach((item, index) => {
					if (item.id == id) {
						if(item.expireType == 2) {
							coupons[index].expireEndAt = parseInt(new Date().getTime()) + coupons[index].expireTime
						}
						coupons[index].receive = 1
					}
				})
				detail.coupons = coupons
				this.$store.dispatch('app/toggleDetail', detail)
			},
			toLogin(callback) {
				if (this.login) {
					if (callback) callback()
				} else {
					uni.showLoading()
					handlerCheckLogin({
						success: () => {
							if (callback) callback()
						},
						fail: (e) => {
							showMessage(e && e.msg || '登录失败，请稍后重试')
						},
						done: () => {
							uni.hideLoading()
						}
					});
				}
			},
			getGrayStar(star) {
				const stars = parseInt(star) || 0
				const number = 5 - stars
				return new Array(number)
			},
			async getCommentList() {
				const res = await CommentListApi({
					cursor: this.cursor,
					count: this.count,
					pid: this.pid
				})
				this.loading = false
				this.list = res.list || []
				this.cursor = res.nextCursor
			}
		}
	}
</script>

<style lang="scss">
	@mixin flexrow {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	$topsix:12rpx;

	.modal {
		height: 500rpx;
		background-color: pink;
	}

	.content {
		background-color: #F7F8F9;
		height: 100vh;
		overflow-y: auto;
		padding: 0 32rpx;

		.from,
		.to {
			color: #343847;
			font-size: 40rpx;
			font-weight: 600;
		}

		.accept_content {
			display: flex;
			flex-direction: row;
			margin-bottom: 15rpx;

			.acc_left {
				color: #343847;
				font-size: 26rpx;
				font-weight: bold;
				width: 130rpx;
			}

			.acc_right {
				color: #056BF1;
				font-size: 24rpx;
				line-height: 33rpx;
				flex: 1;
			}
		}

		.no_comment {
			padding: 80rpx 0 200rpx 0;
			color: #999999;
			font-size: 28rpx;
			text-align: center;
		}

		.center_arrow {
			width: 34rpx;
			height: 10rpx;
			margin: 0 86rpx;
		}

		.place {
			width: 686rpx;
			height: 140rpx;
			background: #FFFFFF;
			box-shadow: 2rpx 4rpx 4rpx 2rpx rgba(0, 0, 0, 0.08);
			border-radius: 8rpx;
			position: relative;
			margin-top: 24rpx;
		}

		.place_content {
			@include flexrow;
			width: 100%;
			position: absolute;
			top: 0;
			left: 0;
			height: 100%;
			justify-content: center;
		}

		.place_bg {
			width: 686rpx;
			height: 140rpx;
		}

		.detail {
			width: 686rpx;
			border-radius: 8rpx;
			background-color: #FFFFFF;
			margin-top: 20rpx;
		}

		.channel {
			padding: 24rpx;
			position: relative;
		}

		.detail_img {
			width: 630rpx;
			height: 390rpx;
			position: absolute;
			top: 0;
			left: 56rpx;
		}

		.detail_title {
			font-size: 28rpx;
			color: #343847;
			font-weight: bold;
		}

		.detail_score {
			@include flexrow;
			margin-top: $topsix;
		}

		.star_img {
			width: 21rpx;
			height: 20rpx;
			margin-right: 9rpx;
		}

		.score {
			color: #E8011B;
			font-size: 24rpx;
			margin-right: 16rpx;
		}

		.comment_number {
			color: #777777;
			font-size: 20rpx;
		}

		.txt {
			color: #777777;
			font-size: 20rpx;
			margin-right: 32rpx;
		}

		.tag_item {
			color: #056BF1;
			font-size: 20rpx;
			padding: 4rpx 8rpx;
			background-color: #ECF4FF;
			border-radius: 4rpx;
			margin-right: 24rpx;
		}

		.center_line {
			height: 1rpx;
			background-color: #E6E6E6;
			margin: 26rpx 0;
		}

		.time_box {
			display: flex;
			flex-direction: column;
		}

		.time_content {
			@include flexrow;
		}

		.time_left {
			color: #777777;
			font-size: 20rpx;
		}

		.time_right {
			color: #333333;
			font-size: 20rpx;
			margin-right: 32rpx;
		}

		.time_box .time_content:nth-child(2) {
			margin-top: $topsix;
		}

		.send_price {
			@include flexrow;
			justify-content: space-between;
			margin-top: 20rpx;
			height: 30rpx;
			overflow: hidden;
		}

		.flex_row {
			@include flexrow;
		}

		.black_txt {
			color: #333848;
			font-size: 24rpx;
		}

		.red_txt {
			font-size: 24rpx;
			color: #E8011B;
		}

		.arrow_img {
			width: 25rpx;
			height: 25rpx;
		}

		.down_arrow {
			transform: rotate(90deg);
		}

		.table {
			border: solid 1rpx #E7E7E7;
			margin-top: 16rpx;
			margin-bottom: 24rpx;
		}

		.tr {
			display: flex;
			flex-direction: row;
			border-bottom: solid 1rpx #E7E7E7;
		}

		.tr:last-child {
			border-bottom: none;
		}

		.td {
			flex: 1;
			color: #343847;
			font-size: 24rpx;
			padding: 18rpx 0;
			width: 150rpx;
			padding-left: 30rpx;
			border-right: solid 1rpx #E7E7E7;
		}

		.td:last-child {
			border-right: none;
		}

		.coupon_content {
			@include flexrow;
			justify-content: space-between;
			margin-top: 22rpx;
		}

		.coupon_line {
			@include flexrow;
		}

		.coupon_item {
			@include flexrow;
			padding: 0 5rpx 0 40rpx;
			position: relative;
			background-color: rgba(234, 58, 62, 0.04);
			border-radius: 4rpx;
			height: 32rpx;
			margin-right: 24rpx;
		}

		.coupon_txt {
			color: #EA3A3E;
			font-size: 20rpx;
		}

		.coupon_img {
			width: 27rpx;
			height: 23rpx;
			position: absolute;
			top: 4rpx;
			left: 0;
		}

		.get_coupon {
			@include flexrow;
		}

		.get_txt {
			color: #056BF1;
			font-size: 20rpx;
		}

		.get_img {
			width: 25rpx;
			height: 25rpx;
			margin-left: 4rpx;
		}

		.other_content {
			width: 686rpx;
			border-radius: 8rpx;
			background-color: #FFFFFF;
			margin-top: 20rpx;
		}

		.other {
			padding: 21rpx 23rpx;
		}

		.other_title {
			color: #EA4145;
			font-size: 20rpx;
			margin-bottom: 14rpx;
		}

		.other_line {
			@include flexrow;
			justify-content: space-between;
			margin-bottom: 24rpx;
		}

		.other_line:last-child {
			margin-bottom: 0;
		}

		.other_txt {
			color: #343847;
			font-size: 24rpx;
		}

		.other_right {
			@include flexrow;
		}

		.other_red {
			color: #EA4145;
			font-size: 24rpx;
		}

		.intro_content {
			width: 686rpx;
			background-color: #FFFFFF;
			border-radius: 8rpx;
			margin-bottom: 148rpx;
			margin-top: 20rpx;
		}

		.intro {
			padding: 21rpx 24rpx;
		}

		.tab_content {
			@include flexrow;
			margin-bottom: 24rpx;
		}

		.tab_item {
			color: #343847;
			padding-bottom: 8rpx;
			font-size: 28rpx;
			margin-right: 46rpx;
		}

		.tab_item.active {
			color: #056BF1;
			border-bottom: solid 2px #056BF1;
			border-radius: 4rpx;
			box-sizing: border-box;
		}

		.tab_intro {
			line-height: 40rpx;
			font-size: 24rpx;
			color: #343847;
		}

		.comment_content {
			padding: 0 32rpx;
			width: 622rpx;
			background-color: #FFFFFF;
		}

		.channel_content {
			position: relative;
			z-index: 2;
		}

		.comment {
			&_line {
				display: flex;
				flex-direction: column;
				width: 100%;
				padding-bottom: 36rpx;
				border-bottom: solid 1px #E6E6E6;
			}

			&_line:last-child {
				border-bottom: none;
			}

			&_user {
				width: 100%;
				@include flexrow;
				justify-content: space-between;
				padding: 35rpx 0 38rpx 0;
			}

			&_left {
				@include flexrow;
			}

			&_head {
				width: 72rpx;
				height: 72rpx;
				margin-right: 16rpx;
				border-radius: 40rpx;
			}

			&_stars {
				@include flexrow;
			}

			&_star {
				width: 28rpx;
				height: 27rpx;
				margin-right: 17rpx;
			}

			&_score {
				color: #343847;
				font-size: 24rpx;
			}

			&_time {
				color: #343847;
				font-size: 24rpx;
			}

			&_name {
				display: flex;
				flex-direction: column;
				justify-content: center;
			}

			&_username {
				color: #343847;
				font-size: 32rpx;
			}

			&_info {
				color: #343847;
				font-size: 28rpx;
			}

			&_images {
				@include flexrow;
				flex-wrap: wrap;
			}

			&_img {
				width: 154rpx;
				height: 153rpx;
				margin-right: 20rpx;
				margin-top: 20rpx;
			}

			&_img:nth-child(4n) {
				margin-right: 0;
			}
		}

		.btn_box {
			width: 100%;
			position: fixed;
			bottom: 0;
			left: 0;
			height: 128rpx;
			@include flexrow;
			background-color: #FFFFFF;
		}

		.btn {
			color: #FFFFFF;
			font-size: 32rpx;
			text-align: center;
			line-height: 80rpx;
			width: 686rpx;
			height: 80rpx;
			border-radius: 40rpx;
			background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
			box-shadow: 0 2rpx 13rpx 0 #0060DC;
			margin-left: 32rpx;
		}

	}
</style>
