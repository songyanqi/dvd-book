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

import preview from '../../../component/com-picture-preview/preview.js';
import pageScrollPosition from 'dvd-base-js-page-scroll-position';

// 渲染页面
export default {
  components: {
    'dvd-service-com-title': require('dvd-service-com-title').default,
    // 'com-to-top-icon': require('../../../component/com-to-top-icon.vue'),
  },
  data() {
    return {
      response: null,//存储页面除评论外的信息
      comment: [],//存储页面评论信息
      pageIndex: 1,//评论分页
      loading: false,
      no_more: false,
      ajaxing: false,
      commentNum: '0',//评论数量
      contentId: this.$route.query.contentId,
      priseCount: '0',//点赞数量
      shareCount: '0',//分享数量
      showPrisedTip: 0,//点赞提示
      firstPageComment: 0,
      userId: '',
      commentContent: '',
      defaultAvatar: 'http://9i.dvmama.com/free/default_avatar.jpg',
      security,
      ua: ua
    };
  },
  computed: {},
  watch: {
    // 监听response变化
    response(){
      // response变化后并渲染完dom,设置其他事项
      this.$nextTick(function () {
        let ts = this;

        // 滚动位置
        pageScrollPosition.init();
        pageScrollPosition.autoSave();

        // 设置分享信息(微信里面右上角分享)
        if (ts.response.code == 0) {
          share.setShareInfo({
            title: ts.response.data.nickName + ts.response.data.actTitle + '第' + ts.response.data.signInDaySum + '天',
            desc: ts.response.data.content.replace(/<br\/>/ig, '\n'),
            link: location.href,
            imgUrl: (function () {
              let img = '';
              if (ts.response.data.imageUrlList && ts.response.data.imageUrlList[0]) {
                img = ts.response.data.imageUrlList[0];
              } else {
                img = ts.response.data.actCover;
              }
              img = img.split('?')[0] + '?x-oss-process=image/resize,m_lfit,h_200,w_200';
              return img;
            })(),
          });
        }

        // 设置头部
        if (ua.isDvdApp() && (ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') < 0)) {
          try {
            if (!ts.response || !ts.response.data) return;
            if (ts.response.data.delStatus == 1) {
              native.Browser.setHead({
                "title": "详情",
                "backBtn": "1", // 0表示头部不展示返回按钮，1表示展示
                "homeBtn": "0", // 0表示头部不展示首页按钮，1表示展示
                "shareBtn": "0", //0表示头部不展示分享按钮，1表示展示
                "rightBtn": {
                  "text": "删除",
                  "textColor": "#333333",
                  "action": "window.deleteAct"
                },
              });
            } else if (ts.response.code == 0) {
              native.Browser.setHead({
                "title": "详情",
                "backBtn": "1", // 0表示头部不展示返回按钮，1表示展示
                "homeBtn": "0", // 0表示头部不展示首页按钮，1表示展示
                "shareBtn": "0", //0表示头部不展示分享按钮，1表示展示
                "rightBtn": {
                  "text": "分享",
                  "textColor": "#333333",
                  "action": "window.share"
                },
              });
            }
          } catch (err) {
            console.error(err);
          }
        }
      });
    },
  },
  beforeRouteEnter(to, from, next) {
    getData(next, to.query.contentId);
  },
  beforeCreate() {
  },
  created() {
    // this.getData();
    // this.getComment();
    window.deleteAct = this.deleteAct;
    window.share = this.share;
  },
  mounted() {
    let ts = this;
    ts.userId = login.getUserId();
    //页面滚动加载
    window.onscroll = function () {
      var pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight);//真实内容高度
      //视窗高度
      var viewportHeight = window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight || 0;
      //隐藏高度即滚动的高度
      var scrollHeight = window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop || 0;
      if (pageHeight - viewportHeight - scrollHeight <= 5) {
        ts.getComment('scroll');
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    // 滚动位置
    pageScrollPosition.destory();
    next();
  },
  filters: {},
  methods: {
    /**
     * 接口名称:
     * 接口文档:
     */
    getComment(scroll) {
      let ts = this;
      if (scroll) {
        // 已经结尾,不要再调接口
        if (ts.comment.length != 0 && ts.pageIndex > 1 && ((ts.pageIndex * 10 - ts.firstPageComment) >= ts.commentNum)) {
          ts.no_more = true;
          return;
        } else if (ts.comment.length != 0 && ((ts.pageIndex * 10 - ts.firstPageComment) < ts.commentNum)) {
          ts.loading = true;
        }
        // 正在请求接口中,不要再调接口
        if (ts.ajaxing) return;
        ts.ajaxing = true;
      }
      $.ajax({
        cache: false,
        async: true,
        url: '/api/mg/content/bookstore/contentCommentList?_=' + Date.now(),
        type: 'post',
        dataType: 'json',
        data: encrypt({
          js_wx_info: 1,
          id: ts.contentId,
          pageIndex: ts.pageIndex,
          pageSize: 10
        }),
        success(response) {
          try {
            ts.comment = ts.comment.concat(response.data.list);
            ts.pageIndex++;
            ts.ajaxing = false;
            if (ts.loading) {
              ts.loading = false;
            }
          } catch (err) {
            // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
          }
        },
        error(error) {
          console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
          // this.success(require('../json/comment.json'));
          // console.log(ts.comment);
          // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_content_detail.json`);
        }
      });
    },
    /**
     * 接口名称:
     * 接口文档:
     */
    prise() {
      let ts = this;
      // 打卡内容违规检测
      if (ts.response.data.status === '0' || ts.response.data.status === 0) {
        popup.toast('内容违规已下线，不可操作');
        return;
      }

      // 检测登录
      login.login();

      if (ts.response.data.praised == 1) {
        ts.showPrisedTip = 1;
        setTimeout(function () {
          ts.showPrisedTip = 0;
        }, 3000);
        return;
      }
      $.ajax({
        cache: false,
        async: true,
        url: '/api/mg/content/bookstore/contentPraise?_=' + Date.now(),
        type: 'post',
        dataType: 'json',
        data: encrypt({
          id: ts.contentId
        }),
        success(response) {
          try {
            if (response.code == 0) {
              let i = ts.priseCount.indexOf('万');
              if (i == -1) {
                ts.priseCount++;
                ts.priseCount = '' + ts.priseCount;
              }
              ts.response.data.praised = 1;
              ts.showPrisedTip = 1;
              setTimeout(function () {
                ts.showPrisedTip = 0;
              }, 3000);
            }
          } catch (err) {
            // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
          }
        },
        error(error) {
          console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
          // this.success(require('../json/prise.json'));
          // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_content_detail.json`);
        }
      });
    },
    /**
     * 接口名称:小书库打卡功能---生成分享卡协议
     * 接口文档:http://wiki.ops.vyohui.com/pages/viewpage.action?pageId=19628723
     */
    share() {
      let ts = this;
      // 打卡内容违规检测
      if (ts.response.data.status === '0' || ts.response.data.status === 0) {
        popup.toast('内容违规已下线，不可操作');
        return;
      }
      // 检测登录
      login.login();
      $.ajax({
        cache: false,
        async: true,
        url: '/api/mg/content/bookstore/contentShareCardCreate?_=' + Date.now(),
        type: 'post',
        dataType: 'json',
        data: encrypt({
          id: ts.contentId
        }),
        success(response) {
          try {
            if (response.code == 0) {
              if (ua.isDvdApp()) {
                // app分享卡
                if (ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0) {
                  native.Share.recordCardShare({
                    recordId: ts.contentId,
                  });
                  // 分享图文链接
                } else {
                  // 设置分享信息
                  share.setShareInfo({
                    title: ts.response.data.nickName + ts.response.data.actTitle + '第' + ts.response.data.signInDaySum + '天',
                    desc: ts.response.data.content.replace(/<br\/>/ig, '\n'),
                    link: location.href,
                    imgUrl: (function () {
                      let img = '';
                      if (ts.response.data.imageUrlList && ts.response.data.imageUrlList[0]) {
                        img = ts.response.data.imageUrlList[0];
                      } else {
                        img = ts.response.data.actCover;
                      }
                      img = img.split('?')[0] + '?x-oss-process=image/resize,m_lfit,h_200,w_200';
                      return img;
                    })(),
                  });
                  // 唤起分享面板
                  share.callShare();
                }
                // web版分享卡
              } else {
                popup.shareCard(response.data.imgUrl);
              }
            } else {
              popup.toast(response.data.mes);
            }
          } catch (err) {
            // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
          }
        },
        error(error) {
          console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
          // this.success(require('../json/share_card.json'));
          // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_content_detail.json`);
        }
      });
      let i = ts.shareCount.indexOf('万');
      if (i == -1) {
        ts.shareCount++;
        ts.shareCount = '' + ts.shareCount;
      }
    },
    deleteComment(commentId, index) {
      let ts = this;
      // 打卡内容违规检测
      if (ts.response.data.status === '0' || ts.response.data.status === 0) {
        popup.toast('内容违规已下线，不可操作');
        return;
      }
      popup.confirm({
        className: 'confirm-tip',
        // title: '确定删除您的评论吗？',            // 标题（支持传入html。有则显示。）
        text: '确定删除您的评论吗？',             // 文本（支持传入html。有则显示。）
        okBtnTitle: '确定',       // 确定按钮标题（支持传入html。有则显示，无则显示默认'确定'。）
        okBtnCallback() {     // 确定按钮点击回调（有则执行该回调）
          $.ajax({
            cache: false,
            async: true,
            url: '/api/mg/content/bookstore/contentCommentDel?_=' + Date.now(),
            type: 'post',
            dataType: 'json',
            data: encrypt({
              id: commentId,
              contentId: ts.contentId
            }),
            success(response) {
              try {
                if (response.code == 0) {
                  ts.comment.splice(index, 1);
                  let i = ts.commentNum.indexOf('万');
                  if (i == -1) {
                    ts.commentNum--;
                    ts.commentNum = '' + ts.commentNum;
                  }
                }
              } catch (err) {
                // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
              }
            },
            error(error) {
              console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
              // this.success(require('../json/share_card.json'));
              // console.log(ts.response.data);
              // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_content_detail.json`);
            }
          });
        },
        cancelBtnTitle: '取消',   // 取消按钮标题（支持传入html。有则显示，无则不显示，传''时显示默认值'取消'。）
      });
    },
    addComment() {
      let ts = this;
      // 打卡内容违规检测
      if (ts.response.data.status === '0' || ts.response.data.status === 0) {
        popup.toast('内容违规已下线，不可操作');
        return;
      }
      // 检测登录
      login.login();
      console.log(ts.commentContent);

      // let content = $('#conmment-content').val();
      if (ts.commentContent == '') {
        console.log(1);
        return;
      } else if (ts.commentContent.length >= 500) {
        popup.toast('评论最多输入500字');
      }
      $.ajax({
        cache: false,
        async: true,
        url: '/api/mg/content/bookstore/contentCommentAdd?_=' + Date.now(),
        type: 'post',
        dataType: 'json',
        data: encrypt({
          id: ts.contentId,
          content: ts.commentContent.replace(/(\r\n)|(\n)/g, '<br/>').replace(/script/g, '请不要注入script'),
        }),
        success(response) {
          try {
            if (response.code == 0) {
              let obj = {
                "id": response.data.commentId,
                "nickname": response.data.nickname,
                "avatar": response.data.avatar,
                "content": ts.commentContent.replace(/(\r\n)|(\n)/g, '<br/>').replace(/script/g, '请不要注入script'),
                "userId": ts.userId,
                "createTime": "1分钟前"
              };
              let i = ts.commentNum.indexOf('万') || ts.commentNum.indexOf('亿');
              if (i == -1) {
                ts.commentNum++;
                ts.commentNum = '' + ts.commentNum;
              }
              ts.comment.unshift(obj);
              console.log(ts.comment);
              ts.commentContent = '';
            }
          } catch (err) {
            // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
          }
        },
        error(error) {
          console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
          // this.success(require('../json/addComment.json'));
          // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_content_detail.json`);
        }
      });
    },
    deleteAct() {
      let ts = this;
      popup.confirm({
        className: 'confirm-tip',
        // title: '确定删除您的评论吗？',            // 标题（支持传入html。有则显示。）
        text: '确定删除您的打卡内容吗？',             // 文本（支持传入html。有则显示。）
        okBtnTitle: '确定',       // 确定按钮标题（支持传入html。有则显示，无则显示默认'确定'。）
        okBtnCallback() {     // 确定按钮点击回调（有则执行该回调）
          $.ajax({
            cache: false,
            async: true,
            url: '/api/mg/content/bookstore/signDelete?_=' + Date.now(),
            type: 'post',
            dataType: 'json',
            data: encrypt({
              id: ts.contentId,
            }),
            success(response) {
              try {
                if (response.code == 0) {
                  // window.location.href = document.referrer;
                  // 去首页缓存
                  // localStorage.removeItem('/book/index-getData');
                  if (ua.isDvdApp()) {
                    window.history.back();
                    setTimeout(function () {
                      native.Browser.close()
                    }, 100);
                  } else {
                    window.history.back();
                    setTimeout(function () {
                      window.close()
                    }, 100);
                  }
                } else {
                  popup.toast(response.data.msg);
                }
              } catch (err) {
                // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
              }
            },
            error(error) {
              console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
              // this.success(require('../json/share_card.json'));
              // console.log(ts.response.data);
              // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_content_detail.json`);
            }
          });
        },
        cancelBtnTitle: '取消',   // 取消按钮标题（支持传入html。有则显示，无则不显示，传''时显示默认值'取消'。）
      });
    },
    show(i) {
      let ts = this;
      // 打卡内容违规检测
      if (ts.response.data.status === '0' || ts.response.data.status === 0) {
        popup.toast('内容违规已下线，不可操作');
        return;
      }
      preview.preview(i, ts.response.data.bigImageUrlList, false);
    },
    open(id) {
      let replace = this.$route.query.replace;
      if (replace == 1) {
        window.location.replace('/book/router.html#/punching_activity?actId=' + id + '&replace=1');
      } else {
        window.location.href = '/book/router.html#/punching_activity?actId=' + id;
      }
    }
    // scroll() {
    //   alert(1);
    //   setTimeout(function(){
    //     $('.comment-input').scrollIntoViewIfNeeded();
    //   },100);
    //   // $('.comment-input').on('focus',function(event){
    //   //   alert(1);
    //   //   //自动反弹 输入法高度自适应
    //   //   var target = this;
    //   //   setTimeout(function(){
    //   //     target.scrollIntoViewIfNeeded();
    //   //   },100);
    //   // });
    // }
  }
};

/**
 * 接口名称:
 * 接口文档:
 */
function getData(next, contentId) {
  let ts = this;
  $.ajax({
    cache: false,
    async: true,
    url: '/api/mg/content/bookstore/contentDetail?_=' + Date.now(),
    type: 'post',
    dataType: 'json',
    data: encrypt({
      //js_wx_info: 1,
      id: contentId,
    }),
    success(response) {
      function callback(response) {
        try {
          this.response = response;
          this.priseCount = response.data.thumbsUpNum;
          this.shareCount = response.data.shareNum;
          this.comment = response.data.comment.list;
          this.firstPageComment = this.comment.length;
          this.commentNum = '' + response.data.comment.count;

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
      console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
      // this.success(require('../json/card_content_detail.json'));
      // console.log(ts.response.data);
      // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_content_detail.json`);
    }
  });
}
