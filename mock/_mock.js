/**
 * koa-mock文档 https://www.npmjs.com/package/@shymean/mock-server
 */

const path = require('path')
const index = require(path.resolve(process.cwd(), './index.json'))
const config = require(path.resolve(process.cwd(), './config.json'))
const coupon = require(path.resolve(process.cwd(), './coupon.json'))
const sendOrder = require(path.resolve(process.cwd(), './sendOrder.json'))
const address = require(path.resolve(process.cwd(), './address.json'))
const comment = require(path.resolve(process.cwd(), './comment.json'))
Mock.parseUrl = function (ctx) {
    return ctx.header["x-ca-api"];
}
const mocks = [...index, ...config, ...coupon, ...sendOrder, ...address,...comment]
for (const i of mocks) {
    Mock.mock(
        new RegExp(i.url),
        i.response
    )
}


