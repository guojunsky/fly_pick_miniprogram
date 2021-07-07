import request from "@/util/request";

// 可开票订单列表
export function InvoiceOrderListApi(data) {
    return request('com.sendatek.sp.api.order.apis.service.InvoiceOrderListApi', data)
}
//电子发票列表
export function InvoiceListApi(data) {
    return request('com.sendatek.sp.api.order.apis.service.InvoiceListApi', data)
}
//申请开电子发票
export function InvoiceGenApi(data) {
    return request('com.sendatek.sp.api.order.apis.service.InvoiceGenApi', data)
}