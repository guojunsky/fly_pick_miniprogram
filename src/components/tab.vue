<template>
  <div class="tab" :class="{'tab-login':cTag}">
    <div class="tab-item" :class="{'tab-item-on':index===currentIndex}"
         v-for="(tab,index) in tabList"
         @click="changeTab(index)"
         :key="index">{{ tab }}
    </div>
  </div>
</template>

<script>
export default {
  name: "tab",
  props: {
    currentIndex: {
      type: Number,
      default: 0
    },
    tabList: {
      type: Array,
      default: () => {
        return []
      }
    },
    cTag: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      // currentTabIndex: 0
    }
  },
  methods: {
    changeTab(index) {
      if(this.disabled)return ;
      this.$emit('update:currentIndex', index)
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/styles/mixins";

.tab {
  margin: rem(30) 0;
  display: flex;

  &-item {
    flex: 1;
    text-align: center;
    position: relative;

    font-size: rem(30);
    font-weight: 400;
    color: #343847;
    line-height: rem(62);

    &-on {
      color: #046CFC;

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: rem(50);
        height: rem(6);
        background: linear-gradient(180deg, #119CFF 0%, #0060DC 100%);
        border-radius: rem(3);
      }
    }
  }


}

.tab-login {
  .tab-item {
    font-size: rem(32);
    padding-bottom: rem(10);
  }
  .tab-item-on:after {
    width: rem(260);
  }
}

</style>
