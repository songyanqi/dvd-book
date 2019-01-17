<!--打卡信息组件，使用位置：首页、打卡活动详情页-->
<template>
  <!--打卡信息-->
  <div class="com-record" v-if="record" @click="open(record)">
    <!--打卡标题-->
    <div class="title">
      <!--头像-->
      <img class="head" v-lazy="record.avatar">
      <!--标题内容-->
      <span class="info">
      <!--第一行标题内容-->
      <div class="top">
        <span class="nickname">{{record.nickName}}</span>
        <span class="time">{{record.time}}</span>
      </div>
        <!--第二行标题内容-->
      <div class="bottom">
        <span class="day">第{{record.dayCount}}天</span>
        <span class="activity"  @click.stop="goAct(record.activityInfo.command && record.activityInfo.command.content || '/book/router.html#/punching_activity?actId='+record.activityInfo.actId)">
          #{{record.activityInfo.name}}#
        </span>
      </div>
    </span>
    </div>
    <!--打卡文字-->
    <div class="words" v-if="record.content">
      <!--{{record.content.substr(0, 65)}}<template v-if="record.content.length > 65">...</template>-->
      <div v-html="security.filterXsshtml(record.content.substr(0, 65) + (record.content.length > 65 ? '...' : ''))"></div>
      <div class="all" v-if="record.content.length > 65">查看全部</div>
    </div>
    <!--打卡图片-->
    <div class="pics" v-if="record.imageUrlList && record.imageUrlList.length > 0">
      <template v-for="(img, i) in record.imageUrlList">
        <img class="pic" v-lazy="img.imageUrl" @click.stop="viewBigPic(i, record.imageUrlList, record.bigImageUrlList);">
        <br v-if="(i + 1) % 3 === 0"/>
      </template>
    </div>
    <!--打卡按钮-->
    <div class="btns">
      <!--点赞-->
      <span class="praise" @click.stop="recordPraise(record)">
        <img src="./img/praised.png" v-if="record.praised === '1'">
        <img src="./img/praise.png" v-else>
        <span class="num">{{record.thumbsUpNum}}</span>
      </span>
      <i class="v-split"></i>
      <!--评论-->
      <span class="cmt" @click.stop="recordCmt(record)">
        <img src="./img/cmt.png"><span class="num">{{record.commentNum}}</span>
      </span>
      <i class="v-split"></i>
      <!--分享-->
      <span class="share" @click.stop="recordShare(record)">
        <img src="./img/share.png"><span class="num">{{record.shareNum}}</span>
      </span>
    </div>
    <!--违规失效-->
    <div class="invalid" v-if="record.status === '0' || record.status === 0">
      <img src="./img/invalid.png"><span>内容违规已下线</span>
    </div>
  </div>
</template>

<script>
  import ua from 'dvd-base-js-ua';
  import native from 'dvd-service-js-native';
  import share from 'dvd-service-js-share';
  import util from 'dvd-service-js-util';
  import login from 'dvd-service-js-login';
  import encrypt from 'dvd-service-js-encrypt';
  import popup from 'dvd-service-js-popup';
  import param from 'dvd-base-js-param';
  import security from 'dvd-service-js-security';
  import $ from 'jquery';

  import preview from '../../component/com-picture-preview/preview.js';

  export default {
    components: {},
    props: {
      // 打卡信息
      record: {
        type: Object,
        default: null,
      },
      // 打开新页
      isOpen: {
        type: Boolean,
        default: false,
      },
      // 点击活动名称是否跳转
      actJump: {
        type: Boolean,
        default: true,
      },
      replace:''
    },
    data() {
      return {
        // 全局变量
        window,
        document,

        // 工具模块
        ua,
        native,
        login,
        util,
        security,

        // 正在分享中
        shareAjaxing: false,
      }
    },
    computed: {},
    created() {
    },
    mounted() {
      var ts = this;

    },
    methods: {
      /**
       * 接口名称：小书库打卡功能---打卡内容点赞协议
       * 接口文档：http://wiki.bravetime.net/pages/viewpage.action?pageId=19628750
       */
      recordPraise(record){
        let ts = this;
        if (record.praised === '1') {
          popup.toast('您已经点过赞了');
          return;
        }
        // 打卡内容违规检测
        if(record.status === '0' || record.status === 0){
          popup.toast('内容违规已下线，不可操作');
          return;
        }

        login.login({
          reload: ua.isDvdApp() && ts.$route.query.entry ? 0 : 1,
        });

        ts.clearCache();
        popup.loading(1);
        $.ajax({
          cache: false,
          async: true,
          url: '/api/mg/content/bookstore/contentPraise?_=' + Date.now(),
          type: 'post',
          dataType: 'json',
          data: encrypt({
            // js_wx_info: 1,
            id: record.id,
          }),
          success(response) {
            popup.loading(0);
            try {
              if (response.code === 0) {
                // 如果单位不是'万'并且是数字，+=1
                if (record.thumbsUpNum.toString().indexOf('万') === -1 && !window.isNaN(window.parseInt(record.thumbsUpNum))) {
                  record.thumbsUpNum++;
                  record.praised = '1';
                }
              } else {
                if (response.data && response.data.msg) {
                  popup.toast(response.data.msg);
                }
              }
            } catch (err) {
              // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
            }
          },
          error(error) {
            popup.loading(0);
//            console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
//            this.success(require('./json/recordPraise.json'));
//            console.warn(`ajax已使用mock数据: url=${this.url}, mock=index.json`);
          }
        });
      },
      /**
       * 打卡评论
       */
      recordCmt(record) {
        // 打卡内容违规检测
        if(record.status === '0' || record.status === 0){
          popup.toast('内容违规已下线，不可操作');
          return;
        }
        this.clearCache();

        login.login({
          url: record.command && record.command.content+'&cmt' || '/book/router.html/card_content_detail?contentId='+record.id+'&cmt',
          reload: ua.isDvdApp() && this.$route.query.entry ? 0 : 1,
          open: ua.isDvdApp() && this.$route.query.entry,
        });
      },
      /**
       * 接口名称：小书库打卡功能---生成分享卡协议
       * 接口文档：http://wiki.bravetime.net/pages/viewpage.action?pageId=19628723
       */
      recordShare(record){
        let ts = this;
        // 打卡内容违规检测
        if(record.status === '0' || record.status === 0){
          popup.toast('内容违规已下线，不可操作');
          return;
        }

        login.login({
          reload: ua.isDvdApp() && this.$route.query.entry ? 0 : 1,
        });

        ts.clearCache();

        let shareAdd = function(){
          // 如果单位不是'万'并且是数字，+=1
          if (record.shareNum.toString().indexOf('万') === -1 && !window.isNaN(window.parseInt(record.shareNum))) {
            record.shareNum++;
          }
          ts.$forceUpdate();
        };

        if (ts.shareAjaxing) return;
        ts.shareAjaxing = true;
        popup.loading();
        $.ajax({
          cache: false,
          async: true,
          url: '/api/mg/content/bookstore/contentShareCardCreate?_=' + Date.now(),
          type: 'post',
          dataType: 'json',
          data: encrypt({
            // js_wx_info: 1,
            id: record.id,
          }),
          success(response) {
            popup.loading(0);
            try {
              if (response.code === 0) {
                if(ua.isDvdApp()) {
                  // app分享卡
                  if(ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
                    native.Share.recordCardShare({
                      recordId: record.id,
                    });
                    // 分享图文链接
                  } else {
                    // 设置分享信息
                    share.setShareInfo({
                      title: record.nickName + record.activityInfo.name + '第' + record.dayCount + '天',
                      desc: record.content ? record.content.replace(/<br\/>/ig, '\n') : '',
                      link: `${location.protocol}//${location.host}${record.command.content}`,
                      imgUrl: (function(){
                        let img = '';
                        if(record.imageUrlList && record.imageUrlList[0]){
                          img = record.imageUrlList[0].imageUrl;
                        }else{
                          img = record.activityInfo.actImg;
                        }
                        img = img.split('?')[0]+ '?x-oss-process=image/resize,m_lfit,h_200,w_200';
                        return img;
                      })(),
                    });
                    // 唤起分享面板
                    share.callShare();
                  }
                  // web版分享卡
                }else {
                  popup.shareCard(response.data.imgUrl);
                }
                shareAdd();
              } else {
                if (response.data && response.data.msg) {
                  popup.toast(response.data.msg);
                }
              }
            } catch (err) {
              // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
            }
            ts.shareAjaxing = false;
          },
          error(error) {
            popup.loading(0);
            ts.shareAjaxing = false;
//            console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
//            this.success(require('./json/recordShare.json'));
//            console.warn(`ajax已使用mock数据: url=${this.url}, mock=index.json`);
          }
        });

      },
      // 查看大图
      viewBigPic(i, objList, bigObjList) {
        if(objList){
          preview.preview(i, bigObjList);
        } else {
          preview.preview(i, objList.map(function (item, i, all) {
            return item.imageUrl;
          }));
        }
      },
      // 清除小书库首页缓存
      clearCache(){
        window.localStorage.clear('/book/index-getData');
      },
      // 去打卡页
      open(record) {
        let ts = this;
//        if(record.status === '0' || record.status === 0){
//
//        }
        if(ts.replace) {
          let sign = this.$route.query.replace;
          if(sign == 1) {
            window.location.replace('/book/router.html#/card_content_detail?contentId=' + ts.record.id + '&replace=1');
          } else {
            window.location.href = '/book/router.html#/card_content_detail?contentId=' + ts.record.id + '&replace=1';
//            util.open('/book/router.html#/card_content_detail?contentId=' + ts.record.id + '&replace=1');
          }
        } else {
          let url = ts.record.command && ts.record.command.content || '/book/router.html#/card_content_detail?contentId='+ts.record.id;
          this.isOpen ? native.Browser.open({url: url}) : (location = url);
        }
      },
      // 去活动页
      goAct(url){
        if(this.actJump) {
          this.isOpen ? native.Browser.open({url: url}) : (location = url);
        }
      }
    },
    filters: {
    },
    watch: {},
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";

  .com-record {
    padding: r(20) r(20) 0 r(20);
    //margin-top: r(10);
    /* 打卡标题 */
    .title {
      display: flex;
      /* 头像 */
      .head {
        @include circle(r(40));
        margin-right: r(10);
        display: block;
      }
      /* 标题内容 */
      .info {
        flex: 1;
        max-width: r(285);
        @include ellipsis;
        display: block;
        /* 第一行标题内容 */
        .top {
          height: r(20);
          .nickname {
            @include height(r(20));
            font-size: r(14);
            vertical-align: middle;
          }
          .time {
            float: right;
            position: relative;
            top: r(2);
            @include height(r(17));
            font-size: r(12);
            vertical-align: middle;
            color: #999;
          }
        }
        /* 第二行标题内容 */
        .bottom {
          margin-top: r(2);
          @include ellipsis;
          color: #FF4a7d;
          .day {
            padding: 0 r(5);
            display: inline-block;
            height: r(16);
            line-height: r(16);
            border-radius: r(4);
            background: #D3BEA0;
            font-size: r(10);
            color: white;
            vertical-align: middle;
          }
          .activity {
            margin-left: r(5);
            color: #FF4a7d;
            @include height(r(17));
            font-size: r(12);
            vertical-align: middle;
          }
        }
      }
    }
    /* 打卡文字 */
    .words {
      margin-top: r(10);
      padding-left: r(50);
      line-height: r(17);
      font-size: r(14);
      color: #666;
      .all {
        margin-top: r(10);
        color: #6F9BD8;
        font-size: r(12);
      }
    }
    /* 打卡图片 */
    .pics {
      margin-top: r(3);
      padding-left: r(50);
      white-space: nowrap;
      font-size: 0;
      .pic {
        margin: r(7) 0 0 r(7);
        @include square(r(90));
        border-radius: r(3);
        vertical-align: middle;
        &:nth-of-type(3n+1) {
          margin-left: 0;
        }
      }
    }
    /* 打卡按钮 */
    .btns {
      margin-top: r(10);
      padding-left: r(50);
      text-align: right;
      font-size: 0;
      white-space: nowrap;
      * {
        vertical-align: middle;
      }
      .v-split {
        display: inline-block;
        width: 1px;
        height: r(15);
        background: #eee;
        margin-left: r(15);
      }
      /* 按钮 */
      .praise, .cmt, .share {
        margin-left: r(14);
        color: #999;
        img {
          margin-right: r(3);
          @include square(r(17));
          padding: 0 4px;
          overflow: visible;
        }
        .num {
          display: inline-block;
          //width: r(52);
          font-size: r(13);
          text-align: left;
        }
      }
      .praise {
        img {
          position: relative;
          top: r(-2);
        }
      }
      .share {
        img {
          height: r(19);
        }
      }
    }
    /* 内容违规失效 */
    .invalid {
      margin-top: r(15);
      margin-left: r(50);
      @include height(r(34));
      background: #FFF9FB;
      font-size: 0;
      img {
        margin: 0 r(5) 0 r(10);
        height: r(13);
        position: relative;
        top: r(1);
      }
      * {
        vertical-align: middle;
        font-size: r(13);
        color: #FF4a7d;
      }
    }
  }

  /* 安卓hacker */
  .app.android {
    .com-record .title .info .bottom .day {
      line-height: r(18);
    }
    .com-record .invalid span {
      position: relative;
      top: r(2);
    }
    .com-record .btns .praise .num,
    .com-record .btns .cmt .num,
    .com-record .btns .share .num {
      position: relative;
      top: 1px;
    }
  }
</style>
