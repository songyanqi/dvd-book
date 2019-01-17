// 第三方
import Vue from 'vue';
import $ from 'jquery';

// 大V店内部组件
import ua from 'dvd-base-js-ua';
import tj from 'dvd-service-js-tj';
import date from 'dvd-base-js-date';
import param from 'dvd-base-js-param';
import util from 'dvd-service-js-util';
import popup from 'dvd-service-js-popup';
import login from 'dvd-service-js-login';
import share from 'dvd-service-js-share';
import native from 'dvd-service-js-native';
import localCache from 'dvd-base-js-cache';
import encrypt from 'dvd-service-js-encrypt';
import pageScrollPosition from 'dvd-base-js-page-scroll-position';

export default {
  components: {
    'dvd-service-com-title': require('dvd-service-com-title').default,
  },
  data () {
    return {
      dataList: [],
      loading: false,
      no_more: false,
      pageIndex: 0,
      ajaxFlag: false,
      ua,
    }
  },
  beforeRouteEnter(to, from, next) {
    getData(next);
  },
  created() {
    var ts = this;
    // ts.getData();//初始化调用数据
    // 返回刷新
//      util.backReload();
  },
  beforeRouteLeave(to, from, next) {
    // 滚动位置
    pageScrollPosition.destory();
    next();
  },
  watch: {
    // 监听response变化
    response() {
      // response变化后并渲染完dom,设置其他事项
      this.$nextTick(function () {
        // 滚动位置
        pageScrollPosition.init();
        pageScrollPosition.autoSave();
      });
    },
  },
  methods: {
    //加载更多滚动事件
    scrollListener() {
      var ts = this;
      $(window).scroll(function () {//滚动条滚动事件
        var offset = window.pageYOffset;
        var offsetTop = document.body.scrollHeight;
        if (offsetTop - offset - window.screen.availHeight < 30) {//整个页面的高度-滚动条滚动的高度-返回当前屏幕高度
          if (!ts.no_more) {
            ts.loading = true;
            if (ts.ajaxFlag) return;
            ts.getData();
          }
        }
      })
    },
    //跳转到活动详情
    toActivityMessage(obj) {
      if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
        native.BookStore.openActiveDetail({
          "actId": obj.actId
        });
      } else {
        // util.open('/book/router.html#/punching_activity?actId=' + obj.actId);
        location = ('/book/router.html#/punching_activity?actId=' + obj.actId);
      }

    }
  }
}

// 初始化获取数据接口
function getData(next) {
  let ts = this;
  if (!next) {
    ts.ajaxFlag = true;
  }
  $.ajax({
    cache: false,
    async: true,
    url: '/api/mg/content/bookstore/hotList?_=' + Date.now(),
    type: 'post',
    data: encrypt({
      pageIndex: next ? 0 : ts.pageIndex,
      pageSize: 10,
    }),
    dataType: 'json',
    success(response) {
      function callback(response) {
        this.ajaxFlag = false;
        if (response.code == 0) {
          //page页码 ++
          this.pageIndex += 1;
          //数据返回来的不够请求的
          if (!response.data.list.length || response.data.list.length < 20) {
            this.no_more = true;
          } else {
            this.no_more = false;
          }
          //调用监听滚动函数
          if (!this.no_more) {
            this.scrollListener();
          }
          this.loading = false;
          this.dataList = (this.dataList || []).concat(response.data.list);
          this.loading = false;
        } else {
          this.ajaxFlag = false;
        }
      }

      // 如果有next，代表router进入页面前调用；否则为页面内调用
      next ? next(function (ts) {
        callback.call(ts, response);
      }) : callback.call(ts, response);
    },
    error(error) {
      console.error('ajax error:' + error.status + ' ' + error.statusText);
    }
  });
}
