<template>
	<div class="page page-grey">
		<div class="page_hd" :class="{'page_hd-mini':(!login || (userInfo && userInfo.lgType !== 1))}">
			<navtitle title="我的" color="black" :fixed="true"></navtitle>

			<div class="page_hd-info">
				<div class="profile" @click="toUserPage">
					<div class="profile_l">

						<img :src="userInfo.avatar" class="profile_avatar" v-if="login && userInfo && userInfo.avatar">
						<img src="../../assets/images/icon/mine_default_avatar.png" class="profile_default_avatar" v-else>

						<div class="profile_mn" v-if="login">
							<div class="profile_tt">{{ userInfo.phone }}</div>
							<div class="profile_tt">{{ userInfo.nickname }}</div>
							<!--              <div class="profile_ct">-->
							<!--                <div class="icon-person"></div>-->
							<!--                <span>未实名</span>-->
							<!--              </div>-->
						</div>
						<div class="profile_mn" v-else>
							<div class="profile_tt">点击登录</div>
						</div>
					</div>

					<div class="profile_r" v-if="login"></div>
				</div>
				<div class="group-text-list" v-if="login && userInfo && userInfo.lgType === 1 ">
					<div class="group-text">
						<div class="group-text_tt">￥{{ balance }}</div>
						<div class="group-text_ct">预存款</div>
					</div>
					<div class="group-text" @click="toMyCoupon">
						<div class="group-text_tt">{{ availableCouponList.length }}</div>
						<div class="group-text_ct">优惠券</div>
					</div>
					<div class="group-text">
						<div class="group-text_tt">￥{{ credit }}</div>
						<div class="group-text_ct">授信</div>
					</div>
				</div>
			</div>

		</div>
		<div class="page_bd">
			<div class="menu-list">
				<!--  取货员： 是否接单 主账号 也需要有开启接单的按钮  -->
				<div class="menu-group" v-if="userInfo && (userInfo.lgType == 3 || userInfo.lgType == 1)">
					<div class="menu-item">
						<div class="menu-item_icon icon-pick"></div>
						<div class="menu-item_name">是否接单</div>
						<div class="menu-item_right">
							<switch :checked="isSwitchPick" @change="switchChangePick" style="transform:scale(0.7)" />
							<div class="icon-arrow-r-grey"></div>
						</div>

					</div>
				</div>

				<div v-for="(group, index) in menuList" class="menu-group" :key="index">
					<div class="menu-item" v-for="(item) in group" :key="item.name" @click="clickMenuItem(item)">
						<div class="menu-item_icon" :class="item.icon"></div>
						<button class="menu-item_name" v-if="item.openType" :open-type='item.openType' session-from=''>{{
                item.name
              }}
						</button>
						<div class="menu-item_name" v-else>{{ item.name }}</div>
						<div class="icon-arrow-r-grey"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import navtitle from '@/components/header/header.vue'
	import {
		handlerCheckLogin,
		showMessage
	} from '@/util/index'
	import {
		mapGetters
	} from 'vuex'
	import {
		setPickUpPersonnelOnline,
		getPickUpPersonnelOnline,
		getUser,
		getLeagueBasePreStore
	} from '@/api/user'
	import {
		getFlyTIMInstance,
		timUserLogin
	} from '@/util/flyTIM'
	import {
		FlyIMBusinessGroupId
	} from '@/util/common'


	export default {
		components: {
			navtitle
		},
		data() {
			return {
				isSwitchPick: true,
				isSwitchLoading: false,
				balance: 0,
				credit: 0,
				chatLoading: false
			}
		},
		computed: {
			...mapGetters(['login', 'userInfo']),
			// userInfo() {
			//   return this.$store.state.user.userInfo || null
			// },
			menuList() {
				//取货员-没有电子发票和地址管理

				if (this.userInfo && this.userInfo.lgType == 3) { //1是主账号,2是区域负责人，3是取货员
					return [
						[{
								icon: 'icon-tel',
								name: '客服电话',
								click: () => {
									uni.makePhoneCall({
										phoneNumber: '4008803783'
									})
								}
							},
							{
								icon: 'icon-service',
								name: '在线客服',
								click: () => {
									uni.showLoading()
									handlerCheckLogin({
										success: (data) => {
											console.log("登录成功")
											this.openTIM()
										},
										fail: (e) => {
											showMessage(e && e.msg || '登录失败，请稍后重试')
										},
										done: () => {
											uni.hideLoading()
										}
									});
								}
							},
							// {icon: 'icon-printer', name: '打印机管理', routePath: ''},
						],
						[
							// {icon: 'icon-message', name: '消息中心', routePath: ''},
							{
								icon: 'icon-feedback',
								name: '投诉反馈',
								click: () => {
									this.toMenuItem('/pages/feedback/index')
								}
							},
							{
								icon: 'icon-about',
								name: '关于我们',
								click: () => {
									const link = 'https://sp.sendatek.com/about/index.html'
									const url = encodeURIComponent(link)
									uni.setStorageSync('url', url)
									uni.navigateTo({
										url: '../web/index'
									})
								}
							}
						]
					]
				}
				return [
					[{
							icon: 'icon-ticket',
							name: '电子发票',
							click: () => {
								this.toMenuItem('/pages/bill/index')
							}
						},
						{
							icon: 'icon-tel',
							name: '客服电话',
							click: () => {
								uni.makePhoneCall({
									phoneNumber: '4008803783'
								})
							}
						},
						{
							icon: 'icon-service',
							name: '在线客服',
							click: () => {
								uni.showLoading()
								handlerCheckLogin({
									success: (data) => {
										console.log("登录成功")
										this.openTIM()
									},
									fail: (e) => {
										showMessage(e && e.msg || '登录失败，请稍后重试')
									},
									done: () => {
										uni.hideLoading()
									}
								});
							}
						},
						{
							icon: 'icon-address',
							name: '地址管理',
							click: () => {
								this.toMenuItem('/pages/address/total')
							}
						},
						// {icon: 'icon-printer', name: '打印机管理', routePath: ''},
					],
					[
						// {icon: 'icon-message', name: '消息中心', routePath: ''},
						{
							icon: 'icon-feedback',
							name: '投诉反馈',
							click: () => {
								this.toMenuItem('/pages/feedback/index')
							}
						},
						{
							icon: 'icon-about',
							name: '关于我们',
							click: () => {
								const link = 'https://sp.sendatek.com/about/index.html'
								const url = encodeURIComponent(link)
								uni.setStorageSync('url', url)
								uni.navigateTo({
									url: '../web/index'
								})
							}
						},
						// {
						//   icon: 'icon-address', name: '打印绘制', click: () => {
						//     uni.navigateTo({
						//       url: '/pages/print/index'
						//     })
						//   }
						// },
						// {
						//   icon: 'icon-address', name: '打印蓝牙测试', click: () => {
						//     uni.navigateTo({
						//       url: '/pages/print/deviceList'
						//     })
						//   }
						// },
					]
				]
			},
			availableCouponList() {
				return this.login ? this.$store.state.coupon.availableList : []
			}
		},

		onShow() {
			if (this.login) {
				if (this.userInfo && this.userInfo.lgType === 1) {
					this.$store.dispatch('coupon/getAvailableCouponList')
					//获取预存款
					this.getPreStore()
				}

				//取货员/加盟商 是否设置接单
				if (this.userInfo && (this.userInfo.lgType === 3 || this.userInfo.lgType == 1)) {
					this.getPickSwitch()
				}
			}
			if (typeof this.$mp.page.getTabBar === 'function' && this.$mp.page.getTabBar()) {
				if (this.userInfo) {
					this.$mp.page.getTabBar().setData({
						lgType: this.userInfo.lgType,
						tab: 3
					})
				} else {
					this.$mp.page.getTabBar().setData({
						tab: 3
					})
				}
			}
		},
		methods: {
			async getPreStore() {
				let lgId = uni.getStorageSync('userInfo') && (JSON.parse(uni.getStorageSync('userInfo'))['lgId'] || '')
				const res = await getLeagueBasePreStore({
					lgId
				})
				if (res.ret_code === '0000') {
					this.balance = parseFloat((res.prestore / 100).toFixed(2)) || 0
				}

			},
			//打开在线客服
			async openTIM() {
				if (this.chatLoading) return;
				this.chatLoading = true
				this.$store.commit('chat/resetCurrentConversation')
				getFlyTIMInstance()

				uni.showLoading()
				timUserLogin(FlyIMBusinessGroupId, {
					success: (res) => {
						this.chatLoading = false
						uni.hideLoading()
						uni.navigateTo({
							url: `/pages/chat/index?groupId=${FlyIMBusinessGroupId}`
						})
					},
					fail: (res) => {
						this.chatLoading = false
						uni.hideLoading()
						showMessage(res && res.ret_msg)
					}
				})

			},
			async getBalance() {
				const res = await getUser()
				if (res.ret_code === '0000') {
					// this.balance = parseFloat((res.user.balance / 100).toFixed(2)) || 0
					this.credit = parseFloat((res.user.credit / 100).toFixed(2)) || 0
				}
			},
			async getPickSwitch() {
				try {
					const res = await getPickUpPersonnelOnline({
						uid: this.userInfo.id
					}, this.userInfo.lgType)
					this.isSwitchPick = res.canPickUp > 0 ? true : false; //是否接单，1接单中，0停止接单，-1停用中
				} catch (e) {
					this.isSwitchPick = false
				}
			},
			async switchChangePick(e) {
				console.log(e.detail.value)
				this.isSwitchPick = e.detail.value

				if (this.isSwitchLoading) return
				this.isSwitchLoading = true
				try {
					const res = await setPickUpPersonnelOnline({
						uid: this.userInfo.id
					}, this.userInfo.lgType)
					this.isSwitchLoading = false
					if (res && res.ret_code === '0000') {
						//canPickUp 是否接单，1接单中，0停止接单，-1停用中
						showMessage("设置成功")
					} else {
						this.isSwitchPick = !this.isSwitchPick
						showMessage(res && res.ret_msg || '设置失败，请稍后重试')
					}
				} catch (e) {
					this.isSwitchLoading = false
					this.isSwitchPick = !this.isSwitchPick
					showMessage("设置失败，请稍后重试")
				}

			},
			toUserPage() {
				this.toLogin('userDetail', this.login)
			},
			toMyCoupon() {
				// this.toLogin("myCoupon")
				uni.navigateTo({
					url: 'myCoupon',
					fail(e) {
						console.log(e)
					}
				})
			},
			toLogin(path, immediatelyJump = true) {
				uni.showLoading()
				handlerCheckLogin({
					success: (data) => {
						console.log("登录成功")
						if (immediatelyJump) {
							this.handleToPage(path)
						} else if (path == 'userDetail') {
							//登录完成，重新获取优惠券数据
							this.$store.dispatch('coupon/getAvailableCouponList')
						}
					},
					fail: (e) => {
						showMessage(e && e.msg || '登录失败，请稍后重试')
					},
					done: () => {
						uni.hideLoading()
					}
				});

			},
			handleToPage(path) {
				if (path) {
					uni.navigateTo({
						url: path
					})
				}
			},
			clickMenuItem(item) {
				item.click && item.click()
			},
			toMenuItem(routePath) {
				if (!routePath) return
				this.toLogin(routePath);
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "../../assets/styles/mixins";

	.page {
		&_hd {
			&-info {
				padding: rem(180) rem(24) 0 rem(40);
				height: rem(270);
			}

			background: #317DE6;

			&-mini {
				height: rem(350);
			}
		}
	}

	.profile {

		display: flex;
		justify-content: space-between;
		align-items: center;

		&_l {
			display: flex;
			justify-content: flex-start;
			align-items: center;
		}

		&_avatar {
			width: rem(100);
			height: rem(100);
			margin-right: rem(31);
			background-color: #979797;
			border-radius: 50%;
			border: rem(5) solid rgba(225, 225, 225, 0.65);
		}

		&_default_avatar {
			width: rem(100);
			height: rem(100);
			margin-right: rem(31);
			background-color: #979797;
			border-radius: 50%;
		}

		&_mn {
			flex: 1;
		}

		&_tt {

			font-size: rem(36);
			font-weight: 500;
			color: #FEFFFE;
			line-height: rem(50);
		}

		&_ct {
			display: flex;
			align-items: center;
			justify-content: center;
			width: rem(100);
			height: rem(30);
			background: #5A97EA;
			border-radius: rem(15);
			margin-top: rem(16);

			span {
				font-size: rem(20);
				font-weight: 400;
				color: #FEFFFE;
			}
		}

		&_r {
			@include image-bg(rem(44), rem(44), url('../../assets/images/icon/arrow_white.png'))
		}
	}

	.icon-person {
		margin-right: rem(2);
		@include image-bg(rem(20), rem(20), url('../../assets/images/icon/person.png'))
	}

	.group-text-list {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: rem(28) rem(40) 0;
	}

	.group-text {
		font-size: rem(32);
		font-weight: 400;
		color: #FFFFFF;
		text-align: center;
		height: rem(84);

		&_tt {}

		&_ct {
			font-size: rem(24);
			color: rgba(225, 225, 225, 0.8);
			margin-top: rem(6);
		}
	}

	.menu-list {
		padding-bottom: rem(46);
		background: #F7F8F9;
	}

	.menu-group {
		margin-bottom: rem(20);
		background-color: #fff;
	}

	.menu-item {
		display: flex;
		align-items: center;
		position: relative;

		margin-left: rem(102);
		padding-right: rem(20);

		&:not(:last-child) {
			border-bottom: rem(1) solid #E6E6E6;
		}

		&_right {
			display: flex;
			align-items: center;
		}

		&_icon {
			position: absolute;
			left: rem(-66);
			top: rem(24);
		}

		&_name {
			padding: rem(24) 0;
			flex: 1;
			font-size: rem(32);
			font-weight: 400;
			color: #343847;
			line-height: rem(45);
			background-color: transparent;

			text-align: left;

			&:after {
				border: none;
			}
		}
	}

	$icon-list: 'message''feedback''about''address''printer''service''tel''ticket';

	@each $icon in $icon-list {
		.icon-#{$icon} {
			@include image-bg(rem(44), rem(44), url('../../assets/images/icon/#{$icon}.png'))
		}
	}

	.icon-arrow-r-grey {
		@include image-bg(rem(44), rem(44), url('../../assets/images/icon/arrow_grey.png'))
	}

	.icon-pick {
		@include image-bg(rem(44), rem(44), url('../../assets/images/icon/service.png'))
	}
</style>
