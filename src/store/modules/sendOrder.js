// 下单相关逻辑

import {calcOrderPrice, createOrder, leagueOrderConfirmGoods, getCurrentCoupon} from '@/api/order'
import {searchProductOrder} from "@/api/product";
import {createRandomStr, formatWeight} from '@/util'
import {ConfigDataListApi, getPickUpConfig} from "@/api/config";
import dayjs from 'dayjs'

// 格式化优惠券
export const formatCoupon = (coupon) => {
    const {type, expireType, expireEndAt, expireTime, usingScope, discount, sourcePrice, eachPrice, reducePrice, weightStart, weightEnd, maxPrice} = coupon

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
            return `过期时间：${dayjs(new Date(expireEndAt)).format('YYYY-MM-DD HH:mm')}`
        },
        2: () => {
            return `领取后${dayjs(new Date(expireTime)).format('YYYY-MM-DD HH:mm')}内有效`
        }
    }
    const expireMsg = expireType ? (expireMap[expireType] && expireMap[expireType]()) : `至${dayjs(new Date(expireEndAt)).format('YYYY-MM-DD HH:mm')}失效`

    let expireTips = "";
    if (weightEnd) {
        expireTips += `适用范围${weightStart / 1000}-${weightEnd / 1000}公斤段 `
    }
    if (maxPrice) {
        expireTips += `最高减${maxPrice / 100}`
    }

    const target = typeMap[type]
    const {unit, num} = target
    const shortDesc = type === 0 ? `${num}${unit}` : `${unit}${num}`
    return {
        shortDesc,
        unit: target.unit,
        typeName: target.name,
        num: target.num,
        title: titleMap[usingScope],
        expireMsg,
        expireTips
    }
}

// 格式化下单时物品参数
const formatOrderGoods = (goodsInfo) => {
    let goods
    if (goodsInfo) {
        goods = {}
        const {goodsType, goodsValue, weight, packageDetail, fbaValue} = goodsInfo
        goods.type = goodsType
        // 1 私人包裹；2 商务快递；3 电商小包；4 FBA。
        // goods.nature = fbaValue === 1 ? [4] : [1, 2, 3]// fba商品传4，否则把1、2、3都传过去
        goods.nature = fbaValue === 1 ? 4 : 1// fba商品传4，下单这里随便传1个
        if (goodsType === 1) {
            // 文件
            goods.items = [{
                quantity: 1,
                weight: weight * 1000 || 0
            }]
        } /*else if (goodsValue === 1) {
            // 包裹 总的物品信息
            goods.items = packageDetail.map(item => {
                const {goodsPacking, count, height, width, length, weight} = item
                return {
                    quantity: count,
                    type: goodsPacking,
                    length,
                    width,
                    height,
                    weight
                }
            })
        }*/ else {
            // 包裹，单件物品类型
            goods.items = packageDetail.map(item => {
                const {goodsPacking, count, height, width, length, weight, goodTypes} = item
                return {
                    quantity: count,
                    type: goodsPacking,
                    length,
                    width,
                    height,
                    weight: weight * 1000 || 0,
                    props: goodTypes || []
                }
            })

        }
    }
    return goods
}

// 格式化揽件方式
const formatPickup = (pickupType, pickupDate, transitStore) => {
    let pickup
    if (pickupType === 0 && pickupDate) {
        const {date, begin, end} = pickupDate
        pickup = {
            type: pickupType,
            date, begin, end
        }
    } else if (transitStore) {
        const {id, address} = transitStore
        pickup = {
            type: pickupType,
            storeId: id,
            storeAddr: address,
            // 寄件到仓库，暂时不填该参数
            name: '',
            tno: ''
        }
    }
    return pickup
}

export const defaultCheckPriceFilterParams = () => {
    return {
        dispatcher: [],
        logisticsInfo: [],
        agingStart: 2,
        agingEnd: 21
    }
}

export default {
    namespaced: true,
    state: {
        pid: null, // 当前产品pid，由链接带入、或者根据参数查询
        currentProduct: null, // 当前产品

        couponList: [],
        currentCoupon: null,
        currentInsur: null,

        goodsInfo: null,

        senderAddress: null, // 寄件人地址
        receiverAddress: null, // 收件人地址

        transitStore: null, // 中转仓
        customsManifest: {}, //报关信息
        surcharges: [], //附加费

        pickupConfig: {}, // 上门配置
        pickupType: null, // 0 预约上门取货；1 国内快递到仓库；2 自送到中转仓
        pickupDate: null,  // type为0时上门取货时间
        remark: '', // 注释
        payment: {
            payAt: undefined,
            paymentType: 1,
            monthlyNo: '',
        }, //支付方式等
        //查价结果页筛选数据
        checkPriceFilterParams: defaultCheckPriceFilterParams(),
        confirmReceiveData: null,//确认收货订单数据
        orderUserId: "",
        //用户上传的附件
        attachments: [],
        //处理物品切换 物品信息是否改变 默认为0
        isChangeGoodsInfo: 0,
        fromPage:""
    },
    mutations: {
        setFromPage(state, payload) {
            state.fromPage = payload
        },
        setAttachments(state, payload) {
            state.attachments = payload
        },
        setConfirmReceiveData(state, payload) {
            state.confirmReceiveData = payload
        },
        setCheckPriceFilterParams(state, payload) {
            state.checkPriceFilterParams = payload
        },
        setPickupConfig(state, payload) {
            state.pickupConfig = payload
        },
        setPid(state, payload) {
            state.pid = payload
        },
        setCouponList(state, payload) {
            state.couponList = payload
        },
        setCurrentCoupon(state, payload) {
            state.currentCoupon = payload
        },
        setCurrentInsur(state, payload) {
            state.currentInsur = payload
        },
        setCurrentProduct(state, payload) {
            state.currentProduct = payload
        },
        setSenderAddress(state, payload) {
            state.senderAddress = payload
        },
        setReceiverAddress(state, payload) {
            state.receiverAddress = payload
        },
        setTransitStore(state, payload) {
            state.transitStore = payload
        },
        setSurcharge(state, payload) {
            state.surcharge = payload
        },
        setCustomsManifest(state, payload) {
            state.customsManifest = payload
        },
        setSurcharges(state, payload) {
            state.surcharges = payload
        },
        setPickupType(state, payload) {
            state.pickupType = payload
        },
        setPickupDate(state, payload) {
            state.pickupDate = payload
        },
        setGoodsInfo(state, payload) {
            state.goodsInfo = payload
        },
        setRemark(state, payload) {
            state.remark = payload
        },
        setPayment(state, payload) {
            state.payment = payload
        },
        setOrderUserId(state, payload) {
            state.orderUserId = payload
        },
        setIsChangeGoodsInfo(state, payload) {
            state.isChangeGoodsInfo = payload
        }
    },
    getters: {
        surchargeTotalPrice(state) {
            if (!state.currentProduct || !state.currentProduct.realSurcharges) return 0

            return state.currentProduct.realSurcharges.reduce((acc, item) => {
                return acc + item.totalPrice
            }, 0)

        },
        productQueryVO(state) {
            const {pid, pickupType, pickupDate, transitStore, senderAddress, receiverAddress, surcharges, customsManifest, goodsInfo, checkPriceFilterParams, orderUserId, isChangeGoodsInfo} = state
            // 没有选择物品则不进行查询
            if (!goodsInfo || !receiverAddress) return

            let pickup = formatPickup(pickupType, pickupDate, transitStore)

            const {goodsType, goodsValue, weight, packageDetail, fbaValue, goodsNature} = goodsInfo || {}
            let packageDetailList = []
            if (goodsType === 1) {
                // 文件类型不用传packageDetailList
            } else if (goodsValue === 1) {
                packageDetailList = packageDetail
            } else {
                packageDetailList = packageDetail
            }

            packageDetailList = formatWeight(packageDetailList)
            //处理报关价格
            let customsManifestList = {
                items: [],
                totalPrice: customsManifest.totalPrice * 100 || 0
            };
            if (customsManifest.items && customsManifest.items.length) {
                customsManifestList.items = customsManifest.items.map(item => {
                    const {cnName, quantity, price} = item
                    return {
                        cnName,
                        quantity,
                        price: parseFloat((parseFloat(price) * 100).toFixed(2)) || 0
                    }
                })

            }

            //处理税金类型
            let taxType = null;
            const {currentProduct, payment} = state;
            if (currentProduct && !currentProduct.hasTax) {
                if (payment && payment.payAt) {
                    taxType = payment.payAt
                } else if (currentProduct.taxType === 3) {
                    taxType = 2
                } else {
                    taxType = currentProduct.taxType
                }
            }
            //付款方式：0预付，1到付
            let payAtTmp = 0
            if (payment && payment.payAt) {
                if (payment.payAt == 1) {
                    payAtTmp = 0
                }
                if (payment.payAt == 2) {
                    payAtTmp = 1
                }
            }

            return {
                pid,
                chinaAddress: senderAddress,
                internationalAddress: receiverAddress,
                // 物品信息
                goodsType: goodsType,
                weight: weight * 1000, // 单位g
                packageDetail: packageDetailList,
                goodsNature: goodsNature,//fbaValue === 1 ? [4] : [1, 2, 3],// fba商品传4，否则把1、2、3都传过去
                // 寄件方式
                pickup,
                // 支付方式
                taxType,
                // 附加费
                surcharges,
                // 报关
                manifest: {
                    "taxAt": currentProduct && currentProduct.hasTax || 0,//是否含税：0不含税，1含税
                    payAt: payAtTmp,
                    ...customsManifestList,
                },
                ...checkPriceFilterParams,
                packageWay: goodsValue === 1 ? 0 : 1,
                orderUserId,//确认收货-用户id
                //处理物品切换
                initPrice: isChangeGoodsInfo

            }
        }
    },
    actions: {
        async getPickupConfig({state, commit}) {
            const {senderAddress} = state
            if (!senderAddress) return
            const {addr, province, city} = senderAddress
            const res = await getPickUpConfig({leagueId: '', address: addr, province, city}).catch(() => {
            })

            // 根据配置自己生成对应上门时间
            // const res = {
            //     canPickUp: true,
            //     pickUpStart: "08:00",
            //     pickUpEnd: "22:00",
            //     lgId:"",//加盟商id 下单时必填
            // }
            commit('setPickupConfig', res)
        },
        resetSendOrder({dispatch, commit, rootState}) {

            commit('setConfirmReceiveData', null)
            //收件人地址
            commit('address/setSelectAboardAddress', null, {root: true})
            commit('setReceiverAddress', null)
            //物品信息
            commit('setGoodsInfo', null)

            commit('setPickupConfig', {})
            commit('setPid', null)
            commit('setCouponList', [])
            commit('setCurrentCoupon', null)
            commit('setCurrentInsur', null)

            commit('address/setSelectChinaAddress', null, {root: true})
            commit('setSenderAddress', null)
            commit('setTransitStore', null)

            commit('setCurrentProduct', null)
            commit('setSurcharges', [])
            commit('setCustomsManifest', {})

            commit('setPickupType', null)
            commit('setPickupDate', null)
            commit('setRemark', '')
            commit('setPayment', {
                payAt: undefined,
                paymentType: 1,
                monthlyNo: '',
            })
            commit('setConfirmReceiveData', null)
            commit('setOrderUserId', '')
            commit('setAttachments', [])
            commit('setFromPage',"")
        },
        async initSendOrder({dispatch, state, commit, rootState, rootGetters}) {

            // 确认收货时，不查询相关数据，直接使用订单列表返回的信息
            const {selectChinaAddress, selectAboardAddress} = rootState.address
            let tasks = []
            // 获取地址
            if (!selectChinaAddress) {
                tasks.push(dispatch('address/getChinaAddrList', {}, {root: true}))
            }
            if (!selectAboardAddress) {
                dispatch('address/getAboardAddressList', {}, {root: true})
            }

            await Promise.all(tasks)

            const defaultChinaAddress = rootState.address.selectChinaAddress || rootGetters['address/defaultChinaAddress']
            const defaultAboardAddress = rootState.address.selectAboardAddress || rootGetters['address/defaultAboardAddress']

            // 设置默认地址
            commit('setSenderAddress', defaultChinaAddress)
            commit('setReceiverAddress', defaultAboardAddress)

            // 获取产品详情
            dispatch('getProductDetail')

            //预约取件配置接口
            dispatch('getPickupConfig')
        },
        // 获取当前寄件的产品详情，根据选择的相关参数查询价格等
        async getProductDetail({state, commit, getters}) {
            const {pid, receiverAddress, senderAddress, goodsInfo,fromPage} = state

            let {productQueryVO} = getters
            if (!productQueryVO) return


            // 如果没有pid，则需要先查询
            if (!pid) {
                let packageDetail = []
                if (goodsInfo.packageDetail && goodsInfo.packageDetail.length) {
                    packageDetail = goodsInfo.packageDetail.map(item => {
                        const {weight} = item
                        return {
                            ...item,
                            weight: weight * 1000
                        }
                    })
                }
                const productParams = {
                    count: 20,
                    cursor: 0,
                    sort: "default",
                    queryVO: {
                        startAreaCode: senderAddress.areaCode,
                        endAreaCode: receiverAddress.countryCode,
                        goodsNature: goodsInfo.goodsNature,
                        //物品信息
                        goodsType: goodsInfo.goodsType,
                        weight: goodsInfo.weight * 1000 || 0,
                        packageDetail: packageDetail,

                        dispatcher: [],
                        logisticsInfo: [],
                        agingStart: 2,
                        agingEnd: 21,
                        packageWay: goodsInfo.goodsValue === 1 ? 0 : 1
                    }
                }

                const {list} = await searchProductOrder(productParams)
                if (!Array.isArray(list) || !list.length) return

                const {id} = list[0]
                commit('setPid', id)

                commit('setCurrentProduct', list[0])
                commit('setSurcharges', list[0].surcharges)
                // 查询到pid，更新参数进行价格查询
                // params.queryVO.pid = id
            }
            let params = {
                queryVO: getters.productQueryVO
            }
            if(fromPage != "" && fromPage != 'confirmReceive'){
                params['queryVO']['league'] = 1
            }

            const {productVO} = await calcOrderPrice(params)

            commit('setCurrentProduct', productVO)
            commit('setSurcharges', productVO.surcharges)

            // 设置可用优惠券,保存格式化之后的优惠券信息，方便UI展示
            const {receivedCoupon} = productVO || {}
            if (Array.isArray(receivedCoupon)) {
                receivedCoupon.forEach(coupon => {
                    coupon.format = formatCoupon(coupon)
                })
                commit('setCouponList', receivedCoupon)
            } else {
                commit('setCouponList', [])
            }
        },
        async createOrder({dispatch, state, getters}, uid) {

            const {productQueryVO} = getters
            if (!productQueryVO) return

            const {currentProduct, pickupType, pickupDate, transitStore, senderAddress, receiverAddress, surcharges, customsManifest, goodsInfo, currentCoupon, remark, payment, pickupConfig, currentInsur, attachments} = state

            let goods = formatOrderGoods(goodsInfo)
            let pickup = formatPickup(pickupType, pickupDate, transitStore)

            const {paymentType, monthlyNo, payAt,} = payment
            let leagueId = ""
            if (pickupConfig['pickUpConfig'] && pickupConfig['pickUpConfig']['id']) {
                leagueId = pickupConfig['pickUpConfig']['id']
            }
            //处理报关价格
            let customsManifestList = {
                items: [],
                totalPrice: parseFloat((parseFloat(customsManifest.totalPrice) * 100).toFixed(2)) || 0
            };
            if (customsManifest.items && customsManifest.items.length) {
                customsManifestList.items = customsManifest.items.map(item => {
                    const {cnName, quantity, price} = item
                    return {
                        cnName,
                        quantity,
                        price: parseFloat((parseFloat(price) * 100).toFixed(2)) || 0
                    }
                })

            }
            //处理保价
            let vas = []

            if (currentInsur) {
                vas = [{
                    selected: 1,
                    type: 0,
                    price: parseFloat((parseFloat(currentInsur.val) * 100).toFixed(2)) || 0
                }]
            }
            //获取基础配置，匹配国内邮编
            let areaCodeData = await dispatch('getCityList', senderAddress.areaCode)
            let chinaAddress = senderAddress;
            chinaAddress.postalCode = areaCodeData['postCode'] || ''
            //付款方式：0预付，1到付
            let payAtTmp = 0
            if (payment && payment.payAt) {
                if (payment.payAt == 1) {
                    payAtTmp = 0
                }
                if (payment.payAt == 2) {
                    payAtTmp = 1
                }
            }
            let params = {
                "sn": createRandomStr(), // 随机字符串
                productQueryVO: productQueryVO,
                "order": {
                    "leagueId": uni.getStorageSync('userInfo') && (JSON.parse(uni.getStorageSync('userInfo'))['lgId'] || ''), //如选择的是预约上门取件，则加盟商id必传
                    goods,
                    chinaAddress,
                    abroadAddress: receiverAddress,
                    pickup,
                    storeId: pickup && pickup.storeId,
                    // 支付方式
                    paymentType,
                    monthlyNo,
                    // 优惠券ID
                    couponId: currentCoupon && currentCoupon.couponId || null,
                    // 增值保价
                    vas,
                    // 附件
                    attachments,
                    // 报关
                    manifest: {
                        "taxAt": currentProduct && currentProduct.hasTax || 0,//是否含税：0不含税，1含税
                        "payAt": payAtTmp,
                        ...customsManifestList
                    },
                    remark
                }
            }
            if (uid) {
                params['uid'] = uid;
            }
            console.log("下单参数", params)

            return await createOrder(params)
        },

        //确认收货
        async confirmLeagueOrder({state, getters}) {
            const {productQueryVO} = getters
            if (!productQueryVO) return
            const {confirmReceiveData} = state;
            if (!confirmReceiveData) return

            const {pickupType, pickupDate, transitStore, senderAddress, receiverAddress, customsManifest, goodsInfo, currentCoupon, remark, payment, pickupConfig, currentInsur, attachments, currentProduct} = state

            let goods = formatOrderGoods(goodsInfo)
            let pickup = formatPickup(pickupType, pickupDate, transitStore)

            const {paymentType, monthlyNo, payAt} = payment
            let leagueId = ""
            if (pickupConfig['pickUpConfig'] && pickupConfig['pickUpConfig']['id']) {
                leagueId = pickupConfig['pickUpConfig']['id']
            }

            //处理报关价格
            let customsManifestList = {
                items: [],
                totalPrice: parseFloat((parseFloat(customsManifest.totalPrice) * 100).toFixed(2)) || 0
            };
            if (customsManifest.items && customsManifest.items.length) {
                customsManifestList.items = customsManifest.items.map(item => {
                    const {cnName, quantity, price} = item
                    return {
                        cnName,
                        quantity,
                        price: (parseFloat(price).toFixed(2)) * 100 || 0
                    }
                })

            }
            //处理保价
            let vas = []

            if (currentInsur) {
                vas = [{
                    selected: 1,
                    type: 0,
                    price: currentInsur.val * 100
                }]
            }

            //付款方式：0预付，1到付
            let payAtTmp = 0
            if (payment && payment.payAt) {
                if (payment.payAt == 1) {
                    payAtTmp = 0
                }
                if (payment.payAt == 2) {
                    payAtTmp = 1
                }
            }

            let params = {
                orderNo: confirmReceiveData.orderNo, //主订单号
                productQueryVO: productQueryVO,
                "order": {
                    leagueId, //如选择的是预约上门取件，则加盟商id必传
                    goods,
                    chinaAddress: senderAddress,
                    abroadAddress: receiverAddress,
                    pickup,
                    storeId: pickup && pickup.storeId,
                    // 支付方式
                    paymentType,
                    monthlyNo,
                    // 优惠券ID
                    couponId: currentCoupon && currentCoupon.couponId || undefined,
                    // 增值保价
                    vas,
                    // 附件
                    attachments,
                    // 报关
                    manifest: {
                        "taxAt": currentProduct && currentProduct.hasTax || 0,//是否含税：0不含税，1含税
                        "payAt": payAtTmp,
                        ...customsManifestList
                    },
                    remark
                }
            }

            return await leagueOrderConfirmGoods(params)
        },

        //计算优惠券
        async calCoupon({state, getters}, data) {
            const {currentCoupon, currentProduct, orderUserId} = state
            const params = {
                productVO: currentProduct,
                totalPrice: parseFloat((parseFloat(data) * 100).toFixed(2)) || 0,//保价价格+产品价格
                couponId: currentCoupon.couponId,
                myUid: orderUserId
            }
            return await getCurrentCoupon(params)

        },
        async getCityList({state, getters}, code) {
            const res = await ConfigDataListApi()
            const data = res.cityInners || []
            if (data.length) {
                let tmpArr = data.filter(item => {
                    //匹配到城市
                    let str1 = item.areaCode.toString().substring(0, 8)
                    let str2 = code.toString().substring(0, 8)
                    return str1 == str2;
                })
                if (tmpArr.length) {
                    return tmpArr[0]
                }
                return {};
            } else {
                return {}
            }
        },


    }
}
