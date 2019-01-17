<!--运营广告位，不够2项不展示-->
<template>
  <div class="com-feed-list-no-more">没有更多啦~</div>
</template>

<script>
  import util from 'dvd-service-js-util';

  export default {
    components: {},
    props: {
    },
    data() {
      return {
        // 全局变量
        window,
        document,
        // 模块变量
        util,
      }
    },
    computed: {},
    created() {
    },
    mounted() {
    },
    methods: {},
    filters: {},
    watch: {},
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";

  .com-feed-list-no-more {
    text-align: center;
    color: #999;
    padding: r(20) 0 r(20);
    font-size: r(12);
    background-color: #fcfcfc;
  }
</style>
