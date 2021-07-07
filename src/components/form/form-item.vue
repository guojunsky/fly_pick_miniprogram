<template>
  <div class="form-item">
    <div class="form-item_label" :style="{width:labelWidth}">{{ label }}</div>
    <div class="form-item_mn" :class="['form-item_mn-'+align]">
      <slot></slot>
    </div>
    <div class="icon-arrow-r-grey" v-if="showRight"></div>
  </div>
</template>

<script>
export default {
  name: "form-item",
  props: {
    label: {
      type: String,
      default: ''
    },
    align: {
      type: String,
      default: 'right'
    },
    showRight: {
      type: Boolean,
      default: true
    },
    labelWidth: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins";

.form-item {
  height: rem(100);
  display: flex;
  align-items: center;

  &:not(:last-child) {
    border-bottom: 1px solid #E6E6E6;
  }

  &_label {
    width: rem(130);
    margin-right: rem(17);

    font-size: rem(28);
    font-weight: 400;
    color: #343847;
    line-height: rem(40);
  }

  &_mn {
    display: flex;
    align-items: center;
    flex: 1;

    &-right {
      justify-content: flex-end;
      text-align: right;
    }

    &-left {
      justify-content: flex-start;
      text-align: left;
    }
  }
}

.icon-arrow-r-grey {
  @include image-bg(rem(44), rem(44), url('../../assets/images/icon/arrow_grey.png'))

}
</style>
