<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../css/card_content_detail";
</style>

<template>
  <div class="card_content_detail" v-cloak v-if="response && response.data" :class="{offline: response.data.status == 0}">
    <!--标题-->
    <dvd-service-com-title :title="$route.meta.title" back v-if="(response.data.delStatus == 1 || response.data.status != 0) && response.code == 0"
                           :home="!ua.isDvdApp()" :home-img="require('../../../common/img/title-home.png')" home-href="/book/router.html#/">
      <a slot="right">
        <i class="delete-icon" v-if="response.data.delStatus == 1" @click="deleteAct"></i>
        <i class="share-icon" v-else @click="share"></i>
      </a>
    </dvd-service-com-title>

    <!--非本人查看已下线打卡内容-->
    <div class="non-user" v-if="response.data.delStatus != 1 && response.data.status == 0 && response.code == 0">
      <dvd-service-com-title title="打卡活动" back></dvd-service-com-title>

      <div class="tip">
        <img :src="require('../img/no_find.png')" class="tip-pic">
        <p class="tip-text">内容违规已下线</p>
        <p class="tip-text">到别处看看吧</p>
      </div>
    </div>
    <!--非本人查看已下线打卡内容结束-->

    <!--本人已删除打卡内容-->
    <div class="non-user" v-if="response.code != 0">
      <dvd-service-com-title title="打卡活动" back></dvd-service-com-title>

      <div class="tip">
        <img :src="require('../img/no_find.png')" class="tip-pic">
        <p class="tip-text">内容已删除</p>
        <p class="tip-text">到别处看看吧</p>
      </div>
    </div>
    <!--本人已删除打卡内容-->

    <!--打卡内容-->
    <div class="record" v-cloak v-if="(response.data.delStatus == 1 || response.data.status != 0) && response.code == 0">
      <!--打卡标题-->
      <div class="title">
        <!--头像-->
        <img class="head" v-lazy="response.data.avatar || defaultAvatar">
        <!--标题内容-->
        <span class="info">
            <!--第一行标题内容-->
            <div class="top">
              <span class="nickname">{{response.data.nickName}}</span>
              <span class="time">{{response.data.createTime}}</span>
            </div>
          <!--第二行标题内容-->
            <div class="bottom">
              <span class="day">第{{response.data.signInDaySum}}天</span>
              <span class="activity" @click="open(response.data.actId)">#{{response.data.actTitle}}#</span>
              <!--<a :href="response.data.content"><span class="activity">{{response.data.actTitle}}</span></a>-->
            </div>
      </span>
      </div>
      <!--打卡文字-->
      <div class="words" v-if="response.data.content" v-html="security.filterXsshtml(response.data.content)">
        <!--<template>{{response.data.content}}</template>-->
      </div>
      <!--打卡图片-->
      <div class="pics" v-if="response.data.imageUrlList && response.data.imageUrlList.length > 0">
        <img class="pic" v-for="(img, i) in response.data.imageUrlList" v-if="i < 9" v-lazy="img" @click="show(i)">
      </div>
      <!--打卡按钮-->
      <div class="btns">
        <!--点赞-->
        <span class="praise" @click="prise" :class="{prised: response.data.praised == 1}">
            <i></i><span>{{priseCount}}</span>
          </span>
        <!--分享-->
        <span class="share" @click="share">
            <i></i><span>{{shareCount}}</span>
          </span>
      </div>

      <!--违规失效-->
      <div class="invalid" v-if="response.data.status == 0">
        <img :src="require('../img/invalid.png')"><span>内容违规已下线</span>
      </div>

      <!--评论-->
      <div class="comment">
        <p class="comment-title">全部评论 <span class="sub-title">({{commentNum}})</span></p>
        <ul v-if="comment.length != 0">
          <li class="comment-item" v-for="(item,i) in comment">
            <div v-if="item.userId == userId" @click="deleteComment(item.id,i)">
              <div class="item-detail">
                <img class="comment-pic" :src="item.avatar || defaultAvatar">
                <span class="name">{{item.nickname}}</span>
                <span class="my-comment">我的评论</span>
                <span class="time">{{item.createTime}}</span>
              </div>
              <!--<p class="item-text">{{item.content}}</p>-->
              <div v-html="item.content" class="item-text"></div>
            </div>
            <div v-else>
              <div class="item-detail">
                <img class="comment-pic" :src="item.avatar || defaultAvatar">
                <span class="name">{{item.nickname}}</span>
                <span class="time">{{item.createTime}}</span>
              </div>
              <!--<p class="item-text">{{item.content}}</p>-->
              <div v-html="item.content" class="item-text"></div>
            </div>
          </li>
        </ul>
        <div v-if="comment.length == 0" class="no-comment">
          <img :src="require('../img/no_find.png')" class="no-comment-pic">
          <p class="no-comment-text">没有过评论哦</p>
          <p class="no-comment-text">马上来评论吧</p>
        </div>
      </div>
      <!--返回顶部-->
      <!--<com-to-top-icon></com-to-top-icon>-->
    </div>
    <!--分页效果图-->
    <div v-if="loading && (response.data.delStatus == 1 || response.data.status != 0) && response.code == 0" class="no_more">
      正在加载更多数据
      <img src="//9i.dvmama.com/free/loading_03252.svg" />
    </div>
    <div v-if="no_more && (response.data.delStatus == 1 || response.data.status != 0) && response.code == 0" class="no_more no_moreStyle">
      <span>已经到底啦</span>
    </div>

    <!--底部评论输入框-->
    <div class="comment-input" v-if="(response.data.delStatus == 1 || response.data.status != 0) && response.code == 0">
      <div class="text-wrapper">
        <textarea type="text" placeholder="打卡内容已下线，不可评论" maxlength="500" class="text" v-model="commentContent" v-if="response.data.status == 0"></textarea>
        <textarea type="text" placeholder="打卡不容易，希望你鼓励" maxlength="500" class="text" id="conmment-content" v-model="commentContent" v-else></textarea>
      </div>
      <a class="comment-btn" @click="addComment()">评论</a>
    </div>
    <p v-if="showPrisedTip == 1" class="prised-tip">已点赞</p>
  </div>
</template>

<script>
  export default require('../js/card_content_detail.js').default;
</script>
