<template>
  <div class="slide-popup" v-if="show" @click="close">
    <div class="slide-popup_inner" @click.stop>
      <div class="slide-popup_hd">
        <div class="slide-popup_tt">{{ title }}</div>
        <div class="slide-popup_close" @click="close"></div>
      </div>
      <div class="slide-popup_bd">
        <slot></slot>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "slide-popup",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: ''
    },

  },
  methods: {
    close() {
      this.$emit('update:show', false)
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/styles/mixins";


@keyframes slide-in-up {
  from {
    transform: translateY(200%);
  }
  to {
    transform: translateY(0);
  }
}

.slide-popup {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  width: 100vw;
  height: 100vh;

  background: rgba(0, 0, 0, 0.4);

  &_inner {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    padding-top: rem(32);
    background-color: #fff;
    transform: translateY(-100%);
    animation: slide-in-up .3s linear forwards;
  }

  &_hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 rem(32);
  }

  &_close {
    @include image-bg(rem(28), rem(28), url('../assets/images/icon/close.png'));
    background-size: rem(28);
    width: rem(40);
    height: rem(40);
  }

  &_tt {

    font-size: rem(34);
    font-weight: 500;
    color: #343847;
    line-height: rem(48);

  }

  &_bd {
    max-height: 75vh;
    overflow-y: auto;
    padding: 0 rem(32);
  }
}
</style>
