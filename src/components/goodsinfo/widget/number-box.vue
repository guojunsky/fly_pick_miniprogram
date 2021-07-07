<template>
	<view class="content">
		<view class="box">
			<view class="left">
				<slot></slot>
			</view>
			<view class="right">
				<input type="number" class="inp" v-model="number" v-show="!typesShow" />
				<view class="select" @click="handlerSelect">
					<text class="sel_txt">{{typesObj[value]}}</text>
					<image class="sel_img" src="/static/index/down_arrow.png"></image>
				</view>
			</view>
		</view>
		<view class="info"></view>
		<package-types :show.sync="typesShow" :value.sync="value"></package-types>
	</view>
</template>

<script>
	import packageTypes from './package-types.vue'
	export default{
		props:{
			show: {
				type:Boolean,
				default:false
			},
			index: {
				type: Number,
				default: 0
			},
			//件数
			defaultcount: {
				type: [String,Number],
				default:1
			},
			//类型
			defaultvalue: {
				type: [String,Number],
				default:1
			}
		},
		data() {
			return {
				typesShow:false,
				//1纸箱 2木箱 3麻袋 4托盘 5不规则 6圆柱体 0其他
				typesObj: {
					1: '纸箱',
					2: '木箱',
					3: '麻袋',
					4: '托盘',
					5: '不规则',
					6: '圆柱体',
					0: '其他',
				}
			}
		},
		components:{
			packageTypes
		},
		computed:{
			number: {
				get() {
					return this.defaultcount
				},
				set(val) {
					this.$emit('update:defaultcount', val)
				}
			},
			value: {
				get() {
					return this.defaultvalue
				},
				set(val) {
					this.$emit('update:defaultvalue', val)
				}
			}
		},
		watch:{
			typesShow() {
				this.$emit('update:show',this.typesShow)
			},
			number() {
				this.handlerSure();
			},
			value() {
				this.handlerSure();
			}
		},
		methods:{
			handlerSelect() {
				this.typesShow = true
			},
			handlerSure() {
				const value = this.value
				console.log('数据变化', {
					number: this.number,
					value,
					index: this.index
				})
				this.$emit('change',{
					number: this.number,
					value,
					index: this.index
				})
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
	.box{
		@include flexrow;
		justify-content: space-between;	
	}
	.content{
		margin-top: 49rpx;
	}
	.right{
		@include flexrow;
		justify-content: flex-end;
	}
	.inp{
		width: 120rpx;
		height: 65rpx;
		border:solid 1rpx #E3E3E3;
		font-size: 24rpx;
		color: #666666;
		margin-right: 22rpx;
		padding-left: 20rpx;
	}
	.select{
		width: 160rpx;
		height: 65rpx;
		@include flexrow;
		justify-content: space-between;
		padding:0 18rpx;
		border:solid 1rpx #E3E3E3;
	}
	.sel_txt{
		width: 130rpx;
		color: #666666;
		font-size: 24rpx;
		overflow:hidden; 
		text-overflow:ellipsis;
		white-space:nowrap; 
	}
	.sel_img{
		width: 16rpx;
		height: 9rpx;
	}
</style>
