import request from "@/util/request";


export function getCouponList(data) {
    return request('com.sendatek.sp.api.product.apis.CouponListApi', data)
}

export function getMyCouponList(data) {
    return request('com.sendatek.sp.api.product.apis.MyCouponListApi', data)
}

export function takeCoupon(data) {
    return request('com.sendatek.sp.api.product.apis.ReceiveCouponApi', data)

}
