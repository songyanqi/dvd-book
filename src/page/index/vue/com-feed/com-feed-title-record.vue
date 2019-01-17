<!--打卡-->
<template>
  <div class="com-feed-title-record">
    <div>
      <!--static/fixed转换-->
      <div class="switcher" ref="switcher" :class="{fixed: fixed, footer: store.entry == 'footer', menu: store.entry == 'menu', block: store.entry == 'block'}">
        <!--左侧-->
        <span class="left">
          <img src="./img/title-vline.png"><span class="text">{{d.name}}</span>
        </span>
        <!--右侧-->
        <span class="right">
          <span class="text" :class="{active: !store.recordType || !d.rightName2}" @click="changeSelect(false);" v-if="d.rightName1">热门</span>
          <template v-if="d.rightName2">
            <i></i>
            <span class="text" :class="{active: store.recordType && d.rightName2}" @click="changeSelect(true);">我的</span>
          </template>
        </span>
      </div>
    </div>
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
        // 内部变量
        fixed: false,
      }
    },
    computed: {},
    created() {
    },
    mounted() {
      let ts = this;

      let statusHeight = 0;
      if(ts.store.entry == 'footer') {
        statusHeight = 20;
      } else if(ts.store.entry == 'menu'){
        statusHeight = 40;
      }

      // 吸顶效果
      let offsetTop = util.getOffsetTop(ts.$refs.switcher.parentNode) - 44 - statusHeight;
      setTimeout(function(){
        offsetTop = util.getOffsetTop(ts.$refs.switcher.parentNode) - 44 - statusHeight;
      }, 1000);
      window.addEventListener('scroll', function () {
        // 吸顶
        if (util.getDocumentScrollTop() > offsetTop) {
          ts.fixed = true;
        } else {
          ts.fixed = false;
        }
      }, false);
    },
    methods: {
      changeSelect(value) {
        this.store.bus.$emit('changeRecordType', value);
        if(value) {
          window.sessionStorage.setItem(location.pathname + location.search + location.hash + '_recordType', 1);
        } else {
          window.sessionStorage.removeItem(location.pathname + location.search + location.hash + '_recordType');
        }
      }
    },
    filters: {},
    watch: {},
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";

  /* 打卡标题 */
  .com-feed-title-record {
    height: r(40);
    background-color: white;
    overflow: hidden;
    padding-top: r(15);
    .switcher {
      position: relative;
      padding: 0 r(20);
      font-size: 0;
      height: r(40);
      line-height: r(46);
      /*border-bottom: 1px solid #F4F4F4;*/
      background: white;
      width: r(375);
      box-sizing: border-box;
      max-width: 640px;
      border-bottom: 1px solid #F4F4F4 !important;
      &.fixed {
        position: fixed;
        top: 44px;
        z-index: 2;
        background-color: rgba(255, 255, 255, 0.95);
        /*border-bottom: 1px solid #F4F4F4 !important;*/
        &.footer {
          top: 44px + 20px;
        }
        &.menu {
          top: 44px + 40px;
        }
      }
      .left {
        /*i {
          margin-right: r(5);
          display: inline-block;
          width: r(4);
          height: r(17);
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
          position: relative;
          font-size: r(14);
          vertical-align: middle;
          color: #999;
          &.active {
            color: #666;
            &:after {
              content: '';
              position: absolute;
              bottom: r(-8);
              left: 0;
              display: block;
              width: 100%;
              height: r(3);
              background: #FF4a7d;
            }
          }
        }
        i {
          margin: 0 r(15);
          display: inline-block;
          vertical-align: middle;
          width: 1px;
          height: r(18);
          background: #D8D8D8;
        }
      }
    }
  }

  .app.android{
    .com-feed-title-record .switcher .left .text {
      position: relative;
      top: 1px;
    }
  }
</style>
