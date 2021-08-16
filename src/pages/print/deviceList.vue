<template>
  <div class="page page-grey">
    <div class="page_hd">
      <div class="alert">
        <div class="alert_icon"></div>
        <div class="alert_ct">确保蓝牙打开。当打印机无法连接时，请重启重试</div>
      </div>
      <div class="device_title">附近的蓝牙打印机设备</div>
    </div>
    <div class="page_bd">
      <div class="page_blank" v-if="!devices.length">
        未搜索到设备
      </div>
      <div class="device_wrap" v-else>
        <div class="device_list" v-for="(item,index) in devices" :key="index" @click="selectedDevice(item,index)">
          <div>
            <div class="device_name">{{ item.name }}</div>
            <div class="device_row">{{ item.deviceId }}</div>
          </div>

          <div>
            <div class="address_checkbox icon-checked-c" v-if="item.isSelected"></div>
            <div class="address_checkbox icon-check-c" v-else></div>
          </div>
        </div>
      </div>
    </div>
    <div class="page_ft page_ft-fixed">
      <div class="page_ft-btn search-btn" @click="searchDevice">搜索设备</div>
      <div class="page_ft-btn print-btn" @click="toPrintPage">开始打印</div>
    </div>

  </div>
</template>

<script>
import * as zksdk from '../../util/bluetoolthPrinter/bluetoolth';
import {showMessage} from "@/util";
let QRPrinter = require("../../libs/wxQRPrinter/QRPrinter.js");
export default {
  name: "deviceList",
  data() {
    return {
      devices: [],
    }
  },
  onLoad() {
    this.handleBlue()
    //mock
    // this.onGetDevice([{name: '123', deviceId: '22'}, {name: '123', deviceId: '33'}, {
    //   name: '44',
    //   deviceId: '55'
    // }, {name: '123', deviceId: '66'}, {name: '123', deviceId: '77'}, {name: '123', deviceId: '88'}, {
    //   name: '123',
    //   deviceId: '99'
    // }, {name: '123', deviceId: '00'}, {name: '最后', deviceId: '111111'}, {name: '最后1', deviceId: '22222222'}])

    // this.onGetDevice([{name: '123', deviceId: '22'}, {name: '123', deviceId: '33'}])
  },
  methods: {
    selectedDevice(data, index) {
      if (!data) return
      data.isSelected = true
      console.log(data);
      this.devices.map(item => {
        if (data.deviceId !== item.deviceId) {
          item.isSelected = false
        }
      });
      this.devices.splice(index,1,data);
      console.log(this.devices);
      wx.stopBluetoothDevicesDiscovery({
        success:function(e){
          console.log(e);
        }
      })
      // QRPrinter.connect(data.deviceId,function(res){
      //   console.log(res);
      // })
     // QRPrinter.disconnect();
    },
    toPrintPage() {
      let deviceData = this.devices.filter(item => item.isSelected)
      console.log(deviceData)
      if (deviceData.length <= 0) {
        showMessage("请选择设备")
        return
      }
      let deviceId = deviceData[0].deviceId;
      console.log("deviceId", deviceId)

      if (!deviceId) {
        showMessage("请选择设备")
        return
      }
      uni.setStorageSync("deviceInfo", JSON.stringify(deviceData[0]))
      this.$store.commit('print/setDeviceInfo', deviceData[0])
      uni.navigateTo({
        url: `./index?deviceId=${deviceId}`
      })
    },
    handleBlue() {
      // zksdk.openBlue()
      //     .then(() => {
      //       //搜寻设备
      //       zksdk.startBluetoothDevicesDiscovery();
      //       //监听寻找新设备
      //       zksdk.onfindBlueDevices(this.onGetDevice)
      //     })
      //     .catch(e => {
      //       uni.hideLoading()
      //       showMessage("蓝牙连接失败")
      //     })
        let that =this;
         QRPrinter.searchPrinter(function(devices){
           uni.hideLoading();
           console.log(that.devices,'array');
           console.log(devices,'----------devices');
            let arr  = that.devices.filter(item=>item.deviceId ==devices[0].deviceId);
           if(arr.length ==0){
             that.devices = that.devices.concat(devices);
             that.devices = that.devices.map(item => {
              item.isSelected = false
              return item;
             });
           }
         // that.devices = that.devices.concat(devices);
           
           console.log(that.devices,'devices_dddd')
         
        },err=>{
          uni.hideLoading();
          showMessage("蓝牙连接失败")
        });

    },
    searchDevice() {
      uni.showLoading()
      this.devices = []
      this.handleBlue()
    },
    onGetDevice: function (res) {
      uni.hideLoading()
      if (!this.devices.length && Array.isArray(res)) {
        this.devices = res.map(item => {
          item.isSelected = false
          return item;
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../assets/styles/mixins.scss';
@import '../../assets/styles/common';

.page {
  &_hd {
    position: fixed;
    z-index: 2;
    width: 100%;
    background-color: #fff;
    box-sizing: border-box;
  }

  &_bd {
    padding: rem(188) 0 rem(128);
  }

  &_blank {
    display: block;
    margin-top: rem(50);
    font-size: rem(24);
    color: #3a3a3a;
    text-align: center;
  }

  &_ft {
    &-btn {
      padding-left: rem(100);
      padding-right: rem(100);
    }
  }
}

.alert {
  display: flex;
  align-items: center;
  padding: 0 rem(22);
  height: rem(80);
  background: #FFF3EA;
  border-radius: rem(8);
  //margin-bottom: rem(38);
  margin: 0 rem(32) rem(38);

  &_wrap {
    background-color: #ffffff;
  }

  &_icon {
    width: rem(28);
    height: rem(28);
    margin-right: rem(10);
    @include image-bg(rem(30), rem(28), url('../../assets/images/icon/notice.png'))
  }

  &_ct {
    font-size: rem(24);
    font-weight: 400;
    color: #FE7904;
  }
}

.device {
  &_title {
    font-size: rem(32);
    font-weight: bold;
    margin-bottom: rem(38);
    margin-left: rem(32);
    color: #343847;

    //&_wrap {
    //  background-color: #ffffff;
    //}
  }


  &_wrap {
    background-color: #ffffff;
    //overflow: auto;
    //padding-bottom: rem(100);
  }

  &_list {
    border-bottom: rem(1) solid #E6E6E6;
    padding: rem(15) rem(32);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &_name {
    font-weight: bold;
    font-size: rem(28);
    color: #343847;
  }

  &_row {
    font-size: rem(24);
    color: #7B7D87;
  }
}

.print-btn {
  height: rem(80);
  line-height: rem(80);
  background: -webkit-linear-gradient(left, #119CFF 0%, #0060DC 100%);
  background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
  box-shadow: 0 rem(2) rem(13) 0 #0060DC;
  border-radius: rem(44);
  text-align: center;
  font-size: rem(32);
  font-weight: 400;
  color: #FFFFFF;
  margin-left: rem(40);
}

.search-btn {
  height: rem(80);
  line-height: rem(80);
  background-color: white;
  border: rem(1) solid #0060DC;
  border-radius: rem(44);
  text-align: center;
  font-size: rem(32);
  font-weight: 400;
  color: #0060DC;
}

.address {
  &_checkbox {
    margin-right: rem(16);
    width: rem(40);
    height: rem(40);
  }
}
</style>
