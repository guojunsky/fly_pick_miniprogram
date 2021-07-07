<template>
	<view class="contnet">
		<view class="weight_content">
			<view class="left">
				<view class="number_name"><text class="red_txt">*</text>物品大小</view>
			</view>
		</view>
		<view class="spare_content">
			<view class="box">
				<input type="digit" class="inp" placeholder="长" v-model="length" v-show="!typeshow" cursor-spacing="30" />
				<text class="unit">CM</text>
			</view>
			<view class="box">
				<input type="digit" class="inp" placeholder="宽" v-model="width" v-show="!typeshow" cursor-spacing="30" />
				<text class="unit">CM</text>
			</view>
			<view class="box">
				<input type="digit" class="inp" placeholder="高" v-model="height" v-show="!typeshow" cursor-spacing="30" />
				<text class="unit">CM</text>
			</view>
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
			defaultwidth: {
				type: [String,Number],
				default: ''
			},
			defaultheight: {
				type: [String,Number],
				default: ''
			},
			defaultlength: {
				type: [String,Number],
				default: ''
			},
		},
		data() {
			return {}
		},
		computed: {
			width: {
				get() {
					return this.defaultwidth
				},
				set(val) {
					this.handlerChange()
					this.$emit('update:defaultwidth',val)
				}
			},
			height: {
				get() {
					return this.defaultheight
				},
				set(val) {
					this.handlerChange()
					this.$emit('update:defaultheight',val)
				}
			},
			length: {
				get() {
					return this.defaultlength
				},
				set(val) {
					this.handlerChange()
					this.$emit('update:defaultlength',val)
				}
			},
			listenData() {
				const {
					width,
					height,
					length
				} = this
				return {
					width,
					height,
					length
				}
			}
		},
		methods: {
			handlerChange() {
				const listenData = Object.assign({},this.listenData)
				const data = {
					index: this.index,
					...listenData
				};
				this.$emit('change', data)
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

	.info {
		color: #666666;
		font-size: 24rpx;
		margin-top: 22rpx;
	}

	.spare_content {
		@include flexrow;
		margin-top: 28rpx;
		justify-content: space-between;
	}

	.box {
		@include flexrow;
		width: 200rpx;
		height: 65rpx;
		border-radius: 2rpx;
		border: 1px solid #E3E3E3;
		justify-content: space-between;
	}

	.inp {
		width: 130rpx;
		padding-left: 12rpx;
		height: 65rpx;
		font-size: 24rpx;
		color: #343847;
	}

	.unit {
		color: #343847;
		font-size: 24rpx;
		margin-right: 8rpx;
	}

	.weight_content {
		@include flexrow;
		justify-content: space-between;
		margin-top: 49rpx;
	}

	.right {
		@include flexrow;
		justify-content: flex-end;
	}

	.number {
		color: #343847;
		font-size: 42rpx;
	}

	.txt {
		color: #757781;
		font-size: 24rpx;
		margin-left: 8rpx;
	}
	.number_name {
		color: #343847;
		font-size: 32rpx;
	}
	
	.red_txt {
		color: #FF0000;
		font-size: 32rpx;
		margin-right: 10rpx;
	}
	
</style>
