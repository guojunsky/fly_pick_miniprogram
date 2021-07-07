import request from "@/util/request";

// 计算订单产品价格
export function calcOrderPrice(data) {
    return request('com.sendatek.sp.api.product.apis.ProductPriceApi', data)
}

//下单
export function createOrder(data) {
    return request(`com.sendatek.sp.api.order.apis.service.OrderGenApi`, data)
}

// 查询订单详情
export function getPreOrderDetail(data) {
    return request(`com.sendatek.sp.api.order.apis.service.OrderGetApi`, data)
}

//支付下单
export function billOrderGen(data) {
    return request(`com.sendatek.sp.api.order.apis.service.BillOrderGenApi`, data)
}

// 支付平台预下单
export function prepayment(data) {
    return request(`com.sendatek.sp.api.order.apis.service.BillOrderPrepaymentApi`, data)
}

// 检查订单付款状态
export function checkOrderPaid(data) {
    return request(`com.sendatek.sp.api.order.apis.service.BillOrderPaidCheckApi`, data)
}

//测试使用：将账单状态修改为付款成功
export function billOrderPaid(data) {
    return request(`com.sendatek.sp.api.order.apis.service.test.BillOrderPaidApi`, data)
}
// 增值服务(保价等)价格计算
export function valueAddedServiceCalc(data) {
    return request(`com.sendatek.sp.api.order.apis.service.ValueAddedServiceCalcApi`, data)
}
//确认收货
export function leagueOrderConfirmGoods(data) {
    return request(`com.sendatek.sp.api.order.apis.service.LeagueOrderConfirmGoodsApi`, data)
}

// 计算优惠金额
export function getCurrentCoupon(data) {
    return request('com.sendatek.sp.api.product.apis.MyCouponCalcApi', data)
}

