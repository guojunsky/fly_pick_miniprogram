
<template>
	<view class="radio" @click="handlerCheck" :style="{'margin-right' : right}">
		<view :class="['circle',checkedValue == value ? 'active' : '']"><text v-if="checkedValue == value" class="small_circle"></text></view>
		<text class="txt"><slot>{{title}}</slot></text>
	</view>
</template>

<script>
	export default{
		props:{
			checked:{
				type:[Number,String],
				default:''
			},
			title: {
				type: String,
				default:''
			},
			value: {
				type: [Number,String],
				default: ''
			},
			right: {
				type: String,
				default:'0'
			}
		},
		computed:{
			checkedValue: {
				get() {
					return this.checked
				},
				set() {
					if(this.checkedValue) {
						this.handlerCheck()
					}
				}
			}
		},
		methods:{
			handlerCheck() {
				this.$emit('update:checked',this.value)
			}
		}
	}
</script>

<style scoped>
	.radio{
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.circle{
		width: 32rpx;
		height: 32rpx;
		border-radius: 20rpx;
		border:solid 2rpx #999999;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
	.circle.active{
		color: #056BF1;
		border-color: #056BF1;
	}
	.small_circle{
		width: 16rpx;
		height: 16rpx;
		background-color: #056BF1;
		border-radius: 20rpx;
	}
	.txt{
		color: #343847;
		font-size: 32rpx;
		margin-left: 8rpx;
	}
</style>
