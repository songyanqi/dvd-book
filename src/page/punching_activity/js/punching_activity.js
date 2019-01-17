// 基础模块
require('dvd-service-js-common');

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

export default {
  data() {
    return {
      response: null,
      replace: 'true',
      isActive: 'latest',
      dataList: {loading: true},
      titleList: [],
      newList: [],//循环列表数据
      feedList: [],//加载请求数组
      sysTime: 0,
      actInfo: {},//顶部内容图片
      loading: false,
      no_more: false,
      pageIndex: 0,
      ajaxFlag: false,
      arrChange: [],//没有日期今的数组
      fixed: false,//吸顶
      shareInfo: {},//分享
      record: {
        type: Object,
        default: null,
      },
      fixedApp: false,
      weekDay: [],
      dateDay: [],//改变为今的数组
      dateInfo: {},
      dateDayArr: [],//存放相同数组的key
      today: 0,
      contentTitle: [],//tab 标题
      flag: -1,//判断是否显示未打卡样式
      actId: this.$route.query.actId,
      styleFlag: false,//今天样式显示
      isDvdApp: ua.isDvdApp(),
      flagIndex: -1,//数组循环标识
      actStatus: '',//判断该活动是否打过卡
      customNewList: [],   // 本地缓存-最新
      customHotList: [],   // 本地缓存-热门
      customMyList: [],    // 本地缓存-我的
      ua: ua
    }
  },
  components: {
    'dvd-service-com-title': require('dvd-service-com-title').default,
    'com-record': require('../../../component/com-record/com-record.vue').default,

  },
  beforeRouteEnter(to, from, next) {
    getData(next, to);
  },
  created() {
    var ts = this;
    // ts.getData(ts.dealData);
  },
  mounted() {
    let ts = this;
    //判断app 版本
    if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') <= 0) {
      // 吸顶效果
      let offsetTop = util.getOffsetTop(ts.$refs.switcher.parentNode);
      setTimeout(function () {
        offsetTop = util.getOffsetTop(ts.$refs.switcher.parentNode);
      }, 1000);
      window.addEventListener('scroll', function () {
        // 吸顶
        if (util.getDocumentScrollTop() > offsetTop) {
          ts.fixedApp = true;
        } else {
          ts.fixedApp = false;
        }
      }, false);
    } else {
      let offsetTop = util.getOffsetTop(ts.$refs.switcher.parentNode) - 44;
      setTimeout(function () {
        offsetTop = util.getOffsetTop(ts.$refs.switcher.parentNode) - 44;
      }, 1000);
      window.addEventListener('scroll', function () {
        // 吸顶
        if (util.getDocumentScrollTop() > offsetTop) {
          ts.fixed = true;
        } else {
          ts.fixed = false;
        }
      }, false);
    }

    //监听屏幕滚动
    ts.scrollListener();
  },
  watch: {
    // 监听response变化
    response(){
      // response变化后并渲染完dom,设置其他事项
      this.$nextTick(function () {
        let ts = this;
        // 滚动位置
        pageScrollPosition.init();
        pageScrollPosition.autoSave();
      });
    },
    shareInfo() {
      // dataList变化后并渲染完dom,设置其他事项
      this.$nextTick(function () {
        let ts = this;
        // 设置分享信息
        share.setShareInfo({
          title: ts.shareInfo.title,
          desc: ts.shareInfo.actDesc,
          link: location.href,
          imgUrl: ts.shareInfo.imgUri,
        });
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    // 滚动位置
    pageScrollPosition.destory();
    next();
  },
  methods: {

    dealDataMessage(data) {
      let ts = this;
      if (data && data.feedList) {
        ts.newList = (ts.newList || []).concat(data.feedList);//feedList的数据
      } else {
        ts.newList = ts.newList;
      }

    },
    //加载更多滚动事件
    scrollListener() {
      var ts = this;
      $(window).scroll(function () {//滚动条滚动事件
        var offset = window.pageYOffset;
        var offsetTop = document.body.scrollHeight;
        if (offsetTop - offset - window.screen.availHeight < 10) {
          //整个页面的高度-滚动条滚动的高度-返回当前屏幕高度
          if (!ts.no_more) {
            ts.loading = true;
            if (ts.ajaxFlag) return;
            var thisNewList = [];
            if (ts.isActive == 'hot') {
              thisNewList = ts.customHotList;
            } else if (ts.isActive == 'mine') {
              thisNewList = ts.customMyList;
            } else {
              thisNewList = ts.customNewList;
            }
            if (thisNewList && thisNewList[ts.pageIndex] && thisNewList[ts.pageIndex].length > 0) {
              ts.newList = thisNewList[ts.pageIndex];
            } else {

              ts.getDataMessage(ts.dealDataMessage);
            }
          }
          ts.loading = false;
        }
      })
    },
    //加入后从新调用接口数据
    getDatarel() {
      var ts = this;
      $.ajax({
        cache: false,
        async: true,
        url: '/api/mg/content/bookstore/actDetail?_=' + Date.now(),
        type: 'post',
        data: encrypt({
          actId: this.$route.query.actId
        }),
        dataType: 'json',
        success(res) {
          if (res.code == 0) {
            dealData.call(ts, res.data);
          }
        },
        error(error) {
          console.error('ajax error:' + error.status + ' ' + error.statusText);
        }
      });
    },
    //打卡详情数据接口调用
    getDataMessage(callback) {
      var ts = this;
      ts.ajaxFlag = true;
      var tmpData = [];
      if (ts.isActive == 'hot') {
        if (ts.customHotList && ts.customHotList[ts.pageIndex] && ts.customHotList[ts.pageIndex].length > 0) {
          tmpData = ts.customHotList[ts.pageIndex];
        }
      } else if (ts.isActive == 'mine') {
        if (ts.customMyList && ts.customMyList[ts.pageIndex] && ts.customMyList[ts.pageIndex].length > 0) {
          tmpData = ts.customMyList[ts.pageIndex];
        }
      } else {
        if (ts.customNewList && ts.customNewList[ts.pageIndex] && ts.customNewList[ts.pageIndex].length > 0) {
          tmpData = ts.customNewList[ts.pageIndex];
        }
      }

      if (tmpData.length == 0 && !ts.no_more) {
        $.ajax({
          cache: false,
          async: true,
          url: '/api/mg/content/bookstore/actContent?_=' + Date.now(),
          type: 'post',
          data: encrypt({
            pageIndex: ts.pageIndex,
            pageSize: 20,
            category: ts.isActive,
            actId: this.$route.query.actId
          }),
          dataType: 'json',
          success(res) {
            ts.ajaxFlag = false;
            if (res.code == 0) {
              //数据返回来的不够请求的
              if (res.data && res.data.feedList && res.data.feedList.length == 20) {
                ts.no_more = false;
                ts.flag = 1;
              } else {
                if (ts.pageIndex == 0) {
                  if (!res.data) {
                    ts.flag = 0;
                  } else if (res.data && (!res.data.feedList || res.data.feedList && res.data.feedList.length == 0)) {
                    ts.flag = 0;

                  } else {
                    ts.flag = 1;
                  }
                }
                ts.no_more = true;//没有更多了
              }

              callback(res.data);

              // 填充缓存数据
              if (res.data && res.data.feedList && res.data.feedList.length > 0) {
                if (ts.isActive == 'hot') {
                  ts.customHotList[ts.pageIndex] = res.data.feedList;
                  ts.flag = 1;
                } else if (ts.isActive == 'mine') {
                  ts.customMyList[ts.pageIndex] = res.data.feedList;
                  ts.flag = 1;
                } else {
                  ts.customNewList[ts.pageIndex] = res.data.feedList;
                  ts.flag = 1;
                }
              }

              //page页码 ++
              ts.pageIndex += 1;

            } else {
              ts.ajaxFlag = false;
            }
          },
          error(error) {
            console.error('ajax error:' + error.status + ' ' + error.statusText);
          }
        });
      } else {
        callback(tmpData);
      }
    },
    //点击获取数据
    activeChange(category) {
      var ts = this;
      ts.isActive = category;
      ts.pageIndex = 0;
      //点击判断最新  热门、我的
      var tmpData = [];
      var customData = [];
      if (ts.isActive == 'hot') {
        if (ts.customHotList && ts.customHotList.length > 0) {
          tmpData = ts.customHotList;
        }
      } else if (ts.isActive == 'mine') {
        if (ts.customMyList && ts.customMyList.length > 0) {
          tmpData = ts.customMyList;
        }
      } else {
        if (ts.customNewList && ts.customNewList.length > 0) {
          tmpData = ts.customNewList;
        }
      }

      if (tmpData.length > 0) {
        for (var i = 0; i < tmpData.length; i++) {
          customData = (customData || []).concat(tmpData[i]);
        }
      }
      ts.pageIndex = tmpData.length;
      ts.flag = 1;

      if (customData.length > 0) {
        ts.newList = customData;
      } else {
        ts.newList = [];
        ts.no_more = false;
        ts.getDataMessage(ts.dealDataMessage);
      }


    },
    //今日打卡 ————> 去打卡
    toCard() {
      var ts = this;
      $.ajax({
        cache: false,
        async: true,
        url: '/api/mg/content/bookstore/signCreate?_=' + Date.now(),
        type: 'post',
        data: encrypt({
          actId: this.$route.query.actId
        }),
        dataType: 'json',
        success(res) {
          if (res.code == 0) {
            ts.actStatus = res.data.actStatus;
            if (ts.actStatus == 0) {
              window.location.href = '/book/router.html#/custom_card?actId=' + ts.$route.query.actId + '&no_change=1';
            } else if (ts.actStatus == 1) {
              popup.toast('活动今日已打卡');
            } else {
              popup.toast('活动已下线');
            }
          }
        },
        error(error) {
          console.error('ajax error:' + error.status + ' ' + error.statusText);
        }
      });
//
    },
    //周卡————> 月卡
    goMonthCard() {
      window.location.href = '/book/router.html#/card_record?actId=' + this.$route.query.actId;
    },
    //删除今日打卡记录
    toWindow(obj, newList) {
      var that = this;
      //找到今日打卡ID
      newList.map(function (item, index) {
        if (newList[index].body.id == obj) {
          that.flagIndex = index;
        }
      });
//        if(that.customNewList.length > 0){
//          console.log(that.customNewList);
//        }
      popup.confirm({
        text: '今日已打卡，是否删除已有打卡记录？',
        okBtnTitle: '确定',
        okBtnCallback() {
          $.ajax({
            cache: false,
            async: true,
            url: '/api/mg/content/bookstore/signDelete?_=' + Date.now(),
            type: 'post',
            data: encrypt({
              id: that.dataList.userInfo.contentId
            }),
            dataType: 'json',
            success(res) {
              if (res.code == 0) {
                ////-1:未打卡 非-1时为今日打卡Id
                that.dataList.userInfo.contentId = -1;
                that.dataList.userInfo.actSignDay = that.dataList.userInfo.actSignDay - 1;
                that.styleFlag = true;
                if (that.flagIndex >= 0) {
                  that.newList.splice(that.flagIndex, 1);
                }
              }
            },
            error(error) {
              console.error('ajax error:' + error.status + ' ' + error.statusText);
            }
          });
        },
        cancelBtnTitle: '取消',
      });
    },
    //加入打卡活动
    joinAct(obj) {
      var ts = this;
      // 去首页缓存
//        localStorage.removeItem('/book/index-getData');
      $.ajax({
        cache: false,
        async: true,
        url: '/api/mg/content/bookstore/joinAct?_=' + Date.now(),
        type: 'post',
        data: encrypt({
          actId: this.$route.query.actId
        }),
        dataType: 'json',
        success(res) {
          if (res.code == 0) {
            if (res.visitor_status == 3 || res.visitor_status == 1) {
//                ts.dataList.joinStatus = 1;
              ts.getDatarel();
            }
          } else {
            login.login();
          }
        },
        error(error) {
          console.error('ajax error:' + error.status + ' ' + error.statusText);
        }
      });
    },
    // 监听shareInfo变化
    shareAdd() {
      let ts = this;
      share.setShareInfo({
        title: ts.shareInfo.title,
        desc: ts.shareInfo.actDesc,
        link: location.href,
        imgUrl: ts.shareInfo.imgUri,
      });
      // 唤起分享面板
      share.callShare();
    }
  }
}


//匹配打卡打卡日期和是否打卡
function checkTime() {
  if (this.dateInfo) {
    var arr = Object.keys(this.dateInfo);
    var timeArr = this.arrChange;
    var newArr = this.dateDayArr;
    timeArr.map(function (item, index) {
      arr.map(function (item2, index2) {
        if (item == item2) {
          Vue.set(newArr, index, 1);//set 创建一个数组存放相同的数组的索引
//              newArr[index]=1; 等同于上  但是上面可以监听数组改变
        }
      })
    });
    this.dateDayArr = newArr;
  }
}

//数据处理
function dealData(data) {
  let ts = this,
    dataTime = (ts.sysTime), //时间戳转化
    myDate = new Date(dataTime * 1000),// 美化时间
    day = myDate.getDay(),//推算今天周几
    sunDayTime = dataTime - day * 24 * 3600,//推算出周日的时间
    arrData = [],//创建一个改变成今的数组
    arrChange = [];//创建一个时间的数组
  for (let i = 0; i < 7; i++) {
    let item = new Date(1000 * (sunDayTime + i * 24 * 3600));
    arrChange.push(item.getDate());
  }
  ts.arrChange = arrChange;

  for (let i = 0; i < 7; i++) {
    let item = new Date(1000 * (sunDayTime + i * 24 * 3600));
    if (i === day) {
      arrData.push('今');
      ts.today = i;
    } else {
      arrData.push(item.getDate());
    }
  }
  //定义一个数组存放当前一周对应的日期
  let weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  //遍历周
  ts.weekDay = weekDay;
  //遍历日期
  ts.dateDay = arrData;
  //数据初始化
  ts.dataList = data;
  ts.actInfo = data.actInfo;// title 描述
  ts.contentTitle = data.contentTitle;//最新、热门、我的
  ts.newList = data.newList;//数据列表
  ts.shareInfo = data.shareInfo;// 分享

  if (ts.dataList.joinStatus == 1) {
    ts.dateInfo = data.userInfo.dateInfo;//当joinStatus为1时  存在此节点
  }

  checkTime.call(ts);
}

// 初始化获取数据接口
function getData(next, to) {
  var ts = this;
  if (next || ts.customNewList.length == 0) {
    $.ajax({
      cache: false,
      async: true,
      url: '/api/mg/content/bookstore/actDetail?_=' + Date.now(),
      type: 'post',
      data: encrypt({
        pageIndex: next ? 0 : ts.pageIndex,
        pageSize: 20,
        actId: next ? to.query.actId : this.$route.query.actId,
      }),
      dataType: 'json',
      success(response) {
        function callback(response) {
          if (response.code == 0) {
            this.response = response;
            //获取到当前的时间戳
            this.sysTime = response.sys_time;
            //数据返回来的不够请求的
            if (response.data.newList && response.data.newList.length == 20) {
              this.no_more = false;//加载更多
              this.flag = 1;
              this.pageIndex += 1;
            } else {
              if (this.pageIndex == 0) {
                if (!response.data) {
                  this.flag = 0;//没有打卡记录
                } else if (response.data && (!response.data.newList || response.data.newList && response.data.newList.length == 0)) {
                  this.flag = 0;
                } else {
                  this.flag = 1;
                  this.no_more = true;//没有更多了
                }
              } else {
                this.no_more = true;//没有更多了
              }
            }
            // callback(response.data);
            dealData.call(this, response.data);
            // 填充缓存数据
            if (response.data.newList && response.data.newList.length > 0) {
              this.customNewList[0] = response.data.newList;
            }
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
}
