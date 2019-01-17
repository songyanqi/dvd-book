<!--去打卡-->
<template>
  <div class="com-feed-body-record-go" @click="tj(2);goRecordPage();">
    <div class="box">
      <span class="input">{{d.desc}}</span>
      <span class="button"><span class="text">{{d.button}}</span><img src="./img/record-go.png"></span>
    </div>
  </div>
</template>

<script>
  import popup from 'dvd-service-js-popup';
  import login from 'dvd-service-js-login';
  import encrypt from 'dvd-service-js-encrypt';
  import tj from 'dvd-service-js-tj';
  import util from 'dvd-service-js-util';
  import ua from 'dvd-base-js-ua';
  import param from 'dvd-base-js-param';
  import native from 'dvd-service-js-native';
  import $ from 'jquery';

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
      }
    },
    computed: {},
    created() {
    },
    mounted() {
    },
    methods: {
      /**
       * 方法功能：检查是否能够打卡
       * 接口名称：小书库打卡功能---自定义打卡页面协议
       * 接口文档：http://wiki.bravetime.net/pages/viewpage.action?pageId=19628625
       */
      goRecordPage(){
        let ts = this;

        // 检测登录
        login.login({
          reload: ua.isDvdApp() && ts.$route.query.entry ? 0 : 1,
        });

        $.ajax({
          cache: false,
          async: true,
          url: '/api/mg/content/bookstore/signCreate?_=' + Date.now(),
          type: 'post',
          dataType: 'json',
          data: encrypt({
            rp: this.d.rp,
            rl: this.d.rl,
          }),
          success(response) {
            try {
              if (response.code === 0) {
                let url = '/book/router.html#/custom_card';
                ts.store.entry !== undefined ? native.Browser.open({url: url}) : (window.location = url);
              } else {
                popup.toast(response.data.msg);
              }
            } catch (err) {
              // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
            }
          },
          error(error) {
            console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
//            this.success(require('../../json/goRecord.json'));
//            console.warn(`ajax已使用mock数据: url=${this.url}, mock=index.json`);
          }
        });
      },
      // 统计
      tj(action_type){
        tj.send({
          production: 24,
          action: 1,
          action_type: action_type,
        })
      },
    },
    filters: {},
    watch: {},
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";

  /* 打卡内容-去打卡 */
  .com-feed-body-record-go {
    background-color: #fcfcfc;
    padding-top: r(20);
    .box{
      margin: auto;
      width: r(335);
      box-sizing: border-box;
      font-size: 0;
      white-space: nowrap;
      .input {
        display: inline-block;
        @include height(r(40));
        width: r(232);
        border: 1px solid #cacaca;
        border-right: none;
        border-top-left-radius: r(4);
        border-bottom-left-radius: r(4);
        font-size: r(14);
        text-align: center;
        color: #666;
        vertical-align: top;
        box-sizing: border-box;
      }
      .button {
        display: inline-block;
        @include height(r(40));
        width: r(103);
        background: #FF4a7d;
        border-top-right-radius: r(4);
        border-bottom-right-radius: r(4);
        color: white;
        font-size: 0;
        text-align: center;
        .text {
          font-size: r(14);
          vertical-align: middle;
        }
        img {
          width: r(20);
          vertical-align: middle;
        }
      }
    }
  }

  /* 安卓hacker */
  .app.android {
    .com-feed-body-record-go .input {
      line-height: r(42);
    }
    .com-feed-body-record-go .button .text {
      line-height: r(16);
    }
  }
</style>
