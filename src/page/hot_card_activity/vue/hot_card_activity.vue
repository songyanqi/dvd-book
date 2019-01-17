<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../css/hot_card_activity";
</style>

<template>
  <div class="hot_card_activity" v-cloak v-if="dataList">
    <!--标题-->
    <dvd-service-com-title :title="$route.meta.title" back :home="!ua.isDvdApp()" :home-img="require('../../../common/img/title-home.png')" home-href="/book/router.html#/"></dvd-service-com-title>
    <div>
      <div class="wapper">
        <div class="list" v-for="(list,index) in dataList" @click="toActivityMessage(list)">
          <div class="content">
            <div class="left-pic">
              <img :src="list.imageUrl" alt="">
            </div>
            <div class="right-cont" v-if="list.joinStatus && list.joinStatus==1 ">
              <p>已加入<span>{{list.joinDays}}</span>天<span v-if="list.actSignDays != 0">，坚持<span>{{list.actSignDays}}</span>天</span></p>
              <div class="btn Join" >已加入</div>
            </div>
            <div class="right-cont" v-else>
              <p><span>{{list.userNum}}</span>人已加入</p>
              <div class="btn noJoin">加入</div>
            </div>
          </div>
          <!--分割线-->
          <div class="pad-line"></div>
        </div>
      </div>
      <!--分页效果图-->
      <div v-show="loading" class="no_more">
        正在加载更多数据 <img src="//9i.dvmama.com/free/loading_03252.svg">
      </div>
      <div v-show="no_more" class="no_more no_moreStyle">
        <span>没有更多了～</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default require('../js/hot_card_activity.js').default;
</script>
