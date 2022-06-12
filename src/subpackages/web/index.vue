<template>
	<view class="content">
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		name: 'WebPage',
		data() {
			return {
				url: ''
			}
		},
		onLoad() {
			const url = uni.getStorageSync('url') || ''
			this.url = decodeURIComponent(url)
		}
	}
</script>

<style scoped lang="scss">
	.content{
		width: 100vw;
		height: 100vh;
		overflow-y: auto;
	}
</style>
