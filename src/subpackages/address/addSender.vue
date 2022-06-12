<template>
  <div class="page page-grey">
    <div class="page_bd">
      <div class="form">
        <formItem label="姓名" :showRight="false" align="left">
          <input class="form-input" v-model="form.name" type="text" placeholder="请输入姓名">
        </formItem>
        <formItem label="电话" :showRight="false" align="left">
          <input class="form-input" v-model="form.phone" type="text" placeholder="请输入电话">
          <!--          <div class="form-divide">-</div>-->
          <!--          <input class="form-input" v-model="form.ext" type="text" placeholder="分机号">-->
        </formItem>
        <formItem label="城市/区域" align="left">
          <picker class="form-input" @change="bindPickerChange" mode="region">
            <div class="text-form">{{ areaStr }}</div>
          </picker>
        </formItem>
        <formItem label="详细地址" :showRight="false" align="left">
          <input class="form-input" v-model="form.addr" type="text" placeholder="请输入详细地址(例如：**街**号**)">
        </formItem>
        <formItem label="公司名称" :showRight="false" align="left">
          <input class="form-input" v-model="form.companyName" type="text" placeholder="请输入公司名称(选填)">
        </formItem>
      </div>
    </div>
    <div class="page_ct">
      <div @click="toggleDefault" v-if='fromPage !== "confirmReceive"'>
        <div class="icon-check" v-if="form.defaultAt === 1"></div>
        <div class="icon-uncheck" v-else></div>
      </div>

      <div class="page_tip" v-if='fromPage !== "confirmReceive"'>设置为默认寄件地址</div>
      <div class="page_reset" @click="reset">清空当前信息</div>
    </div>
    <div class="page_ft page_ft-fixed">
      <div class="btn-confirm" @click="submit">保存</div>
    </div>
  </div>
</template>

<script>
import formItem from '@/components/form/form-item'

import {addChinaAddress, getChinaAddressDetail, editChinaAddress} from "@/api/address";

import ValidatorSchema from '@/util/validator'

import {saveAddress} from '@/util/eventBus'

const createDefaultForm = () => {
  return {
    id: '',
    name: '',
    phone: '',
    ext: '',
    province: '',
    city: '',
    town: '',
    addr: '',
    companyName: '',
    areaCode: '',
    defaultAt: 1,// 是否设置为默认地址，0不是，1是
  }
}

const descriptor = {
  name: [
    {key: "required", message: "请填写姓名"},
  ],
  phone: [
    {key: "required", message: "请填写电话号码"},
    {
      key: "validator",
      params(val) {
        return !/^1\d{10}$/.test(val);
      },
      message: "请填写正确的电话号码",
    },
  ],
  province: [{key: "required", message: "请选择省份"}],
  city: [{key: "required", message: "请选择城市"}],
  town: [{key: "required", message: "请选择区域"}],
  addr: [{key: "required", message: "请填写详细地址"}],
  // companyName: [{key: "required", message: "请填写公司名称"}],
};

export default {
  name: "add",
  components: {formItem},
  data() {
    return {
      id: '',
      isCheckMode: false,
      form: createDefaultForm(),
      isLoading: false,
      fromPage:""
    }
  },
  computed: {
    areaStr() {
      const {province = '', city = '', town = ''} = this.form
      return (province + city + town) || '请选择'
    },
  },
  onLoad(option) {
    // 判断是否是编辑状态
    const {id, choose} = option
    this.id = id
    this.isCheckMode = !!choose // 是否是选择模式

    this.getAddressDetail()
  },
  methods: {
    async getAddressDetail() {
      if (!this.id) return


      const {address} = await getChinaAddressDetail(this.id)
      if (address) {
        this.form = {
          ...createDefaultForm(),
          ...address,
          areaCode: '8600110100'
        }
      }else {
        this.fromPage="confirmReceive";
        //从确认收货页面过来
        if(this.$store.state.address.selectChinaAddress){
          this.form = {
            ...createDefaultForm(),
            ...this.$store.state.address.selectChinaAddress,
          }
        }
      }
    },
    toggleDefault() {
      this.form.defaultAt = this.form.defaultAt === 1 ? 0 : 1
    },
    bindPickerChange(e) {
      const {code, value} = e.detail

      this.form.areaCode = `8600${code[2]}` // 唯一码ID-10位（1～4位表示国家,国内8600开头，5～6省；7-8市;9-10区县
      this.form.province = value[0]
      this.form.city = value[1]
      this.form.town = value[2]
    },
    reset() {
      this.form = createDefaultForm()
      this.form.id = this.id
    },
    submit() {
      const validate = () => {
        const validator = new ValidatorSchema(descriptor)
        return validator.validate(this.form).then(()=>{
          return true
        }).catch((errors) => {
          uni.showToast({title: errors[0], icon: 'none'})
          return false
        })
      }

      validate().then((res) => {
        if(!res)return
        if(this.fromPage === "confirmReceive"){ //从确认收货页面过来
          this.$store.commit('address/setSelectChinaAddress', this.form)
          uni.navigateBack();
          return;
        }
        if (this.isLoading) return
        this.isLoading = true;
        const api = this.id ? editChinaAddress : addChinaAddress
        api(this.form).then(res => {
          this.isLoading = false
          const {address} = res
          //更新地址列表数据
          uni.$emit(saveAddress)
          // 选择模式
          if (this.isCheckMode) {
            this.$store.commit('address/setSelectChinaAddress', address)
          }

          uni.navigateBack()
        }).catch(e => {
          console.log(e)
          this.isLoading = false
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../assets/styles/mixins.scss';

.page {
  padding: rem(24) rem(32);

  &_bd {
    background: #FFFFFF;
    border-radius: rem(8);
    padding: 0 rem(24);
  }

  &_ct {
    margin-top: rem(24);
    display: flex;
    align-items: center;
  }

  &_checkbox {
    width: rem(40);
    height: rem(40);
    margin-right: rem(16);
    background-color: red;
  }

  &_tip {
    flex: 1;

    font-size: rem(24);
    font-weight: 400;
    color: #343847;
  }

  &_reset {
    font-size: rem(24);
    font-weight: 400;
    color: #343847;
  }

  &_ft {
    box-sizing: border-box;
    padding: 0 rem(32);
  }
}

.form-divide {
  margin: 0 rem(20);
  text-align: center;
}

.icon-check {
  margin-right: rem(16);
  @include image-bg(rem(40), rem(40), url('../../assets/images/icon/checked_blue.png'))
}

.icon-uncheck {
  margin-right: rem(16);
  width: rem(40);
  height: rem(40);
  box-sizing: border-box;
  border-radius: rem(40);

  border: 1px solid #343847;
}

.text-form {
  font-size: rem(30);
  font-weight: 400;
  color: #343847;

}


</style>
