<!--焦点图-->
<template>
  <div class="com-feed-body-banner"
       :style="{backgroundImage: 'url('+d.imageUrl+')'}"
       @click="go(d.command.content)">
    <!--加入人数-->
    <div class="join-num">已有{{d.top && d.top.totalNum}}位妈妈加入小书库</div>
    <!--加入动态-->
    <div class="swiper-container join-scroll" v-if="d.top">
      <div class="swiper-wrapper">
        <template v-for="(joiner, i) in d.top.dataList">
          <div class="swiper-slide"></div>
          <div class="swiper-slide"><span class="text">{{joiner.nickName}}刚刚加入了小书库</span></div>
        </template>
      </div>
    </div>
    <!--&lt;!&ndash;按钮&ndash;&gt;-->
    <!--<template v-if="d.status === '1'">-->
      <!--&lt;!&ndash;已加入，已领取&ndash;&gt;-->
      <!--<div class="btn-enter" v-if="d.getStatus === '1'">-->
        <!--<span class="text">进入小书库</span><img src="./img/banner-btn-enter.png">-->
      <!--</div>-->
      <!--&lt;!&ndash;已加入，未领取&ndash;&gt;-->
      <!--<div class="btn-receive" v-else>-->
        <!--<span class="text">领取本月童书</span><img src="./img/banner-btn-enter.png">-->
      <!--</div>-->
    <!--</template>-->
    <!--&lt;!&ndash;未加入&ndash;&gt;-->
    <!--<div class="btn-join" v-else>-->
      <!--<span class="text">立即加入</span><img src="./img/banner-btn-join.png">-->
    <!--</div>-->

    <!--已加入，已领取-->
    <div class="btn-enter" v-if="d.status === '1'">
      <span class="text">进入小书库</span><img src="./img/banner-btn-enter.png">
    </div>
    <!--未加入-->
    <div class="btn-join" v-else>
      <span class="text">立即加入</span><img src="./img/banner-btn-join.png">
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

        swiper: null,
      }
    },
    computed: {},
    created() {
    },
    mounted() {
      let ts = this;
      // 用户加入信息轮播，10s后开始
      setTimeout(function () {
        ts.swiper = new Swiper('.join-scroll', {
          // 滑动方向
          direction: 'vertical',
          // 自动播放时间间隔
          autoplay: 2500,
          // false用户拖动后继续自动滑动
          autoplayDisableOnInteraction: false,
          // 每次滑动的动画时间
          speed: 500,
          // 每个swiper-slide之间的间距
          spaceBetween: 3,
          // 禁止用户拖动
          simulateTouch: false,
          // 循环，播放到最后继续滚动，而不是突然反方向滚动到第一个
          loop: true,
        });
      }, 2000);
    },
    beforeDestroy() {
      this.swiper = null;
    },
    methods: {
      go(url) {
        this.store.entry !== undefined ? native.Browser.open({url: url}) : (window.location = url);
      }
    },
    filters: {},
    watch: {},
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";


  /* 焦点图 */
  .com-feed-body-banner {
    position: relative;
    height: r(237);
    background-size: 100% 100%;
    box-sizing: border-box;
    padding-top: r(1);
    background-color: white;
    /* 加入人数 */
    .join-num {
      margin: r(16) auto 0;
      @include height(r(17));
      color: #999;
      font-size: r(12);
      text-align: center;
    }
    /* 加入动态 */
    .join-scroll {
      margin: r(5) auto 0;
      text-align: center;
      font-size: 0;
      height: r(14);
      overflow: hidden;
      text-align: center;
      .swiper-slide {
        .text {
          display: inline-block;
          padding: 0 r(5);
          max-width: r(230);
          background: #FFFFFF;
          box-shadow: 0 1px 3px 0 rgba(255, 125, 121, 0.17);
          border-radius: 12px;
          @include height(r(14));
          color: #FF4a7d;
          font-size: r(9);
        }
      }
    }
    /* 按钮 */
    .btn-join, .btn-enter, .btn-receive {
      position: absolute;
      left: r(27);
      bottom: r(45);
      padding: 0 r(15);
      @include height(r(34));
      border-radius: 100px;
      font-size: 0;
      color: white;
      .text {
        vertical-align: middle;
        font-size: r(14);
      }
      img {
        margin-left: r(10);
        vertical-align: middle;
        width: r(18);
      }
    }
    .btn-join {
      background: linear-gradient(to right, #FA6E6E 0%, #FFAB9E 98%);
    }
    .btn-enter, .btn-receive {
      background: linear-gradient(to right, #7777FF 0%, #A975FF 100%);
    }
  }

  /* 安卓hacker */
  .app.android {
    .com-feed-body-banner .btn-join .text,
    .com-feed-body-banner .btn-enter .text,
    .com-feed-body-banner .btn-receive .text {
      line-height: r(16);
    }
    .com-feed-body-banner .join-scroll .text {
      line-height: r(18);
    }
  }
</style>
