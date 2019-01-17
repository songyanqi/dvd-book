// 第三方模块
import Vue from 'vue';
import $ from 'jquery';
import Swiper from 'swiper';

// H5项目间通用模块
import ua from 'dvd-base-js-ua';
import tj from 'dvd-service-js-tj';
// import type from 'dvd-base-js-type';
// import date from 'dvd-base-js-date';
import param from 'dvd-base-js-param';
import cache from 'dvd-base-js-cache';
import util from 'dvd-service-js-util';
import popup from 'dvd-service-js-popup';
import login from 'dvd-service-js-login';
// import share from 'dvd-service-js-share';
import native from 'dvd-service-js-native';
import encrypt from 'dvd-service-js-encrypt';
import pageScrollPosition from 'dvd-base-js-page-scroll-position';

// import ('lodash').then(function(aaaa){
//   alert(11)
//   debugger
// });

// 渲染页面
export default {
  components: {
    'dvd-service-com-title': require('dvd-service-com-title').default,
    'dvd-service-com-go-page-top': require('dvd-service-com-go-page-top').default,
    'dvd-service-com-footer': require('dvd-service-com-footer').default,
    'com-feed-list': require('../vue/com-feed-list.vue').default,
  },
  data() {
    let ts = this;
    return {
      // 全局属性
      window,
      document,
      location,

      // H5项目间通用模块
      ua,
      popup,
      param,

      // 首屏返回数据
      response: null,

      // 所有组件已绑定过事件
      bind: 0,

      // 刷新数据
      refreshData: {},

      // 热门打卡
      hot: {
        pageIndex: 0,
        ajaxing: false,
        hasMore: true,
      },

      // 我的打卡
      mine: {
        pageIndex: 0,
        ajaxing: false,
        hasMore: true,
      },

      // 热门打卡、我的打卡切换
      swiper: null,

      // 组件间属性
      store: {
        recordType: window.sessionStorage.getItem(window.location.pathname + window.location.search + window.location.hash + '_recordType') ? true : false,
        bus: new Vue(),
        // app入口
        entry: (function () {
          if (ua.isDvdApp()) {
            let entry = ts.$route.query.entry;
            // 5.3.0以上
            if (entry == 'menu') {
              if (ua.isAndroid() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') < 0 && ua.compareVersion(ua.getDvdAppVersion(), '5.1.2') > 0) {
                return entry;
              } else {
                return null;
              }
            } else if (entry == 'footer') {
              // if (ua.isAndroid() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') >= 0 || ua.isIos() && ua.compareVersion(ua.getDvdAppVersion(), '5.1.2') >= 0) {
              if (ua.isIos() && ua.compareVersion(ua.getDvdAppVersion(), '5.1.2') >= 0) {
                return entry;
              } else if (ua.isAndroid() && ua.compareVersion(ua.getDvdAppVersion(), '5.1.2') >= 0 && ua.compareVersion(ua.getSysVersion(), '5.0.0') >= 0) {
                return entry;
              } else {
                return null;
              }
            } else {
              return entry;
            }
          }
        })(),
      },

      // 自动刷新定时器
      refreshInterval: null,
    };
  },
  computed: {},
  beforeRouteEnter(to, from, next) {
    getData(next, false);
  },
  beforeCreate() {
    // 是否使用mock数据
    window.mock = 0;
    // 登陆完去首页缓存
    if (document.referrer && document.referrer.indexOf('/login.html') !== -1) {
      localStorage.removeItem('/book/index-getData');
    }
  },
  created() {
    // 获取首屏数据
    // this.getData();
    // getData.call(this, undefined, false);
  },
  mounted() {
    let ts = this;

    // 切换打卡列表事件
    this.store.bus.$on('changeRecordType', function (recordType) {
      ts.store.recordType = recordType;
      if (ts.store.recordType) {
        ts.swiper.slideTo(1);
      } else {
        ts.swiper.slideTo(0);
      }
    });

    // 每3分钟同步
    ts.refreshInterval = setInterval(function () {
      // ts.refresh.call(ts);
      getData.call(ts, undefined, true);
    }, 1 * 60 * 1000);

    // 接受全局音频浮窗状态变化
    window.iosInterface = window.iosInterface || {};
    window.iosInterface.getAudioState = function (obj) {
      ts.store.bus.$emit('musicStateChange');
    };
  },
  watch: {
    // 监听response变化
    response() {
      // response变化后并渲染完dom,设置其他事项
      this.$nextTick(function () {
        let ts = this;

        if (ts.bind) return;

        // 滚动位置
        pageScrollPosition.init();
        pageScrollPosition.autoSave();

        // 底部打卡feedList左右滑动
        if (ts.response.data.hotFeedList && ts.response.data.mineFeedList) {
          ts.setRecordListHeight();
          setTimeout(ts.setRecordListHeight, 100);
          this.swiper = new Swiper(ts.$refs.recordSwiper, {
            initialSlide: ts.store.recordType ? 1 : 0,
            // 手动滑动时修改title状态
            onSlideChangeEnd: function (swiper) {
              if (swiper.activeIndex) {
                ts.store.recordType = true;
                window.sessionStorage.setItem(location.pathname + location.search + location.hash + '_recordType', 1);
              } else {
                ts.store.recordType = false;
                window.sessionStorage.removeItem(location.pathname + location.search + location.hash + '_recordType');
              }
              ts.setRecordListHeight();
            },
          });
        }

        // 设置分享信息
        /*try {
         if (!ts.response || !ts.response.data) return;
         share.setShareInfo({
         title: ts.response.data.shareTitle,
         desc: ts.response.data.shareDesc,
         link: location.href,
         imgUrl: ts.response.data.shareImg,
         }, ts.response);
         } catch (err) {
         console.error(err);
         }*/

        // 触底分页加载打卡列表
        util.pageScrollToBottom(ts.getNextPage);

        if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') >= 0) {
          // 如果在app中，显示音频浮窗
          native.Browser.setHead({
            isShowAudio: '1',
          });
        }

        // 返回刷新
        // util.backReload();

        ts.bind = 1;

        // 顶部系统状态栏
        if (ts.$refs.sysStatus) {
          ts.sysStatus_callback = function (event) {
            ts.scrollTop = util.getDocumentScrollTop();
            ts.$refs.sysStatus.style.opacity = ts.scrollTop / 200;
          };
          window.addEventListener('scroll', ts.sysStatus_callback, false);
        }

        // 刚渲染完主动触发scroll设置吸顶效果
        var event = document.createEvent('Events');
        event.initEvent('scroll', true, false);
        document.body.dispatchEvent(event);
      });
    },
  },
  beforeRouteLeave(to, from, next) {
    // 滚动位置
    pageScrollPosition.destory();
    next();
  },
  beforeDestroy() {
    clearInterval(this.refreshInterval);
    this.swiper = null;
    window.iosInterface = null;
    window.removeEventListener('scroll', this.sysStatus_callback, false);
  },
  destroyed() {
  },
  filters: {},
  methods: {
    /**
     * 方法功能：获取首屏数据-回调
     */
    getDataCallback(response) {
      let ts = this;

    },
    /**
     * 方法功能：获取打卡列表下一页数据
     * 接口名称：小书库首页－热门打卡列表协议
     * 接口名称：小书库首页－我的打卡列表协议
     * 接口文档：http://wiki.bravetime.net/pages/viewpage.action?pageId=19628507
     * 接口文档：http://wiki.bravetime.net/pages/viewpage.action?pageId=19628528
     */
    getNextPage(refresh){
      let ts = this;

      // 计算上行参数
      let pageIndex = 0;
      let url = '/api/mg/content/bookstore/index_hot_sign_list';
      // 刷新
      if (refresh) {
        // 我的
        if (ts.store.recordType) {
          url = '/api/mg/content/bookstore/index_mine_sign_list';
          pageIndex = ts.mine.pageIndex + 1;
          // 热门
        } else {
          pageIndex = ts.hot.pageIndex + 1;
        }
        // 分页
      } else {
        // 我的
        if (ts.store.recordType) {
          if (ts.mine.ajaxing || !ts.mine.hasMore) return;
          url = '/api/mg/content/bookstore/index_mine_sign_list';
          pageIndex = ts.mine.pageIndex + 1;
          ts.mine.ajaxing = true;
          // 热门
        } else {
          if (ts.hot.ajaxing || !ts.hot.hasMore) return;
          pageIndex = ts.hot.pageIndex + 1;
          ts.hot.ajaxing = true;
        }
      }

      var deferred = $.Deferred();

      $.ajax({
        cache: false,
        async: true,
        url: url + '?_=' + Date.now(),
        type: 'post',
        dataType: 'json',
        data: encrypt({
          pageIndex: refresh ? 0 : pageIndex,
          pageSize: refresh ? pageIndex * 10 : 10,
        }),
        success(response) {
          try {
            if (response.code === 0) {
              // 我的
              if (ts.store.recordType) {
                // 防止服务端缺少节点
                if (!response.data) {
                  response.data = {};
                }
                if (!response.data.mineFeedList) {
                  response.data.mineFeedList = [];
                }
                // 分页
                if (!refresh) {
                  ts.setHasMore(response.data.mineFeedList, true);
                  ts.response.data.mineFeedList = ts.response.data.mineFeedList.concat(response.data.mineFeedList);
                  ts.mine.pageIndex += 1;
                  // 刷新
                } else {
                  ts.refreshData.mineFeedList = response.data.mineFeedList;
                }
                setTimeout(function () {
                  ts.mine.ajaxing = false;
                }, 100);
                // 热门
              } else {
                // 防止服务端缺少节点
                if (!response.data) {
                  response.data = {};
                }
                if (!response.data.hotFeedList) {
                  response.data.hotFeedList = [];
                }

                // 分页
                if (!refresh) {
                  ts.setHasMore(response.data && response.data.hotFeedList, false);
                  ts.response.data.hotFeedList = ts.response.data.hotFeedList.concat(response.data.hotFeedList);
                  ts.hot.pageIndex += 1;
                  // 刷新
                } else {
                  ts.refreshData.hotFeedList = response.data.hotFeedList;
                }
                setTimeout(function () {
                  ts.hot.ajaxing = false;
                }, 100);
              }
              ts.$nextTick(function () {
                ts.setRecordListHeight();
              });
            }
          } catch (err) {
            // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
          }
          return deferred;
        },
        error(error) {
          // 是否使用mock数据
          if (window.mock) {
            console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
            // this.success(require('../json/nextPage.json'));
            // console.warn(`ajax已使用mock数据: url=${this.url}, mock=index.json`);
          }
        },
      });
    },
    // 设置更多
    setHasMore(feedList, isMine){
      let ts = this;
      let count = 0;
      for (let i in feedList) {
        if (feedList[i].body && feedList[i].body.tplId == 'bd_book_store_sign_list') {
          count++;
        }
      }
      if (count < 10) {
        // 设置更多标记位
        if (isMine) {
          ts.mine.hasMore = false;
        } else {
          ts.hot.hasMore = false;
        }
        // 添加没有更多模板
        feedList && feedList.push({
          body: {
            tplId: 'com-feed-list-no-more',
          },
        });
      }
    },
    // 设置打卡列表高度
    setRecordListHeight() {
      let ts = this;
      let currentList = document.querySelector('.record-swiper > .swiper-wrapper > .swiper-slide-active > .com-feed-list');
      if (currentList) {
        let height = currentList.clientHeight + 'px';
        $(ts.$refs.recordSwiper).animate({
          height,
        }, 300);
      }
    },
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

      popup.loading();

      $.ajax({
        cache: false,
        async: true,
        url: '/api/mg/content/bookstore/signCreate?_=' + Date.now(),
        type: 'post',
        dataType: 'json',
        data: encrypt({
          rp: ts.response.data.rp,
          rl: ts.response.data.rl,
        }),
        success(response) {
          popup.loading(0);
          try {
            if (response.code === 0) {
              ts.store.entry !== undefined ? native.Browser.open({url: '/book/router.html#/custom_card'}) : (location.href = '/book/router.html#/custom_card');
            } else {
              popup.toast(response.data.msg);
            }
          } catch (err) {
            // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
          }
        },
        error(error) {
          popup.loading(0);
          // 是否使用mock数据
          if (window.mock) {
            console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
            // this.success(require('../json/goRecord.json'));
            // console.warn(`ajax已使用mock数据: url=${this.url}, mock=index.json`);
          }
        },
      });
    },
    // 统计
    tj(action_type){
      tj.send({
        production: 24,
        action: 1,
        action_type: action_type,
      });
    },
    /**
     * 方法功能：刷新页面数据
     * 接口名称：小书库首页－第一屏协议
     * 接口文档：http://wiki.bravetime.net/pages/viewpage.action?pageId=19628496
     */
    refresh(){
      let ts = this;
      $.when(
        ts.getData.call(ts, true),
        ts.response.data.hotFeedList && ts.getNextPage.call(ts, true),
        ts.response.data.mineFeedList && ts.getNextPage.call(ts, true)
      ).then(function () {
        let response = null;
        response = ts.refreshData.response;
        ts.setHasMore(ts.refreshData.hotFeedList, true);
        ts.setHasMore(ts.refreshData.mineFeedList, true);
        response.data.hotFeedList = ts.refreshData.hotFeedList;
        response.data.mineFeedList = ts.refreshData.mineFeedList;
        ts.refreshData = {};
        ts.$nextTick(function () {
          ts.setRecordListHeight();
        });
        ts.response = response;
        ts.$forceUpdate();
        console.log('首页数据已更新。')
      });
    },
    // 点击扫描
    scanClick(){
      if (ua.isDvdApp()) {
        native.ScanCode.openScanCode({
          debug: true,
        });
      } else {
        popup.toast('下载APP才能使用');
      }
    }
  },
};

/**
 * 方法功能：获取首屏数据
 * 接口名称：小书库首页－第一屏协议
 * 接口文档：http://wiki.bravetime.net/pages/viewpage.action?pageId=19628496
 */
function getData(next, refresh) {
  let ts = this;
  // 取缓存
  /*if (!refresh) {
   let response = cache.getItem('/book/index-getData');
   if (response) {
   ts.response = response;
   ts.setHasMore(ts.response.data.mineFeedList, true);
   ts.setHasMore(ts.response.data.hotFeedList, false);
   document.body.className += ' loaded';
   return;
   }
   }*/
  // var deferred = $.Deferred();
  $.ajax({
    cache: false,
    async: true,
    url: '/api/mg/content/bookstore/index?_=' + Date.now(),
    type: 'post',
    dataType: 'json',
    data: encrypt({
      // js_wx_info: 1,
    }),
    success(response) {
      function callback(response) {
        try {
          if (response.code === 0) {
            let setCache = function (response) {
              // 设置缓存
              // cache.setItem({
              //   key: '/book/index-getData',            // 缓存key
              //   data: response,           // 缓存data（可以传json或String）
              //   expires: {          // 缓存有效时长（从当前时间开始计算过多少毫秒缓存失效）
              //     d: 0,             // 天
              //     h: 0,             // 小时
              //     m: 0,             // 分钟
              //     s: 30,             // 秒
              //     ms: 0,            // 毫秒
              //   },
              // });
            };
            /*if (refresh) {
             this.refreshData.response = response;
             // setCache(response);
             } else {
             this.response = response;
             // setCache(response);
             this.setHasMore(this.response.data.mineFeedList, true);
             this.setHasMore(this.response.data.hotFeedList, false);
             }*/
            // if (refresh) {
            //   let hotFeedList = response.data.hotFeedList;
            //   let mineFeedList = response.data.mineFeedList;
            //   delete response.data.hotFeedList;
            //   delete response.data.mineFeedList;
            //   $.extend(this.response, response, true);
            //   debugger
            //   if(this.response.data.hotFeedList){
            //     for(let i in hotFeedList) {
            //       hotFeedList[i]
            //     }
            //   }
            //   this.refreshData.response = response;
            //   // setCache(response);
            // } else {
            this.response = response;
            // setCache(response);
            this.hot.hasMore = true;
            this.mine.hasMore = true;
            this.setHasMore(this.response.data && this.response.data.hotFeedList, false);
            this.setHasMore(this.response.data && this.response.data.mineFeedList, true);
            this.hot.pageIndex = 0;
            this.mine.pageIndex = 0;
            // debugger
            this.$nextTick(function () {
              this.setRecordListHeight();
              // 音频状态
              this.store.bus.$emit('musicStateChange');
            });
            // }
          }
        } catch (err) {
          // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
        }
        // deferred.resolve();
      }

      // 如果有next，代表router进入页面前调用；否则为页面内调用
      next ? next(function (ts) {
        callback.call(ts, response);
      }) : callback.call(ts, response);
    },
    error(error) {
      // 只有本地调试版本才能使用mock数据
      if (!'[[env]]') {
        console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
        // this.success(require('../json/index.json'));
        // console.warn(`ajax已使用mock数据: url=${this.url}, mock=index.json`);
      }
    },
  });
  // return deferred;
}
