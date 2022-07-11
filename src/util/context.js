export class Context {
    setCtx(saasId, saasToken) {
        this.saasId = saasId
        this.saasToken = saasToken
    }

    setConfig(config){
        this.config = config
    }
 

    isLogin() {
        return this.saasId && this.saasToken
    }

    relogin() {
        //
    }

    get baseParam() {
        const {
            saasId,
            saasToken
        } = this
        return {
            saasId,
            saasToken,
            channel:  this.config && this.config.miniPickAppId
        }
    }

}

export const context = new Context()
