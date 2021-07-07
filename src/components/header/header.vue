<template>
	
	<view :class="['header',fixed ? 'fixed' : '',color == 'white' ? 'bg_white':'bg_black']">
		<view class="status_bar" :style="{'height':statusBarHeight + 'px'}"></view>
		<view class="title">{{title}}</view>
	</view>
</template>

<script>
	export default {
		props:{
			title:{
				type:String,
				default: ''
			},
			fixed: {
				type:Boolean,
				default: false
			},
			//背景颜色
			color: {
				type:String,
				default: 'white'
			}
		},
		data() {
			return {
				statusBarHeight:0,
			}
		},
		created() {
		   this.getPageHeight();
		},
		methods: {
			getPageHeight () {
			    const res = uni.getSystemInfoSync();
			    this.statusBarHeight = res.statusBarHeight;
			}
			
		}
	}
</script>

<style>
	.header{
		width: 750rpx;
	}
	.fixed{
		position: fixed;
		top: 0;
		left: 0;
	}
	.status_bar {
	     height: var(--status-bar-height);
	     width: 750rpx;
	 }
	 .title{
		 font-size: 37rpx;
		 font-weight: 500;
		 text-align: center;
		 height: 80rpx;
		 display: flex;
		 flex-direction: row;
		 align-items: center;
		 justify-content: center;
	 }
	 .bg_white{
		 background-color: #FFFFFF;
	 }
	 .bg_black{
		 background-color: transparent;
	 }
	  .bg_white .title{
		 color: #343847;
	  }
	  .bg_black .title{
		 color: #FFFFFF;
	  }
</style>
