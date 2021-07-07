import request from "@/util/request";

export function searchProductOrder(data) {
    return request(`com.sendatek.sp.api.product.apis.ProductSearchApi`,data)
}

