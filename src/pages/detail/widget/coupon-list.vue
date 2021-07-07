<template>
	<div class="coupon-list">
		<div class="coupon-list_hd">可领取优惠券</div>
		<div class="coupon-list_bd">
			<div class="coupon" v-for="(coupon,index) in couponlist" :key="index" @click="chooseItem(index)">
				<div class="coupon_sd">
					<div class="coupon_price">
						<div class="coupon_price-yen">{{ coupon.unit }}</div>
						{{ coupon.num }}
					</div>
					<div class="coupon_type">{{ coupon.typeName }}</div>
				</div>
				<div class="coupon_mn">
					<div class="coupon_tt">{{ coupon.title }}</div>
					<div class="coupon_ct">{{ coupon.expireMsg }}</div>
					<div class="coupon_ct" v-if="coupon.expireTips">{{ coupon.expireTips }}</div>
				</div>
				<div class="coupon_r">
					<div :class="['get_btn',coupon.receive ? 'active' : '']" @click="handlerGet(coupon.id,coupon.receive)">{{coupon.receive ? '已领取' : '领取'}}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		takeCoupon
	} from '@/api/coupon.js'
	import {
		timeToMinute,
		showMessage
	} from '@/util/index.js'
	// 格式化优惠券
	const formatCoupon = (coupon) => {
		const {
			type,
			expireType,
			expireEndAt,
			expireTime,
			usingScope,
			discount,
			sourcePrice,
			eachPrice,
			reducePrice,
			id,
			receive,
			weightStart,
			weightEnd,
			maxPrice
		} = coupon

		const titleMap = {
			1: '平台通用券',
			2: '供应商优惠券',
			3: '产品优惠券'
		}
		const typeMap = {
			0: {
				name: '折扣券',
				unit: '折',
				num: discount / 10
			},
			1: {
				unit: '￥',
				name: `满${sourcePrice / 100}元减`,
				num: reducePrice / 100
			},
			2: {
				unit: '￥',
				name: `每满${eachPrice / 100}元减`,
				num: reducePrice / 100
			},
			3: {
				unit: '￥',
				name: '无门槛券',
				num: reducePrice / 100
			}
		}

		const expireMap = {
			1: () => {
				return `过期时间：${timeToMinute(expireEndAt)}`
			},
			2: () => {
				const time = Math.ceil(expireTime / 1000 / 60 / 60 / 24)
				let message = receive == 1 ? `过期时间：${timeToMinute(expireEndAt)}` : `领取后${time}天内有效`
				return message
			}
		}
		const expireMsg = expireMap[expireType] && expireMap[expireType]()

		let expireTips = "";
		if (weightEnd) {
			expireTips += `适用范围${weightStart/1000}-${weightEnd/1000}公斤段 `
		}
		if (maxPrice) {
			expireTips += `最高减${maxPrice/100}`
		}

		const target = typeMap[type]
		const {
			unit,
			num
		} = target
		const shortDesc = type === 0 ? `${num}${unit}` : `${unit}${num}`
		return {
			id,
			receive,
			shortDesc,
			unit: target.unit,
			typeName: target.name,
			num: target.num,
			title: titleMap[usingScope],
			expireMsg,
			expireTips
		}
	}

	export default {
		name: "coupon-list",
		data() {
			return {
				currentIndex: -1
			}
		},
		props: {
			list: {
				type: Array,
				default: () => {
					return []
				}
			}
		},
		computed: {
			couponlist() {
				const list = this.list.map((coupon) => {
					return formatCoupon(coupon)
				})
				return list
			}
		},
		methods: {
			chooseItem(index) {
				this.currentIndex = index
				const item = this.list[index]
				this.$emit('chooseItem', item)
			},
			updateData(id) {
				this.$emit('update', id)
				this.$store.dispatch('sendOrder/initSendOrder')
			},
			async handlerGet(id, receive) {
				if (receive) return;
				const res = await takeCoupon({
					id
				})
				if (res.ret_code == '0000') {
					showMessage('领取成功')
					this.updateData(id)
				}

			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../../../assets/styles/mixins";

	.coupon-list {
		padding-top: rem(49);
		padding-bottom: 20rpx;

		&_hd {
			font-size: rem(32);
			font-weight: 400;
			color: #343847;
			line-height: rem(45);
		}

		&_bd {}

		.get_btn {
			width: 104rpx;
			height: 48rpx;
			background-color: #E8011B;
			border-radius: 4rpx;
			color: #FFFFFF;
			text-align: center;
			line-height: 48rpx;
			font-size: 24rpx;
			margin-left: 20rpx;

			&.active {
				background-color: #CCCCCC;
				color: #343847;
			}
		}
	}

	.coupon {
		display: flex;
		align-items: center;

		margin-top: rem(32);
		height: rem(160);
		box-sizing: border-box;

		padding: rem(44) rem(20) rem(38) rem(30);

		border-radius: rem(8);
		border: 1px solid #AAAAAA;

		&-on {
			border: 1px solid #E8011B;
		}

		&_sd {
			width: rem(155);

		}

		&_price {
			display: flex;
			align-items: center;
			padding-left: rem(17);
			margin-bottom: rem(8);

			font-weight: 400;
			color: #E8011B;
			line-height: rem(33);
			font-size: rem(48);

			&-yen {
				font-size: rem(24);
			}
		}

		&_type {
			font-size: rem(24);
			font-weight: 400;
			color: #343847;
			line-height: rem(33);
		}

		&_mn {
			flex: 1;
			padding-left: rem(32);
			border-left: 1px solid #ccc;

		}

		&_tt {
			margin-bottom: rem(9);
			font-size: rem(28);
			font-weight: 500;
			color: #343847;
			line-height: rem(40);

		}

		&_ct {
			font-size: rem(24);
			font-weight: 400;
			color: #343847;
			line-height: rem(33);
		}
	}
</style>
