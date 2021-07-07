<template>
  <div>
    <div class="md-modal md-effect-1" :class="{'md-show':visible}">
      <div class="md-content">
        <slot></slot>
      </div>
    </div>
    <div class="md-overlay" @click="close" @touchmove="preventMove"></div>
  </div>

</template>
<script>
module.exports = {
  name: 'message-box',
  props: {
    closeOnClickModal: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      default: false,
    },
    onClose: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      type: 'md-effect-1',
    }
  },

  methods: {
    close() {
      if (this.closeOnClickModal) {
        this.hide()
      }
    },
    preventMove(e) {
      // 禁止滑动背景滚动
      e.preventDefault()
      e.stopPropagation()
    },
    hide() {
      if (typeof this.onClose === 'function') {
        this.onClose()
      }
      this.$emit('update:visible', false)
    }

  }
}
</script>

<style lang="scss">
.md-modal {
  position: fixed;
  top: 50%;
  left: 50%;

  z-index: 5499;
  visibility: hidden;
  backface-visibility: hidden;
  transform: translateX(-50%) translateY(-50%);
}

.md-show {
  visibility: visible;
}

.md-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  visibility: hidden;
  top: 0;
  left: 0;
  z-index: 1999;
  opacity: 0;
  background: rgba(0, 0, 0, 0.6);
  transition: all 0.3s;
}

.md-show ~ .md-overlay {
  opacity: 1;
  visibility: visible;
}

.md-content {
  position: relative;
}

/* .md-effect-1  */
.md-effect-1 {
  .md-content {
    transform: scale(0.7);
    opacity: 0;

    transition: all 0.3s;
  }

  &.md-show {
    .md-content {
      transform: scale(1);
      opacity: 1;
    }
  }
}

/* .md-effect-3  */
.md-effect-2 {
  .md-content {
    transform: translateX(20%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.25, 0.5, 0.5, 0.9);
  }

  &.md-show .md-content {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 如果需要增加其他动画，在这里添加对应的类名即可 */
</style>
