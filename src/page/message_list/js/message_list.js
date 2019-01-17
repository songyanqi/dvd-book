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
import security from 'dvd-service-js-security';
import pageScrollPosition from 'dvd-base-js-page-scroll-position';

// 渲染页面
export default ({
  components: {
    'dvd-service-com-title': require('dvd-service-com-title').default,
    'dvd-service-com-go-page-top': require('dvd-service-com-go-page-top').default,
  },
  data() {
    return {
      response: null,
      ua,
      security,
      pageIndex: -1,
      loading: false,
      no_more: 0,
      ajaxing: false,
      list: [],
      fistRequestOver: false,
      window,
    };
  },
  computed: {},
  watch: {
    // 监听response变化
    response(){
      // response变化后并渲染完dom,设置其他事项
      this.$nextTick(function () {
        let ts = this;

        // 只执行一次
        if (ts.fistRequestOver) return;
        ts.fistRequestOver = true;

        // 滚动位置
        pageScrollPosition.init();
        pageScrollPosition.autoSave();

        // 设置分享信息
        try {
          if (!ts.response || !ts.response.data) return;
          share.setShareInfo({
            title: ts.response.data.shareTitle,
            desc: ts.response.data.shareDesc,
            link: location.href,
            imgUrl: ts.response.data.shareImg,
          }, ts.response);
        } catch (err) {
          console.error(err);
        }

        // 触底分页加载打卡列表
        util.pageScrollToBottom(getData, ts);

        window.clear = ts.clear;
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
    let ts = this;
    popup.loading(0);
  },
  beforeRouteLeave(to, from, next) {
    // 滚动位置
    pageScrollPosition.destory();
    next();
  },
  filters: {},
  methods: {
    /**
     * 接口名称: 清空消息列表
     * 接口文档: http://wiki.bravetime.net/pages/viewpage.action?pageId=19632268
     */
    clear(){
      let ts = this;
      if (!ts.list || ts.list.length <= 0) {
        popup.toast('暂无消息~');
        return;
      }
      popup.confirm({
        className: 'message_list-clear-confirm',
        text: '清空所有消息？',
        okBtnTitle: '确定',
        okBtnCallback() {
          $.ajax({
            cache: false,
            async: true,
            url: '/api/mg/content/bookstore/message_wipe?_=' + Date.now(),
            type: 'post',
            dataType: 'json',
            data: encrypt({
              // js_wx_info: 1,
            }),
            success(response) {
              if (response.code === 0) {
                ts.list = [];
                ts.no_more = true;
                ts.pageIndex = -1;
                setHead.call(ts);
              }
            },
            error(error) {
              ts.ajaxing = false;
              // console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
              // this.success(require('../json/message_list.json'));
              // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_content_detail.json`);
            }
          });
        },
        cancelBtnTitle: '取消',
      });
    },
  },
});

// 设置头部
function setHead() {
  let ts = this;
  if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') < 0) {
    // 5.2.0以下设置头部
    native.Browser.setHead({
      title: document.title,
      rightBtn: ts.list && ts.list.length > 0 ? {
        'text': '清除',
        'textColor': '#333333',
        'action': 'window.clear',
      } : null,
    });
  }
}

/**
 * 接口名称: 消息列表分页
 * 接口文档: http://wiki.bravetime.net/pages/viewpage.action?pageId=19632266
 */
function getData(next) {
  let ts = this;
  if (ts && (ts.no_more || ts.ajaxing)) {
    return;
  }
  if (!next) {
    ts.ajaxing = true;
  }
  $.ajax({
    cache: false,
    async: true,
    url: '/api/mg/content/bookstore/message_list?_=' + Date.now(),
    type: 'post',
    dataType: 'json',
    data: encrypt({
      js_wx_info: 1,
      pageIndex: next ? -1 : ts.pageIndex + 1,
      pageSize: 10
    }),
    success(response) {
      function callback(response) {
        this.ajaxing = false;
        this.response = response;
        try {
          // 有数据则数据增加，页码+1
          if (response.data && response.data.dataList && response.data.dataList.length > 0) {
            this.list = this.list.concat(response.data.dataList);
            this.pageIndex++;
          }

          // 判断没有更多
          if (!response.data || !response.data.dataList || response.data.dataList.length < 10) {
            this.no_more = true;
          }

          // 隐藏删除按钮
          if (this.list.length === 0) {
            setHead.call(this);
          }
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
      this && (this.ajaxing = false);
      // console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
      // this.success(require('../json/message_list.json'));
      // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_content_detail.json`);
    }
  });
}
