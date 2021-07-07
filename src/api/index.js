import request from "@/util/request";
//Banner配置
export const BannerListApi = (data) => {
	return request('com.sendatek.sp.api.config.apis.service.BannerListApi',data,false)
}
//订单列表
export const OrderListApi = (data) => {
	return request('com.sendatek.sp.api.order.apis.service.OrderListApi',data,false)
}
//订单详情
export const OrderGetApi = (data) => {
	return request('com.sendatek.sp.api.order.apis.service.OrderGetApi',data,false)
}

//投诉反馈
export const FeedbackApi = (data) => {
	return request('com.sendatek.sp.api.account.apis.service.FeedbackApi',data,false)
}

//上传图片临时凭证
export const CosConfigApi = (data) => {
	return request('com.sendatek.sp.api.config.apis.service.CosConfigApi',data,false)
}
// 上门取货订单-查询加盟商订单详情
export const leagueOrderGet = (data) => {
    return request('com.sendatek.sp.api.order.apis.service.LeagueOrderGetApi',data)
}

