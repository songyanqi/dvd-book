<!--焦点图-->
<!--<template>-->
<!--<div class="com-feed-list">-->
<!--<div class="feed-wrapper" v-for="(feed, i) in feedList">-->
<!--<com-feed-title-read          :feed="feed"      v-if="feed.title && feed.title.tplId == 'tt_book_store_selection_title'"  :style="{marginTop: marginTop(feed.marginTop)}"></com-feed-title-read>-->
<!--<com-feed-title-record        :feed="feed" v-else-if="feed.title && feed.title.tplId == 'tt_book_store_sign_title'"       :style="{marginTop: marginTop(feed.marginTop)}" :store="store"></com-feed-title-record>-->
<!--<com-feed-body-banner         :feed="feed" v-else-if="feed.body && feed.body.tplId == 'bd_book_store_cover'"              :style="{marginTop: marginTop(feed.marginTop)}"></com-feed-body-banner>-->
<!--<com-feed-body-read           :feed="feed" v-else-if="feed.body && feed.body.tplId == 'bd_book_store_selection'"          :style="{marginTop: marginTop(feed.marginTop)}"></com-feed-body-read>-->
<!--<com-feed-body-record-act     :feed="feed" v-else-if="feed.body && feed.body.tplId == 'bd_books_tore_sign_activity_list'" :style="{marginTop: marginTop(feed.marginTop)}"></com-feed-body-record-act>-->
<!--<com-feed-body-record-go      :feed="feed" v-else-if="feed.body && feed.body.tplId == 'bd_book_store_sign_guide'"         :style="{marginTop: marginTop(feed.marginTop)}"></com-feed-body-record-go>-->
<!--<com-feed-body-record-msg     :feed="feed" v-else-if="feed.body && feed.body.tplId == 'bookstore_my_message'"         :style="{marginTop: marginTop(feed.marginTop)}"></com-feed-body-record-msg>-->
<!--<com-feed-body-record-dynamic :feed="feed" v-else-if="feed.body && feed.body.tplId == 'bd_book_store_sign_list'"          :style="{marginTop: marginTop(feed.marginTop)}"></com-feed-body-record-dynamic>-->
<!--</div>-->
<!--</div>-->
<!--</template>-->

<script>
  export default {
    components: {
      'com-feed-body-banner': require('./com-feed/com-feed-body-banner.vue').default,
      'com-feed-title-read': require('./com-feed/com-feed-title-read.vue').default,
      'com-feed-body-read': require('./com-feed/com-feed-body-read.vue').default,
      'com-feed-title-record': require('./com-feed/com-feed-title-record.vue').default,
      'com-feed-body-record-act': require('./com-feed/com-feed-body-record-act.vue').default,
      'com-feed-body-record-go': require('./com-feed/com-feed-body-record-go.vue').default,
      'com-feed-body-record-msg': require('./com-feed/com-feed-body-record-msg.vue').default,
      'com-feed-body-record-dynamic': require('./com-feed/com-feed-body-record-dynamic.vue').default,
      'com-feed-body-ad': require('./com-feed/com-feed-body-ad.vue').default,
      'com-feed-list-no-more': require('./com-feed/com-feed-list-no-more.vue').default,
    },
    props: {
      // feedList数据
      feedList: {
        type: Array,
        default: null,
      },
      // feed信息
      store: {
        type: Object,
        default() {
          return {};
        },
      },
    },
    data() {
      return {
        // 全局变量
        window,
        document,
      }
    },
    render(createElement) {
      let ts = this;

      // 模板名称: 组件名称
      let map = {
        bd_book_store_cover: 'com-feed-body-banner',
        bd_book_store_ad: 'com-feed-body-ad',
        tt_book_store_selection_title: 'com-feed-title-read',
        tt_book_store_sign_title: 'com-feed-title-record',
        bd_book_store_selection: 'com-feed-body-read',
        bd_book_store_sign_activity_list: 'com-feed-body-record-act',
        bd_book_store_sign_guide: 'com-feed-body-record-go',
        bd_book_store_my_message: 'com-feed-body-record-msg',
        bd_book_store_sign_list: 'com-feed-body-record-dynamic',
        'com-feed-list-no-more': 'com-feed-list-no-more',
      };

      // 动态创建feedList
      return createElement(
        // 类型
        'div',
        // 属性
        {
          'class': 'com-feed-list',
        },
        // 子元素
        this.feedList && this.feedList.map(function (feed, index, arr) {
          if (feed) {
            // 模板id
            let tplId = feed.title && feed.title.tplId || feed.body && feed.body.tplId;
            // 组件名称
            let component = map[tplId];
            // 动态创建feed
            return createElement(component, {
              props: {
                d: feed.title || feed.body,
                store: ts.store,
                feedList: ts.feedList,
              },
              style: {
                marginTop: ts.marginTop(feed.marginTop)
              }
            })
          }
        }),
      )
    },
    computed: {},
    created() {
    },
    mounted() {
    },
    methods: {
      marginTop(num){
        if (num > 0 && num < 1) {
          num = 1;
        }
        return num + 'px';
      }
    },
    filters: {},
    watch: {},
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";

</style>
