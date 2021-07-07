<template>
	<slide-popup :show.sync="show">
		<view class="picker_content">
			<picker-view indicator-style="height: 50px;" style="width: 100%; height: 400rpx;" value="{{value}}" bindchange="bindChange">
				<picker-view-column></picker-view-column>
			</picker-view>
		</view>
	</slide-popup>
</template>

<script>
	import slidePopup from '@/components/slide-popup'
	export default{
		props:{
			show:{
				type:Boolean,
				default:true
			}
		},
		components:{
			slidePopup
		},
		data() {
			return{
				value: ''
			}
		},
		methods:{
			bindChange() {}
		}
		
	}
</script>

<style scoped lang="scss">
	.picker_content{
		width: 750rpx;
		height: 400rpx;
		background-color: #FFFFFF;
	}
</style>
