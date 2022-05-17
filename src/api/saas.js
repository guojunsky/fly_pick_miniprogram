import request from "@/util/request";

export const sassApi = {
  login(apiId, apiKey){
    return request('com.sendatek.sp.api.saas.apis.service.SaasLoginApi', {
      apiId, apiKey
    }, true, true, false)
  },
  getConfig(saasId, saasToken){
    return request('com.sendatek.sp.api.saas.apis.service.SaasConfigGetApi', {}, true, false, false)
  }
}