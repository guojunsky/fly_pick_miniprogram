<template>
	<view class="content">
		<view class="info"><text class="fat">若您的包裹内含以下类别的物品，请如实勾选（可多选）</text>， 以获得更加准确的预估报价，并降低海关查验风险。</view>
		<view class="things_content">
			<view :class="['item',inArray(activeNames,item.name) ? 'active' : '']" v-for="(item,index) in list" :key="index"
			 @click.stop="handlerActive(item)">{{item.name}}</view>
		</view>
	</view>
</template>

<script>
	import {
		ConfigDataListApi
	} from '@/api/config.js'
	import {
		isInArray
	} from '@/util/index.js'
	export default {
		props: {
			index: {
				type: Number,
				default: 0
			},
			defaultvalue: {
				type: Array,
				default: () => {
					return []
				}
			}
		},
		data() {
			return {
				activeIds: [],
				list: []
			}
		},
		created() {
			this.getThings()
		},
		computed:{
			activeNames: {
				get() {
					return this.defaultvalue
				},
				set(val) {
					this.$emit('update:defaultvalue',val)
				}
			}
		},
		methods: {
			inArray(arr, data) {
				return isInArray(arr, data)
			},
			handlerActive(item) {
				const {
					id,
					name
				} = item
				const index = this.activeNames.indexOf(name)
				if (index > -1) {
					// this.activeIds.splice(index, 1)
					this.activeNames.splice(index, 1)
				} else {
					// this.activeIds.push(id)
					this.activeNames.push(name)
				}
				this.$emit('selected', this.activeNames,this.index)
			},
			async getThings() {
				const res = await ConfigDataListApi()
				const data = res.goodsTypes || []
				this.list = data.filter((item) => item.special == 1)
			},
		}
	}
</script>

<style scoped lang="scss">
	.content {
		margin-top: 49rpx;
	}
	.fat {
		font-weight: 500;
		color: #333333;
	}

	.info {
		color: #666666;
		font-size: 24rpx;
		margin-bottom: 10rpx;
	}

	.things_content {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}

	.item {
		padding: 0 16rpx;
		height: 54rpx;
		line-height: 54rpx;
		text-align: center;
		background-color: #F6F6F6;
		border-radius: 2rpx;
		color: #999999;
		font-size: 22rpx;
		margin-right: 22rpx;
		margin-bottom: 20rpx;
	}

	.item.active {
		color: #056BF1;
		background-color: #ECF4FF;
	}
</style>
