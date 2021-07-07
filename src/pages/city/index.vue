<template>
	<view class="content">
		<view class="search_box">
			<view class="s_box">
				<image class="s_img" src="/static/index/simg.png"></image>
				<input class="inp" type="text" placeholder="城市中文名/拼音" v-model="scity" @input="handlerSearch" />
			</view>
		</view>
		<!-- list -->
		<view class="list">
			<scroll-view class="list_content" scroll-y="true" :scroll-into-view="viewId">
				<view class="hot_content" v-if="hotList.length">
					<view class="hot_title">热门城市</view>
					<view class="hot_wrap">
						<view class="hot_item" v-for="(item,index) in hotList" :key="item.id" @click="handlerCity(item)">{{item.cityName}}</view>
					</view>
				</view>
				<template  v-for="(item,index) in cityWords">
				   <view class="title" :id="item">{{item}}</view>
				   <view class="city_list">
					  <view class="city_name" v-for="(citem,cindex) in cityInners[item]" :key="citem.id" @click="handlerCity(citem)">{{citem.cityName}}</view>
				   </view>
				</template>
			</scroll-view>
			<view class="list_first">
				<text class="word_txt" v-for="(item,index) in cityWords" :key="index" @click="handlerWord(item)">{{item}}</text>
			</view>
		</view>
		
	</view>
</template>

<script>
	
	import {
		ConfigDataListApi
	} from '@/api/config.js'
	export default {
		data() {
			return {
				viewId: '',
				scity: '',
				originList: [],
				cityInners:{},
				cityWords:[],
				hotList: []
			}
		},
		onLoad() {
			this.getCityList()
		},
		methods: {
			handlerWord(word) {
				console.log('word ==>',word)
				this.viewId = word;
			},
			makeData(data) {
				let cityInners = {}
				let cityWords = []
				let hotList = []
				data.forEach((item,index) => {
					const hot = item.hot;
					const cityEnName = item.cityEnName.toUpperCase().substring(0,1)
					if(hot) {
						hotList.push(item)
					}
					if(!cityInners[cityEnName]) {
						cityInners[cityEnName] = []
						cityWords.push(cityEnName)
					}
					cityInners[cityEnName].push(item)
				})
				this.cityInners = cityInners
				this.cityWords = cityWords.sort()
				this.hotList = hotList
			},
			handlerSearch(event) {
				const value = event.target.value || ''
				let list = [];
				const citys = this.originList;
				if(value) {
					citys.forEach((item,index) => {
						const {
							cityEnName,
							cityName,
							py,
							shortPy
						} = item;
						const cvalue = value.toUpperCase()
						if (cityName.indexOf(value) > -1 || cityEnName.indexOf(value) > -1 || (py && py.indexOf(cvalue) > -1) || (shortPy && shortPy.indexOf(cvalue) > -1)) {
							list.push(item)
						}
					})
					this.makeData(list)
				}else{
					this.makeData(citys)
				}
			},
			async getCityList() {
				const res = await ConfigDataListApi()
				const data = res.cityInners || []
				this.originList = data;
				this.makeData(data)
			},
			handlerCity(item) {
				this.$store.dispatch('app/toggleCity',item)
				uni.navigateBack()
			}
		}
	}
</script>

<style  scoped>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #F7F8F9;
		height: 100%;
	}
	.search_box{
		width: 750rpx;
		background-color: #FFFFFF;
		padding:30rpx 32rpx 31rpx 32rpx;
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
	.s_box{
		width: 686rpx;
		height: 65rpx;
		border-radius: 33rpx;
		background-color: #F0F1F1;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
	.s_img{
		width: 34rpx;
		height: 34rpx;
		margin-left: 24rpx;
		margin-right: 15rpx;
	}
	.inp{
		height: 60rpx;
		margin-right: 24rpx;
		font-size: 24rpx;
		color: #343847;
		width: 600rpx;
	}
	.list{
		width: 750rpx;
		display: flex;
		flex-direction: row;
		flex: 1;
	}
	.list_first{
		width: 52rpx;
		height: calc(100vh - 126rpx);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
		background: #F6F6F6;
		box-shadow: -2rpx 2rpx 2rpx 0 rgba(0, 0, 0, 0.05);
		border-radius: 4rpx 4rpx 0 0;
		position: fixed;
		right: 0;
		bottom: 0;
	}
	.word_txt{
		width: 100%;
		color: #343847;
		font-size: 28rpx;
		padding: 10rpx 0;
		text-align: center;
	}
	.word_txt:first-child{
		padding-top: 10rpx;
	}
	.list_content{
		width: 698rpx;
		display: flex;
		height: calc(100vh - 126rpx);
		flex-direction: column;
		overflow-y: auto;
		background-color: #FFFFFF;
	}
	.hot_content{
		padding-left: 38rpx;
	}
	.hot_title{
		color: #343847;
		font-size: 24rpx;
		padding-top: 15rpx;
		padding-bottom: 32rpx;
	}
	.hot_wrap{
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}
	.hot_item{
		padding:10rpx 33rpx;
		border:solid 1rpx #E4E4E4;
		color: #343847;
		font-size: 28rpx;
		text-align: center;
		margin-right: 20rpx;
		border-radius: 30rpx;
		margin-bottom: 22rpx;
	}
	.title{
		padding:45rpx 0 18rpx 38rpx;
		color: #343847;
		font-size: 24rpx;
		background-color: #F7F8F9;
	}
	.city_list{
		background-color: #FFFFFF;
		padding-left: 32rpx;
	}
	.city_name{
		color: #343847;
		font-size: 28rpx;
		height: 95rpx;
		line-height: 95rpx;
		border-bottom: solid 1rpx #F7F8F9;
	}
	.city_name:first-child{
		border-top: solid 1rpx #F7F8F9;
	}
	

</style>
