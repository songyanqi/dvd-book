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
      dataList: [],
      shareInfo: {},//分享
      loading: false,
      no_more: false,
      ajaxFlag: false,
      sort: 0,
      minSortNo: 0,
      musicId: 0,
      lastMusicId: 0,
      sysTime: 0,//时间戳
      date,
      response: {},
      ua: ua,
    }
  },
  components: {
    'dvd-service-com-title': require('dvd-service-com-title').default,
    'dvd-service-com-go-page-top': require('dvd-service-com-go-page-top').default,
  },
  beforeRouteEnter(to, from, next) {
    getData(next);
  },
  created() {
    var ts = this;
    // ts.getData(ts.dealData);
    if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') >= 0) {
          // 如果在app中，显示音频浮窗
          setTimeout(function(){
            native.Browser.setHead({
              isShowAudio: '1',
              'hideHead': '1'
            });
          },3500);
        }
  },
  mounted(){
    let ts = this;
    // 接受全局音频浮窗状态变化
    window.iosInterface = window.iosInterface || {};
    window.iosInterface.getAudioState = function (obj) {
      ts.common(obj);
    };
  },
  watch: {
    //response 变化
    response(){
      this.$nextTick(function () {
        let ts = this;

        // 滚动位置
        pageScrollPosition.init();
        pageScrollPosition.autoSave();

        // 设置分享信息
        share.setShareInfo({
          title: ts.shareInfo.title,
          desc: ts.shareInfo.desc,
          link: location.href,
          imgUrl: ts.shareInfo.imgUrl,
        });
        if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') >= 0) {
          // 如果在app中，显示音频浮窗
          native.Browser.setHead({
            isShowAudio: '1',
          });
        }
        //检查音频播放状态
        ts.setPlayState();
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    // 滚动位置
    pageScrollPosition.destory();
    next();
  },
  methods: {
    //时间转化分钟数
    timeFormat(t) {
      let time = Math.ceil(t);
      if (time < 60) {
        if (time < 10) {
          time = '0' + parseInt(t)
        }
        return '00:' + time
      } else {
        if (time < 3600) {
          let minutes = parseInt(time / 60)
          let seconds = time - minutes * 60
          if (minutes < 10) {
            minutes = '0' + minutes
          }
          if (seconds < 10) {
            seconds = '0' + seconds
          }
          return minutes + ':' + seconds
        } else {
          let hours = parseInt(time / 3600)
          let minutes = parseInt((time - hours * 3600) / 60)
          let seconds = time - hours * 3600 - minutes * 60
          if (hours < 10) {
            hours = '0' + hours
          }
          if (minutes < 10) {
            minutes = '0' + minutes
          }
          if (seconds < 10) {
            seconds = '0' + seconds
          }
          return hours + ':' + minutes + ':' + seconds
        }
      }
    },
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
            // ts.getData(ts.dealData);
            getData.call(ts);
          }
        }
      })
    },
    //点赞
    getPraise(item, index) {
      let ts = this;
      $.ajax({
        cache: false,
        async: true,
        url: '/api/mg/content/prime/praise?_=' + Date.now(),
        type: 'post',
        data: encrypt({
          albumId: ts.dataList[index].albumId,
          musicId: ts.dataList[index].musicId
        }),
        dataType: 'json',
        success(res) {
          var num = ts.dataList[index].favorNum;
          if (res.code == 0) {
            if (res.visitor_status == 3 || res.visitor_status == 1) {
              if (ts.dataList[index].favorNum.toString().indexOf('万') === -1 || ts.dataList[index].favorNum.toString().indexOf('亿') === -1) {
                //判断是否点过赞
                if (ts.dataList[index].isFavored == "0") {
                  ts.dataList[index].favorNum = parseInt(num) + 1;
                }
              }
              ts.dataList[index].isFavored = '1';
            }
          } else {
            login.login();//登陆检测
          }
        },
        error(error) {
          console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
        }
      });
    },
    noPraise() {
      popup.toast('您已经点过赞了');
    },

    //App 调用分享面板
    shareCard(obj, index){
      let ts = this;
      login.login();//登陆检测
      if (ua.isDvdApp()) {
        //调用分享接口
        $.ajax({
          cache: false,
          async: true,
          url: '/api/mg/content/music/onSub?_=' + Date.now(),
          type: 'post',
          data: encrypt({
            albumId: ts.dataList[index].albumId,
            musicId: ts.dataList[index].musicId
          }),
          dataType: 'json',
          success(res) {
            let num = ts.dataList[index].shareNum;
            if (res.code == 0) {
              if (res.visitor_status == 3 || res.visitor_status == 1) {
                if (res.data.res == 1) {
                  //调用分享
                  share.setShareInfo({
                    title: obj.shareInfo.title,
                    desc: obj.shareInfo.desc,
                    link: obj.shareInfo.link,
                    imgUrl: (function () {
                      let img = '';
                      img = obj.shareInfo.imgUrl;
                      //图片处理
                      img = img.split('?')[0] + '?x-oss-process=image/resize,m_lfit,h_200,w_200';
                      return img;
                    })(),
                  });
                  // 唤起分享面板
                  share.callShare();
                  if (ts.dataList[index].shareNum.toString().indexOf('万') === -1 || ts.dataList[index].shareNum.toString().indexOf('亿') === -1) {
                    ts.dataList[index].shareNum = parseInt(num) + 1;
                  }
                } else {
                  popup.toast('分享失败');
                }
              }
            }
          },
          error(error) {
            console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
          }
        });

      } else {
        //跳转到精读详情
        // util.open('/book/router.html#/music_detail?albumId=' + obj.albumId + '&musicId=' + obj.musicId);
        location = ('/book/router.html#/music_detail?albumId=' + obj.albumId + '&musicId=' + obj.musicId);
      }
    },

    // 顶部分享
    shareAdd() {
      // shareInfo变化后并渲染完dom,设置其他事项
      let ts = this;
      // 设置分享信息
      share.setShareInfo({
        title: ts.shareInfo.title,
        desc: ts.shareInfo.desc,
        link: location.href,
        imgUrl: ts.shareInfo.imgUrl,
      });
      // 唤起分享面板
      share.callShare();
    },

    //跳转到播放详情
    toActivityMessage(obj){
      var ts = this;
      if (ts.response.visitor_status == 3 || ts.response.visitor_status == 1) {
        if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
          native.BookStore.enterPerusal({
            "albumId": obj.albumId,
            "musicId": obj.musicId
          });
        } else {
          // util.open('/book/router.html#/music_detail?albumId=' + obj.albumId + '&musicId=' + obj.musicId);
          location = ('/book/router.html#/music_detail?albumId=' + obj.albumId + '&musicId=' + obj.musicId);
        }
      } else {
        //未登陆判断是APP || H5
        if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
          native.Account.login({});
        } else {
          login.login();//登陆检测
        }
      }
    },

    //判断h5跳转到音频详情 APP 可以在列表也播放
    toPlaying(obj) {
      let ts = this;
      if (ts.response.visitor_status == 3 || ts.response.visitor_status == 1) {
        //成功判断是否符合播放条件 App5.3.0 使用APP原生页面
        if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
          native.BookStore.enterPerusal({
            "albumId": obj.albumId,
            "musicId": obj.musicId
          });

        } else if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') >= 0) {
          //canRead 1 可以播放
          if (ts.response.data && ts.response.data.canRead === '1') {
            // 唤起全局浮窗
            // 功能: H5触发cmd客户端播放暂停音频
            native.Audio.audioPlay({
              "albumId": obj.albumId,//当前播放的合辑id
              "musicId": obj.musicId,//当前正在播放的音频id
            });

            //在App 5.2.0中 设置播放状态 H5主动调用
            ts.setPlayState();

          } else {
            //提示窗
            popup.confirm({
              text: '只有小书库会员才能听呀',
              okBtnTitle: '购买小书库',
              okBtnCallback() {
                window.location.href = "/index.php?c=ShopGoods&a=index&id=623534";
              },
              cancelBtnTitle: '取消',
            });
          }

        } else {
          //在H5 中
          // util.open('/book/router.html#/music_detail?albumId=' + obj.albumId + '&musicId=' + obj.musicId);
          location = ('/book/router.html#/music_detail?albumId=' + obj.albumId + '&musicId=' + obj.musicId);
        }

      } else {
        //未登陆判断是APP || H5
        if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
          native.Account.login({});
        } else {
          login.login();//登陆检测
        }
      }
    },
    common(data) {
      let ts = this;
      for (let i in ts.dataList) {
        let music = ts.dataList[i];
        if (music.musicId == data.musicId && data.state == '1') {
          music.playing = true;
        } else {
          music.playing = false;
        }
      }
      ts.$forceUpdate();
    },
    // 设置播放状态
    setPlayState() {
      let ts = this;
      //H5触发cmd客户端回调js告诉我们正在播放是哪一条
      native.Audio.audioLocation({
        success(data){
          ts.common(data);
          ts.$forceUpdate();
        },
        error(data){
          ts.dataList.playing = false;
          ts.$forceUpdate();
        },
      });
    },
    //跳转到指定评论位置
    toComment(obj) {
      var ts = this;
      if (ts.response.visitor_status == 3 || ts.response.visitor_status == 1) {
        if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
          native.BookStore.enterPerusal({
            "albumId": obj.albumId,
            "musicId": obj.musicId
          });
        } else {
          // util.open('/book/router.html#/music_detail?albumId=' + obj.albumId + '&musicId=' + obj.musicId + '#position');
          location = ('/book/router.html#/music_detail?albumId=' + obj.albumId + '&musicId=' + obj.musicId + '#position');
        }
      } else {
        //未登陆判断是APP || H5
        if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
          native.Account.login({});
        } else {
          login.login();//登陆检测
        }
      }

    }
  }
}

// 初始化获取数据接口
function getData(next) {
  let ts = this;
  if(!next){
    ts.ajaxFlag = true;
  }
  $.ajax({
    cache: false,
    async: true,
    url: '/api/mg/content/prime/list?_=' + Date.now(),
    type: 'post',
    data: encrypt({
      sort: next ? 0 : ts.sort,
      sortNo: next ? 0 : ts.minSortNo,
      musicId: next ? 0 : ts.lastMusicId
    }),
    dataType: 'json',
    success(response) {
      function callback(response) {
        this.ajaxFlag = false;
        if (response.code == 0) {
          this.response = response;
          this.sysTime = response.sys_time;
          this.sort = -1;
          //数据返回来的不够请求的
          //response.data.dataList && response.data.dataList.length == 10
          if (response.data.hasMore == 1) {
            this.no_more = false;
          } else {
            this.no_more = true;
          }
          //调用监听滚动函数
          if (!this.no_more) {
            this.scrollListener();
          }
          this.loading = false;
          this.dataList = (this.dataList || []).concat(response.data.dataList);
          //分享
          this.shareInfo = response.data.shareInfo;
          //minSortNo
          this.minSortNo = response.data.minSortNo;
          this.lastMusicId = response.data.lastMusicId;
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
      // console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
      // this.success(require('../json/good_book_reading.json'));
      // console.warn(`ajax已使用mock数据: url=${this.url}, mock=good_book_reading.json`);
    }
  });
}
