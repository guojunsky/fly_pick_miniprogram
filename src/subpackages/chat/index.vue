<template>
  <div class="page" id="chat">
    <div class="page_bd" :class="{'page_bd_iphone':isIphone}">
      <div class="chat-it" v-for="(item,index) in messageList" :key="index">
        <!--  时间-->
        <div class="chat-time">
          <span v-if="index != 0 && item.createTime != messageList[index - 1].createTime">{{ item.createTime }}</span>
        </div>
        <!--客服-->
        <div class="chat-content chat-l" v-if="item.source === 2 && item['val']">
          <div class="chat-content_wrap">
            <div class="chat-blank">头像</div>
            <div class="chat-avatar chat-avatar_service"></div>
          </div>
          <div class="chat-content_wrap">
            <div class="chat-name chat-name_l">小飞</div>
            <!-- 文本/图片 -->
            <div class="chat-triangle chat-triangle_l" v-if="item['type'] === 'text'"></div>
            <div class="chat-dialog chat-txt" v-if="item['type'] === 'text'">
              {{ item['val'] }}
            </div>

            <image v-if="item['type'] === 'img'" class="chat-img" mode="aspectFit" :src="item['val']" @click="previewImage(item['val'])"></image>
          </div>
        </div>

        <!--用户-->
        <div class="chat-content chat-r" v-if="item.source === 1 && item['val']">
          <!-- 文本/图片 -->
          <div class="chat-content_wrap">
            <div class="chat-name">{{ nickName }}</div>
            <div class="chat-triangle chat-triangle_r" v-if="item['type'] === 'text'"></div>
            <div class="chat-dialog chat-txt" v-if="item['type'] === 'text'">
              {{ item['val'] }}
            </div>

            <image v-if="item['type'] === 'img'" class="chat-img" mode="aspectFit" :src="item['val']" @click="previewImage(item['val'])"></image>

          </div>
          <div class="chat-content_wrap">
            <div class="chat-blank">头像</div>
            <div class="chat-avatar chat-avatar_user_default"></div>
          </div>
        </div>

      </div>

      <div class="chat-end" v-if="isEndChat">当前对话已结束</div>
    </div>

    <!-- 快捷问题 -->
    <div class="quick" :class="{'quick_iphone':isIphone}" v-if="quickList.length">
      <div class="quick-list">
        <div class="quick-item" v-for="(item,index) in quickList" :key="index" @click="handleQuick(item)">{{
            item
          }}
        </div>
      </div>
    </div>

    <div class="page_ft page_ft-fixed" :class="{'page_ft_iphone':isIphone}">
      <input class="page_ft-input" type="text" v-model="message"/>
      <div class="btn-confirm page_ft-btn" @click="sendMessage(message)" v-if="message">发送</div>
      <div class="btn-img" v-else @click="chooseImage">
        <div class="btn-img_upload"></div>
      </div>

    </div>
  </div>
</template>

<script>

import TIM from 'tim-wx-sdk';
import {messageSend, fastQuestionList, userLoginOut} from '@/api/tim'
import {phoneDeal, showMessage} from "@/util";
import {getFlyTIMInstance} from '@/util/flyTIM'
import {uploadToCos} from "@/util/upload";
import {mapGetters} from "vuex";

export default {
  name: 'chat',
  data() {
    return {
      quickList: [],
      message: "",
      loading: false,
      quickLoading: false,
      isEndChat: false,
      groupId: '',
      isIphone: false
    }
  },

  onLoad(options) {
    wx.getSystemInfo({
      success: (res) => {
        console.log('当前用户机型及配置', res)
        const screenHeight = wx.getSystemInfoSync().screenHeight
        const bottom = wx.getSystemInfoSync().safeArea.bottom
        if (screenHeight === bottom) {
          this.isIphone = false
        } else {
          this.isIphone = true
        }
      }
    });
    this.groupId = options.groupId || ''

    // if (this.serviceInfo && this.serviceInfo.name) {
    //   wx.setNavigationBarTitle({
    //     title: `${this.serviceInfo.name}`
    //   })
    // }
    this.getMessageList()

    let flyTIM = getFlyTIMInstance()
    flyTIM.on(TIM.EVENT.MESSAGE_RECEIVED, this.messageReceived, this)
    let interval = setInterval(() => {
      if (this.messageList.length !== 0) {
        this.scrollToBottom()
        clearInterval(interval)
      }
    }, 600)
    //获取快捷问题
    this.getFastQuestionList()
  },
  // 退出聊天页面的时候所有状态清空
  onUnload() {
    this.logout()
    this.$store.commit('chat/resetCurrentConversation')
  },
  computed: {
    ...mapGetters(['userInfo']),
    nickName() {
      return this.userInfo && phoneDeal(this.userInfo.phone);
    },
    messageList() {
      return this.$store.state.chat.messageList;
    },
    serviceInfo() {
      return this.$store.state.chat.serviceInfo;
    }
  },
  methods: {
    async logout() {
      let myUid = uni.getStorageSync('myUid') || '';
      let token = this.$store.state.chat.chatToken || ''
      let uid = this.$store.state.chat.serviceInfo.id || ''

      let params = {
        from: myUid, to: uid, token, groupId: this.groupId
      }
      await userLoginOut(params)
    },
    async handleQuick(item) {
      if (this.quickLoading) return
      this.quickLoading = true
      await this.sendMessage(item)
      this.quickLoading = false;
    },
    async getFastQuestionList() {
      let tenantId = uni.getStorageSync('myUid') || '';
      let token = this.$store.state.chat.chatToken || ''

      try {
        const res = await fastQuestionList({groupId: this.groupId, token, tenantId})
        if (res.ret_code === '0000') {
          this.quickList = res.questions;
        } else {
          this.quickList = []
        }
      } catch (e) {
        this.quickList = []
        console.log("获取快捷问题失败", e)
      }

    },
    chooseImage() {
      if (this.isEndChat) return
      uploadToCos((url) => {
        if (url) {
          this.sendMessage(url, {type: "img"})
        } else {
          showMessage('图片上传失败，请重试')
        }
      });
    },
    previewImage(src) {
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: [src]
      })
    },
    //处理文本或图片
    handleContent(data) {
      if (data) {
        let obj = JSON.parse(data)
        if (obj['text']) {
          return {
            type: 'text',
            val: obj['text']
          }
        } else if (obj['img']) {
          return {
            type: 'img',
            val: obj['img']
          }
        }
        return ''
      }
      return ''
    },
    messageReceived(event) {
      console.log("messageReceived 收到消息")
      console.log(event)
      this.isEndChat = event && event['data'].length && event['data'].payload &&event['data'].payload.text === 'session_end'
      if (this.isEndChat) return

      this.getMessageList()
    },
    // 滚动到列表bottom
    scrollToBottom() {
      wx.pageScrollTo({
        scrollTop: 99999
      })
    },
    async getMessageList() {
      await this.$store.dispatch('chat/getMessageList')
      this.scrollToBottom()
    },

    async sendMessage(data, {type = 'text'} = {}) {
      if (this.isEndChat) return
      if (!data) {
        showMessage("请输入内容")
        return
      }

      let myUid = uni.getStorageSync('myUid') || '';
      let token = this.$store.state.chat.chatToken || ''
      let uid = this.$store.state.chat.serviceInfo.id || ''
      let content = {};
      content[type] = data;
      let params = {
        from: myUid, to: uid, msgBody: [{
          msgType: 'TIMTextElem',
          msgContent: {"Text": JSON.stringify(content)}
        }], token
      }
      console.log("发送消息params", params)
      if (this.loading) return
      this.loading = true
      const res = await messageSend(params)

      if (type === 'text') {
        this.message = ""
      }
      this.loading = false

      console.log("发送消息res", res)
      if (res.ret_code === '0000') {
        this.getMessageList()
      }
    }
  },
}
</script>

<style scoped lang="scss">
.page {
  background-color: #F7F8F9;
  box-sizing: border-box;
  height: 100vh;

  &_bd {
    background-color: #F7F8F9;
    padding-bottom: rem(215);
  }

  &_ft {
    width: rem(750);
    height: rem(112);
    background: #EBECED;
    display: flex;
    z-index: 999;

    &-input {
      width: rem(516);
      height: rem(80);
      background: #FFFFFF;
      border-radius: rem(40);
      margin: 0 rem(23);
      padding: 0 rem(20);
    }

    &-btn {
      height: rem(60);
      line-height: rem(60);
      margin-right: rem(23);
    }

    .btn {
      &-img {
        width: rem(150);
        height: rem(80);
      }

      &-img_upload {
        width: rem(80);
        height: rem(80);
        @include image-bg(rem(80), rem(80), url('../../assets/images/icon/img_upload.png'))
      }
    }

  }

  &_bd_iphone {
    padding-bottom: rem(253);
  }

  &_ft_iphone {
    height: rem(120);
    padding-bottom: rem(30);
  }
}

.chat {
  &-end {
    text-align: center;
    margin: rem(20) 0;
    font-size: rem(26);
    color: rgba(0, 0, 0, 0.44);
  }

  &-list {
    display: flex;
    flex-direction: column;
  }

  &-it {
    text-align: center;
  }

  &-time {
    font-size: rem(24);
    font-weight: 400;
    color: rgba(0, 0, 0, 0.44);
    padding: rem(30) 0;
  }

  &-item {
    display: flex;
    flex-direction: row;
  }

  &-content {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0 rem(32);
    position: relative;
    white-space: normal;
  }

  &-avatar {
    width: rem(80);
    height: rem(80);
    border-radius: rem(80);
  }

  &-avatar_service {
    @include image-bg(rem(80), rem(80), url('../../assets/images/icon/chat_ser_avatar.png'));
    margin-right: rem(20);
  }

  &-avatar_user {
    margin-left: rem(20);
  }

  &-avatar_user_default {
    @include image-bg(rem(80), rem(80), url('../../assets/images/icon/mine_default_avatar.png'));
    margin-left: rem(20);
  }

  &-dialog {
    max-width: rem(460);
    //max-height: rem(250);
    background: #FFFFFF;
    border-radius: rem(12);
    padding: rem(17) rem(30);
    word-wrap:break-word;
    text-align: left;
  }

  &-l {
    justify-content: flex-start;
  }

  &-r {
    justify-content: flex-end;
  }

  &-triangle {
    background: #ffffff;
    width: rem(20);
    height: rem(20);
    margin-top: rem(26);
    transform: rotate(45deg);
    position: absolute;

    &_l {
      left: rem(120);
    }

    &_r {
      right: rem(120);
    }
  }

  &-img {
    background-color: white;
    border-radius: rem(12);
    width: rem(300);
    height: rem(300);
    object-fit: cover;
  }

  &-name {
    font-size: rem(24);
    line-height: 1;
    margin-bottom: rem(12);
    color: #999;
    text-align: right;
  }

  &-name_l {
    text-align: left;
  }

  &-blank {
    width: rem(80);
    font-size: rem(24);
    line-height: 1;
    margin-bottom: rem(12);
    color: #F7F8F9;
  }

}

.quick {
  background-color: #F7F8F9;
  position: fixed;
  bottom: rem(112);
  left: 0;
  width: rem(750);

  &-list {
    width: rem(750);
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    box-sizing: border-box;
    display: flex;
    padding: rem(20) 0;
  }


  &-item {
    padding: 0 rem(15);
    height: rem(52);
    line-height: rem(52);
    background: #FFFFFF;
    border-radius: rem(26);
    border: rem(1) solid #DBDCDE;
    text-align: center;

    font-size: rem(24);
    font-weight: 400;
    color: rgba(0, 0, 0, 0.44);

    margin: 0 rem(12);
  }
}

.quick_iphone {
  bottom: rem(150);
}
</style>
