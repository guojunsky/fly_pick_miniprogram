<template>
	<view class="content">
		<image class="no_img" src="../../static/index/empty.png"></image>
		<text class="no_txt">{{message}}</text>
	</view>
</template>

<script>
	export default {
		props: {
			message: {
				type: String,
				default: '暂无数据'
			}
		}
	}
</script>

<style scoped lang="scss">
	.content {
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
</style>
