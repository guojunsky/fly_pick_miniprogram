<template>
  <div class="switch" @click="toggle">
    <div class="switch_inner" :class="{'switch_inner-on':currentValue}"></div>
  </div>
</template>

<script>
export default {
  name: 'custom-switch',
  props: {
    value: {
      type: Boolean | Number,
      default: false
    }
  },
  data() {
    return {
      currentValue: this.value
    }
  },
  watch: {
    value(newVal) {
      this.currentValue = newVal
    }
  },
  methods: {
    toggle() {
      this.currentValue = !this.currentValue
      this.$emit('input', this.currentValue)
    }
  }
}
</script>

<style scoped lang="scss">
.switch {
  display: inline-block;
  vertical-align: middle;
  position: relative;
  $s: rem(28);

  &_inner {
    width: rem(57);
    height: $s;
    background-color: #ccc;
    border-radius: $s;
    transition: all linear 0.3s;

    &:after {
      content: '';
      display: block;
      position: absolute;
      top: rem(2);

      left: rem(2);
      width: rem(24);
      height: rem(24);
      border-radius: rem(26);
      background-color: #fff;
      transition: all linear 0.3s;
    }

    &-on {
      //background-color: #fff;

      &:after {
        transform: translateX(rem(26));
        background-color: #2f5df2;
      }
    }
  }
}
</style>
