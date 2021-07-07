<template>
	<view class="content">
		<textarea placeholder-class="placeholder_type" cols="30" rows="6" v-model="content" class="inp" placeholder="请输入问题描述"></textarea>
		<upload-box @update="updateImage"></upload-box>
		<view class="btn" @click.stop="handlerSure">确认提交</view>
	</view>
</template>

<script>
	import {
		FeedbackApi
	} from '@/api/index.js'
	import {
		showMessage
	} from '@/util/index.js'
	import uploadBox from '@/components/uploadbox/index.vue'
	export default {
		data() {
			return {
				content: '',
				image: '',
				imageList: []
			}
		},
		components: {
			uploadBox
		},
		methods: {
			updateImage(imgs) {
				this.imageList = imgs
			},
			handlerSure() {
				const {
					content
				} = this;
				if (!content) {
					showMessage('请输入问题描述');
					return
				}
				this.sureComment();
			},
			async sureComment() {
				let pdata = {
					content: this.content
				}
				if (this.imageList.length) {
					pdata['imgs'] = this.imageList
				}
				const res = await FeedbackApi(pdata)
				if (res.ret_code === '0000') {
					showMessage('已收到您的反馈')
					setTimeout(() => {
						uni.navigateBack()
					}, 1000)
				}
			}
		}
	}
</script>

<style scoped>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #FFFFFF;
		height: 100%;
	}

	.inp {
		color: #343847;
		font-size: 28rpx;
		margin-top: 35rpx;
		margin-left: 32rpx;
		border:solid 1rpx #e6e6e6;
		width: 646rpx;
		margin-right: 32rpx;
		padding:20rpx;
	}

	.placeholder_type {
		color: #999999;
	}

	.upload_content {
		display: flex;
		flex-direction: row;
		margin-top: 35rpx;
		width: 100%;
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
	}

	.upload_img {
		width: 180rpx;
		height: 180rpx;
		background: #F6F6F6;
		border-radius: 4rpx;
		border: 1px solid #CCCCCC;
		margin-left: 32rpx;
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
		color: #FFFFFF;
		font-size: 32rpx;
		text-align: center;
		line-height: 76rpx;
		position: absolute;
		bottom: 80rpx;
		left: 32rpx;
	}
</style>
