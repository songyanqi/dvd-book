<!--新消息提示-->
<template>
  <div class="com-feed-body-record-msg" @click="go">
    <div class="box" v-if="parseInt(d.thumbsUpNum) > 0 || parseInt(d.commentNum) > 0">
      新消息：
      <span class="praise" v-if="parseInt(d.thumbsUpNum) > 0">{{d.thumbsUpNum}}条点赞</span>
      <span  class="comment" v-if="parseInt(d.commentNum) > 0">{{d.commentNum}}条评论</span>
    </div>
    <div class="box no-msg" v-else>暂无新消息</div>
  </div>
</template>

<script>
  import util from 'dvd-service-js-util';
  import native from 'dvd-service-js-native';

  export default {
    components: {
      'com-record': require('../../../../component/com-record/com-record.vue').default,
    },
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
      }
    },
    computed: {},
    created() {
    },
    mounted() {
    },
    methods: {
      go() {
        let ts = this;
        this.store.entry !== undefined ? native.Browser.open({url: this.d.command.content}) : (window.location = this.d.command.content);
        window.setTimeout(function(){
          ts.d.thumbsUpNum = 0;
          ts.d.commentNum = 0;
        }, 1000);
      }
    },
    filters: {},
    watch: {},
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";


  /* 卡内容-新消息提示 */
  .com-feed-body-record-msg {
    background-color: #fcfcfc;
    padding-top: r(20);
    text-align: center;
    .box{
      display: inline-block;
      margin: auto;
      padding: 0 r(20);
      @include height(r(30));
      background: #999;
      border-radius: 100px;
      color: white;
      text-align: center;
      .comment {
        /*margin-left: r(10);*/
      }
    }
  }

  /* 安卓hacker */
  .app.android {
    .com-feed-body-record-msg .box{
      line-height: r(34);
    }
  }
</style>
