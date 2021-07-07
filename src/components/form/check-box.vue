<template>

  <div class="checkbox" @click="toggleCheck">
    <div class="checkbox_icon" :class="{'checkbox_icon-on':currentValue}" :style="{width:size,height:size}"></div>
    <div class="checkbox_text">
      <slot></slot>
    </div>
  </div>

</template>

<script>
export default {
  name: "check-box",
  props: {
    value: {
      type: [Boolean, Number],
      default: false,
    },
    size: {
      type: String,
      default: '34rpx'
    },
    edit: {
      type: [Boolean, Number],
      default: true,
    }
  },
  data() {
    return {
      currentValue: this.value
    }
  },
  watch: {
    value: function (newVal, oldVal, changedPath) {
      this.currentValue = newVal
    }
  },
  methods: {
    toggleCheck() {
      if (!this.edit) return
      this.currentValue = !this.currentValue
      this.$emit('input', this.currentValue)
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins";

.checkbox {
  display: flex;
  align-items: center;

  &_icon {
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('../../assets/images/icon/checkbox.png');

    margin-right: rem(20);

    &-on {
      background-image: url('../../assets/images/icon/checkbox_on.png');
    }
  }

  &_text {

    font-size: rem(26);
    font-weight: 400;
    color: #000000;
  }
}

</style>
