<template>
  <div class="form-item">
    <div class="form-ic">
      <slot name="ic"></slot>
    </div>

    <input class="form-input" :class="{'form-input_mini':size=='mini'}" v-model="currentVal" :type="type" :placeholder="placeholder" @focus="onfocus" @blur="onblur">
    <div class="form-clear" @click="clearVal">
      <div class="form-clear_ic"  v-show="currentVal"></div>
    </div>

    <slot name="right"></slot>
  </div>
</template>

<script>
export default {
  name: "login-form-item",
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    type:{
      type: String,
      default: 'text'
    },
    size:{
      type: String,
      default: 'normal'
    }
  },
  data() {
    return {
      currentVal: this.value
    }
  },
  watch: {
    currentVal(newVal) {
      this.$emit('input', newVal)
    }
  },
  methods: {
    clearVal(){
      this.currentVal = ""
    },
    onfocus(){
      this.$emit('onFocus')
    },
    onblur(){
      this.$emit('onBlur')
    }
  },
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins";

.form{
  &-item {
    width: rem(650);
    height: rem(96);
    display: flex;
    justify-content: flex-start;
    align-items: center;

    border-radius: 6px;
    border: 1px solid #979797;
  }
  &-input {
    width: rem(550);
  }
  &-input_mini {
    width: rem(360);
  }
  &-ic {
    width: rem(88);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &-clear {
    width: rem(50);
    height: rem(96);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: rem(15);
    &_ic{
      @include image-bg(rem(35), rem(35), url("../../assets/images/pick/login/clear.png"));
    }
  }
}
</style>
