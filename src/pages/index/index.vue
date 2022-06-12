<template>
    <view class="content">
        <navtitle title="国际物流" color="black" :fixed="fixed"></navtitle>
        <swiper class="swiper" :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval"
            :duration="duration">
            <swiper-item v-for="(item) in bannerList" :key="item.id" @click="handlerBanner(item.link)">
                <image class="banner_img" mode="aspectFill" :src="item.img"></image>
            </swiper-item>
        </swiper>
        <view class="wrap">
            <view class="tab_content">
                <view v-for="(item,index) in tablist" :class="['tab_item',activeIndex == item.value ? 'active' : '']"
                    :key="index" @click="handlerTab(item.value)">
                    {{item.name}}
                    <view class="active_line" v-if="activeIndex == item.value"></view>
                </view>
            </view>
            <view class="info">{{tabInfo[activeIndex].message}}</view>
            <view class="send_box">
                <image class="map_img" src="/static/index/map.png"></image>
                <view class="send_wrap">
                    <view class="place_content">
                        <view class="left_place">
                            <view class="type">发</view>
                            <text class="txt">货物所在地</text>
                        </view>
                        <view class="right_place">
                            <text class="txt">目的国家</text>
                            <view class="type">收</view>
                        </view>
                    </view>
                    <view class="detail_place">
                        <view :class="[city ? 'from' : 'fromnone']" @click="handlerCityPage">
                            {{city ? city.cityName : '城市'}}
                        </view>
                        <image class="center_arrow" src="/static/index/right_arrow.png"></image>
                        <view :class="[country ? 'to' : 'fromnone']" @click="handlerCountryPage">
                            {{country ? country.cnName : '国家'}}
                        </view>
                    </view>
                    <view class="look_content" v-if="activeIndex !== 1">
                        <text class="only_txt">只看</text>
                        <view class="only_item" v-for="(item,index) in typeObj[activeIndex]" :key="index"
                            @click="handlerOnlyItem(item)">
                            <image class="only_img" v-if="inArray(onlyCheck[activeIndex],item.value)"
                                src="../../static/index/checked.png"></image>
                            <image class="only_img" v-else src="../../static/index/check.png"></image>
                            <text class="only_name">{{item.name}}</text>
                        </view>
                    </view>
                    <view class="btn" @click="getPrice">查价下单</view>
                    <view class="history" v-if="history.length">
                        <view class="history_list">
                            <text class="h_txt" v-for="(item,index) in history" :key="index"
                                @click="handlerHisroty(item)">{{item.city.cityName}}-{{item.country.cnName}}</text>
                        </view>
                        <view class="clear" @click.stop="handlerClearHistory">清除数据</view>
                    </view>
                </view>
            </view>
        </view>
        <!-- menu -->
        <view class="menu_content">
            <view class="menu_item" v-for="(item,index) in menulist" :key="index" @click="clickMenu(item,index)">
                <view class="m_icon">
                    <image class="m_img" :src="item.icon" :style="{'width': item.width,'height': item.height}"></image>
                </view>
                <text class="m_txt">{{item.name}}</text>
            </view>
        </view>
        <view class="line_box">
            <view class="line"></view>
            <view class="slogon">
                <image class="logo" :src="globalConfig.miniLogo"></image>
                <view class="line_txt">{{globalConfig.slogan}}</view>
            </view>
        </view>
        <view class="service_content">
            <view class="s_item" v-for="(item,index) in servicelist" :key="index">
                <view class="s_icon">
                    <image class="s_img" :src="item.icon" :style="{'width': item.width,'height': item.height}"></image>
                </view>
                <text class="s_txt">{{item.name}}</text>
            </view>
        </view>
        <!-- popup -->
        <slidePopup title="物品信息" :show.sync="goodsVisible">
            <goodsInfo ref="goodsInfo" :goods-nature="goodsNature" :dispatcherTypes="dispatcherTypes" :fba="fba"
                :fbaval.sync="fbaval" @close="handlerClose"></goodsInfo>
        </slidePopup>
        <customDialog :visible.sync="showRCode">
            <view class="rcode">
                <view class="rcode_close" @click="showRCode=false"></view>
                <view class="rcode_footer">
                    您可以添加如下客服微信，我们将竭力为您服务
                </view>
                <view class="kefu">
                    <image :src="globalConfig.wechatCustomerService"></image>
                </view>
            </view>
        </customDialog>
    </view>
</template>

<script>
    import navtitle from '@/components/header/header.vue'
    import slidePopup from '@/components/slide-popup'
    import customDialog from '@/components/popup/dialog'

    import goodsInfo from '@/components/goodsinfo/goodsinfo.vue'
    import {
        BannerListApi
    } from '@/api/index.js'
    import {
        mapGetters
    } from 'vuex'
    import {
        handlerCheckLogin,
        showMessage,
        isInArray
    } from '@/util/index'

    import {
        getFlyTIMInstance,
        timUserLogin
    } from "@/util/flyTIM";
    import {
        FlyIMBusinessGroupId,
        FlyIMMajorGroupId
    } from "@/util/common";

    export default {
        components: {
            navtitle,
            slidePopup,
            goodsInfo,
            customDialog
        },
        computed: {
            ...mapGetters(['city', 'country', 'login', 'userInfo', 'globalConfig']),
            fba() {
                const status = this.activeIndex == 3
                return status
            },
            //货品性质  1私人包裹 2商务快递 3电商小包 4FBA
            goodsNature() {
                if (this.activeIndex == 1 || this.activeIndex == 2) {
                    return [this.activeIndex]
                } else {
                    const result = this.onlyCheck[3].length ? (this.onlyCheck[3].length > 1 ? [4] : this.onlyCheck[3]) :
                        [3];
                    return result
                }
            },
            dispatcherTypes() {
                return this.activeIndex === 2 ? this.onlyCheck[2] : []
            }
        },
        watch: {
            goodsNature(newVal) {
                this.fbaval = newVal.indexOf(4) > -1 ? 1 : 2
            }
        },
        data() {
            return {
                fbaval: 2,
                activeIndex: 1,
                fixed: true,
                goodsVisible: false, // 物品信息弹窗
                indicatorDots: true,
                autoplay: true,
                interval: 2000,
                duration: 500,
                onlyCheck: {
                    2: [],
                    3: []
                },
                bannerList: [],
                tablist: [{
                    name: '私人快递',
                    value: 1
                }, {
                    name: '商务快递',
                    value: 2
                }, {
                    name: '电商包裹',
                    value: 3
                }],
                typeObj: {
                    2: [{
                        name: 'FedEx',
                        value: 'FEDEX'
                    }, {
                        name: 'UPS',
                        value: 'UPS'
                    }, {
                        name: 'DHL',
                        value: 'DHL'
                    }, {
                        name: 'TNT',
                        value: 'TNT'
                    }, {
                        name: 'EMS',
                        value: 'EMS'
                    }],
                    3: [{
                        name: '电商小包',
                        value: 3
                    }, {
                        name: 'FBA',
                        value: 4
                    }]
                },
                history: [], // 查询历史记录
                tabInfo: {
                    1: {
                        message: '个人用品、防疫物资、家乡土特产...国货好物随心寄'
                    },
                    2: {
                        message: '各大国际快递优质渠道，满足公司各类寄送需求'
                    },
                    3: {
                        message: '兼顾时效价格，助您货销全球'
                    }
                },
                menulist: [{
                    name: '直接下单',
                    icon: '/static/index/icon_xiadan.png',
                    width: '45rpx',
                    height: '51rpx',
                    url: `/subpackages/sendOrder/index?showFba=1`
                }, {
                    name: '大货询价',
                    icon: '/static/index/icon_xunj.png',
                    width: '46rpx',
                    height: '49rpx'
                }, {
                    name: '客服热线',
                    icon: '/static/index/icon_dianh.png',
                    width: '50rpx',
                    height: '41rpx'
                }, {
                    name: '在线客服',
                    icon: '/static/index/icon_zaix.png',
                    width: '50rpx',
                    height: '45rpx'
                }, ],
                servicelist: [{
                    name: '随心寄',
                    icon: '/static/index/icon_wul.png',
                    width: '36rpx',
                    height: '41rpx'
                }, {
                    name: '方便寄',
                    icon: '/static/index/icon_xiad.png',
                    width: '40rpx',
                    height: '41rpx'
                }, {
                    name: '放心寄',
                    icon: '/static/index/icon_baz.png',
                    width: '37rpx',
                    height: '41rpx'
                }],
                chatLoading: false,
                showRCode: false
            }
        },
        onLoad() {
            this.getBanner();
        },
        onShow() {
            this.history = this.getHistory()
            this.$refs.goodsInfo && this.$refs.goodsInfo.initInfo()
            if (typeof this.$mp.page.getTabBar === 'function' && this.$mp.page.getTabBar()) {
                if (this.userInfo) {
                    this.$mp.page.getTabBar().setData({
                        lgType: this.userInfo.lgType,
                        tab: 1
                    })
                } else {
                    this.$mp.page.getTabBar().setData({
                        tab: 1
                    })
                }
            }
        },
        methods: {
            handlerTab(index) {
                this.activeIndex = index;
            },
            handlerCountryPage() {
                uni.navigateTo({
                    url: '/pages/country/index'
                })
            },
            handlerCityPage() {
                uni.navigateTo({
                    url: '/pages/city/index'
                })
            },
            handlerBanner(link) {
                if (!link) {
                    showMessage('没找到有效地址')
                    return
                }
                if (link.indexOf('http:') > -1 || link.indexOf('https:') > -1) {
                    const url = encodeURIComponent(link)
                    uni.setStorageSync('url', url)
                    uni.navigateTo({
                        url: '/subpackages/web/index'
                    })
                } else if (/^miniapp:\/\//.test(link)) {
                    // 跳转到小程序
                    const ec = /^miniapp:\/\/([a-z0-9]{10,})/g
                    const [_, appId] = ec.exec(link)
                    if (appId) {
                        uni.navigateToMiniProgram({
                            appId
                        })
                    }
                } else {
                    uni.navigateTo({
                        url: link
                    })
                }
            },
            async openTIM(groupId) {
                if (this.chatLoading) return;
                this.chatLoading = true
                this.$store.commit('chat/resetCurrentConversation')
                getFlyTIMInstance()

                uni.showLoading()
                timUserLogin(groupId, {
                    success: (res) => {
                        this.chatLoading = false
                        uni.hideLoading()
                        uni.navigateTo({
                            url: `/subpackages/chat/index?groupId=${groupId}`
                        })
                    },
                    fail: (res) => {
                        this.chatLoading = false
                        uni.hideLoading()
                        showMessage(res && res.ret_msg)
                    }
                })

            },
            handleIM(groupId) {
                uni.showLoading()
                handlerCheckLogin({
                    success: (data) => {
                        console.log("登录成功")
                        this.openTIM(groupId)
                    },
                    fail: (e) => {
                        showMessage(e && e.msg || '登录失败，请稍后重试')
                    },
                    done: () => {
                        uni.hideLoading()
                    }
                });
            },
            clickMenu(menu, index) {
                if (index == 2) { //客服热线
                    uni.makePhoneCall({
                        phoneNumber: '4008803783'
                    })
                } else if (menu.name === '在线客服') {
                    // this.handleIM(FlyIMBusinessGroupId)
                    this.showRCode = true
                } else if (menu.name === '大货询价') {
                    this.showRCode = true
                    // this.handleIM(FlyIMMajorGroupId)
                } else {
                    if (!menu.url) return
                    if (menu.url.indexOf('/subpackages/sendOrder/index') > -1) {
                        //直接下单登录判断
                        this.toLogin(() => {
                            this.$store.dispatch('sendOrder/resetSendOrder')
                            uni.navigateTo({
                                url: `${menu.url}&fromPage=order`
                            })
                        })
                        return
                    }
                    uni.navigateTo({
                        url: menu.url
                    })
                }
            },
            getPrice() {
                if (!this.city) {
                    showMessage('请选择货物所在地')
                    return
                }
                if (!this.country) {
                    showMessage('请选择目的国家')
                    return
                }
                // this.toLogin(() => {
                this.saveHistory();
                this.goodsVisible = !this.goodsVisible
                // })
            },
            handlerClose() {
                this.goodsVisible = false
            },
            toLogin(callback) {
                if (this.login) {
                    if (callback) callback()
                } else {
                    uni.showLoading()
                    handlerCheckLogin({
                        success: () => {
                            if (callback) callback()
                        },
                        fail: (e) => {
                            console.log("登录失败", e)
                            showMessage(e && e.msg || '登录失败，请稍后重试')
                        },
                        done: () => {
                            uni.hideLoading()
                        }
                    });
                }
            },
            saveHistory() {
                const {
                    city,
                    country
                } = this
                let history = this.getHistory()
                const info = {
                    city,
                    country
                }
                history.forEach((item, index) => {
                    if (item.city.cityName == city.cityName && item.country.cnName == country.cnName) {
                        history.splice(index, 1)
                    }
                })
                history.unshift(info)
                history = history.slice(0, 3)
                uni.setStorageSync('history', JSON.stringify(history))
                this.history = this.getHistory()
            },
            getHistory() {
                let history = uni.getStorageSync('history')
                history = history ? JSON.parse(history) : [];
                return history
            },
            handlerClearHistory() {
                uni.removeStorageSync('history');
                this.history = []
            },
            handlerHisroty(item) {
                const {
                    city,
                    country
                } = item;
                this.$store.dispatch('app/toggleCity', city)
                this.$store.dispatch('app/toggleCountry', country)
            },
            handlerOnlyItem(item) {
                const data = this.onlyCheck[this.activeIndex]
                const value = item.value
                if (this.inArray(data, value)) {
                    const index = data.indexOf(value)
                    this.onlyCheck[this.activeIndex].splice(index, 1)
                } else {
                    this.onlyCheck[this.activeIndex].push(value)
                }
            },
            inArray(arr, data) {
                return isInArray(arr, data)
            },
            async getBanner() {
                const res = await BannerListApi({
                    "loc": "DISCOVER"
                })
                this.bannerList = res.list;
            }
        }
    }
</script>

<style scoped lang="scss">
    @import "../../assets/styles/mixins";

    .logo {
        width: 40rpx;
        height: 40rpx;
        border-radius: 30px;
        // border: solid 2rpx #CCCCCC;
        margin-right: 10rpx;
    }

    .slogon {
        display: flex;
        flex-direction: row;
        align-items: center;
        background-color: #ffffff;
        height: 100%;
        padding: 0 6rpx;
        z-index: 2;
    }

    .look_content {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
        margin: 40rpx 0;
    }

    .only_txt,
    .only_name {
        color: #343847;
        font-size: 24rpx;
        margin-right: 10rpx;
    }

    .only_item {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .only_img {
        width: 30rpx;
        height: 30rpx;
        display: block;
        margin-right: 10rpx;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 120rpx;
    }

    .h_margin_right {
        margin-right: 10rpx;
    }

    .swiper {
        width: 750rpx;
        height: 498rpx;
    }

    .banner_img {
        width: 750rpx;
        height: 498rpx;
    }

    .wrap {
        width: 620rpx;
        background-color: #FFFFFF;
        box-shadow: 4rpx 6rpx 8rpx 2rpx rgba(0, 0, 0, 0.08);
        border-radius: 12rpx;
        margin-top: -110rpx;
        padding: 0 33rpx;
        z-index: 2;
    }

    .tab_content {
        width: 620rpx;
        height: 92rpx;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border-bottom: solid 1px #E3E3E3;
    }

    .tab_item {
        width: 140rpx;
        height: 100%;
        position: relative;
        line-height: 92rpx;
        color: #000000;
        font-size: 30rpx;
        text-align: center;
    }

    .tab_item.active {
        color: #0060DC;
        font-weight: 700;
    }

    .info {
        color: #999999;
        font-size: 22rpx;
        margin-top: 21rpx;
    }

    .send_box {
        width: 620rpx;
        position: relative;
        margin-top: 3rpx;
    }

    .send_wrap {
        width: 100%;
        position: relative;
        z-index: 2;
        padding-bottom: 38rpx;
    }

    .map_img {
        width: 606rpx;
        height: 296rpx;
        margin-left: 7rpx;
        position: absolute;
        top: 0;
        left: 0;
    }

    .left_place {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .right_place {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    }

    .left_place .type {
        margin-right: 8rpx;
    }

    .right_place .type {
        margin-left: 8rpx;
    }

    .place_content {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-top: 38rpx;
    }

    .type {
        width: 36rpx;
        height: 36rpx;
        text-align: center;
        line-height: 36rpx;
        background-color: #E5F1FE;
        border-radius: 2rpx;
        color: #056BF1;
        font-size: 24rpx;
    }

    .txt {
        color: #343847;
        font-size: 24rpx;
    }

    .from,
    .to {
        color: #343847;
        font-size: 40rpx;
        font-weight: 600;
    }

    .fromnone {
        color: #999999;
        font-size: 40rpx;
    }

    .detail_place {
        margin-top: 26rpx;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 12rpx;
        border-bottom: solid 1rpx #E3E3E3;
    }

    .btn {
        width: 618rpx;
        height: 96rpx;
        background: linear-gradient(90deg, #0F9EFC 0%, #0060DC 100%);
        box-shadow: 0 0 6rpx 0 #2E76CF;
        border-radius: 48rpx;
        color: #FFFFFF;
        text-align: center;
        line-height: 96rpx;
        font-size: 32rpx;
        margin-top: 48rpx;
    }

    .history {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-top: 28rpx;
    }

    .history_list {
        display: flex;
        flex-direction: row;
        align-items: center;
        @include text-overflow-line(1);
    }

    .h_txt {
        color: #999999;
        font-size: 24rpx;
        margin-right: 10rpx;
        white-space: nowrap;
    }

    .clear {
        font-size: 24rpx;
        color: #3a3a3a;
        width: 170rpx;
        text-align: right;
    }

    .menu_item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .m_icon {
        width: 51rpx;
        height: 51rpx;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }

    .m_txt {
        color: #343847;
        font-size: 24rpx;
        margin-top: 18rpx;
    }

    .menu_content {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 620rpx;
        height: 160rpx;
        background: #FFFFFF;
        box-shadow: 0 3rpx 6rpx 0 rgba(0, 0, 0, 0.08);
        border-radius: 12rpx;
        border: 1rpx solid #FAFAFA;
        padding: 0 33rpx;
        margin-top: 3vh;
    }

    .line_box {
        width: 370rpx;
        height: 33rpx;
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 3vh;
    }

    .line {
        width: 370rpx;
        height: 2rpx;
        background-color: #999999;
        position: absolute;
        top: 16rpx;
        left: 0;
    }

    .line_txt {
        color: #999999;
        font-size: 24rpx;
        background-color: #FFFFFF;
        position: relative;
        z-index: 2;
    }

    .s_item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .s_icon {
        width: 41rpx;
        height: 41rpx;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
    }

    .s_txt {
        color: #343847;
        font-size: 24rpx;
        margin-top: 14rpx;
    }

    .service_content {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 620rpx;
        padding: 0 33rpx;
        margin-top: 40rpx;
        margin-bottom: 20rpx;
    }

    .active_line {
        width: 60rpx;
        height: 6rpx;
        background: linear-gradient(90deg, #0F9DFF 0%, #0060DC 100%);
        border-radius: 3rpx;
        position: absolute;
        bottom: 0;
        left: 50%;
        margin-left: -30rpx;
    }

    .center_arrow {
        width: 34rpx;
        height: 10rpx;
    }

    .change-env {
        position: absolute;
        top: rem(100);
        left: rem(100);
    }

    .rcode {
        height: 400rpx;
        width: 400rpx;
        margin: 0 auto;
        position: relative;
        background-color: #fff;
        padding: rem(60);
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;

        &_close {
            @include image-bg(rem(28), rem(28), url('../../assets/images/icon/close.png'));
            background-size: rem(28);
            width: rem(40);
            height: rem(40);
            position: absolute;
            right: 20rpx;
            top: 20rpx;
        }

        &_footer {
            //  position: absolute;
            //  bottom: 20rpx;
            //  left: 40rpx;
            //  right: 40rpx;
            font-size: 28rpx;
        }
    }

    .kefu {
        width: 320rpx;
        height: 320rpx;
    }

    .kefu image {
        width: 100%;
        height: 100%;
    }
</style>
