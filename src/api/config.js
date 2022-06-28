import request from "@/util/request";

//基础配置（国家城市）
export const ConfigDataListApi = () => {
    return request('com.sendatek.sp.api.config.apis.service.ConfigDataListApi')
}

// 中转仓列表
export function getTransitStoreList(data, ) {
    return request('com.sendatek.sp.api.product.apis.ProductTransitStoreListApi', data)
}

// fba仓库
export function getFbaStoreList() {
    return request('com.sendatek.sp.api.config.apis.service.FBAStoreListApi')
}


// 寄件方式接口
export function getPickUpConfig(data) {
    return request('com.sendatek.sp.api.league.apis.service.PickUpConfigApi', data)
}
