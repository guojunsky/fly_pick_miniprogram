import request from "@/util/request";

export const protocolApi = {
    get(filed){
        return request('com.sendatek.sp.api.saas.apis.service.SaasAgreementGetApi', { filed }, true, false, false)
    }
}