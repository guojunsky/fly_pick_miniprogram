<template>
	<view class="bottom">
		<view class="left">
			<view>
				<text class="red_txt">*</text>
				<text class="top_name">预估重量</text>
			</view>
			<text class="txt">实际重量以揽收后确认为准</text>
		</view>
		<view class="right">
			<image class="l_img" src="/static/index/lease.png" @click="handlerLess"></image>
			<input type="digit" class="number" v-model="value" v-show="!typeshow" @change="handlerInput"/>
			<text class="unit">公斤</text>
			<image class="l_img" src="/static/index/plus.png" @click="handlerPlus"></image>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			typeshow: {
				type: Boolean,
				default: false
			},
			index: {
				type: Number,
				default: 0
			},
			defaultvalue: {
				type:[String,Number],
				default: 0.5
			}
		},
		data() {
			return {}
		},
		computed:{
			value: {
				get() {
					return this.defaultvalue
				},
				set(val) {
					this.$emit('update:defaultvalue', val)
				}
			}
		},
		watch: {
			value() {
				this.$emit('change', {
					weight: this.value,
					index: this.index
				})
			}
		},
		methods: {
			handlerInput(event) {
				this.value = event.target.value || 0
			},
			handlerPlus() {
				this.value = parseFloat(this.value) + 0.5
			},
			handlerLess() {
				if (this.value > 0.5) {
					this.value = parseFloat(this.value) - 0.5
				} else {
					uni.showToast({
						title: '重量不能小于0'
					})
					return
				}

			}
		}
	}
</script>

<style scoped lang="scss">
	@mixin flexrow {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.right {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
	}

	.l_img {
		width: 46rpx;
		height: 46rpx;
	}

	.number {
		color: #343847;
		font-size: 42rpx;
		width: 70rpx;
		margin-left: 17rpx;
	}

	.unit {
		color: #757781;
		font-size: 24rpx;
		margin-right: 17rpx;
		margin-left: 6rpx;
	}

	.red_txt {
		color: #FF0000;
		font-size: 32rpx;
	}

	.top_name {
		color: #343847;
		font-size: 32rpx;
	}

	.txt {
		font-size: 24rpx;
		color: #666666;
		margin-top: 4rpx;
	}

	.bottom {
		@include flexrow;
		justify-content: space-between;
		margin-top: 49rpx;
	}

	.left {
		display: flex;
		flex-direction: column;
	}
</style>
