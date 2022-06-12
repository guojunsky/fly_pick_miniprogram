<template>
	<slidePopup title="选择物品类型" :show.sync="visible">
	  <modeList @input="changePickupType" :value="pickupTypeIndex" :list="list" :listactive="listactive"></modeList>
	</slidePopup>
</template>

<script>
	import slidePopup from '@/components/slide-popup'
	import modeList from '@/subpackages/sendOrder/widget/mode-list.vue'
	export default {
		props: {
			show: {
				type: Boolean,
				default: true
			}
		},
		components: {
			slidePopup,
			modeList
		},
		computed:{
			visible:{
				get() {
					return this.show;
				},
				set(value) {
					this.$emit('update:show',value)
				}
			}
		},
		data() {
			return {
				pickupTypeIndex:0,
				listactive:true,
				value: 1,
				//1纸箱 2木箱 3麻袋 4托盘 5不规则 6圆柱体 0其他
				list: [{
					name: '纸箱',
					value: 1
				}, {
					name: '木箱',
					value: 2
				}, {
					name: '麻袋',
					value: 3
				}, {
					name: '托盘',
					value: 4
				}, {
					name: '不规则',
					value: 5
				}, {
					name: '圆柱体 ',
					value: 6
				}, {
					name: '其他',
					value: 0
				}]
			}
		},
		methods: {
			changePickupType(data) {
				 const value = data.value
				 this.value = value
				this.$emit('update:value',value)
				this.visible = false;
			}
		}

	}
</script>

<style scoped lang="scss">
	@keyframes contentshow {
	  from {
	    opacity: 0;
	  }
	  to {
	    opacity: 1;
	  }
	}
	.content {
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.6);
		position: fixed;
		bottom: 0;
		left: 0;
		animation: contentshow .3s linear forwards;
	}
	.cencel_btn{
		font-size: 32rpx;
		color: #999999;
	}
	.sure_btn{
		font-size:32rpx;
		color: #0060DC;
	}
	
    .top{
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding:24rpx 32rpx;
	}
	.picker_content {
		width: 750rpx;
		background-color: #FFFFFF;
		position: absolute;
		bottom: 0;
		left: 0;
	}

	.item {
		height: 50rpx;
		width: 100%;
		text-align: center;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
</style>
