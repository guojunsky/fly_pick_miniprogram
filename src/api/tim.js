import request from "@/util/request";

//租户登录
export const tenantLogin = (data) => {
    return request(`com.sendatek.sp.api.im.apis.TenantLoginApi`, data)
}
// 分配客服
export const distributeMember = (data) => {
    return request(`com.sendatek.sp.api.im.apis.DistributeMemberApi`, data)
}
//聊天记录列表
export const userMessageList = (data) => {
    return request(`com.sendatek.sp.api.im.apis.UserMessageListApi`, data)
}
//消息发送
export const messageSend = (data) => {
    return request(`com.sendatek.sp.api.im.apis.UserMessageSendApi`, data)
}
//快捷问题
export const fastQuestionList = (data) => {
    return request(`com.sendatek.sp.api.im.apis.FastQuestionListApi`, data)
}
//用户退出
export const userLoginOut = (data) => {
    return request(`com.sendatek.sp.api.im.apis.UserLoginOutApi`, data, false)
}




