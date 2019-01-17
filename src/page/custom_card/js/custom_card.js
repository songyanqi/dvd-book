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
import ajaxFileUpload from 'dvd-service-js-ajax-file-upload';
import pageScrollPosition from 'dvd-base-js-page-scroll-position';

import preview from '../../../component/com-picture-preview/preview.js';

export default {
  components: {
    'dvd-service-com-title': require('dvd-service-com-title').default,
  },
  data() {
    return {
      response: null,
      textNum: 300,
      picGroup: [],
      checked: -1, //记录哪个活动被选中,
      userId: login.getUserId(),
      canpublish: 0,
      content: '',
      picIndex: -1, //记录哪张图片被点击
      actId: this.$route.query.actId,
      clicked: false,
      usedCache: false,
      nochange: this.$route.query.no_change,
      ua: ua
    }
  },
  beforeRouteEnter(to, from, next) {
    getData(next);
  },
  // 检测是否登录
  beforeCreate(){
    if (!login.isLogined()) {
      location.href = '/login.html?referer=' + encodeURIComponent(location.href);
    }
  },
  created() {
    let ts = this;
    var dataInfo = localStorage.getItem('custom_card_data');
    console.log(ts.actId);
    dataInfo = JSON.parse(dataInfo);
    console.log(dataInfo);
    console.log(ts.nochange);
    if (dataInfo) {
      if (!ts.actId) {
        ts.actId = dataInfo.actId;
        ts.content = dataInfo.content;
        ts.picGroup = dataInfo.picGroup;
        ts.usedCache = true;
        ts.textNum = 300 - ts.content.length
      } else if (ts.actId == dataInfo.actId) {
        ts.content = dataInfo.content;
        ts.picGroup = dataInfo.picGroup;
        ts.usedCache = true;
        ts.textNum = 300 - ts.content.length
      }
    }
    // this.getActivity();
    // this.getData();
    console.log(this.actId);
    if (!this.actId) {
      this.clicked = true;
    }
  },
  mounted() {
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
  beforeRouteLeave(to, from, next) {
    // 滚动位置
    pageScrollPosition.destory();
    next();
  },
  computed: {},
  methods: {
    delatePic(i) {
      this.picGroup.splice(i, 1);
    },
    /**
     * 接口名称: 获取用户信息
     * 接口文档: http://wiki.ops.vyohui.com/pages/viewpage.action?pageId=17041929
     */
    /*getData(){
     let ts = this;
     $.ajax({
     cache: false,
     async: true,
     url: '/api/mg/user/center/getUserInfo?_=' + Date.now(),
     type: 'post',
     dataType: 'json',
     data: encrypt({}),
     success(response) {
     try {
     ts.userId = response.data.userId;
     }catch (err) {
     // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
     }
     },
     error(error) {
     console.error('ajax error:' + error.status + ' ' + error.statusText);
     }
     });
     },*/
    // 上传图片
    upload(){
      let ts = this;
      ajaxFileUpload.upload({
        owner_id: ts.userId,
        success: function (response) {
          if (response.errorCode === 0) {
            console.log(response.data.shop_logo.src);
            ts.picGroup.push(response.data.shop_logo.src);
            console.log(ts.picGroup);
          } else {
            popup.toast(response.errorMsg);
          }
        },
        error: function (error) {
          console.error('ajax error:' + error.status + ' ' + error.statusText);
        }
      });
    },
    publish() {
      let ts = this;
      console.log(ts.content.replace(/(\r\n)|(\n)/g, '<br/>').replace(/script/g, '请不要注入script'));
      if (ts.actId && ts.content && ts.picGroup.length) {
        $.ajax({
          cache: false,
          async: true,
          url: '/api/mg/content/bookstore/signCommit?_=' + Date.now(),
          type: 'post',
          dataType: 'json',
          data: encrypt({
            actId: ts.actId,
            content: ts.content.replace(/(\r\n)|(\n)/g, '<br/>').replace(/script/g, '请不要注入script'),
            imgUri: JSON.stringify(ts.picGroup)
          }),
          success(response) {
            try {
              if (response.code == 0) {
                console.log(response.data.msg);
                if (ts.usedCache) {
                  localStorage.removeItem('custom_card_data');
                  // 去首页缓存
                  // localStorage.removeItem('/book/index-getData');
                }
                // window.location.replace(document.referrer);
                // window.location.href = document.referrer;
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
            console.error('ajax error:' + error.status + ' ' + error.statusText);
          }
        });
      }
    },
    show(index) {
      let ts = this;
      ts.picIndex = index;
      preview.preview(index, ts.picGroup, true, ts.showModifiedPic);
    },
    showModifiedPic(data) {
      this.picGroup = data;
      console.log(data);
      console.log(this.picGroup);
    },
    select(index) {
      this.actId = this.response.list[index].actId;
      var obj = this.response.list[index];
      this.response.list.splice(index, 1);
      this.response.list.unshift(obj);
      this.clicked = false;
    },
    mesChange(mes) {
      this.textNum = 300 - mes.length;
    },
    setInfo() {
      let ts = this;
      if (ts.content || ts.actId || ts.picGroup) {
        popup.confirm({
          className: '',        // 钩子（支持传入class名。一个页面需要多种弹窗时，可以根据传入的className在页面设定各种样式）
          title: '',            // 标题（支持传入html。有则显示。）
          text: '内容尚未发布呦，是否保存草稿后离开',             // 文本（支持传入html。有则显示。）
          okBtnTitle: '保存草稿并离开',       // 确定按钮标题（支持传入html。有则显示，无则显示默认'确定'。）
          okBtnCallback() {     // 确定按钮点击回调（有则执行该回调）
            var obj = {
              actId: ts.actId,
              content: ts.content,
              picGroup: ts.picGroup
            };
            obj = JSON.stringify(obj);
            localStorage.setItem('custom_card_data', obj);
            console.log(localStorage);
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
          },
          cancelBtnTitle: '取消',   // 取消按钮标题（支持传入html。有则显示，无则不显示，传''时显示默认值'取消'。）
          cancelBtnCallback() { // 取消按钮点击回调（有则执行该回调）
            if (ts.usedCache) {
              localStorage.removeItem('custom_card_data');
            }
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
          }
        });
      }
    }
  },
  watch: {
    picGroup() {
      let ts = this;
      if (ts.actId && ts.picGroup.length && ts.content) {
        ts.canpublish = 1;
      } else {
        ts.canpublish = 0;
      }
    },
    content() {
      let ts = this;
      if (ts.actId && ts.content && ts.picGroup.length) {
        ts.canpublish = 1;
      } else {
        ts.canpublish = 0;
      }
    },
    actId() {
      let ts = this;
      if (ts.actId && ts.content && ts.picGroup.length) {
        ts.canpublish = 1;
      } else {
        ts.canpublish = 0;
      }
    }
  }
};

/**
 * 接口名称: 小书库打卡功能---自定义打卡页面协议
 * 接口文档: http://wiki.ops.vyohui.com/pages/viewpage.action?pageId=19628625
 */
function getData(next) {
  let ts = this;
  $.ajax({
    cache: false,
    async: true,
    url: '/api/mg/content/bookstore/signCreate?_=' + Date.now(),
    type: 'post',
    dataType: 'json',
    data: encrypt({}),
    success(response) {
      function callback(response) {
        try {
          if (response.code == 0) {
            this.response = response.data;
            if (this.response.list.length == 1) {
              this.clicked = false;
              this.actId = this.response.list[0].actId;
            }
            console.log(this.response.list);
          } else {
            popup.toast(response.data.msg);
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
      console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
      // this.success(require('../json/custom_card.json'));
      // console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_achievement.json`);
    }
  });
}
