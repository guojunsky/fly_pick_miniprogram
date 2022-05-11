import request from "@/util/request";
//登录
export const wxLogin = (data) => {
    return request(`com.sendatek.sp.api.account.apis.service.WechatMiniOpenIdApi`, data, false, true, false)
}
//解密
export const wxDecryptLogin = (data) => {
    return request(`com.sendatek.sp.api.account.apis.service.MiniDecryptUnionLoginApi`, data)
}

//修改用户
export const updateUser = (data) => {
    return request(`com.sendatek.sp.api.account.apis.service.AccountUserPutApi`, data)
}

export const getUser = (data) => {
    return request(`com.sendatek.sp.api.account.apis.service.AccountUserGetApi`, data)
}


//下发短信
export const smsSend = (data) => {
    return request(`com.sendatek.sp.api.league.apis.service.user.LgSmsSendApi`, data, true, false, false)
}
//加盟商注册
export const lgRegister = (data) => {
    return request(`com.sendatek.sp.api.league.apis.service.user.LgRegisterApi`, data, true, false, false)
}
//加盟商登录
export const lgLogin = (data) => {
    return request(`com.sendatek.sp.api.league.apis.service.user.LgLoginApi`, data, true, false, false)
}
//修改密码
export const lgPwdChange = (data) => {
    return request(`com.sendatek.sp.api.league.apis.service.user.LgPwdChangeApi`, data)
}
//忘记密码
export const lgPwdForget = (data) => {
    return request(`com.sendatek.sp.api.league.apis.service.user.LgPwdForgetApi`, data, true, false, false)
}
//取货员/加盟商 -设置是否接单
export const setPickUpPersonnelOnline = (data,type=3) => {
    let url = `com.sendatek.sp.api.league.apis.service.PickUpPersonnelOnlineApi`
    if(type === 1){
        url = `com.sendatek.sp.api.league.apis.service.LeagueBaseOrderingOnlineApi`
    }
    return request(url, data)
}
//获取 取货员/加盟商 -设置是否接单
export const getPickUpPersonnelOnline = (data,type=3) => {
    let url = `com.sendatek.sp.api.league.apis.service.PickUpPersonnelUserStatusApi`
    if(type === 1){
        url = `com.sendatek.sp.api.league.apis.service.LeagueBaseOrderingStatusApi`
    }
    return request(url, data)
}
//加盟商预存金额配置
export const getLeagueBasePreStore = (data) => {
    return request(`com.sendatek.sp.api.league.apis.service.LeagueBasePreStoreApi`, data)
}
//加盟商主账号信息
export const getLeagueMainAccount = (data) => {
    return request(`com.sendatek.sp.api.league.apis.service.LeagueMainAccountApi`, data)
}
//修改加盟商信息
export const updateLgUserInfoChange = (data) => {
    return request(`com.sendatek.sp.api.league.apis.service.user.LgUserInfoChangeApi`, data)
}







