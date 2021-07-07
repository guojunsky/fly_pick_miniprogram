import {prepayment, checkOrderPaid, billOrderGen,billOrderPaid} from "@/api/order";
import store from '@/store/index'
import {createRandomStr, showMessage} from "@/util/index";

let resCount = 0;
let isLoading = false;

export function toPayOrder(order, {suc = null, fail = null} = {}) {
    if (isLoading) return
    isLoading = true
    uni.showLoading()
    let ids = order.unpaidBills.map((item) => {
        return item.id;
    })
    const params = {
        "sn": createRandomStr(), // 随机字符串
        "billIds": ids
    }
    billOrderGen(params).then((res) => {
        resCount = 0
        if (res.ret_code === '0000') {
            //todo mock 暂时屏蔽支付，正式环境修改回来
            // toPaidForTest(res.order.id, {suc, fail})
            toPrePay(res.order.id, {suc, fail})
        } else {
            isLoading = false
            uni.hideLoading()
            showMessage("支付下单失败，请稍后重试！")
        }
    }).catch((err) => {
        isLoading = false
        uni.hideLoading()
    })
}

//测试使用
function toPaidForTest(orderNo,{suc = null, fail = null} = {}){
    billOrderPaid({orderNo}).then((res) => {
        if (res.ret_code === '0000') {
            uni.hideLoading()
            isLoading = false
            showMessage("支付成功!")
            if (suc) suc()
        } else {
            isLoading = false
            uni.hideLoading()
            showMessage("支付下单失败，请稍后重试！")
        }
    }).catch((err) => {
        isLoading = false
        uni.hideLoading()
    })
}

function toPrePay(orderNo, {suc = null, fail = null} = {}) {
    // console.log(store.state.user.userInfo)
    let userInfo = JSON.parse(uni.getStorageSync('userInfo'));
    //store.state.user.userInfo.openid
    prepayment({
        orderNo,
        payType: 2,
        tradeType: 4,
        openid: userInfo.openid
    }).then((res) => {
        if (res.ret_code === '0000') {
            let {wxpay} = res
            let data = JSON.parse(wxpay)

            // {appId,timeStamp,nonceStr,package,signType,paySign}
            wx.requestPayment(
                {
                    ...data,
                    'success': function (res) {
                        checkOrder(orderNo, {suc, fail})
                    },
                    'fail': function (res) {
                        console.log("fail", res)
                        isLoading = false
                        uni.hideLoading()
                        if (res.errMsg === 'requestPayment:fail cancel') {
                            showMessage("支付取消")
                        } else {
                            showMessage("支付预下单失败，请稍后重试！")
                        }
                    },
                    'complete': function (res) {
                        console.log("complete", res)
                    }
                })
        } else {
            isLoading = false
            uni.hideLoading()
            showMessage("支付预下单失败，请稍后重试！")
        }
    }).catch((err) => {
        isLoading = false
        uni.hideLoading()
    })
}

async function checkOrder(orderNo, {suc = null, fail = null} = {}) {
    const res = await checkOrderPaid({orderNo, payType: 2, tradeType: 4})
    console.log(res)
    if (res.ret_code === '0000') {
        let {payStatus} = res
        // 0 未发起支付；1 支付中；2 支付成功；3 取消；4 付款超时
        let payStatusTxt = {
            0: '未发起支付',
            3: "支付取消",
            4: "付款超时"
        }
        if (payStatus === 2) {
            uni.hideLoading()
            isLoading = false
            showMessage("支付成功!")
            if (suc) suc()
        } else if (payStatus === 1) {
            if (resCount < 5) {
                setTimeout(() => {
                    checkOrder(orderNo, {suc, fail});
                }, 1000);
            } else {
                uni.hideLoading()
                isLoading = false
                showMessage("支付超时，请稍后重试！")
            }
        } else {
            uni.hideLoading()
            isLoading = false
            showMessage(`${payStatusTxt[payStatus]}，请稍后重试！`)
        }
    } else {
        uni.hideLoading()
        isLoading = false
        showMessage("支付失败，请稍后重试！")
    }

}
