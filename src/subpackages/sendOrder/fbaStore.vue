<template>
  <div class="page-fba">
    <div class="tab">
      <div class="tab-item" :class="{'tab-item-on':index===currentTabIndex}" v-for="(tab,index) in tabList"
           @click="currentTabIndex = index"
           :key="index">{{ tab }}
      </div>
    </div>

    <template v-if="currentTabIndex === 0">
      <div class="page-fba_wrap">
        <div class="search-wrap">
          <div class="search">
            <div class="search_icon"></div>
            <input class="search_input" v-model="searchKey" placeholder="快速搜索仓库号" @change="handleFBAChange"/>
          </div>
        </div>
        <div class="page-fba_bd">
          <div class="page-fba_sd">
            <div class="side-item " :class="{'side-item-on':name === currentCountry}"
                 v-for="name in Object.keys(fbaCountryMap)"
                 @click="currentCountry = name"
                 :key="name">
              {{ name }}
            </div>
          </div>
          <div class="page-fba_mn">
            <div class="main-item" v-for="(item,index) in fbaCountryMap[currentCountry]" :key="index"
                 @click="chooseFbaCountry(item)">{{
                item.code
              }}
            </div>
          </div>
        </div>
      </div>

    </template>
    <template v-else>
      <div class="address-wrap">
        <addressIndex :fromFba="true" :style="{width:'100%'}"></addressIndex>
      </div>

    </template>
  </div>
</template>

<script>
import {getFbaStoreList} from '@/api/config'
import addressIndex from '@/subpackages/address/index'

export default {
  name: "fbaStore",
  components: {
    addressIndex
  },
  data() {
    return {
      fbaCountryMap: {},
      tabList: ['亚马逊FBA', '海外仓'],
      currentTabIndex: 0,
      currentCountry: '',
      searchKey: '',
      allList: []
    }
  },
  created() {
    this.getList()
  },

  methods: {
    handleFBAChange() {
      if(this.searchKey){
        let val = this.searchKey.toUpperCase()
        let list = this.allList.filter(item => {
          return item.code.indexOf(val) > -1
        })
        this.handleList(list)
      }else {
        this.handleList(this.allList)
      }
    },
    async getList() {
      const {list} = await getFbaStoreList()
      this.allList = list;
      this.handleList(list)

    },
    handleList(list) {
      if (Array.isArray(list)) {

        const countryMap = list.reduce((acc, row) => {
          const {country} = row
          if (!acc[country]) {
            acc[country] = []
          }
          acc[country].push(row)
          return acc
        }, {})

        this.fbaCountryMap = countryMap
        this.currentCountry = Object.keys(countryMap)[0]
      }
    },
    chooseFbaCountry(item) {
      if (!item) return
      // fbaId
      let addrs = {
        ...item,
        fbaId: item.code,
        companyName: "",
        defaultAt: 0,
        ext: '',
        name: `${item.country} ${item.code}`,
        phone: '',
        code: "",
      }

      this.$store.commit('address/setSelectAboardAddress', addrs)
      uni.navigateBack()
    }

  }
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/mixins";

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

.search {
  width: rem(686);
  margin: 0 auto;
  height: rem(65);
  background: #FFFFFF;
  border-radius: rem(33);
  display: flex;
  align-items: center;
  padding-left: rem(24);

  &-wrap {
    padding: rem(15) 0;
    background: #F7F8F9;
  }

  &_icon {
    margin-right: rem(15);
    @include image-bg(rem(30), rem(29), url('../../assets/images/icon/search.png'))
  }

  &_input {
    flex: 1;

    font-size: rem(24);
    font-weight: 400;
    color: #343847;
  }


}

.page-fba {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &_wrap {
    flex: 1;
  }

  &_bd {
    height: calc(100vh - 133px);
    padding-top: rem(30);
    display: flex;
  }

  &_sd {
    height: 100%;
    width: rem(198);
    background: #F7F8F9;
    overflow: auto;
  }

  &_mn {
    flex: 1;
    height: 100%;
    overflow: auto;
    padding-left: rem(20);
  }
}

.side-item {
  padding-left: rem(32);
  padding-top: rem(30);
  padding-bottom: rem(28);
  font-size: rem(28);
  font-weight: 400;
  color: #343847;
  line-height: rem(40);

  &-on {
    background-color: #fff;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: rem(9);
      margin: auto 0;
      width: rem(5);
      height: rem(60);
      background: linear-gradient(180deg, #119CFF 0%, #0060DC 100%);
      border-radius: rem(3);
    }
  }
}

.main-item {
  width: rem(112);
  height: rem(52);
  float: left;
  margin-right: rem(17);
  margin-bottom: rem(20);
  line-height: rem(52);
  background: #F7F8F9;
  border-radius: rem(4);
  text-align: center;
  @include text-overflow;


  font-size: rem(28);
  font-weight: 400;
  color: #343847;
}

.address-wrap {
  display: flex;
  overflow: auto;
  height: calc(100vh - 65px);
}

</style>
