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

import api from "../js/api.js";

export default {
  data: function () {
    return {
      audioListFlag: false,
      index: 0,
      musicList: [],
      musicPlayList: [],
      playTime: 0,
      isPlay: false,
      playTimer: null,
      allAudio: null,
      getDataFlag: true,
      scrollTop: 1,
      isapp: !!navigator.userAgent.match(/davdian|bravetime|vyohui/),
      price: -1,
      ua: ua,

      musicId: this.$route.query.musicId,
      isScroll: false,
      canRead: -1
    }
  },
  computed: {
    musicListBlock(){
      let arr = []
      if (this.musicList >= 7) {
        return null
      } else {
        if (7 - this.musicList.length < 1) {
          return null
        } else {
          arr.length = 7 - this.musicList.length
        }
      }
      return arr
    },
    introduction(){
      var that = this;
      this.$nextTick(function () {
        var length = $('.bottom_text img').length;
        if (length == 0) {
          if (this.musicList && this.musicList[this.musicList.length - this.index - 1] && this.musicList[this.musicList.length - this.index - 1].introduction) {
            setTimeout(function () {
              if (that.isapp && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
                native.Browser.showWebHeight({
                  "webHeight": ($('.bottom_text').height() + 30).toString()
                })
              }
            }, 200)
          } else {
            console.log('introduction is null')
          }
        } else {
          var imgIndex = 0;
          var imgs = $('.bottom_text img');
          for (var i = 0; i < imgs.length; i++) {
            $(imgs[i]).css("max-width", "100%");
            imgs[i].onload = function () {
              imgIndex++;
              console.log("一个结束啦");
              if (imgIndex == $('.bottom_text img').length) {
//                    alert("加载完毕");
                if (that.isapp && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
                  setTimeout(function () {
                    native.Browser.showWebHeight({
                      "webHeight": ($('.bottom_text').height() + 30).toString()
                    })
                  }, 200)
                }
              }
            };
          }
        }
      })
      return this.musicList && this.musicList[this.musicList.length - this.index - 1] && this.musicList[this.musicList.length - this.index - 1].introduction || null
    }
  },
  created: function () {
    this.isLogin();
  },
  watch: {
    // 监听response变化
    musicList(){
      // response变化后并渲染完dom,设置其他事项
      this.$nextTick(function() {
        if(ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0){
          native.Browser.close();
          native.BookStore.enterPerusal({
            albumId: this.$route.query.albumId,
            musicId: this.$route.query.musicId
          });

        }
      });
    },
  },
  mounted: function () {
    this.scroll();
    document.title = '音频详情';

    var that = this
    this.$nextTick(function () {
      // that.playData()

      // 滚动位置
      pageScrollPosition.init(0);
      // pageScrollPosition.autoSave();

      $('a').on('click', function (event) {
        event.preventDefault();
      });

      var obj = {
        albumId: this.$route.query.albumId || 0,
        sort: '0',
        musicId: this.$route.query.musicId
      }

      if (localStorage.getItem('access_token')) {
        obj['access_token'] = localStorage.getItem('access_token')
      }
      if (localStorage.getItem('expires_in')) {
        obj['expires_in'] = localStorage.getItem('expires_in')
      }
      api('/api/mg/content/music/getListData', obj).then(function (data) {
        that.checkPosition();
        if (data.code == 0) {
          if (data.data && data.data.dataList) {
            that.price = data.data.attr.price;
            that.musicList = that.musicList.concat(data.data.dataList);
            that.musicPlayList = that.musicList.map(function (item) {
              return item.fileLink;
            }).reverse();
            that.allAudio = data.data.attr.count
          } else {
            popup.confirm({
              title: '提示',
              text: '音频已经被删除',
              okBtnTitle: '确定',
              cancelBtnTitle: '取消',
              okBtnCallback: function () {
                window.history.back()
              },
              cancelBtnCallback: function () {
                window.history.back()
              }
            });
          }
        } else {
          if (data.data && data.data.msg) {
            popup.confirm({
              title: '提示',
              text: 'code=' + data.code + ';msg=' + data.data.msg,
              okBtnTitle: '确定',
              cancelBtnTitle: '取消',
              okBtnCallback: function () {
              },
              cancelBtnCallback: function () {
              }
            });
          } else {
//              popup.confirm({
//                title: '提示444',
//                text: 'code='+data.code,
//                okBtnTitle: '确定',
//                cancelBtnTitle: '取消',
//                okBtnCallback: function(){},
//                cancelBtnCallback: function(){}
//              });
          }
        }
        if (data && data.data && data.data.xmlyToken && data.data.xmlyToken.access_token) {
          localStorage.setItem('access_token', data.data.xmlyToken.access_token)
          localStorage.setItem('expires_in', data.data.xmlyToken.expires_in)
        }
        if (data && data.data && data.data.dataList && data.data.dataList[that.index] && data.data.dataList[that.index].shareInfo) {
          try {
//              share.setShareInfo({
//                title: data.data.dataList[that.musicList.length - that.index -1].shareInfo.title,
//                desc: data.data.dataList[that.musicList.length - that.index -1].shareInfo.desc,
//                link: data.data.dataList[that.musicList.length - that.index -1].shareInfo.link,
//                imgUrl: data.data.dataList[that.musicList.length - that.index -1].shareInfo.imgUrl,
//                success:function(){
//                  var obj = {
//                    albumId: this.$route.query.albumId,
//                    musicId: that.musicList[that.musicList.length - 1 - that.index].musicId
//                  }
//                  api('/api/mg/content/music/onSub',obj).then(function(data){
//                    console.log('data--->', data)
//                  })
//                }
//              });
          } catch (err) {
            alert(err)
          }

        }
      })

    })
  },
  beforeRouteLeave(to, from, next) {
    // 滚动位置
    pageScrollPosition.destory();
    next();
  },
  methods: {
    canReadFn(values){
      this.canRead = values;
    },
    shareInfo(values){
      console.log(values);
      share.setShareInfo({
        title: values.title,
        desc: values.desc,
        link: values.link,
        imgUrl: values.imgUrl,
      });
    },
    isLogin(){
      if (!login.isLogined()) {
        if (!!navigator.userAgent.match(/davdian|bravetime|vyohui/)) {
          native.Account.login()
        } else {
          window.location.href = '/login.html?' + 'referer=' + encodeURIComponent(window.location.href)
        }
      }
    },
    scroll(){
      var _this = this;
      document.body.onscroll = function () {
        _this.isScroll = true;
      }
    },
    checkPosition(){
      var _this = this;
      if (window.location.href.indexOf("position") != -1) {
        setTimeout(function () {
          if (!_this.isScroll) {
            //            window.location.href="#all";

            var top = $('#all')[0].offsetTop - 10 - 44;
//            var timer=setInterval(function () {
//              if($(document).scrollTop()<=top){
//                window.scrollTo(0,$(document).scrollTop()+15)
//                console.log($(document).scrollTop());
//                console.log(top);
//              }else{
//                window.scrollTo(0,top);
//                clearInterval(timer);
//              }
//            },10)

            $('html,body').animate({scrollTop: top}, 500);
          }
        }, 1000)
      }
    },
    goindex(){
      if (this.isapp) {
        native.Browser.open({
          url: "/"
        })
      } else {
        window.location.href = "/";
      }
    },
    playTrackSingle(){
      let that = this
      let obj = {
        albumId: this.$route.query.albumId,
        musicId: that.musicId,
        duration: that.playTime,
        play_type: 1,
      }
      if (that.musicList && that.musicList[that.index] && that.musicList[that.index].musicId) {
        obj['musicId'] = that.musicList[that.musicList.length - 1 - that.index].musicId
      }
      if (localStorage.getItem('expires_in')) {
        obj.expires_in = localStorage.getItem('expires_in')
      }
      if (localStorage.getItem('access_token')) {
        obj.expires_in = localStorage.getItem('access_token')
      }
      api('/api/mg/content/music/playTrackSingle', obj).then(function (data) {
        console.log('1' +
          'data--->', data)
      })
    },
    playData(){
      let that = this
      let obj = {
        albumId: this.$route.query.albumId,
        musicId: that.musicId,
        duration: that.playTime,
        play_type: 1,
      }
      console.log("obj", obj);
      if (that.musicList && that.musicList[that.index] && that.musicList[that.index].musicId) {
        obj['musicId'] = that.musicList[that.musicList.length - 1 - that.index].musicId
      }
      if (localStorage.getItem('expires_in')) {
        obj.expires_in = localStorage.getItem('expires_in')
      }
      if (localStorage.getItem('access_token')) {
        obj.expires_in = localStorage.getItem('access_token')
      }
      api('/api/mg/content/music/click', obj).then(function (data) {
        console.log('clickdata-->', data)
      })
    },
    nativePay(url, callback){
      var option = {};
      option.url = encodeURIComponent(url);
      if (url.split("app_pay/").length > 1) {
        var list = url.split("app_pay/")[1].split("&");
        for (var i = 0; i < list.length; i++) {
          var key = list[i].split("=")[0];
          var value = list[i].split("=")[1];
          option[key] = value;
        }
      }
      option.success = callback
      native.Browser.pay(option)
    },
    subscription(){
      if (this.isapp) {
        native.Browser.open({
          "url": "/collect.html?albumId=" + this.$route.query.albumId
        });
      } else {
        window.location.href = "/collect.html?albumId=" + this.$route.query.albumId;
      }
      // var that = this
      // if (!that.isapp){
      //   window.location.href = '/collect.html?albumId=' + getQuery('albumId')
      // }
      // let obj = {
      //   albumId:getQuery('albumId'),
      //   shareUserId:getQuery('shareUserId') || ''
      // }
      // api('/api/mg/content/album/subscription', obj).then(function(result){
      //   let {code,data:{msg,payUrl,jsApi}}=result;
      //   if (code == 0){
      //     if (result.data.code == 300){
      //       if(jsApi){
      //           jsApi.jsApiParameters.dvdhref=location.href;
      //           // window.location.href = "http://open.davdian.com/wxpay_t2/davke_pay.php?info="+encodeURIComponent(JSON.stringify(jsApi.jsApiParameters))
      //           window.location.href = "http://open.vyohui.cn/wxpay_t3/davke_pay.php?info="+encodeURIComponent(JSON.stringify(jsApi.jsApiParameters))
      //       }else if(payUrl){
      //       }else{
      //         window.location.href = '/musicDetail.html?albumId=' + getQuery('albumId') + '&sortNo='+ that.musicList[that.musicList.length - that.index - 1].sortNo
      //       }

      //     }else {
      //       if (result.data.code == 100){
      //         if (that.isapp){
      //           native.Account.login()
      //         }else {
      //           let url = window.location.origin + '/musicDetail.html?albumId=' + getQuery('albumId') + '&sortNo='+ that.musicList[that.musicList.length - that.index -1].sortNo
      //           window.location.href = '/login.html?'+'referer=' + encodeURIComponent(url)
      //         }
      //       } else {
      //         popup.confirm({
      //           title: '提示',
      //           text: result.data.msg,
      //           okBtnTitle: '确定',
      //           cancelBtnTitle: '取消',
      //           okBtnCallback: function(){},
      //           cancelBtnCallback: function(){}
      //         });
      //       }
      //     }
      //   } else {
      //     popup.confirm({
      //       title: '提示',
      //       text: 'code:' + code + 'msg:'+ result.data.msg,
      //       okBtnTitle: '确定',
      //       cancelBtnTitle: '取消',
      //       okBtnCallback: function(){},
      //       cancelBtnCallback: function(){}
      //     });
      //   }
      // })
    },
    // shareInfo(index){
    //   var that = this
    //   let shareInfo = {}
    //   if (that.musicList[index].shareInfo){
    //     shareInfo = that.musicList[index].shareInfo
    //     share.setShareInfo({
    //       title: shareInfo.title,
    //       desc: shareInfo.desc,
    //       link: shareInfo.link,
    //       imgUrl: shareInfo.imgUrl
    //     });
    //   }
    //   console.log('shareinfo-->', shareInfo)
    // },
    goback(){
      window.history.back()
    },
    goAlbumId(){
      if (this.isapp) {
        native.Browser.open({
          'url': '/collect.html?albumId=' + this.$route.query.albumId || 0
        })
      } else {
        window.location.href = '/collect.html?albumId=' + this.$route.query.albumId || 0
      }

    },
    closeAudioList(){
      this.audioListFlag = false
      $('body').css({
        'height': 'auto',
        "overflow": "visible"
      });
    },
    openAudioList(){
      var that = this
      this.audioListFlag = true
      $('body').css({
        'height': document.documentElement.clientHeight - 105 + "px",
        "overflow": "hidden"
      });
      setTimeout(function () {
        $('.mask_banner').get(0).scrollTop = that.scrollTop
        $('.mask_banner').scroll(function (e) {
          that.scrollTop = $('.mask_banner').get(0).scrollTop
          console.log(1, $('.mask_banner').get(0).scrollTop)
          if ($('.mask_banner').get(0).scrollTop < 1) {
            // console.log(2)
            $('.mask_banner').get(0).scrollTop = 1
            console.log(that.musicList[that.musicList.length - 1].sortNo)
            if (that.musicList[that.musicList.length - 1].sortNo == 0) {
              that.getData(1, that.musicList[that.musicList.length - 1].sortNo, false)
            } else {
              that.getData(1, that.musicList[that.musicList.length - 1].sortNo, false)
            }
          }
          if ($('.mask_banner').get(0).scrollTop > $('.mask_banner_content').height() - $('.mask_banner').height() - 2) {
            $('.mask_banner').get(0).scrollTop = $('.mask_banner_content').height() - $('.mask_banner').height() - 2

            if (that.musicList[0].sortNo == that.allAudio - 1) {
            } else {
              that.getData(-1, that.musicList[0].sortNo, false)
            }
          }
        })
      }, 300)
    },
    dialog(){
      popup.confirm({
        title: '提示',
        text: '打开大V店APP，体验更佳',
        okBtnTitle: '确定',
        cancelBtnTitle: '取消',
        okBtnCallback: function () {
        },
        cancelBtnCallback: function () {
        }
      });
    },
    loadAudio(src, callback) {
      var audio = new Audio(src);
      audio.onloadedmetadata = callback;
      audio.src = src;
    },
    prev(){
      if (this.index <= 0) {
        popup.confirm({
          title: '提示',
          text: '已经是第一首了',
          okBtnTitle: '确定',
          cancelBtnTitle: '取消',
          okBtnCallback: function () {
          },
          cancelBtnCallback: function () {
          }
        });
      }
      this.$refs.audio.prev();
    },
    next(){
      if (this.index >= this.musicList.length - 1) {
        popup.confirm({
          title: '提示',
          text: '已经是最后一首了',
          okBtnTitle: '确定',
          cancelBtnTitle: '取消',
          okBtnCallback: function () {
          },
          cancelBtnCallback: function () {
          }
        });
      }
      this.$refs.audio.next();
    },
    // 监听播放序号
    onChange(param) {
      this.index = param.playIndex;
      this.isPlay = param.isPlaying;
    },
    playAudio(index){
      if (this.canRead == 0) {
        popup.confirm({
          title: '提示',
          text: '只有小书库会员才能听呀',
          okBtnTitle: '购买小书库',
          cancelBtnTitle: '取消',
          okBtnCallback: function () {
            window.location.href = "/index.php?c=ShopGoods&a=index&id=623534";
          },
          cancelBtnCallback: function () {
          }
        });
      } else {
        var that = this;

        if(index !== undefined){
          this.index = index;
          that.$refs.audio.play(index);
          that.isPlay = true;
        } else {
          if (that.isPlay) {
            that.$refs.audio.pause();
            that.isPlay = false;
          } else {
            that.$refs.audio.play();
            that.isPlay = true;
          }
        }

        // 去首页缓存
        localStorage.removeItem('/book/index-getData');

        /*//不传index代表点击当前歌曲
         if (index != -100) {
         if (index == -1) {
         if (that.musicList[that.musicList.length - 1].sortNo == that.allAudio - 1) {
         popup.confirm({
         title: '提示',
         text: '已经是第一首了',
         okBtnTitle: '确定',
         cancelBtnTitle: '取消',
         okBtnCallback: function () {
         },
         cancelBtnCallback: function () {
         }
         });
         return
         } else {
         that.getData(1, that.musicList[that.musicList.length - 1].sortNo, true)
         return
         }
         }
         if (index == that.musicList.length) {
         if (that.musicList[0].sortNo == 0) {
         popup.confirm({
         title: '提示',
         text: '已经是最后一首了',
         okBtnTitle: '确定',
         cancelBtnTitle: '取消',
         okBtnCallback: function () {
         },
         cancelBtnCallback: function () {
         }
         });
         return
         } else {
         that.getData(-1, that.musicList[0].sortNo, true)
         return
         }
         }
         if (that.musicList[that.musicList.length - index - 1].isPlay != 1) {
         popup.confirm({
         title: '提示',            // 标题（支持传入html。有则显示。）
         text: '订阅后才能继续收听哦',             // 文本（支持传入html。有则显示。）
         okBtnTitle: '马上订阅',       // 确定按钮标题（支持传入html。有则显示，无则显示默认'确定'。）
         cancelBtnTitle: '取消',   // 取消按钮标题（支持传入html。有则显示，无则显示默认'取消'。）
         okBtnCallback: function () {
         that.subscription()
         },
         cancelBtnCallback: function () {
         }
         });
         return
         }
         } else {
         if (that.musicList[that.musicList.length - that.index - 1].isPlay != 1) {
         popup.confirm({
         title: '提示',            // 标题（支持传入html。有则显示。）
         text: '订阅后才能继续收听哦',             // 文本（支持传入html。有则显示。）
         okBtnTitle: '马上订阅',       // 确定按钮标题（支持传入html。有则显示，无则显示默认'确定'。）
         cancelBtnTitle: '取消',   // 取消按钮标题（支持传入html。有则显示，无则显示默认'取消'。）
         okBtnCallback: function () {
         that.subscription()
         },
         cancelBtnCallback: function () {
         }
         });
         return
         }
         }
         if (that.playTimer) {
         clearInterval(that.playTimer)
         }
         if (index >= 0) {

         that.musicId = that.musicList[that.musicList.length - index - 1].musicId;
         console.log(index);
         console.log(that.musicId);

         that.playTime = 0
         that.index = index
         //传index代表播放别的歌
         that.isPlay = true
         $('.allAudio').get(0).src = that.musicList[that.musicList.length - 1 - that.index].fileLink
         $('.allAudio').get(0).play()
         $('.allAudio').get(0).onloadedmetadata = function () {
         that.musicList[that.musicList.length - 1 - that.index].time = $('.allAudio').get(0).duration
         $('.allAudio').get(0).play();
         that.playTimer = setInterval(function () {
         that.playTime = parseInt(that.playTime) + 1
         }, 1000)
         }
         $('.allAudio').get(0).onended = function () {
         that.isPlay = false
         that.playTime = 0
         clearInterval(that.playTimer)
         that.playTrackSingle()
         that.playAudio(that.index + 1)
         }
         that.playData()
         // that.shareInfo(that.index)
         } else {
         if (that.isPlay) {
         that.isPlay = false
         $('.allAudio').get(0).pause()
         } else {
         that.isPlay = true
         $('.allAudio').get(0).src = that.musicList[that.musicList.length - 1 - that.index].fileLink
         $('.allAudio').get(0).play()
         $('.allAudio').get(0).pause()
         $('.allAudio').get(0).onloadedmetadata = function () {
         that.musicList[that.musicList.length - 1 - that.index].time = $('.allAudio').get(0).duration
         $('.allAudio').get(0).currentTime = that.playTime;
         $('.allAudio').get(0).play()
         that.playTimer = setInterval(function () {
         that.playTime = parseInt(that.playTime) + 1
         }, 1000)
         }
         $('.allAudio').get(0).onended = function () {
         that.isPlay = false
         that.playTime = 0
         clearInterval(that.playTimer)
         that.playTrackSingle()
         that.playAudio(that.index + 1)
         }
         that.playData()
         }
         }*/
      }


    },
    getData(sort, sortNo, flag){
      var that = this
      if (that.getDataFlag) {
        that.getDataFlag = false
        let obj = {
          albumId: this.$route.query.albumId,
          sort: sort,
          sortNo: sortNo
        }
        if (localStorage.getItem('access_token')) {
          obj['access_token'] = localStorage.getItem('access_token')
        }
        if (localStorage.getItem('expires_in')) {
          obj['expires_in'] = localStorage.getItem('expires_in')
        }
        api('/api/mg/content/music/getListData', obj).then(function (data) {
          if (data.code == 0) {
            if (data && data.data && data.data.dataList) {
              if (sort == -1) {
                that.musicList = data.data.dataList.concat(that.musicList);
                that.musicPlayList = that.musicList.map(function (item) {
                  return item.fileLink;
                }).reverse();
                if (flag) {
                  that.index = that.index + data.data.dataList.length
                } else {
                  // that.index = that.index + data.data.dataList.length
                }
              } else {
                that.musicList = that.musicList.concat(data.data.dataList)
                if (flag) {
                  that.index = that.index + data.data.dataList.length - 2
                } else {
                  that.index = that.index + data.data.dataList.length
                }
              }
              if (flag) {
                that.playAudio(that.index + 1);
              }
            }
          } else {
            if (data.data && data.data.msg) {
              popup.confirm({
                title: '提示',
                text: 'code=' + data.code + ';msg=' + data.data.msg,
                okBtnTitle: '确定',
                cancelBtnTitle: '取消',
                okBtnCallback: function () {
                },
                cancelBtnCallback: function () {
                }
              });
            } else {
              popup.confirm({
                title: '提示',
                text: 'code=' + data.code,
                okBtnTitle: '确定',
                cancelBtnTitle: '取消',
                okBtnCallback: function () {
                },
                cancelBtnCallback: function () {
                }
              });
            }
          }
          if (data && data.data && data.data.xmlyToken && data.data.xmlyToken.access_token) {
            localStorage.setItem('access_token', data.data.xmlyToken.access_token)
            localStorage.setItem('expires_in', data.data.xmlyToken.expires_in)
          }
          setTimeout(function () {
            that.getDataFlag = true
          }, 1000)
        })
      } else {
        // console.log(456)
      }
    },
    timeFormat(t){
      let time = Math.ceil(t)
      if (time < 60) {
        if (time < 10) {
          time = '0' + time
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
  },
  components: {
    'com-top-title': require('dvd-service-com-title').default,
    'bottom': require('../vue/bottom.vue').default,
    'dvd-service-com-audio-player': require('dvd-service-com-audio-player').default,
  }
}
