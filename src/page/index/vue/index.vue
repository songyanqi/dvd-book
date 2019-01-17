<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../css/index";
</style>

<template>
  <div class="index" v-cloak v-if="response" :class="{footer: store.entry == 'footer', menu: store.entry == 'menu', block: store.entry == 'block'}">
    <!--<link rel="stylesheet" href="//5e.dvmama.com/book/static3/dist/static/page/index/css/index.css?v=2018-01-03_18:37:25">-->

    <!--系统状态栏-->
    <div class="sys-status" :class="{android: ua.isAndroid()}" ref="sysStatus"></div>

    <!--标题栏-->
    <!--低于5.40版本不显示返回按钮-->
    <dvd-service-com-title :title="$route.meta.title" opacity always-show class="opacity"
                           :back="!ua.isDvdApp()||(ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.4.0') > 0)">
      <!--扫码-->
      <!--<img class="btn-scan" slot="left" :src="require('../img/top-btn-scan.png')"-->
           <!--@click.stop="tj(1);scanClick();">-->
      <!--打卡-->
      <img class="btn-record" slot="right" :src="require('../img/top-btn-record.png')"
           @click.stop="tj(2);goRecordPage();">
    </dvd-service-com-title>

    <!--顶部feedList-->
    <com-feed-list :feed-list="response.data.feedList" :store="store"></com-feed-list>

    <!--底部feedList-->
    <div class="swiper-container record-swiper" ref="recordSwiper">
      <div class="swiper-wrapper">
        <!--热门feedList-->
        <div class="swiper-slide" v-if="response.data.hotFeedList">
          <keep-alive>
            <com-feed-list :feed-list="response.data.hotFeedList" :store="store"></com-feed-list>
          </keep-alive>
        </div>
        <!--我的feedList-->
        <div class="swiper-slide" v-if="response.data.mineFeedList">
          <keep-alive>
            <com-feed-list :feed-list="response.data.mineFeedList" :store="store"></com-feed-list>
          </keep-alive>
        </div>
      </div>
    </div>

    <!--底部tab-->
    <!--<dvd-service-com-footer active="book"></dvd-service-com-footer>-->

    <!--返回顶部-->
    <!--<dvd-service-com-go-page-top></dvd-service-com-go-page-top>-->
  </div>
</template>

<script>
  export default require('../js/index.js').default;
</script>
