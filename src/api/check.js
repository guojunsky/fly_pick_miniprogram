// 查件
import request from "@/util/request";

// 取消订单
export function cancelOrder(data) {
	return request('com.sendatek.sp.api.order.apis.service.OrderCancelApi', data, false)
}

//订单投诉
export function orderFeed(data) {
	return request('com.sendatek.sp.api.order.apis.service.OrderComplaintApi',data,false)
}

//编辑快递单号
export function ExpressNoEditApi(data) {
    return request(`com.sendatek.sp.api.order.apis.service.ExpressNoEditApi`, data,false)
}
