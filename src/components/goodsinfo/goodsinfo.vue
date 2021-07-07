<template>
	<view class="goods_content">
		<view class="title">物品类型</view>
		<view class="type_content">
			<view :class="['type_item',goodsType == 1 ? 'active' : '']" @click="hanlderTab(1)">文件</view>
			<view :class="['type_item',goodsType == 2 ? 'active' : '']" @click="hanlderTab(2)">包裹</view>
		</view>
		<!-- 文件 -->
		<view class="file_content" v-if="goodsType == 1">
			<view class="info">文件类型包括函件、证明、票据和资料等（不包括公文），非文件请选择包裹类型。<text class="fat">若您所选的类型与实物不符，物品揽收或入库后产生的费用差额将由您承担。</text></view>
			<weight :typeshow="typeShow" :defaultvalue.sync="fileweight" @change="handlerWeight"></weight>
		</view>
		<!-- 包裹 -->
		<view class="package_content" v-else>
			<view class="p_title">物品信息</view>
			<view class="fba_content" v-if="fba">
				<text class="p_txt">是否FBA货</text>
				<radio-box title="是" :checked.sync="fbaValue" value="1" right="80rpx"></radio-box>
				<radio-box title="否" :checked.sync="fbaValue" value="2"></radio-box>
			</view>
			<view class="fba_content">
				<radio-box title="总的物品信息" :checked.sync="goodsValue" value="1" right="32rpx"></radio-box>
				<radio-box title="详细物品信息" :checked.sync="goodsValue" value="2"></radio-box>
			</view>
			<!-- 总的物品信息 -->
			<view v-show="goodsValue == 1">
				<number-box :show.sync="typeShow" :defaultcount.sync="count" :defaultvalue.sync="goodsPacking" @change="handlerNumber">
					<view class="flex_row">
						<text class="red_txt">*</text>
						<text class="number_name">包裹总件数</text>
					</view>
				</number-box>
				<weight :typeshow="typeShow" :defaultvalue.sync="packageWeight" @change="handlerWeight"></weight>
				<estimate :typeshow="typeShow" :defaultwidth.sync="width" :defaultheight.sync="height" :defaultlength.sync="length"
				 @change="handlerEstimate"></estimate>
				<things @selected="hanlderAllThings" :defaultvalue.sync="goodTypes"></things>
			</view>
			<!-- 详细物品信息 -->
			<view v-show="goodsValue == 2">
				<view class="package_item" v-for="(item,gindex) in goodsList" :key="gindex">
					<view class="package_title">
						<text class="package_name">第{{gindex + 1}}种包裹信息</text>
						<image class="del_img" src="/static/index/del.png" @click="handlerDel(gindex)"></image>
					</view>
					<number-box :show.sync="typeShow" :index="gindex" :defaultcount.sync="item.count" :defaultvalue.sync="item.goodsPacking"
					 @change="handlerNumber">
						<view class="flex_row">
							<text class="number_name">相同包裹的件数</text>
						</view>
					</number-box>
					<weight :typeshow="typeShow" :index="gindex" :key="`weight{gindex}`" :defaultvalue.sync="item.weight" @change="handlerWeight"></weight>
					<estimate :typeshow="typeShow" :index="gindex" :key="`estimate${gindex}`" :defaultwidth.sync="item.width"
					 :defaultheight.sync="item.height" :defaultlength.sync="item.length" @change="handlerEstimate"></estimate>
					<things @selected="hanlderAllThings" :index="gindex" :key="`things{gindex}`" :defaultvalue.sync="item.goodTypes"></things>
				</view>
				<view class="add_content">
					<view class="add_left" @click="handlerAddGood">
						<image class="add_img" src="/static/index/add.png"></image>
						<text class="add_txt">增加包裹</text>
					</view>
					<text class="add_right">物品总量：{{goodsList.length}}件 {{totalWeight}}KG {{totalBody}}CBM</text>
				</view>
			</view>
		</view>
		<view class="btn" @click="confirmOrderGoods" v-if="sendOrder">确认</view>
		<view class="btn" :style="{'margin-bottom':'200rpx'}" @click="handlerPage" v-else>查价</view>
	</view>
</template>

<script>
	import radioBox from '@/components/form/radio-box.vue'
	import weight from './widget/weight.vue'
	import numberBox from './widget/number-box.vue'
	import estimate from './widget/estimate.vue'
	import things from './widget/things.vue'
	import {
		showMessage
	} from '@/util/index.js'
	export default {
		props: {
			//是否展示fba
			fba: {
				type: Boolean,
				default: false
			},
			fbaval: {
				type: Number,
				default: 2
			},
			sendOrder: {
				type: Boolean,
				default: false
			},
			goodsNature: {
				type: Array,
				default: () => {
					return [1]
				}
			},
			dispatcherTypes: {
				type: Array,
				default: () => {
					return []
				}
			},
			fromPage: {
				type: String,
				default: ""
			}
		},
		components: {
			radioBox,
			weight,
			numberBox,
			estimate,
			things
		},
		computed: {
			fbaValue: { // 是：1，否：2
				get() {
					return this.fbaval
				},
				set(value) {
					this.$emit('update:fbaval', value)
				}
			},
			totalBody() {
				const goodsList = this.goodsList.map((item) => {
					return {
						width: item.width || 0,
						height: item.height || 0,
						length: item.length || 0
					}
				})
				let result = goodsList.reduce((prev, next) => {
					return prev + next.width * next.height * next.length
				}, 0)
				console.log('result ==>', result)
				result = result ? parseFloat(result / 1000000).toFixed(1) : 0
				return result
			},
			totalWeight() {
				const goodsList = this.goodsList.map((item) => {
					return {
						weight: item.weight || 0
					}
				})
				let result = 0
				if (goodsList.length > 1) {
					result = goodsList.reduce((prev, next) => {
						return prev + next.weight
					}, 0)
				} else {
					result = this.packageWeight || 0
				}
				result = result ? parseFloat(result).toFixed(1) : 0
				return result
			}
		},
		data() {
			return {
				goodsType: 1,
				fileweight: 0.5, // 文件重量
				packageWeight: 0.5,
				goodsValue: 1, // 总的物品信息：1，详细物品信息：2
				typeShow: false,
				count: 1,
				goodsPacking: 1, //货物类型： 1纸箱 2木箱 3麻袋 4托盘 5不规则 6圆柱体 0其他
				width: '',
				height: '',
				length: '',
				goodTypes: [],
				goodsList: [{
					count: 1,
					goodsPacking: 1,
					width: '',
					height: '',
					length: '',
					weight: 0.5,
					goodTypes: []
				}],
				goodObj: {
					count: 1,
					goodsPacking: 1,
					width: '',
					height: '',
					length: '',
					weight: 0.5,
					goodTypes: []
				}
			}
		},
		methods: {
			hanlderTab(tab) {
				this.goodsType = tab;
			},
			initData() {
				const data = uni.getStorageSync('goodsdata')
				const info = JSON.parse(data)
				this.data = info || {}
			},
			handlerPage() {
				const data = this.getData()
				if (data) {
					this.$store.dispatch('app/toggleCheckData', data);
					this.$emit('close');
					//查价结果页
					uni.navigateTo({
						url: '../../pages/checkPrice/index'
					})
				}
			},
			handlerAddGood() {
				const goodsList = JSON.parse(JSON.stringify(this.goodsList))
				const goodObj = JSON.parse(JSON.stringify(this.goodObj))
				goodsList.push(goodObj)
				console.log('增加后goodsList ==>', goodsList)
				this.goodsList = []
				this.goodsList = goodsList
			},
			handlerDel(index) {
				console.log('删除前 this.goodsList ==》', this.goodsList)
				this.goodsList.splice(index, 1)
				console.log('删除后 this.goodsList ==》', this.goodsList)
			},
			getData() {
				const {
					goodsType,
					goodsValue,
					goodsNature,
					fbaValue,
					fba,
					dispatcherTypes
				} = this;
				const weight = goodsType == 1 ? this.fileweight : this.packageWeight
				let goodsNatureValue = this.goodsNature
				if (goodsType == 2 && fba && fbaValue == 1) {
					goodsNatureValue = [4]
				}
				const result = {
					goodsType,
					weight,
					goodsValue,
					fbaValue,
					goodsNature: this.fromPage !== 'order' ? goodsNatureValue : (fbaValue === 1 ? [4] : [1, 2, 3]),
					fba,
					dispatcherTypes
				}
				if (goodsType == 2) {
					if (goodsValue == 1) { //总物品信息
						if (!this.count || !this.width || !this.height || !this.length) {
							showMessage('包裹件数或长宽高不能为空');
							return ''
						}
						result['packageDetail'] = [{
							count: this.count,
							goodsPacking: this.goodsPacking,
							width: this.width,
							height: this.height,
							length: this.length,
							weight: this.packageWeight,
							goodTypes: this.goodTypes,
						}]
					} else {
						const goodsList = this.goodsList;
						const status = goodsList.some((item) => (!item.count || !item.width || !item.height || !item.length))
						if (status) {
							showMessage('包裹件数或长宽高不能为空');
							return ''
						}
						result['packageDetail'] = this.goodsList;
					}
				} else {
					if (!this.fileweight) {
						showMessage('请输入文件重量');
						return ''
					}
				}
				console.log('data ==>', result)
				return result
			},
			setInfos(data) {
				const {
					goodsType,
					weight,
					goodsValue,
					goodsNature,
					packageDetail
				} = data
				this.goodsType = goodsType
				this.weight = weight || ''
				this.goodsValue = goodsValue
				if (this.goodsType == 1) {
					this.fileweight = weight
				} else {
					//总物品信息
					if (goodsValue == 1) {
						const detail = packageDetail[0]
						this.count = detail.count
						this.goodsPacking = detail.goodsPacking
						this.width = detail.width
						this.height = detail.height
						this.length = detail.length
						this.packageWeight = detail.weight
						this.goodTypes = detail.goodTypes
					} else {
						this.goodsList = packageDetail
					}
				}
			},
			confirmOrderGoods() {
				const data = this.getData()
				if (data) {
					this.$emit('confirm', data)
				}
			},
			hanlderAllThings(data, index) {
				const goodsValue = this.goodsValue
				if (goodsValue == 1) {
					this.goodTypes = data;
				} else {
					this.goodsList[index]['goodTypes'] = data
				}
			},
			handlerNumber(data) {
				const goodsValue = this.goodsValue
				const {
					number,
					value,
					index
				} = data
				if (goodsValue == 1) {
					this.count = number;
					this.goodsPacking = value;
				} else {
					this.goodsList[index]['count'] = number
					this.goodsList[index]['goodsPacking'] = value
				}
			},
			handlerEstimate(data) {
				const goodsValue = this.goodsValue
				const {
					width,
					height,
					length,
					index
				} = data
				if (goodsValue == 1) {
					this.width = width;
					this.height = height;
					this.length = length;
				} else {
					this.goodsList[index]['width'] = width
					this.goodsList[index]['height'] = height
					this.goodsList[index]['length'] = length
				}
			},
			handlerWeight(data) {
				const {
					index,
					weight
				} = data
				if (this.goodsType == 1) {
					this.fileweight = weight
				} else {
					if (this.goodsValue == 1) {
						this.packageWeight = weight
					} else {
						this.goodsList[index]['weight'] = weight
					}
				}
			},
			initInfo() {
				this.data = this.$options.data()
			}
		}
	}
</script>

<style lang="scss" scoped>
	@mixin flexrow {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	@mixin basefont {
		color: #343847;
		font-size: 32rpx;
	}

	.fat {
		font-weight: 500;
		color: #333333;
	}

	.add {
		&_content {
			@include flexrow;
			justify-content: space-between;
			margin-top: 49rpx;
		}

		&_left {
			@include flexrow;
		}

		&_img {
			width: 36rpx;
			height: 36rpx;
		}

		&_txt {
			color: #0069FA;
			font-size: 32rpx;
			margin-left: 12rpx;
		}

		&_right {
			font-size: 24rpx;
			color: #999999;
		}
	}

	.package_name {
		color: #343847;
		font-size: 34rpx;
		font-weight: bold;
	}

	.del_img {
		width: 36rpx;
		height: 36rpx;
	}

	.package_title {
		@include flexrow;
		justify-content: space-between;
		margin-top: 49rpx;
	}

	.txt {
		font-size: 24rpx;
		color: rgba(123, 125, 135, 1);
		margin-top: 4rpx;
	}

	.es_left {
		display: flex;
		flex-direction: column;
	}

	.flex_row {
		@include flexrow;
	}

	.red_txt {
		color: #FF0000;
		font-size: 32rpx;
		margin-right: 10rpx;
	}

	.fba_content {
		@include flexrow;
		margin-top: 49rpx;
	}

	.p_title {
		@include basefont;
		margin-top: 49rpx;
	}

	.number_name {
		@include basefont;
	}

	.p_txt {
		margin-right: 80rpx;
	}

	.p_txt,
	.radio {
		@include basefont;
	}

	.btn {
		color: #FFFFFF;
		font-size: 32rpx;
		width: 686rpx;
		height: 80rpx;
		background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
		border-radius: 44rpx;
		margin-top: 73rpx;
		text-align: center;
		line-height: 80rpx;
		margin-bottom: 32rpx;
	}

	.title {
		@include basefont;
		margin-bottom: 32rpx;
		margin-top: 32rpx;
	}

	.type_content {
		@include flexrow;
		justify-content: space-between;
	}

	.type_item {
		width: 332rpx;
		height: 90rpx;
		text-align: center;
		border: solid 2rpx #EEEEEE;
		border-radius: 4rpx;
		color: #343847;
		font-size: 30rpx;
		box-sizing: border-box;
		line-height: 90rpx;
	}

	.type_item.active {
		color: #056BF1;
		border-color: #056BF1;
	}

	.info {
		color: rgba(123, 125, 135, 1);
		font-size: 24rpx;
		margin-top: 12rpx;
		line-height: 36rpx;
	}
</style>
