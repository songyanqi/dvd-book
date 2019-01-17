<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../css/card_achievement";
</style>

<template>
  <div class="card_achievement" v-cloak v-if="response && response.data">
    <!--标题-->
    <dvd-service-com-title :title="$route.meta.title" back :home="!ua.isDvdApp()" :home-img="require('../../../common/img/title-home.png')" home-href="/book/router.html#/"></dvd-service-com-title>
    <div class="achievement-head">
      <div class="head-wrapper">
        <div class="head-item">
          <p class="item-title">参与打卡</p>
          <p class="item-detail">第<span>{{response.data.joinDays?response.data.joinDays:0}}</span>天</p>
        </div>
        <div class="head-item">
          <p class="item-title">坚持打卡</p>
          <p class="item-detail">第<span>{{response.data.signDays?response.data.signDays:0}}</span>天</p>
        </div>
      </div>
    </div>
    <!--月视图-->
    <monthly-view :transresponse="response"></monthly-view>
    <div class="activity" v-if="response.data.activity.type == 2">
      <p class="activity-title">我参加的打卡活动</p>
      <ul>
        <li class="activity-item" v-for="(item,index) in response.data.activity.list" @click="open('actDetail',item.id)">
          <img :src="item.imageUrl" class="activity-pic"/>
          <div class="activity-detail" v-if="item.actStatus == 1">
            <p class="detail-title"><span v-if="item.joinDays">已加入<span class="special">{{item.joinDays}}</span>天</span><span v-if="item.actSignDays > 0">,坚持<span class="special">{{item.actSignDays}}</span>天</span></p>
            <a class="activity-btn" v-if="item.signStatus == 1" @click.stop="tip">已打卡</a>
            <a class="activity-btn act" v-if="item.signStatus == 2" @click.stop="open('card',item.id)">打卡</a>
          </div>
          <p class="activity-detail activity-end" v-if="item.actStatus == 2">活动已结束</p>
        </li>
      </ul>
    </div>
    <div class="activity" v-if="response.data.activity.type == 1">
      <p class="activity-title">为你推荐的打卡活动</p>
      <ul>
        <li class="activity-item" v-for="(item,index) in response.data.activity.list" @click="open('actDetail',item.id)">
          <img :src="item.imageUrl" class="activity-pic"/>
          <div class="activity-detail">
            <!--<p class="detail-title"><span class="special">XX</span>人已加入</p>-->
            <a class="activity-btn act">加入</a>
          </div>
        </li>
      </ul>
    </div>
    <!--返回顶部-->
    <!--<com-to-top-icon></com-to-top-icon>-->
  </div>
</template>

<script>
  export default require('../js/card_achievement.js').default;
</script>
