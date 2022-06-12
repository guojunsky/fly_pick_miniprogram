<template>
  <div class="container">
    <tab class="container_hd" :tabList="tabList" :currentIndex.sync="currentIndex"></tab>
    <div class="container_bd">
      <addressPage :key="currentIndex" :fromFba="true" :isCheckModeFba="false" pageTypeFba="1" v-if="currentIndex===0"></addressPage>
      <addressPage :key="currentIndex" :fromFba="true" :isCheckModeFba="false" pageTypeFba="2" v-else-if="currentIndex===1"></addressPage>
    </div>
  </div>
</template>

<script>
import tab from '../../components/tab'
import addressPage from './index'

export default {
  name: "total",
  components: {tab, addressPage},
  data() {
    return {
      currentIndex: 0,
      tabList: ['国内地址', '国际地址']
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  //height: calc(100vh - 44px);
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &_bd {
    flex: 1;
    overflow: auto;
  }
}
</style>
