#启锐386打印机微信小程序驱动
##使用方法
### 1. 导入
`let QRPrinter = require("xxxx/xxxx/wxQRPrinter/QRPrinter.js")`
### 2. 打开蓝牙适配器并搜索启锐打印机
	 function searchPrinter(searchedPrinters,fail)
	 
	 参数说明:
	    searchedPrinters:function, 回调新搜索到的设备（数组），回调参数[{name:"QR-386A-47DA",deviceId:"XXX-XXX-XXX",RRSI:"-70"}]
	    fail:function,打开蓝牙适配器失败的回调
	    
	例：
		QRPrinter.searchPrinter(function(devices){
		      for(let i = 0; i < devices.length; i++)
		      {
		      		console.log(devices[i].name)
		      		console.log(devices[i].deviceId)
		      		console.log(devices[i].RRSI)
		      }
		 })
	
### 3. 连接选定的设备
	function connect(deviceId, success, fail)
	
	参数说明:
	    deviceId:String ,设备的id
	    success:function,成功的回调,回调参数:{ "msg": "成功", "deviceId": connectedDeviceId }
	    fail:function,失败的回调，回调参数:{"msg":"失败"}
	
	例：
		QRPrinter.connect(deviceId,function(res){
		  consle.log(res.msg)//连接成功
		})
	
### 4. 断开连接，关闭蓝牙适配器
	function disconnect()
	
	参数说明：
		无

	例：
		QRPrinter. disconnect()
### 5.开始打印
	function print(revervse, skip)
	参数说明:
	    revervse:bool, 是否反向打印，true反向，false正向
	    skip:bool,是否定位到标签，true定位，false不定位
	    
	例：
		QRPrinter.print(false, true)
		
### 6.设置打印纸张大小（打印区域）的大小
	function pageSetup(pageWidth, pageHeight)
	参数说明：
	    pageWidth:number 打印区域宽度
	    pageHeight:number 是否定位到标签，true定位，false不定位
	    	    
	例：
		QRPrinter.pageSetup(576, 1000)
### 7.打印边框
	function drawBox(lineWidth, top_left_x, top_left_y, bottom_right_x,  bottom_right_y)
	参数说明：
	    lineWidth:number 边框线条宽度
	    top_left_x:number 矩形框左上角x坐标
	    top_left_y:number 矩形框左上角y坐标
	    bottom_right_x:number 矩形框右下角x坐标
	    bottom_right_y:number 矩形框右下角y坐标
		    	    
	例：
	  	QRPrinter.drawBox(1, 0, 0, 150, 20)
	  	
### 8.打印线条
	drawLine(lineWidth, start_x, start_y, end_x, end_y, fullline)
	参数说明：
		lineWidth:number 线条宽度
		start_x:number 线条起始点x坐标
		start_y:number 线条起始点y坐标
		end_x:number 线条结束点x坐标
		end_y:number 线条结束点y坐标
		fullline:bool  true:实线  false: 虚线
		    	    
	例：
		QRPrinter.drawLine(1, 0, 30, 100, 30, true)
		
### 9.页模式下打印文本
	function drawText(text_x, text_y, text, fontSize, rotate, bold, reverse, underline)
	参数说明：
		text_x:number 起始横坐标
		text_y:number 起始纵坐标
		text:number  打印的文本内容
		fontSize:number 字体大小 :
		                    1：16点阵；
		                    2：24点阵；
		                    3：32点阵；
		                    4：24点阵放大一倍；
		                    5：32点阵放大一倍
		                    6：24点阵放大两倍；
		                    7：32点阵放大两倍；
		                  其他：24点阵
		rotate:number   旋转角度:
		                    0：不旋转；    
		                    1：90度；    
		                    2：180°；    
		                    3:270°
	   bold:bool     字体加粗：0～5
	   reverse:bool  是否反白：
		                    false：不反白；
		                    true：反白
	   underline:bool  是否有下划线:
		                    false:没有；
		                    true：有
		    	    
	例：
		QRPrinter.drawText(0, 110 , "测试文字", 2, 0 , false , false)