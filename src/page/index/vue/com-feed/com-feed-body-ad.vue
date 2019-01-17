<!--运营广告位，不够2项不展示-->
<template>
  <div class="com-feed-body-ad" v-if="d.dataList && d.dataList.length >= 2">
    <img :src="item.imageUrl" :style="{height: d.height / 100 + 'rem'}" v-for="(item, i) in d.dataList"
         @click="store.entry !== undefined ? native.Browser.open({url: item.command.content}) : (window.location = item.command.content);">
  </div>
</template>

<script>
  import util from 'dvd-service-js-util';
  import native from 'dvd-service-js-native';

  export default {
    components: {},
    props: {
      // title || body 中的数据
      d: {
        type: Object,
        default: null,
      },
      // title || body 中的数据
      store: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        // 全局变量
        window,
        document,
        // 模块变量
        util,
        native,
      }
    },
    computed: {},
    created() {
    },
    mounted() {
    },
    methods: {},
    filters: {},
    watch: {},
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";

  .com-feed-body-ad {
    font-size: 0;
    white-space: nowrap;
    /*padding-bottom: r(10);*/
    background-color: white;
    &:last-of-type {
      padding-bottom: r(20);
    }
    img {
      width: 50%;
      vertical-align: middle;
    }
  }
</style>
