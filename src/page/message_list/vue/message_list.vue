<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../css/message_list";
</style>

<template>
  <div class="message_list" v-cloak>
    <!--标题-->
    <dvd-service-com-title :title="$route.meta.title" back>
      <i class="del-icon" slot="right" @click="clear" v-if="list && list.length > 0"></i>
    </dvd-service-com-title>

    <!--暂无消息-->
    <div class="message-box" v-if="pageIndex === -1 && no_more">
      <div class="message-content">
        <img :src="require('../img/no-msg.png')">
        <div class="word">暂无消息~</div>
      </div>
    </div>
    <template v-else>
      <!--消息列表-->
      <div class="message-wapper">
        <div class="wapper" v-for="(item, i) in list" @click="window.location = item.command.content">
          <!--列表-->
          <div class="list-message">
            <div class="left">
              <!-- 用户头像 -->
              <div class="pic">
                <img :src="item.avatar">
              </div>
              <!-- 用户评论与点赞 -->
              <div class="content">
                <p class="content-title">{{item.nickname}}</p>
                <p class="content-parise" v-html="security.filterXsshtml(item.content && item.content.replace(/(<br\/>|<br>)/ig, ' '))"></p>
                <p class="content-time">{{item.time}}</p>
              </div>
            </div>
            <!-- 右侧图片 -->
            <div class="right">
              <img :src="item.imageUrl">
            </div>
          </div>
        </div>
      </div>

      <!--没有更多-->
      <div class="no_more no_moreStyle" v-if="no_more">
        <span>没有更多了～</span>
      </div>
    </template>

    <!--返回顶部-->
    <dvd-service-com-go-page-top></dvd-service-com-go-page-top>
  </div>
</template>

<script>
  export default require('../js/message_list.js').default;
</script>
