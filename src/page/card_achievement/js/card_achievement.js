// 第三方模块
import Vue from 'vue';
import $ from 'jquery';

// 业务模块

import tj from 'dvd-service-js-tj';
import util from 'dvd-service-js-util';
import date from 'dvd-base-js-date';
import ua from 'dvd-base-js-ua';
import param from 'dvd-base-js-param';
import popup from 'dvd-service-js-popup';
import login from 'dvd-service-js-login';
import share from 'dvd-service-js-share';
import native from 'dvd-service-js-native';
import encrypt from 'dvd-service-js-encrypt';
import localCache from 'dvd-base-js-cache';
import pageScrollPosition from 'dvd-base-js-page-scroll-position';

// 渲染页面
export default {
  components: {
    'dvd-service-com-title': require('dvd-service-com-title').default,
    // 'com-to-top-icon': require('../../../component/com-to-top-icon.vue'),
    'monthly-view': require('../../../component/com-monthly-view/com-monthly-view.vue').default
  },
  data() {
    return {
      response: null,
      ua,
    };
  },
  computed: {},
  watch: {
    // 监听response变化
    response(){
      // response变化后并渲染完dom,设置其他事项
      this.$nextTick(function () {
        let ts = this;

        // 设置分享信息
        //   try {
        //     if (!ts.response || !ts.response.data) return;
        //     share.setShareInfo({
        //       title: ts.response.data.shareTitle,
        //       desc: ts.response.data.shareDesc,
        //       link: location.href,
        //       imgUrl: ts.response.data.shareImg,
        //     }, ts.response);
        //   } catch (err) {
        //     console.error(err);
        //   }

        // 滚动位置
        pageScrollPosition.init();
        pageScrollPosition.autoSave();
      });
    },
  },
  beforeRouteEnter(to, from, next) {
    getData(next);
  },
  beforeCreate() {
  },
  created() {
    // this.getData();
  },
  mounted() {
    // 返回刷新
    util.backReload();
  },
  beforeRouteLeave(to, from, next) {
    // 滚动位置
    pageScrollPosition.destory();
    next();
  },
  filters: {},
  methods: {
    open(type, actId) {
      var url = '';
      if (type == 'card') {
        url = '/book/router.html#/custom_card?actId=' + actId + '&no_change=1';
      } else if (type == 'actDetail') {
        url = '/book/router.html#/punching_activity?actId=' + actId;
      }
      // 跳转
      if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
        event.preventDefault();
        if (type == 'actDetail') {
          native.BookStore.openActiveDetail({
            "actId": actId
          });
        } else if (type == 'card') {
          native.BookStore.openCustomRecord({
            "actId": actId,
            "type": "1"
          });
        }
      } else {
        location.href = url;
      }
    },
    tip() {
      popup.toast('已打卡，去看看别的活动吧');
    }
  }
};

/**
 * 接口名称:
 * 接口文档:
 */
function getData(next) {
  let ts = this;
  $.ajax({
    cache: false,
    async: true,
    url: '/api/mg/content/bookstore/achieveDetail?_=' + Date.now(),
    type: 'post',
    dataType: 'json',
    data: encrypt({
      js_wx_info: 1
    }),
    success(response) {
      function callback(response) {
        try {
          this.response = response;
        } catch (err) {
          // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
        }
      }

      // 如果有next，代表router进入页面前调用；否则为页面内调用
      next ? next(function (ts) {
        callback.call(ts, response);
      }) : callback.call(ts, response);
    },
    error(error) {
      // console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
      // this.success(require('../json/card_achievement.json'));
      // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_achievement.json`);
    }
  });
}
