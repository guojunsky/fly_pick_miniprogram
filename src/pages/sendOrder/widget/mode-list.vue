<template>
  <div class="list">
    <div class="item" :class="{'item-on':currentIndex===index}" v-for="(item, index) in list" :key="index"
         @click="chooseItem(index)">
      <div class="item_tt">{{ item.name }}</div>
      <div class="icon-checked" v-if="currentIndex===index"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "mode-list",
  props: {
    value: {
      type: Number,
      default: -1,
    },
    list: {
      type: Array,
      default: () => {
        return []
      }
    },
	listactive:{
		type:Boolean,
		default:false
	}
  },
  data() {
    return {
      currentIndex: this.value,
    }
  },
  methods: {
    chooseItem(index) {
      this.currentIndex = index
      this.$emit('input', this.list[index])
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/styles/mixins";

.list {
  margin-top: rem(49);
  padding-bottom: rem(32);
  height: auto;
  padding-bottom: 300rpx;
}
.list.acitve {
  margin-top: 20rpx;
  height: auto;
  padding-bottom: 300rpx;
}


.item {
  display: flex;
  align-items: center;
  justify-content: space-between;


  font-size: rem(32);
  font-weight: 400;
  color: #343847;
  line-height: rem(45 + 36);

  &-on {
    color: #056BF1;
  }

}

.icon-checked {
  @include image-bg(rem(30), rem(24), url('../../../assets/images/icon/checked_line.png'))
}
</style>
