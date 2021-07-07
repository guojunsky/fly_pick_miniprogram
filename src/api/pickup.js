
import request from "@/util/request";
//取货人员列表
export function PickUpPersonnelListApi(data) {
    return request(`com.sendatek.sp.api.league.apis.service.PickUpPersonnelListApi`, data)
}
//上门取货订单-查询加盟商订单列表
export function LeagueOrderListApi(data) {
    return request(`com.sendatek.sp.api.order.apis.service.LeagueOrderListApi`, data)
}
//上门取货订单派单-指定揽货员
export function LeagueOrderDispatchApi(data) {
    return request(`com.sendatek.sp.api.order.apis.service.LeagueOrderDispatchApi`, data)
}

//上门取货订单-确认收货
export function LeagueOrderConfirmGoodsApi(data) {
    return request(`com.sendatek.sp.api.order.apis.service.LeagueOrderConfirmGoodsApi`, data)
}
//上门取货订单-出货
export function LeagueOrderShipApi(data) {
    return request(`com.sendatek.sp.api.order.apis.service.LeagueOrderShipApi`, data)
}
//上门取货订单-退货
export function LeagueOrderReturnApi(data) {
    return request(`com.sendatek.sp.api.order.apis.service.LeagueOrderReturnApi`, data)
}

//加盟商取货配置
export function PickUpConfigApi(data) {
    return request(`com.sendatek.sp.api.league.apis.service.PickUpConfigApi`, data)
}