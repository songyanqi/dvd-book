<!--打卡动态-->
<template>
  <div class="com-feed-body-record-dynamic">
    <!--水平分割线-->
    <div class="h-split" v-if="d.haveLine === '1' || d.haveLine === 1"></div>
    <com-record :record="d" :is-open="store.entry !== undefined"></com-record>
  </div>
</template>

<script>
  import util from 'dvd-service-js-util';
  import native from 'dvd-service-js-native';

  export default {
    components: {
      'com-record': require('../../../../component/com-record/com-record.vue').default,
    },
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

  .com-feed-body-record-dynamic {
    background-color: #fcfcfc;
    /* 水平分割线 */
    .h-split {
      margin: r(20) 0 0 r(20);
      width: r(355);
      height: 1px;
      background: #d8d8d8;
      transform: scaleY(0.5);
    }
    &:last-of-type {
      .com-record {
        padding-bottom: 0;
      }
    }
  }
</style>
