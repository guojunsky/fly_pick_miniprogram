export const orderStatusObj = {
	100: '待确认',
	101: '已确认',
	102: '已拒绝',
	200: '待送货',
	210: '待派单',
	211: '待取货',
	212: '待支付', //待支付（上门取货）
	220: '已取货',
	230: '待入库',
	300: '待支付', //待支付（中转仓）
	301: '已支付',
	320: '已收货',
	330: '已入库',
	400: '运输中',
	500: '发起退货',
	501: '待退货',
	502: '已退货',
	600: '待处理',
	900: '待点评',
	901: '已完结',
	910: '已结算',
	999: '已取消'
}
export const orderProcess = {
	100: 20, //待确认
	101: 40, //已确认
	102: 100, //已拒绝
	200: 40, //待送货
	210: 20, //待派单
	211: 60, //待取货
	212: 60, //待支付
	220: 70, //'已取货',
	230: 60, //待入库
	300: 20, //'待支付',
	301: 40, //'已支付',
	320: 60, //'已收货',
	330: 50, //'已入库',
	400: 60, //'运输中',
	500: 60, //'发起退货',
	501: 70, //'待退货',
	502: 100, //'已退货',
	600: 80, //待处理
	900: 80, //'待点评',
	901: 100, //'已完结',
	910: 100, //'已结算',
	999: 100 //'已取消'
}
