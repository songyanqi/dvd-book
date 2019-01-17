<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../css/good_book_reading";
</style>

<template>
  <div class="good_book_reading" v-cloak v-if="response">
    <!--标题-->
    <dvd-service-com-title :title="$route.meta.title" back
                           :share="ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') < 0"
                           :home="!ua.isDvdApp()" :home-img="require('../../../common/img/title-home.png')" home-href="/book/router.html#/">
      <a slot="right" v-if="ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') >= 0">
        <i class="share-icon" @click="shareAdd()"></i>
      </a>
    </dvd-service-com-title>

      <div class="wrapper" v-for="(item,index) in dataList">
        <div class="goodsList">
          <div class="left" @click.stop="toActivityMessage(item)">
            <p><span class="icon"><i
              :class="{'iconBg': date.format(item.startTime*1000, 'MM-dd') == date.format(sysTime*1000, 'MM-dd')}">{{date.format(item.startTime * 1000, 'MM-dd')}}</i></span><span
              class="title">{{item.title}}</span></p>
            <div class="content">{{item.recommendTitle}}</div>
            <!--收听信息-->
            <div class="listen">
              <i class="num"></i><span>{{item.listenedNum}}人在听</span>
              <i class="split"></i>
              <!--毫秒数转化为分钟数-->
              <i class="time"></i><span v-text="timeFormat(item.time)"></span>
            </div>
          </div>
          <div class="right" @click.stop="toPlaying(item)">
            <img :src="item.cover" alt="" class="right-pic">
            <!--播放状态-->

            <span v-if="item.playing === true"><img src="../img/read-body-pause.png" alt=""></span>
            <span v-else><img src="../img/read-body-play.png" alt=""></span>

          </div>
        </div>
        <!--打卡按钮-->
        <div class="btns">
          <!--点赞-->
          <span class="praise">
              <img src="../img/praise.png" v-if="item.isFavored ==0 " @click="getPraise(item,index)">
              <img src="../img/praised.png" @click="noPraise()" v-else>
              <span class="num">{{item.favorNum}}</span>
          </span>
          <i class="v-split"></i>
          <!--评论-->
          <span class="cmt" @click="toComment(item)">
              <img src="../img/cmt.png"><span class="num">{{item.commentNum}}</span>
          </span>
          <i class="v-split"></i>
          <!--分享-->
          <span class="share" @click="shareCard(item,index)">
              <img src="../img/share.png"><span class="num">{{item.shareNum}}</span>
          </span>
        </div>
        <!--padding线 -->
        <div class="pad-line"></div>

      </div>
      <!--分页效果图-->
      <div v-show="loading" class="no_more">
        正在加载更多数据 <img src="//9i.dvmama.com/free/loading_03252.svg">
      </div>
      <div v-show="no_more" class="no_more no_moreStyle">
        <span>没有更多了～</span>
      </div>

    <!--返回顶部-->
    <dvd-service-com-go-page-top></dvd-service-com-go-page-top>
  </div>
</template>

<script>
  export default require('../js/good_book_reading.js').default;
</script>
