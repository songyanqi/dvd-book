<!--精读-->
<template>
  <div class="com-feed-body-read" @click="store.entry !== undefined ? native.Browser.open({url: d.command && d.command.content}) : (window.location = d.command.content);">
    <!--左侧信息-->
    <span class="left-info">
      <!--音频标题-->
      <div class="title">{{d.title}}</div>
      <!--音频描述-->
      <div class="desc">{{d.desc}}</div>
      <!--收听信息-->
      <div class="listen">
        <img class="num" src="./img/read-body-listen-num.png"><span>{{d.num}}人在听</span>
        <i class="split"></i>
        <img class="time" src="./img/read-body-listen-time.png">
        <span>{{number.preZero(window.parseInt(d.duration / 60), 2)}}:{{number.preZero(d.duration % 60, 2)}}</span>
      </div>
    </span>
    <!--右侧图片-->
    <span class="right-pic">
      <img class="pic" v-lazy="d.imageUrl">
      <img class="play" src="./img/read-body-pause.png" @click="play($event)" v-if="d.playing">
      <img class="play" src="./img/read-body-play.png" @click="play($event)" v-else>
    </span>
  </div>
</template>

<script>
  import ua from 'dvd-base-js-ua';
  import native from 'dvd-service-js-native';
  import number from 'dvd-base-js-number';
  import param from 'dvd-base-js-param';
  import login from 'dvd-service-js-login';
  import util from 'dvd-service-js-util';
  import popup from 'dvd-service-js-popup';

  export default {
    components: {},
    props: {
      // title || body 中的数据
      d: {
        type: Object,
        default: null,
      },
      // store
      store: {
        type: Object,
        default: {},
      },
      // feedList
      feedList: {
        type: Array,
        default: [],
      },
    },
    data() {
      return {
        // 全局变量
        window,
        document,
        // 模块变量
        util,
        native,

        number,
      }
    },
    computed: {},
    created() {
    },
    mounted() {
      let ts = this;

      // 观察者模式-检查音频播放状态
      ts.store.bus.$on('musicStateChange', ts.setPlayState);

      // 检查音频播放状态
      this.setPlayState();
    },
    methods: {
      // 播放
      play(event){
        let ts = this;
        event.stopPropagation();
        if (ua.isDvdApp() && ua.compareVersion(ua.getDvdAppVersion(), '5.2.0') >= 0) {
          login.login({
            reload: ua.isDvdApp() && ts.$route.query.entry ? 0 : 1,
          });
          // 身份是否符合购买条件
          if(ts.d.canRead === '1'){
            // 唤起全局浮窗
            native.Audio.audioPlay({
              "albumId": ts.d.albumId,//当前播放的合辑id
              "musicId": ts.d.musicId,//当前正在播放的音频id
            });
            // 发布事件
            ts.store.bus.$emit('musicStateChange');
            // 设置播放状态
            ts.setPlayState();
          } else {
            popup.confirm({
              className: 'read-popup',        // 钩子（支持传入class名。一个页面需要多种弹窗时，可以根据传入的className在页面设定各种样式）
              title: '只有小书库会员才能听呀',            // 标题（支持传入html。有则显示。）
              text: '',             // 文本（支持传入html。有则显示。）
              okBtnTitle: '购买小书库',       // 确定按钮标题（支持传入html。有则显示，无则显示默认'确定'。）
              okBtnCallback() {     // 确定按钮点击回调（有则执行该回调）
//                util.open('/index.php?c=ShopGoods&a=index&id=623534');
                location = ('/index.php?c=ShopGoods&a=index&id=623534');
              },
              cancelBtnTitle: '取消',   // 取消按钮标题（支持传入html。有则显示，无则不显示，传''时显示默认值'取消'。）
              cancelBtnCallback() { // 取消按钮点击回调（有则执行该回调）

              }
            });
          }
        } else {
          login.login({
//            url: `/book/musicDetail.html?albumId=${ts.d.albumId}&musicId=${ts.d.musicId}&rp=bookstore_index&rl=selection`,
            url: `/book/router.html#/music_detail?albumId=${ts.d.albumId}&musicId=${ts.d.musicId}&rp=bookstore_index&rl=selection`,
            reload: ua.isDvdApp() && ts.$route.query.entry ? 0 : 1,
            open: ua.isDvdApp() && this.$route.query.entry,
          });
        }
      },
      // 设置播放状态
      setPlayState() {
        let ts = this;
        native.Audio.audioLocation({
          success(data){
            if(ts.d.musicId == data.musicId && data.state == '1'){
              ts.d.playing = true;
            } else {
              ts.d.playing = false;
            }
            ts.$forceUpdate();
          },
          error(data){
            ts.d.playing = false;
            ts.$forceUpdate();
          },
        });
      },
    },
    filters: {},
    watch: {},
  }
</script>

<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../../../../../node_modules/dvd-base-scss-util/dvd-base-scss-util";

  /* 精读内容 */
  .com-feed-body-read {
    display: flex;
    padding: r(7) r(20);
    width: 100%;
    background-color: white;
    /* 左侧信息 */
    .left-info {
      flex: 1;
      padding-right: r(10);
      max-width: r(245);
      display: block;
      /* 音频标题 */
      .title {
        @include height(r(20));
        font-size: r(14);
        @include ellipsis(1);
      }
      /* 音频描述 */
      .desc {
        margin-top: r(5);
        height: r(34);
        line-height: r(17);
        font-size: r(12);
        @include ellipsis(2);
        color: #999;
      }
      /* 收听信息 */
      .listen {
        margin-top: r(5);
        font-size: r(12);
        color: #999;
        * {
          vertical-align: middle;
        }
        .num {
          margin-right: r(3);
          width: r(9);
        }
        .split {
          margin: 0 r(5);
          display: inline-block;
          width: 1px;
          height: r(6);
          background: #999;
        }
        .time {
          margin-right: r(3);
          display: inline-block;
          width: r(8);
          height: r(8);
          vertical-align: middle;
        }
      }
    }
    /* 右侧图片 */
    .right-pic {
      position: relative;
      width: r(80);
      height: r(80);
      display: block;
      .pic {
        box-sizing: border-box;
        @include square(r(80) * 2);
        border-radius: r(4 * 2);
        border: 1px solid #d5d5d5;
        transform: scale(0.5);
        transform-origin: top left;
      }
      .play {
        position: absolute;
        right: r(3);
        bottom: r(3);
        width: r(25);
      }
    }
  }

  .dvd-service-com-popup.read-popup .table-cell .box .tip {
    min-height: 0;
  }
</style>
