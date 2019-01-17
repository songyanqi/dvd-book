<!--打卡活动，包括热门活动&&我的活动-->
<template>
  <div class="com-feed-body-record-act">
    <!--标题-->
    <div class="title">
      <span class="left">{{d.leftTitle}}</span>
      <span class="right" v-if="d.rightTitleInfo"
            @click="store.entry !== undefined ? native.Browser.open({url: d.rightTitleInfo.command.content}) : (window.location = d.rightTitleInfo.command.content);">
        <span class="text">{{d.rightTitleInfo.title}}</span>
        <!--<img v-lazy="./img/record-achieve.png">-->
        <img :src="d.rightTitleInfo.icon">
      </span>
    </div>

    <!--列表-->
    <div class="swiper-container" :key="window.Date.now()">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(act, i) in d.dataList" v-if="i < 6"
             @click="store.entry !== undefined ? native.Browser.open({url: act.command.content}) : (window.location = act.command.content);">
          <img class="pic" v-lazy="act.imageUrl">
          <div class="status">
            <!--热门活动-->
            <template v-if="act.joinStatus">
              <span class="text" v-if="act.joinStatus === '1'">我已加入</span>
              <i class="v-split"
                 v-if="act.joinStatus === '1' && act.joinCount && window.parseInt(act.joinCount) > 0"></i>
              <span class="text" v-if="act.joinCount && window.parseInt(act.joinCount) > 0">{{act.joinCount}}人加入</span>
            </template>
            <!--我参加的活动-->
            <template v-else-if="act.signStatus">
              <span class="text" v-if="act.actStatus === '1'">活动已结束</span>
              <template v-else-if="act.signStatus === '1'">
                <img class="signed" src="./img/record-act-signed.png"><span class="text">已打卡</span>
              </template>
              <span class="text" v-else>未打卡</span>
            </template>
          </div>
        </div>
        <div class="swiper-slide all" v-if="d.moreInfo"
             @click="store.entry !== undefined ? native.Browser.open({url: d.moreInfo.command.content}) : (window.location = d.moreInfo.command.content);">
          <div class="text">查看<br/>全部</div>
        </div>
      </div>
    </div>

    <!--水平分割线-->
    <div class="h-split"></div>
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
      this.initSwiper();
    },
    beforeDestroy() {
      this.swiper = null;
    },
    methods: {
      initSwiper(){
        // 打卡活动轮播
        this.swiper = new Swiper(this.$el.querySelector('.swiper-container'), {
          slidesPerView: 'auto',
          freeMode: true,
        });
      }
    },
    filters: {},
    watch: {
      d() {
        this.$nextTick(this.initSwiper);
      }
    },
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";

  .com-feed-body-record-act {
    background-color: #fcfcfc;
    padding-top: r(10);
    /* 打卡内容-活动标题 */
    .title {
      padding: 0 r(20);
      .left {
        font-size: r(14);
        @include height(r(20));
      }
      .right {
        float: right;
        position: relative;
        @include height(r(17));
        * {
          vertical-align: middle;
        }
        .text {
          font-size: r(12);
          color: #666;
          position: relative;
          top: r(2);
        }
        img {
          margin: r(-2) 0 0 r(5);
          width: r(12);
        }
      }
    }

    /* 打卡内容-活动内容 */
    .swiper-container {
      margin-top: r(10);
      width: 100%;
      .swiper-wrapper {
        width: 100%;
      }
      .swiper-slide {
        $white-space: r(5);
        padding: 0 $white-space;
        width: r(180);
        position: relative;
        .pic {
          width: r(180);
          height: r(90);
          border-radius: r(4);
        }
        .status {
          @include height(r(17));
          color: white;
          text-align: center;
          position: absolute;
          width: r(180);
          bottom: r(6);
          font-size: 0;
          .v-split {
            width: 1px;
            height: r(11);
            background: #fff;
            display: inline-block;
            margin: 0 r(10);
          }
          .text {
            font-size: r(12);
            font-weight: 500;
            text-shadow: 0 2px 0 rgba(0, 0, 0, 0.10);
          }
          * {
            vertical-align: middle;
          }
          .signed {
            width: r(14);
            margin-right: r(2);
          }
        }
        &:first-of-type {
          margin-left: r(20) - $white-space;
        }
        &:last-of-type {
          margin-right: r(20) - $white-space;
        }
        &.all {
          background: #FFF;
          border: 1px solid #D8D8D8;
          border-radius: 4px;
          font-size: r(12);
          line-height: r(15);
          color: #999;
          width: r(60);
          height: r(90);
          text-align: center;
          margin-left: r(5);
          box-sizing: border-box;
          .text {
            margin-top: r(32);
          }
        }
      }
    }

    /* 水平分割线 */
    .h-split {
      margin: r(20) 0 0 r(20);
      width: r(355);
      height: 1px;
      background: #d8d8d8;
      transform: scaleY(0.5);
    }
  }
</style>
