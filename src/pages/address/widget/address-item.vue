<template>
  <div :class="['address',address.isSelected?'address_selected':'']" @click="chooseAddress">
    <div class="address_hd">
      <div class="address_name">{{ address.name }}</div>
      <div class="address_phone">{{ address.phone }}</div>
    </div>
    <div class="address_ct" v-if="!isAboard">{{ address.province }}{{ address.city }}{{ address.town }}{{ address.addr }}</div>
    <div class="address_ct" v-else>{{ address.country }}{{ address.city }}{{ address.addr }}</div>
    <div class="address_fixed" v-if="isCheckMode">
      <div class="address_checkbox icon-checked-c" v-if="address.isSelected"></div>
      <div class="address_checkbox icon-check-c" v-else></div>
    </div>


    <div class="address_ft" @click.stop="setDefault">
      <template v-if="!isAboard">
        <div class="address_checkbox icon-checked-c" v-if="address.defaultAt"></div>
        <div class="address_checkbox icon-check-c" v-else></div>
        <div class="address_tip">设置为默认寄件地址</div>
      </template>
      <div class="address_tip" v-else></div>
      <div class="address_edit" @click.stop="edit"></div>
      <div class="address_remove" @click.stop="remove"></div>
    </div>
  </div>
</template>

<script>
import {showToast} from "@/util";

export default {
  name: "address-item",
  props: {
    address: {
      type: Object,
      default: null
    },
    isAboard: {
      type: Boolean,
      default: false,
    },
    isCheckMode: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    setDefault() {
      this.$emit('setDefault')
    },
    chooseAddress() {
      this.$emit("chooseAddr")
    },
    edit() {
      this.$emit("editAddr")
    },
    remove() {
      this.$emit("removeAddr")
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../assets/styles/mixins';
@import '../../../assets/styles/common';

.address {
  box-sizing: border-box;
  width: rem(686);
  margin: rem(20) auto;
  padding: rem(24);

  //height: rem(270);
  background: #FFFFFF;
  border-radius: rem(8);
  position: relative;

  &_fixed {
    position: absolute;
    top: rem(15);
    right: rem(24);
  }

  &_hd {
    display: flex;
    align-items: center;
    line-height: rem(45);
  }

  &_name {
    font-size: rem(32);
    font-weight: 500;
    color: #343847;
    margin-right: rem(18);
  }

  &_phone {
    font-size: rem(24);
    font-weight: 400;
    color: rgba(52, 56, 71, 0.65);
  }

  &_ct {
    padding-top: rem(7);
    font-size: rem(24);
    font-weight: 400;
    color: rgba(52, 56, 71, 0.65);
    line-height: rem(33);
  }

  &_ft {
    margin-top: rem(32);
    padding-top: rem(21);
    display: flex;
    align-items: center;
    border-top: 1px solid #E6E6E6;
  }

  &_checkbox {
    margin-right: rem(16);
    width: rem(40);
    height: rem(40);
  }

  &_tip {
    font-size: rem(24);
    font-weight: 400;
    color: #343847;
    flex: 1;
  }

  &_edit {
    width: rem(27);
    height: rem(27);
    background-color: red;
    margin-right: rem(27);
    @include image-bg(rem(37), rem(40), url('../../../assets/images/icon/address_edit.png'))
  }

  &_remove {
    width: rem(27);
    height: rem(27);
    background-color: red;
    @include image-bg(rem(40), rem(40), url('../../../assets/images/icon/address_remove.png'))

  }
}

</style>
