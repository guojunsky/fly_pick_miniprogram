import request from "./request"
import {
    sassApi
} from '../api/saas'
import { context } from "./context";

export class SassInterceptor {
    constructor(ctx) {
        this.ctx = ctx
        this.promises = []
    }

    async login() {
        const {
            saasId,
            token
        } = await sassApi.login('s123456', 's1234567');
        this.ctx.setCtx(saasId, token)
        const {
            saasConfigInfo
        } = await sassApi.getConfig();
        await this.invoke()
        return saasConfigInfo
    }
    pre(url, param) {
       
        if (this.ctx.isLogin()) {
            return false
        }
         console.log('收到拦截 返回临时的promise....', url)
        return this.addRequest(url, param)
    }
    addRequest(url, param) {
        const temp = new Promise((resolve) => {
            this.promises.push({
                resolve,
                url,
                param
            })
        })
        return temp
    }
    async invoke() {
        if (this.promises.length > 0) {
            for (const it of this.promises) {
                const r = await request(it.url, it.param)
                it.resolve(r)
            }
            this.promises = []
        }
    }
}

export const sassInterceptor = new SassInterceptor(context)
