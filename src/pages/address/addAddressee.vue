<template>
  <div class="page page-grey">
    <div class="alert">
      <div class="alert_icon"></div>
      <div class="alert_ct">请用英文或当地语言填写以下信息</div>
    </div>
    <div class="page_bd">
      <div class="form">
        <formItem label="姓名" align="left" :showRight="false">
          <input class="form-input" v-model="form.name" type="text" placeholder="请输入姓名">
        </formItem>
        <formItem label="国家" align="left">
          <div class="text-form" @click="toCountryPage">{{ form.country || '请选择国家' }}</div>
          <!--          <input class="form-input" v-model="form.country" type="text" placeholder="请选择国家">-->
        </formItem>
        <formItem label="电话" align="left" :showRight="false">
          <input class="form-input" style="width: 100rpx" v-model="form.code" type="text" placeholder="区号">
          <div class="divide">|</div>
          <input class="form-input" v-model="form.phone" type="text" placeholder="请输入电话">
        </formItem>
        <formItem label="邮编" align="left" :showRight="false">
          <input class="form-input" v-model="form.postalCode" type="text" placeholder="请输入邮编">
        </formItem>
        <formItem label="州/城市" align="left" :showRight="false">
          <input class="form-input" v-model="form.city" type="text" placeholder="请选择州/城市">
        </formItem>
        <formItem label="详细地址" align="left" :showRight="false">
          <input class="form-input" v-model="form.addr" type="text" placeholder="请输入详细地址(例如：**街**号**)">
        </formItem>
        <formItem label="公司名称" align="left" :showRight="false">
          <input class="form-input" v-model="form.companyName" type="text" placeholder="请输入公司名称(选填)">
        </formItem>
      </div>
    </div>
    <div class="page_ct">
      <div class="page_tip"></div>
      <div class="page_reset" @click="reset">清空当前信息</div>
    </div>
    <div class="page_ft page_ft-fixed">
      <div class="btn-confirm" @click="submit">保存</div>
    </div>
  </div>
</template>

<script>
import formItem from '@/components/form/form-item'
import {chooseCountry, saveAddress} from '@/util/eventBus'

import {
  addAboardAddress,
  getAboardAddressDetail,
  editAboardAddress,
} from "@/api/address";

import ValidatorSchema from '@/util/validator'

const createDefaultForm = () => {
  return {
    "id": "",
    "name": "",
    "phone": "",
    "ext": "",
    "country": "",
    "city": "",
    "addr": "",
    "postalCode": "",
    "companyName": "",
    "defaultAt": 0,
    "code": "",
    "countryCode": ''
  }
}

const descriptor = {
  name: [
    {key: "required", message: "请填写姓名"},
  ],
  phone: [
    {key: "required", message: "请填写电话号码"},
  ],
  country: [{key: "required", message: "请选择国家"}],
  city: [{key: "required", message: "请选择城市"}],
  addr: [{key: "required", message: "请填写详细地址"}],
  postalCode: [{key: "required", message: "请填写邮编"}],
  // companyName: [{key: "required", message: "请填写公司名称"}],
};

export default {
  name: "addAddressee",
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
    defaultCountry() {
      return this.$store.state.address.defaultCountry
    },
  },
  onLoad(option) {
    const {id, choose} = option
    this.id = id
    this.isCheckMode = !!choose // 是否是选择模式
    this.getAddressDetail()
    this.initDefaultCountry()
  },
  created() {
    uni.$on(chooseCountry, this.setCountry)
  },
  beforeDestroy() {
    uni.$off(chooseCountry, this.setCountry)
  },
  methods: {
    // 判断之前是否选择过国家，如果选择过，则直接使用上一次选择的国家
    initDefaultCountry() {
      if (this.id || !this.defaultCountry) return
      this.setCountry(this.defaultCountry)
    },
    // 选择国家
    setCountry(item) {
      if (!item) return
      const {cnName, areaCode} = item
      this.form.country = cnName
      this.form.countryCode = areaCode
    },
    toCountryPage() {
      uni.navigateTo({
        url: `/pages/country/index`
      })
    },
    async getAddressDetail() {
      if (!this.id) return
      const {address} = await getAboardAddressDetail(this.id)
      if (address) {
        this.form = {
          ...createDefaultForm(),
          ...address
        }
      }else {
        this.fromPage="confirmReceive";
        //从确认收货页面过来
        if(this.$store.state.address.selectAboardAddress){
          this.form = {
            ...createDefaultForm(),
            ...this.$store.state.address.selectAboardAddress,
          }
        }
      }
    },
    reset() {
      this.form = createDefaultForm()
      this.form.id = this.id
    },
    submit() {
      const validate = () => {
        const validator = new ValidatorSchema(descriptor)
        return validator.validate(this.form).catch((errors) => {
          uni.showToast({title: errors[0], icon: 'none'})
          throw errors;
        })
      }

      validate().then((res) => {
        if(this.fromPage === "confirmReceive"){ //从确认收货页面过来
          this.$store.commit('address/setSelectAboardAddress', this.form)
          // 更新选中的国家
          const {country, countryCode} = this.form
          this.defaultCountry && this.$store.commit('address/setDefaultCountry', {
            cnName: country,
            areaCode: countryCode
          })

          uni.navigateBack();
          return;
        }
        if (this.isLoading) return
        this.isLoading = true;
        const api = this.id ? editAboardAddress : addAboardAddress
        api(this.form).then(res => {
          this.isLoading = false
          const {abroadAddress} = res
          //更新地址列表数据
          uni.$emit(saveAddress)

          // 选择模式
          if (this.isCheckMode) {
            this.$store.commit('address/setSelectAboardAddress', abroadAddress)
            // 更新选中的国家
            const {country, countryCode} = this.form
            this.defaultCountry && this.$store.commit('address/setDefaultCountry', {
              cnName: country,
              areaCode: countryCode
            })
          }

          uni.navigateBack()
        }).catch(e => {
          this.isLoading = false
          console.log(e)
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
    padding: 0 rem(32);
    box-sizing: border-box;
  }
}

.alert {
  display: flex;
  align-items: center;
  padding: 0 rem(22);
  height: rem(80);
  background: #FFF3EA;
  border-radius: rem(8);
  margin-bottom: rem(38);

  &_icon {
    width: rem(28);
    height: rem(28);
    margin-right: rem(5);
    @include image-bg(rem(30), rem(28), url('../../assets/images/icon/notice.png'))
  }

  &_ct {
    font-size: rem(24);
    font-weight: 400;
    color: #FE7904;
  }
}

.divide {
  margin: 0 rem(10);
}

.text-form {
  font-size: rem(30);
  font-weight: 400;
  color: #343847;

  &-gray {
    color: rgba(52, 56, 71, 0.2)
  }

  &-xs {
    font-size: rem(20);
  }
}
</style>
