<template>
	<view class="upload_content">
		<view class="upload_box" v-for="(item,index) in imageList" :key="index">
			<image class="close_img" src="../../static/comment/close.png" @click="handlerDelete(index)"></image>
			<image class="upload_img" :src="item"></image>
		</view>
		<view class="upload_box" @click="handlerUpload" v-if="imageList.length < 5">
			<image class="add_img" src="/static/comment/add.png"></image>
			<text class="upload_txt">上传照片</text>
		</view>
	</view>
</template>

<script>
	import {
		uploadToCos
	} from '@/util/upload.js'
	export default {
		name: 'uploadbox',
		data() {
			return {
				imageList: []
			}
		},
		methods: {
			handlerUpload() {
				uploadToCos((url) => {
					if (url) {
						this.imageList.push(url)
						this.$emit('update', this.imageList)
					} else {
						showMessage('上传失败，请重试')
					}
				});
			},
			handlerDelete(index) {
				this.imageList.splice(index, 1)
				this.$emit('update', this.imageList)
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
	}

	.close_img {
		width: 40rpx;
		height: 40rpx;
		position: absolute;
		z-index: 2;
		top: -20rpx;
		right: -20rpx;
	}

	.upload_content {
		width: 686rpx;
		display: flex;
		flex-direction: row;
		margin-top: 35rpx;
		flex-wrap: wrap;
		justify-content: flex-start;
	}
     .upload_box:first-child{
		 margin-left: 0;
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
		position: relative;
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
</style>
