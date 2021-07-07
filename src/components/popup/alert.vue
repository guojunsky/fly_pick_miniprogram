<template>
  <customDialog :visible.sync="visible">
    <div class="dialog">
      <div class="dialog_hd">
        <div class="dialog_tt">下单提醒</div>
        <div class="dialog_close" @click="$emit('close')"></div>
      </div>
      <div class="dialog_bd">
        当前下单费用为预估费用。包裹揽收后，我们将重新进行称重、测量、查验。若您填报的信息不准确，可能产生额外费用。您无需立即支付订单，我们将以实际账单为准向您收取最终费用。
      </div>
      <div class="dialog_ft">
        <div class="btn-confirm" @click="$emit('confirm')">确认</div>
      </div>
      <div class="dialog_tip" @click="changeCheck">
        <div class="icon_checkbox icon-checked-c  " v-if="isCheck"></div>
        <div class="icon_checkbox icon-check-c" v-else="!isCheck"></div>
        知道了，下次不再提示
      </div>
    </div>
  </customDialog>
</template>

<script>
import customDialog from './dialog'

export default {
  name: "custom-alert",
  components: {customDialog},
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCheck: false
    }
  },
  methods: {
    changeCheck() {
      this.isCheck = !this.isCheck;
      this.$emit('change',this.isCheck)
    }
  },


}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins.scss";
@import '../../assets/styles/common';

.dialog {
  width: rem(622);
  background: #FFFFFF;
  border-radius: rem(14);

  &_hd {
    height: rem(90);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-bottom: 1px solid #E9E9E9;
  }

  &_tt {
    font-size: rem(34);
    font-weight: 500;
    color: #343847;
  }

  &_close {
    position: absolute;
    top: rem(33);
    right: rem(25);
    @include image-bg(rem(23), rem(23), url('../../assets/images/icon/close.png'))
  }

  &_bd {
    padding: rem(37) rem(30) rem(32) rem(32);
    font-size: rem(28);
    font-weight: 400;
    color: #A7A9AF;
  }

  &_ft {
    padding: 0 rem(45);
  }

  &_tip {
    padding: rem(30) 0 rem(34);
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: rem(28);
    font-weight: 400;
    color: #A7A9AF;
  }
}

.icon_checkbox {
  margin-right: rem(20);
  width: rem(40);
  height: rem(40);
}
</style>
