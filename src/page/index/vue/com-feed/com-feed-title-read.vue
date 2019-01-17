<!--精读-->
<template>
  <div class="com-feed-title-read">
    <!--左侧-->
    <span class="left">
      <img src="./img/title-vline.png"><span class="text">{{d.name}}</span>
    </span>
    <!--右侧-->
    <span class="right" @click="store.entry !== undefined ? native.Browser.open({url: d.command.content}) : (window.location = d.command.content);">
      <span class="text">更多</span><img src="./img/read-title-more.png">
    </span>
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

  /* 精读标题 */
  .com-feed-title-read {
    position: relative;
    padding: 0 r(20);
    font-size: 0;
    height: r(40);
    line-height: r(46);
    background-color: white;
    overflow: hidden;
    .left {
      /*i {
        margin-right: r(5);
        display: inline-block;
        width: r(4);
        height: r(16);
        background: #FF4a7d;
        vertical-align: middle;
        border-radius: 100px;
        position: relative;
        // top: r(-1);
      }*/
      img {
        margin-right: r(5);
        display: inline-block;
        width: r(3);
        height: r(16);
        vertical-align: middle;
        position: relative;
        // top: r(-1);
      }
      .text {
        font-size: r(18);
        vertical-align: middle;
      }
    }
    .right {
      float: right;
      position: relative;
      top: r(1);
      .text {
        font-size: r(14);
        vertical-align: middle;
        color: #999;
      }
      img {
        margin-left: r(5);
        display: inline-block;
        vertical-align: middle;
        width: r(8);
      }
    }
  }

  .app.android{
    .com-feed-title-read .right img {
      position: relative;
      top: r(-2);
    }
    .com-feed-title-read .left .text {
      position: relative;
      top: 1px;
    }
  }
</style>
