<template>
	<div>
		<div :class="['page', 'page-grey']">
			<div class="page_hd">
				<div class="alert">
					<div class="alert_ct">当前连接设备：{{ deviceInfo.name }}</div>
					<div class="alert_btn" @click="toDeviceList">设备管理</div>
				</div>
			</div>
			<div class="page_bd">
				<view class="list_box">
					<view class="top" @click="handlerClip(printOrder.tno)">
						<text class="send_number">运单号：</text>
						<text class="send_sort">{{ printOrder.tno }}</text>
						<image class="copy_img" src="../../static/index/copy.png"></image>
					</view>
					<view class="order_content">
						<view class="send_place">
							<view class="place">
								<text class="place_name">{{ printOrder.chinaAddress.city }}</text>
								<text class="user_name">{{ printOrder.chinaAddress.name }}</text>
							</view>
							<view class="send_status">
								<text class="status">{{ orderStatusObj[printOrder.orderStatus] }}</text>
								<view class="status_line">
									<view class="status_done" :style="{'width':`${orderProcess[printOrder.orderStatus]}%`}"></view>
								</view>
							</view>
							<view class="place">
								<text class="place_name">{{ printOrder.abroadAddress.country }}</text>
								<text class="user_name">{{ printOrder.abroadAddress.name }}</text>
							</view>
						</view>
					</view>

				</view>
				<div class="order_tt">该订单包含{{ goodsItems.length }}件货品（每件打印一张面单）</div>

				<div class="order_item" v-for="(item,index) in goodsItems" @click="changeGoodsItemSelected(item,index)">
					<div class="order_item_l">
						<div class="order_item_tt">件单号：{{ item.sno }}</div>
						<div class="order_item_ct">
							<span class="order_item_sub">物品信息：</span>
							<span class="order_item_sub_txt">{{ handleGoodsInfo(goodsItems, item) }}</span>
						</div>
					</div>
					<div class="order_item_r">
						<div class="address_checkbox icon-checked-c" v-if="item.selected"></div>
						<div class="address_checkbox icon-check-c" v-else></div>
					</div>

				</div>
			</div>
			<div class="page_ft page_ft-fixed">
				<div class="page_ft-l" @click="selectedGoodsInfoAll">
					<div class="address_checkbox icon-checked-c ml28" v-if="selectedNum == goodsItems.length"></div>
					<div class="address_checkbox icon-check-c ml28" v-else></div>
					<span class="page_ft-num">已选({{ selectedNum }})</span>
				</div>

				<div class="page_ft-btn btn-confirm" @click="toPrint">打印</div>
			</div>

		</div>

		<canvas style="width: 576px; height: 576px;" canvas-id="mainCanvas" id="mainCanvas" v-if="showCanvas"></canvas>

		<canvas style="width: 160px; height: 160px; visibility: hidden" v-if="showCanvas" canvas-id="qrcode" id="qrcode"></canvas>
		<canvas style="width: 300px; height: 50px; visibility: hidden" v-if="showCanvas" canvas-id="barcode" id="barcode"></canvas>
	</div>

</template>

<script>
	import wxbarcode from 'wxbarcode'
	import * as zksdk from '../../util/bluetoolthPrinter/bluetoolth';
	import util from '../../util/bluetoolthPrinter/util'
	import {
		showMessage
	} from "@/util";
	import dayjs from "dayjs";
	import {
		orderStatusObj,
		orderProcess
	} from '../../common/helper.js';
	// import background from '../../static/print/express_bg.jpg'
	const background = '../../static/print/express_bg.jpg' // canvas 绘制本地文件需要使用实际路径，不能通过import引入，否则真机无法显示背景图
	const sleep = (ms) => {
		return new Promise(resolve => {
			setTimeout(resolve, ms)
		})
	}
	const wxPromise = (api) => {
		return (config) => {
			return new Promise((resolve) => {
				api({
					...config,
					success: resolve,
				})
			})
		}
	}
	export default {
		name: "index",
		data() {
			return {
				deviceId: '',
				serviceId: '',
				writeId: '',
				readId: '',

				showCanvas: false,
				qrCodeReady: false,
				barCodeReady: false,
				printing: false,

				orderStatusObj,
				orderProcess,
				createBLEConnectionTime1: "",
				createBLEConnectionTime2: "",
				canvasTime1: "",
				canvasTime2: "",
				printTime1: "",
				printTime2: ""
			}
		},
		computed: {
			deviceInfo() {
				return this.$store.state.print.deviceInfo
			},
			printOrder() {
				return this.$store.state.print.printOrder;
			},
			goodsInfo() {
				return this.$store.state.print.printOrder && this.$store.state.print.printOrder.goods;
			},
			goodsItems() {
				return this.$store.state.print.printOrder && this.$store.state.print.printOrder.goods && this.$store.state.print.printOrder
					.goods.items;
			},
			selectedNum() {
				if (!this.goodsItems || this.goodsItems.length == 0) {
					return 0;
				}
				let data = this.goodsItems.filter(item => item.selected)
				return data.length;
			}
		},
		onReady() {},
		onLoad(option) {

			//获取deviceId
			this.deviceId = this.deviceInfo.deviceId;
			console.log("获取deviceId", this.deviceId);
			if (option.deviceId) {
				console.log("连接开始==>")
				this.initDeviceConnect(this.deviceId)
			} else {
				console.log("直接进入打印页面，打开蓝牙")
				var now1 = new Date().getTime()
				zksdk.openBlue().then(() => {
					var now2 = new Date().getTime()
					console.log(`打开蓝牙耗时==>${now2-now1}ms`)
					this.initDeviceConnect(this.deviceId)
				})
			}

		},
		onHide() {
			//---停止扫描蓝牙设备---------
			console.log("停止扫描蓝牙设备")
			zksdk.stopBlueDevicesDiscovery();
		},
		methods: {
			selectedGoodsInfoAll() {
				let data = JSON.parse(JSON.stringify(this.printOrder))

				if (this.selectedNum == this.goodsItems.length) {
					for (let i = 0; i < data.goods.items.length; i++) {
						data.goods.items[i]['selected'] = false;
					}
				} else {
					for (let i = 0; i < data.goods.items.length; i++) {
						data.goods.items[i]['selected'] = true;
					}
				}
				this.$store.dispatch('print/updatePrintOrder', data)
			},
			changeGoodsItemSelected(item, index) {
				item.selected = !item.selected
				let data = JSON.parse(JSON.stringify(this.printOrder))

				data.goods.items[index] = item;

				this.$store.dispatch('print/updatePrintOrder', data)

			},
			handleGoodsInfo(goods, item) {

				let weight = parseFloat((item.weight / 1000).toFixed(2))
				if (goods.type == 1) {
					return `文件/${weight}kg`;
				}
				// 包裹/2件/10KG/防疫物资、带电
				let num = item.quantity //goods.items.length;
				let unit = '件';
				if (item.props.length == 0) {
					return `包裹/${num}${unit}/${weight}kg`
				}
				let props = item.props.join('、');
				return `包裹/${num}${unit}/${weight}kg/${props}`

			},
			toDeviceList() {
				uni.navigateTo({
					url: `/pages/print/deviceList`
				})
			},
			handleWeight(data) {
				let total = data.reduce((acc, item) => {
					return parseFloat((acc + item.weight).toFixed(2))
				}, 0)

				return parseFloat((total / 1000).toFixed(2))
			},
			toPrint() {
				//获取需要绘制的数据
				let data = this.goodsItems.filter(item => item.selected);
				if (data.length === 0) {
					showMessage("请选择件单号");
					return
				}

				let that = this;
				let arr = data.map((item, index) => {
					return function() {
						return new Promise(function(resolve, reject) {
							// 开始绘制数据
              that.onConnectReady(item, index, resolve).catch(e=>{
                uni.hideLoading()
                showMessage(`第${index}件货品单号打印失败`)
                reject(e)
              })

						});
					}
				})
				console.log(arr);

				this.queue(arr)
					.then(res => {
						for (let i = 0; i < res.length; i++) {
							console.log(res[i])
						}
					})


			},
			async queue(arr) {
				let res = []
				for (let fn of arr) {
					var data = await fn();
					res.push(data);
				}
				return await res
			},
			handlerClip(data) {
				uni.setClipboardData({
					data,
					success: () => {
						showMessage('已复制到剪贴板')
					}
				})
			},
			async initDeviceConnect(deviceId) {
				const onConnectSuccess = (res) => {
					zksdk.getBLEDeviceServices(deviceId, onGetServicesSuccess, (res) => {
						console.log('onGetServicesFail', res);
					});
				}

				const onGetServicesSuccess = (res) => {
					zksdk.getDeviceCharacteristics(deviceId, res.serviceId, onGetCharacterSuccess, (res) => {
						console.log('onGetCharacterFail', res);
					});
				}

				const onGetCharacterSuccess = (res) => {
					this.createBLEConnectionTime2 = new Date().getTime()
					console.log(`蓝牙设备连接成功，已获取设备信息,耗时==>${this.createBLEConnectionTime2-this.createBLEConnectionTime1}ms`)
					this.serviceId = res.serviceId
					this.writeId = res.writeId
					this.readId = res.readId
					uni.setStorageSync("serviceId", res.serviceId)
					uni.setStorageSync("writeId", res.writeId)
					uni.setStorageSync("readId", res.readId)
					// // 开始绘制数据
					// this.onConnectReady()

					//---停止扫描蓝牙设备---------
					zksdk.stopBlueDevicesDiscovery();

				}

				console.log(`准备连接蓝牙==>`)
				this.createBLEConnectionTime1 = new Date().getTime()
				zksdk.createBLEConnection(deviceId, onConnectSuccess, (res) => {
					console.log('onConnectFail', res)
					this.serviceId = uni.getStorageSync("serviceId")
					this.writeId = uni.getStorageSync("writeId")
					this.readId = uni.getStorageSync("readId")
				});
			},
			async onConnectReady(item, index, resolve) {
				if (this.printing) return;
				this.printing = true;
				uni.showLoading();
				this.showCanvas = true;
				console.log('准备绘制图片==>')
				this.canvasTime1 = new Date().getTime();
				const canvasId = 'mainCanvas'
				const w = 576
				const h = 576
				// 获取图片信息打印

				let {
					printOrder
				} = this;
				let {
					abroadAddress
				} = printOrder;
				let CT = `${printOrder.goods.items.length} PCS`; //订单总件数
				let WT = `${this.handleWeight(printOrder.goods.items)}KG`; //订单总重量 todo
				let orderDate = `${dayjs(new Date(printOrder.createAt)).format('DD/MM/YYYY')}`; //下单时间
				let params = {
					to: abroadAddress.name,
					streetOfAddress: abroadAddress.addr,
					phone: abroadAddress.phone,
					city: abroadAddress.city,
					province: "",
					country: abroadAddress.countryEn,
					postCode: abroadAddress.postalCode,

					from: "",
					senderRef: "",
					consignmentRef: "",
					cn: "",

					description: "",
					CT: CT,
					WT: WT,
					Date: orderDate,

					qrCodeText: item.sno,
					barCodeText: printOrder.tno,
					footerLabel: '',
					snoText: `${index + 1}/${printOrder.goods.items.length}`, //件数的序号
					productNo: printOrder.product.no //产品编号
				}

				console.log(params);
				await this.initData(canvasId, w, h, params)
				this.canvasTime2 = new Date().getTime();
				console.log(`图片绘制完毕，准备传输打印指令,耗时==>${this.canvasTime2-this.canvasTime1}ms`)

				// 蓝牙打印
				this.printTime1 = new Date().getTime();
				await this.getInfoImageData(canvasId, w, h, resolve)

			},
			async initData(canvasId, w, h, params) {


				params.qrCode = await this.drawQrcode(params.qrCodeText)
				// this.qrCodeReady = true
				params.barCode = await this.drawBarCode(params.barCodeText)
				// this.barCodeReady = true

				await this.drawInfo(params, canvasId, w, h)
			},
			drawInfo(params, canvasId, w, h) {
				const ctx = uni.createCanvasContext(canvasId)
				// 预留后续单位处理
				const rem = (s) => s / 375 * w

				// 背景图
				ctx.drawImage(background, 0, 0, w, h)

				ctx.setFontSize(rem(14))
				// 收件人
				ctx.fillText(params.to, rem(34), rem(56))
				ctx.fillText(params.streetOfAddress, rem(6), rem(77))
				ctx.fillText(params.phone, rem(50), rem(111))
				ctx.fillText(params.city, rem(38), rem(127))
				ctx.fillText(params.province, rem(62), rem(145))
				ctx.fillText(params.country, rem(62), rem(162))
				ctx.fillText(params.postCode, rem(64), rem(179))

				// 寄件人
				ctx.fillText(params.from, rem(6), rem(210))
				ctx.fillText(params.senderRef, rem(6), rem(236))
				ctx.fillText(params.consignmentRef, rem(6), rem(260))
				ctx.fillText(params.cn, rem(28), rem(280))

				// 物品信息
				ctx.fillText(params.description, rem(118), rem(214)) // todo 描述换行
				ctx.fillText(params.CT, rem(144), rem(269))
				ctx.fillText(params.WT, rem(144), rem(283))
				ctx.fillText(params.Date, rem(144), rem(299))

				// 二维码信息
				ctx.drawImage(params.qrCode, rem(285), rem(80), rem(160), rem(160))
				ctx.drawImage(params.barCode, rem(7), rem(310), rem(300), rem(40))
				ctx.fillText(params.footerLabel, rem(0), rem(360))
				ctx.fillText(params.barCodeText, rem(100), rem(360))

				ctx.fillText(params.snoText, rem(320), rem(180))

				ctx.setFontSize(rem(28))
				ctx.fillText(params.productNo, rem(5), rem(35))

				ctx.save() //保存
				ctx.draw() //绘制
			},
			saveCanvasToFile(canvasId) {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						uni.canvasToTempFilePath({
							canvasId: canvasId,
							success: (res) => {
								resolve(res.tempFilePath)
							},
							fail: reject
						})
					}, 100)

				})
			},
			async getInfoImageData(canvasId, w, h, resolve) {
				await sleep(100)
				const res = await wxPromise(uni.canvasGetImageData)({
					canvasId: canvasId,
					x: 0,
					y: 0,
					width: w,
					height: h,
				})
				this.showCanvas = false;


				const pix = res.data;

				let strCmd = zksdk.CreatCPCLPage(576, h + 60, 1);
				strCmd += zksdk.addCPCLImageCmd(10, 10, {
					imageData: pix,
					width: w,
					height: h,
					threshold: 190,
				});
				strCmd += zksdk.addCPCLPrint();

				let buffer = util.hexStringToBuff(strCmd);
				let datalen = 180;
				if (uni.getSystemInfoSync().platform === 'ios') {
					datalen = 180;
				}

				const opt2 = {
					deviceId: this.deviceId,
					serviceId: this.serviceId,
					characteristicId: this.writeId,
					value: buffer,
					lasterSuccess: () => {
						this.printTime2 = new Date().getTime();
						console.log('print success')
						console.log(`打印完毕 耗时==>${this.printTime2-this.printTime1}ms`)
						console.log(`打印总耗时 耗时==>${this.printTime2-this.canvasTime1}ms`)
						this.printing = false;
						uni.hideLoading();
						resolve("打印成功")
					},
					onceLength: datalen
				};
				console.log(strCmd);
				zksdk.sendDataToDevice(opt2);
			},
			drawQrcode(code) {
				return new Promise((resolve) => {
					const id = 'qrcode'
					wxbarcode.qrcode(id, code, 160, 160);
					return resolve(this.saveCanvasToFile(id))
				})
			},
			drawBarCode(code) {
				return new Promise((resolve) => {
					const id = 'barcode'
					wxbarcode.barcode(id, code, 600, 80);

					return resolve(this.saveCanvasToFile(id))
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	@import '../../assets/styles/common';

	.alert {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 rem(32);
		height: rem(80);
		background: rgba(49, 125, 230, 0.09);
		border-radius: rem(8);
		margin-bottom: rem(38);

		&_ct {
			font-size: rem(24);
			font-weight: 400;
			color: #7B7D87;
		}

		&_btn {
			width: rem(133);
			height: rem(52);
			background: linear-gradient(90deg, #119CFF 0%, #0061DC 100%);
			border-radius: rem(8);

			font-size: rem(24);
			color: #ffffff;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	.list_box {
		padding: 0 rem(24) rem(20);
		margin: rem(25) rem(32);
		background-color: #ffffff;
		border-radius: rem(8);
	}

	.top {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: rem(24);
		padding: rem(21) 0 rem(39) 0;
	}

	.send_number {
		color: #7B7D87;
	}

	.send_sort {
		color: #071755;
	}

	.copy_img {
		width: rem(24);
		height: rem(24);
		margin-left: rem(15);
	}

	.send_place {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		margin-bottom: rem(36);
	}

	.place {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.place_name {
		color: #343847;
		font-size: rem(34);
		font-weight: 600;
	}

	.user_name {
		font-size: rem(24);
		color: #999999;
		margin-top: rem(5);
	}

	.send_status {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: rem(13);
	}

	.status {
		color: #056BF1;
		font-size: rem(28);
		font-weight: 500;
		margin-bottom: rem(11);
	}

	.status_line {
		width: rem(200);
		height: rem(6);
		background: #E6E6E6;
		border-radius: rem(3);
		margin-top: rem(10);
	}

	.status_done {
		width: 0;
		height: rem(6);
		background: linear-gradient(90deg, #0CA4F9 0%, #056BF1 100%);
		border-radius: rem(3);
	}

	.order {
		&_tt {
			font-size: rem(28);
			font-weight: bold;
			color: #343847;
			margin: rem(20) 0 rem(20) rem(32);
		}

		&_item {
			margin: 0 rem(32) rem(20);
			background: #FFFFFF;
			border-radius: rem(8);
			padding: rem(30) rem(24);
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

			&_tt {
				font-size: rem(28);
				font-weight: bold;
				color: #343847;
			}

			&_sub {
				font-size: rem(26);
				color: #82848D;
			}

			&_sub_txt {
				font-size: rem(26);
				color: #343847;
			}
		}
	}

	.page {
		&_ft {
			&-l {
				width: rem(280);
				//margin-left: rem(28);
				//margin-right: rem(83);
				display: flex;
				justify-content: flex-start;
				align-items: center;
			}

			&-num {
				font-size: rem(28);
				color: #343847;
				margin-left: rem(22);
			}

			&-btn {
				margin-right: rem(32);
			}
		}
	}

	.ml28 {
		margin-left: rem(28);
	}
</style>
