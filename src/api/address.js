import request from "@/util/request";

// 国内地址

export function addChinaAddress(data) {
    return request(`com.sendatek.sp.api.account.apis.service.ChinaAddressAddApi`, data)
}

export function editChinaAddress(data) {
    return request(`com.sendatek.sp.api.account.apis.service.ChinaAddressPutApi`, data)

}

export function removeChinaAddress(data) {
    return request(`com.sendatek.sp.api.account.apis.service.ChinaAddressDelApi`, data)
}

export function getChinaAddressList(data) {
    return request(`com.sendatek.sp.api.account.apis.service.ChinaAddressListApi`, data)
}

export function getChinaAddressDetail(id) {
    return request(`com.sendatek.sp.api.account.apis.service.ChinaAddressGetApi`, {id})
}


// 海外地址

export function getAboardAddressList(data) {
    return request(`com.sendatek.sp.api.account.apis.service.AbroadAddressListApi`, data)
}

export function addAboardAddress(data) {
    return request(`com.sendatek.sp.api.account.apis.service.AbroadAddressAddApi`, data)
}

export function editAboardAddress(data) {
    return request(`com.sendatek.sp.api.account.apis.service.AbroadAddressPutApi`, data)
}

export function removeAboardAddress(data) {
    return request(`com.sendatek.sp.api.account.apis.service.AbroadAddressDelApi`, data)
}

export function getAboardAddressDetail(id) {
    return request(`com.sendatek.sp.api.account.apis.service.AbroadAddressGetApi`, {id})
}
