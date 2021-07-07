//获取应用实例
const app = getApp();
Component({
    data: {
        tab: 0,
        lgType: 1,
        tabBottomHeight: 0,
        list: [{
            "pagePath": "/pages/pickup/index",
            "iconPath": "/static/index/pick.png",
            "selectedIconPath": "/static/index/pick_active.png",
            "text": "取货",
            "index": 0
        },
            {
                "pagePath": "/pages/index/index",
                "iconPath": "/static/index/send.png",
                "selectedIconPath": "/static/index/send_active.png",
                "text": "代客下单",
                "index": 1
            },
            {
                "pagePath": "/pages/check/index",
                "iconPath": "/static/index/search.png",
                "selectedIconPath": "/static/index/search_active.png",
                "text": "查件",
                "index": 2
            },
            {
                "pagePath": "/pages/mine/index",
                "iconPath": "/static/index/mine.png",
                "selectedIconPath": "/static/index/mine_active.png",
                "text": "我的",
                "index": 3
            }
        ]
    },
    lifetimes: {
        //组件的生命周期函数
        attached() {
            const res = wx.getSystemInfoSync();
            let platform = res.platform;
            let screenHeight = res.screenHeight;
            if (platform == 'ios' && screenHeight >= 812) {
                this.setData({
                    tabBottomHeight: 34
                })
            }
        },
        ready() {
            if (wx.getStorageSync("homeIndex") === 1) {
                this.setData({
                    tab: wx.getStorageSync("homeIndex"),
                })
                wx.switchTab({
                    url: '/pages/index/index'
                })
                wx.setStorageSync("homeIndex", 0)
            }
            const userInfo = wx.getStorageSync('userInfo')
            if (userInfo) {
                this.setType();
            }
        }
    },
    methods: {
        setType() {
            const myUid = wx.getStorageSync('myUid')
            let userInfo = ''
            let lgType = ''
            if (myUid) {
                userInfo = JSON.parse(wx.getStorageSync('userInfo') || '{}')
                lgType = userInfo.lgType
                this.setData({
                    lgType: userInfo.lgType
                })
            }
        },
        handlerTab(event) {
            const {
                page,
                index
            } = event.currentTarget.dataset;
            wx.switchTab({
                url: page
            })
        }
    }

})
