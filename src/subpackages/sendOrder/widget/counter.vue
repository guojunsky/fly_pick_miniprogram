<template>
  <div class="counter">
    <div class="counter_tt">
      <slot name="title"></slot>
    </div>
    <div class="counter_mn">
      <div class="counter_minus" @click="minus"></div>
      <div class="counter_num">
        <input type="text" class="counter_input" v-model="currentVal">
        <div class="counter_unit">{{ unit }}</div>
      </div>
      <div class="counter_add" @click="add"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "counter",
  props: {
    value: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentVal: this.value
    }
  },
  watch: {
    currentVal(newVal) {
      if (newVal < 0 || newVal === '') {
        this.currentVal = 0
      }
      this.$emit('input', newVal)
    }
  },
  methods: {
    minus() {
      if (this.currentVal > 0) {
        this.currentVal--
        if (this.currentVal < 0) {
          this.currentVal = 0
        }
      }
    },
    add() {
      this.currentVal++
    }
  }
}
</script>

<style scoped lang="scss">
.counter {
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: rem(110);
  padding: 0 rem(20);
  background: #F6F6F6;

  &_tt {
    flex: 1;
    font-size: rem(26);
    font-weight: 400;
    color: #343847;
    line-height: rem(37);
  }

  &_mn {
    width: rem(265);
    display: flex;
    align-items: center;
    justify-content: space-around;

  }

  %btn {
    width: rem(46);
    height: rem(46);
    //background: red;
  }

  &_minus {
    @extend %btn;
    @include image-bg(rem(46), rem(46), url('../../../static/index/lease.png'))
  }

  &_add {
    @extend %btn;
    @include image-bg(rem(46), rem(46), url('../../../static/index/plus.png'))
  }

  &_num {
    display: flex;
    align-items: center;
  }

  &_input {
    width: rem(70);
    font-size: rem(45);
    text-align: center;
  }

  &_unit {
    font-size: rem(24);
    color: #757781;
  }
}
</style>
