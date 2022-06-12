<template>
	<scroll-view class="content" @scrolltolower="hanlderToLower">
		<view class="wrap" v-if="list.length">
			<view class="top">
				<view class="top_left">
					<image class="star" v-for="(item,index) in getStar(comment.star)" :key="index" src="/static/comment/blue_star.png"></image>
					<image class="star" v-for="(sitem,sindex) in getGrayStar(comment.star)" star src="/static/comment/gray_star.png"></image>
					<text class="score">{{comment.star}}分</text>
				</view>
				<text class="total_comment">{{comment.commentCount}}条评价</text>
			</view>
			<view class="top_label">
				<text class="top_item">服务：{{comment.serviceStar}}</text>
				<text class="top_item">时效：{{comment.effectiveStar}}</text>
				<text class="top_item">安全：{{comment.securityStar}}</text>
			</view>
			<view class="gray_line"></view>
			<view class="comment_content">
				<view class="comment_line" v-for="(item,index) in list">
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
						<image class="comment_img" v-for="(sitem,sindex) in item.urlList" mode="aspectFill" :src="sitem" @click="previewImage(sindex,item.urlList)"></image>
					</view>
				</view>
			</view>
		</view>
		<empty-box v-else-if="!loading"></empty-box>
	</scroll-view>
</template>

<script>
	import moment from 'moment'
	import {
		handlerPreviewImage,
		phoneDeal
	} from '@/util/index.js'
	import {
		CommentListApi
	} from '@/api/comment.js'
	import emptyBox from '@/components/empty/index.vue'
	import {
		mapGetters
	} from 'vuex'
	moment.locale('zh-cn')
	export default {
		components: {
			emptyBox
		},
		data() {
			return {
				cursor: 0,
				count: 10,
				pid: '',
				list: [],
				loading: true
			}
		},
		computed: {
			...mapGetters(['comment'])
		},
		onLoad(options) {
			this.pid = options.pid || ''
			moment.locale('zh-cn');
			this.getList()
		},
		methods: {
			dealPhone(value) {
				return phoneDeal(value)
			},
			previewImage(index, urls) {
				handlerPreviewImage(index, urls)
			},
			getStar(number) {
				number = parseInt(number) || 0
				return new Array(number)
			},
			getGrayStar(star) {
				const stars = parseInt(star) || 0
				const number = 5 - stars
				return new Array(number)
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
			hanlderToLower() {
				if (this.cursor == -1) return
				this.getList()
			},
			async getList() {
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

<style lang="scss" scoped>
	@mixin flexrow {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #FFFFFF;
		height: 100%;
	}

	.top {
		@include flexrow;
		justify-content: space-between;
		padding-top: 28rpx;
		width: 100%;
		border-top: solid 1rpx #E6E6E6;
	}

	.top_left {
		@include flexrow;
		padding-left: 32rpx;
	}

	.total_comment {
		color: #343847;
		font-size: 28rpx;
		padding-right: 32rpx;
	}

	.gray_line {
		width: 100%;
		height: 20rpx;
		background-color: #F7F8F9;
	}

	.label {
		color: #343847;
		font-size: 32rpx;
		margin-right: 20rpx;
		padding-left: 32rpx;
	}

	.star {
		width: 38rpx;
		height: 36rpx;
		margin-right: 32rpx;
	}

	.score {
		color: #343847;
		font-size: 28rpx;
	}

	.top_label {
		@include flexrow;
		justify-content: flex-start;
		width: 100%;
		padding-top: 32rpx;
		padding-bottom: 25rpx;
	}

	.top_item {
		margin-right: 39rpx;
		color: #343847;
		font-size: 28rpx;
	}

	.top_item:first-child {
		padding-left: 32rpx;
	}

	.comment_content {
		padding: 0 32rpx;
		width: calc(100vw - 64rpx);
		background-color: #FFFFFF;
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
</style>
