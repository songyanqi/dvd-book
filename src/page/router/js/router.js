// 第三方模块
import Vue from 'vue';
import $ from 'jquery';
import Swiper from 'swiper';

// H5项目间基础业务模块
require('dvd-service-js-common');

// H5项目间通用模块
import ua from 'dvd-base-js-ua';
import util from 'dvd-service-js-util';
import debug from 'dvd-service-js-debug';
import imgLazyload from 'dvd-service-js-img-lazyload';

Vue.use(VueRouter);

let router = new VueRouter({
  routes: [
    // 首页
    {
      path: '/',
      component: () => import(/* webpackChunkName: "page/index/index" */ '../../index/vue/index.vue'),
      meta: {
        title: '小书库'
      },
    },
    // 自定义打卡
    {
      path: '/custom_card',
      component: () => import(/* webpackChunkName: "page/custom_card/custom_card" */ '../../custom_card/vue/custom_card.vue'),
      meta: {
        title: '今日读书打卡'
      },
    },
    // 打卡内容详情
    {
      path: '/card_content_detail',
      component: () => import(/* webpackChunkName: "page/card_content_detail/card_content_detail" */ '../../card_content_detail/vue/card_content_detail.vue'),
      meta: {
        title: '详情'
      },
    },
    // 打卡成就
    {
      path: '/card_achievement',
      component: () => import(/* webpackChunkName: "page/card_achievement/card_achievement" */ '../../card_achievement/vue/card_achievement.vue'),
      meta: {
        title: '打卡成就'
      },
    },
    // 打卡记录
    {
      path: '/card_record',
      component: () => import(/* webpackChunkName: "page/card_record/card_record" */ '../../card_record/vue/card_record.vue'),
      meta: {
        title: '我的打卡记录'
      },
    },
    // 热门打卡活动列表
    {
      path: '/hot_card_activity',
      component: () => import(/* webpackChunkName: "page/hot_card_activity/hot_card_activity" */ '../../hot_card_activity/vue/hot_card_activity.vue'),
      meta: {
        title: '热门打卡活动'
      },
    },
    // 打卡活动详情
    {
      path: '/punching_activity',
      component: () => import(/* webpackChunkName: "page/punching_activity/punching_activity" */ '../../punching_activity/vue/punching_activity.vue'),
      meta: {
        title: '打卡活动'
      },
    },
    // 精读列表
    {
      path: '/good_book_reading',
      component: () => import(/* webpackChunkName: "page/good_book_reading/good_book_reading" */ '../../good_book_reading/vue/good_book_reading.vue'),
      meta: {
        title: 'V电台—童书精读'
      },
    },
    // 精读详情
    {
      path: '/music_detail',
      component: () => import(/* webpackChunkName: "page/music_detail/music_detail" */ '../../music_detail/vue/music_detail.vue'),
      meta: {
        title: '音频详情'
      },
    },
    // 消息列表
    {
      path: '/message_list',
      component: () => import(/* webpackChunkName: "page/message_list/message_list" */ '../../message_list/vue/message_list.vue'),
      meta: {
        title: '消息'
      },
    },
  ],
});

// 路由全局勾子：beforeEach -- 有next方法
router.beforeEach((to, from, next) => {
  // 设置标题
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

// 路由全局勾子：afterEach --- 没有next方法`
router.afterEach((to, from) => {
});


new Vue({
  el: ".app",
  data() {
    return {
      // 全局属性
      window,
      document,
      location,

      // H5项目间通用模块
      ua,
    };
  },
  beforeCreate() {
    // 懒加载初始化
    imgLazyload.init();
  },
  router,
});


