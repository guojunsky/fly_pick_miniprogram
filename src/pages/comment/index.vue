<template>
	<view class="content">
		<view class="top">
			<view class="top_left">
				<text class="label">评分</text>
				<image class="star" v-for="(item,index) in getStar('star')" :key="index" src="/static/comment/blue_star.png" @click="handlerStar(index,'star')"></image>
				<image class="star" v-for="(item,index) in getGrayStar('star')" :key="index" src="/static/comment/gray_star.png"
				 @click="handlerStar(index,'star','gray')"></image>
				<text class="score">{{star}}分</text>
			</view>
			<text class="total_comment">{{starInfo('star')}}</text>
		</view>
		<view class="gray_line"></view>
		<view class="line" v-for="(startype,tindex) in typelist">
			<view class="line_left">
				<text class="label">{{startype.name}}</text>
				<image class="star" v-for="(item,index) in getStar(startype.value)" :key="index" src="/static/comment/blue_star.png"
				 @click="handlerStar(index,startype.value)"></image>
				<image class="star" v-for="(item,index) in getGrayStar(startype.value)" :key="index" src="/static/comment/gray_star.png"
				 @click="handlerStar(index,startype.value,'gray')"></image>
			</view>
			<text class="total_comment">{{starInfo(startype.value)}}</text>
		</view>
		<textarea placeholder-class="placeholder_type" cols="30" rows="6" v-model="content" class="inp" placeholder="这个产品怎么样？大家都期待您的点评"></textarea>
		<upload-box @update="updateImage"></upload-box>
		<view class="btn" @click.stop="handlerSure">发表</view>
	</view>
</template>

<script>
	import {
		CommentApi
	} from '@/api/comment.js'
	import {
		showMessage
	} from '@/util/index.js'
	import uploadBox from '@/components/uploadbox/index.vue'
	export default {
		components: {
			uploadBox
		},
		data() {
			return {
				pid: '',
				orderId: '',
				content: '',
				serviceStar: 0,
				effectiveStar: 0,
				securityStar: 0,
				star: 0,
				imageList: [],
				typelist: [{
					name: '服务',
					value: 'serviceStar'
				}, {
					name: '时效',
					value: 'effectiveStar'
				}, {
					name: '安全',
					value: 'securityStar'
				}]
			}
		},
		onLoad(options) {
			this.pid = options.pid || ''
			this.orderId = options.oid || ''
		},
		methods: {
			starInfo(star) {
				const value = this[star]
				switch (value) {
					case 1:
						return '极差';
					case 2:
						return '较差';
					case 3:
						return '一般';
					case 4:
						return '良好';
					case 5:
						return '极好';
					default:
						return ''
				}
			},
			handlerSure() {
				const {
					content,
					serviceStar,
					effectiveStar,
					securityStar,
					star
				} = this;
				if (!serviceStar || !effectiveStar || !securityStar || !star) {
					showMessage('星级不能为0');
					return
				}
				if (!content) {
					showMessage('点评内容不能为空');
					return
				}
				this.sureComment();
			},
			getStar(type) {
				const number = parseInt(this[type]) || 0
				return new Array(number)
			},
			getGrayStar(type) {
				const star = parseInt(this[type]) || 0
				const number = 5 - parseInt(star)
				return new Array(number)
			},
			handlerStar(index, type, gray) {
				this[type] = parseInt(index) + 1 + (gray ? this[type] : 0)
			},
			updateCheckPage() {
				const pages = getCurrentPages()
				const index = pages.findIndex((item) => item.route === 'pages/check/index')
				if (index > -1) {
					pages[index].$vm.handlerSearch()
				}
			},
			handlerUpload() {
				uploadToCos((url) => {
					if (url) {
						this.imageList.push(url)
					} else {
						showMessage('上传失败，请重试')
					}
				});
			},
			updateImage(imgs) {
				this.imageList = imgs
			},
			async sureComment() {
				const {
					pid,
					orderId,
					content,
					serviceStar,
					effectiveStar,
					securityStar,
					star
				} = this;
				const data = {
					pid,
					orderId,
					content,
					serviceStar,
					effectiveStar,
					securityStar,
					star,
					urlList: this.imageList
				}
				await CommentApi(data)
				showMessage('感谢您的评价')
				this.updateCheckPage();
				setTimeout(() => {
					uni.navigateBack()
				}, 1000)
			}
		}
	}
</script>

<style scoped>
	.upload_img {
		width: 180rpx;
		height: 180rpx;
		background: #F6F6F6;
		border-radius: 4rpx;
		border: 1px solid #CCCCCC;
		margin-left: 32rpx;
		margin-bottom: 20rpx;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #FFFFFF;
		height: 100%;
	}

	.top {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		height: 139rpx;
		width: 100%;
	}

	.top_left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.line {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		padding-top: 35rpx;
		justify-content: space-between;
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

	.inp {
		color: #343847;
		font-size: 28rpx;
		margin-top: 35rpx;
		margin-left: 32rpx;
		border: solid 1rpx #e6e6e6;
		width: 646rpx;
		margin-right: 32rpx;
		padding: 20rpx;
	}

	.placeholder_type {
		color: #999999;
	}

	.upload_content {
		display: flex;
		flex-direction: row;
		margin-top: 35rpx;
		width: 100%;
		flex-wrap: wrap;
	}

	.upload_box {
		width: 180rpx;
		height: 180rpx;
		background: #F6F6F6;
		border-radius: 4rpx;
		border: 1px solid #CCCCCC;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-left: 32rpx;
		margin-bottom: 20rpx;
	}

	.add_img {
		width: 44rpx;
		height: 44rpx;
	}

	.upload_txt {
		color: #343847;
		font-size: 24rpx;
		margin-top: 12rpx;
	}

	.btn {
		width: 686rpx;
		height: 80rpx;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		box-shadow: 0 2rpx 4rpx 0 #0060DC, 0 0 6rpx 0 #2E76CF;
		border-radius: 44rpx;
		border: 2rpx solid rgba(5, 5, 5, 0.08);
		margin-top: 193rpx;
		margin-bottom: 32rpx;
		color: #FFFFFF;
		font-size: 32rpx;
		text-align: center;
		line-height: 76rpx;

	}
</style>
