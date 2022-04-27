export class Context {
    setCtx(saasId, saasToken) {
        this.saasId = saasId
        this.saasToken = saasToken
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
            saasToken
        }
    }

}

export const context = new Context()
