import {resourceAppid,cloudEnvId} from '@/util/common';

let c1 = null
export async function getCloudInstance() {
    if (!c1) {
        c1 = new wx.cloud.Cloud({
            resourceAppid,
            resourceEnv: cloudEnvId
        })

        await c1.init({
            env: cloudEnvId
        })
    }
    return c1
}

export function reset(){
    c1 = null
}
