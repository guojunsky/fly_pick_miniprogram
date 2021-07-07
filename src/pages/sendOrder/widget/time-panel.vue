<template>
  <div class="time">
    <div class="time_sd">
      <div class="time_row" :class="{'time_row-on':index===navIndex}" v-for="(item,index) in navList" :key="index"
           @click="changeNavIndex(index)">{{ item.name }}
      </div>
    </div>
    <div class="time_mn">
      <template v-for="(group,index) in tabList">
        <div class="time_list" :key="index" v-if="navIndex === index">
          <div class="time_row" :class="{'time_row-on':idx===currentIndex}" v-for="(item,idx) in group" :key="idx"
               @click="changeCurrentIndex(idx)">
            {{ item.name }}
            <div class="icon-checked" v-if="currentIndex===idx"></div>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: "time-panel",
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      navList: [],
      navIndex: 0,
      tabList: [],
      currentIndex: -1
    }
  },
  computed: {
    pickupConfig() {
      return this.$store.state.sendOrder.pickupConfig
    }
  },
  watch: {
    pickupConfig() {
      this.initData()
    },
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      const {pickUpConfig} = this.pickupConfig || {}
      if (!pickUpConfig) return
      const {pickUpStart, pickUpEnd} = pickUpConfig
      if (!pickUpStart || !pickUpEnd) return []

      // const date = dayjs().format('YYYY-MM-DD')

      const pad2 = (n) => {
        return n < 10 ? '0' + n : n
      }
      const createNav = (name, d) => {
        return {name, value: d.format('YYYYMMDD')}
      }
      const createRow = (hour, name) => {
        const cur = pad2(hour)
        const next = pad2(hour + 1)
        return {name: name || `${cur}:00-${next}:00`, value: [cur + '00', next + '00']}
      }

      const createDayList = (start, end) => {
        let list = []

        for (let i = start; i < end; ++i) {
          list.push(createRow(i))
        }
        return list
      }

      const currentHour = new Date().getHours()

      const start = parseInt(pickUpStart.split(':')[0], 10)
      const end = parseInt(pickUpEnd.split(':')[0], 10)


      // 生成列表
      const tabList = []
      const navList = []
      if (currentHour < end && currentHour > start ) {
        tabList.push([
          createRow(currentHour, '最近一小时'),
          ...createDayList(currentHour + 1, end),
        ])
        navList.push(createNav('今天', dayjs()))
      }else if(currentHour < start){
        tabList.push(createDayList(start, end))
        navList.push(createNav('今天', dayjs()))
      }
      const fullList = createDayList(start, end)

      tabList.push(fullList)
      tabList.push(fullList.concat())

      navList.push(createNav('明天', dayjs().add(1, 'days')))
      navList.push(createNav('后天', dayjs().add(2, 'days')))

      this.tabList = tabList
      this.navList = navList
    },
    changeNavIndex(index) {
      this.navIndex = index
      this.changeCurrentIndex(0)
    },
    changeCurrentIndex(idx) {
      this.currentIndex = idx
      const {value: date, name: dateName} = this.navList[this.navIndex]
      const {value: time, name: timeName} = this.tabList[this.navIndex][this.currentIndex]
      const str = dateName + ' ' + timeName
      const [begin, end] = time
      this.$emit('input', {date, str, begin, end})
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/styles/mixins";

.time {
  display: flex;
  min-height: rem(600);
  margin: rem(36) rem(-32) rem(-32);
  border-top: rem(1) solid #E9E9E9;

  &_sd {
    flex: 1;
    background: #EFEFEF;
  }

  &_mn {
    flex: 1;

    background: #fff;
  }

  &_list {

  }

  &_row {
    position: relative;
    line-height: rem(45+52);
    font-size: rem(32);
    font-weight: 400;

    text-align: center;
    color: #343847;

    &-on {
      color: #056BF1;
      background-color: #fff;
    }

  }
}

.icon-checked {
  position: absolute;
  top: rem(35);
  right: rem(40);
  @include image-bg(rem(30), rem(24), url('../../../assets/images/icon/checked_line.png'))
}
</style>
