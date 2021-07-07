// 评论
import request from "@/util/request";

// 评论列表
export function CommentListApi(data) {
	return request('com.sendatek.sp.api.product.apis.CommentListApi', data, false)
}

// 产品评论
export function CommentApi(data) {
	return request('com.sendatek.sp.api.product.apis.CommentApi', data, false)
}
