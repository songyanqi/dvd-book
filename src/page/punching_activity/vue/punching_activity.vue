<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../css/punching_activity";
</style>

<template>
  <div class="punching_activity" v-cloak>
    <!--标题-->
    <dvd-service-com-title :title="$route.meta.title" back :share="ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') < 0"
                           :home="!ua.isDvdApp()" :home-img="require('../../../common/img/title-home.png')" home-href="/book/router.html#/">
      <a slot="right" v-if="ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') >= 0">
        <i class="share-icon" @click="shareAdd()"></i>
      </a>
    </dvd-service-com-title>
    <!--banner-->
    <div class="warp">
      <div class="banner-pic">
        <img :src="actInfo.imgUri" v-if="actInfo.imgUri">
      </div>
      <p class="cont">{{actInfo.actDesc}}</p>

      <!--加入按钮-->
      <div class="box">
        <!--已加入，活动已经结束-->
        <div v-if="dataList.joinStatus && dataList.joinStatus == 1">
          <!--"actStatus":"1",//1:进行中,2:已结束-->
          <div class="joinOver" v-if="actInfo.actStatus == 2">活动已结束</div>
        </div>
        <!--"joinStatus":"1", //1:已加入2:未加入-->
        <!--否则未加入-->
        <div v-else>
          <div v-if="!dataList.loading">
            <!--加入活动-->
            <div class="joinOver" v-if="actInfo.actStatus == 2">活动已结束</div>
            <div class="joinBtn" @click="joinAct(dataList)" v-else>加入</div>
            <!--如果未加入|| 为登录 显示加入状态，但是未登录不显示多少人已经参加活动-->
            <p class="joinNum" v-if="dataList.joinStatus && dataList.joinStatus == 2">{{dataList.joinNum}}人已加入</p>

          </div>
        </div>
      </div>

      <!--周打卡-->
      <div class="noJoinBtn" v-if="dataList.joinStatus && dataList.joinStatus == 1">
        <!--1、已加入但活动结束-->
        <div class="timeLong" v-if="actInfo.actStatus == 2 ">
          <template>
            <p class="first" v-if="dataList.userInfo && dataList.userInfo.actSignDay !=0">
              已加入<span>{{dataList.userInfo.joinDay}}</span>天，坚持<span>{{dataList.userInfo.actSignDay}}</span>天</p>
            <p class="first" v-else>
              已加入<span>{{dataList.userInfo.joinDay}}</span>天</p>
          </template>
          <p class='over'>活动已结束</p>
        </div>

        <!--2、已加入今日已打卡-->
        <div class="timeLong"
             v-else-if="dataList.userInfo && dataList.userInfo.contentId && dataList.userInfo.contentId != -1 ">
          <p class="first">
            已加入<span>{{dataList.userInfo.joinDay}}</span>天，坚持<span>{{dataList.userInfo.actSignDay}}</span>天</p>
          <!--已经打卡弹出是否删除今日打卡记录-->
          <p class="last" @click="toWindow(dataList.userInfo.contentId,newList)">
            <img src="../img/punchTheClock.png" alt="">
            <span>今日已打卡</span>
          </p>
        </div>

        <!--3、已加入但今日未打卡-->
        <div class="timeLong" v-else>
          <p class="first"
             v-if="dataList.userInfo && dataList.userInfo.actSignDay && dataList.userInfo.actSignDay != 0">已加入<span>{{dataList.userInfo.joinDay}}</span>天，坚持<span>{{dataList.userInfo.actSignDay}}</span>天
          </p>
          <p class="first" v-else>已加入<span>{{dataList.userInfo.joinDay}}</span>天</p>
          <!--未打卡跳转到去打卡-->
          <p class="last" @click="toCard()">
            <img src="../img/punchTheClock.png" alt="">
            <span>今日打卡</span>
          </p>
        </div>

        <!--打卡日历-->
        <div class="weekDayBox" @click="goMonthCard()">
          <div class="weekDay">
            <span v-for="(item,index) in weekDay">{{item}}</span>
          </div>
          <div class="weekDate">
            <!--class="flag"-->
            <span v-for="(item,index) in dateDay"
                  :class="{'todayFlag': today == index, 'flag':dateDayArr[index]==1 && today != index, 'dayStyle':dateDayArr[index]==1 && !styleFlag && today == index}">{{item}}</span>
          </div>
          <!--下标点-->
          <div class="flagIndex">
            <!--flagDayBg-->
            <span v-for="(item,index) in dateDay"><i
              :class="{'flagDay': today == index, 'flagDayBg': dateDayArr[index]==1 && !styleFlag && today == index}"></i>{{item}}</span>
          </div>
        </div>
      </div>
    </div>

    <!--打卡标题-->
    <div class="g-record-title">
      <!--static/fixed转换-->
      <div class="switcher" :class="{fixed: fixed, fixedApp:fixedApp}" ref="switcher">
        <!--左侧-->
        <span class="left" v-if="contentTitle.length !=0">
        <i></i>
        <span class="text">动态</span>
      </span>
        <!--右侧-->
        <span class="right">
        <span v-for="(tab,index) in contentTitle">
          <span class="text" :class="{active: isActive == tab.category}" @click="activeChange(tab.category)">{{tab.title}}</span>
          <i v-if="index!=contentTitle.length-1"></i>
        </span>
      </span>
      </div>
    </div>
    <!--底部tab切换-->
    <div class="footerWarp">
      <div class="tabList" v-for="(record, i) in newList">
        <!--首页组件-->
        <div class="g-record-split" v-if="i !== 0"></div>

        <com-record :record="(record.body.activityInfo.actImg = actInfo.imgUri) && record.body" :replace="replace" :act-jump="false"></com-record>
      </div>
      <!--分页效果图-->
      <div v-show="loading" class="no_more" v-if="flag!=0">
        正在加载更多数据 <img src="//9i.dvmama.com/free/loading_03252.svg">
      </div>
      <div v-show="no_more" class="no_more no_moreStyle" v-if="flag!=0">
        <span>没有更多了~</span>
      </div>
    </div>
    <!--判断没有打卡记录展示数据-->
    <div class="myMessage" v-if="flag==0">
      <div class="myMessage-pic">
        <img src="//9i.dvmama.com/free/no_find.png" alt="">
      </div>
      <p>没有打卡记录哦</p>
      <p class="content-bot">马上来打卡吧</p>
    </div>

  </div>
</template>

<script>
  export default require('../js/punching_activity.js').default;
</script>
