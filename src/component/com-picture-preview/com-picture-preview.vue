<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import '../../../node_modules/dvd-base-scss-util/dvd-base-scss-util.scss';
  @import '../../../node_modules/dvd-service-scss-common/dvd-service-scss-common.scss';

  .preview {
    position:fixed;
    top:0;
    bottom:0;
    background-color:#000;
    width:100%;
    max-width:640px;
    height:100%;
    z-index:999;
    padding-top:r(49);

    .preview-head {
      position: fixed;
      top: 0;
      width: 100%;
      max-width: 640px;
      height: r(49);
      line-height: r(49);
      color: #fff;
      text-align: center;
      font-size: r(14);
      z-index: 1;

      .btn {
        display: inline-block;
        margin: 0;
        width: r(40);
        height: r(49);
        line-height: r(49);
        text-align: center;
        font-size: r(14);
        background: center no-repeat;
        background-size: 100% 100%;
        vertical-align: middle;
        cursor: pointer;
      }
      .left-btn-wrapper {
        position: absolute;
        top: 0;
        left:0;
        height: r(49);
        width:r(49);
        font-size: 0;
        z-index: 1;

        .back {
          position: absolute;
          top: r(17);
          left: r(15);
          display: inline-block;
          width: r(12);
          height: r(12);
          border-bottom: 1px solid #fff;
          border-left: 1px solid #fff;
          transform: rotate(45deg);
          cursor: pointer;
        }
      }
      .panel {
        position: relative;
        height: r(49);
        background: rgba(249,247,248,0.15);

        .center-title-wrapper {
          display: inline-block;
          height: r(49);
          line-height: r(49);
          min-width: 30%;
          max-width: 70%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .right-btn-wrapper {
        position: absolute;
        top: 0;
        right:0;
        height: r(49);
        font-size: 0;
        z-index: 1;
      }
    }
    .pic-wrapper {
      /*padding:r(26) 0;*/
      position:relative;
      height: 85%;
      box-sizing: border-box;
      .gallery-top {
        height:100%;

        .swiper-slide {
          overflow-y: scroll;
        }
        .slide-pic-wrapper {
          display:table;
          height: 100%;
          width: 100%;

          div {
            display:table-cell;
            vertical-align:middle;
          }

        }
      }
      .big-pic {
        width:100%;

        &.set-middle {
          position:absolute;
          top:50%;
          transform:translateY(-50%);
        }
      }
    }
    .gallery-thumbs {
      position: fixed;
      bottom: 0.49rem;
      height:r(80);
      width:100%;
      max-width: 640px;
      padding:r(10);
      background:rgba(0,0,0,.6);
      box-sizing:border-box;

      &.to_bottom {
        position:fixed;
        bottom:0;
      }

      li {
        position:relative;
        width:r(60);

        &:not(:last-child) {
          margin-right:r(10);
        }
      }
      .active {
        .small-pic {
          border: 2px solid #FF4A7D;
          border-radius: 2px;
        }
      }
      .small-pic {
        width:r(60);
        height:r(60);
        border-radius:r(2);
        box-sizing:border-box;
      }
      .pic-cover {
        position:absolute;
        bottom:0;
        width:100%;
        text-align:center;
        @include height(r(14));
        font-size: r(12);
        color: #FFFFFF;
        background: rgba(255,74,125,0.70);
        border-bottom-left-radius:r(2);
        border-bottom-right-radius:r(2);
      }
    }
    .set-btn {
      font-size: r(14);
      color: #FFFFFF;
      display:block;
      width:100%;
      max-width:640px;
      @include height(r(49));
      text-align:center;
      background:rgba(249,247,248,0.15);
      position:fixed;
      bottom:0;
    }
  }

  .app.footer {
    .preview {
      padding-top: r(69);
      .preview-head {
        top: 20px;
      }
    }
  }
</style>
<template>
  <div class="preview">
    <div class="preview-head">
      <div class="left-btn-wrapper" @click="destroy">
        <span class="back"></span>
      </div>
      <div class="panel">
        <div class="center-title-wrapper">
          <span class="title">{{activeIndex + 1}}/{{picGroup.length}}</span>
        </div>
      </div>
      <div class="right-btn-wrapper" v-if="operate" @click="deletePic">
        <span class="btn">删除</span>
      </div>
    </div>
    <div class="pic-wrapper">
      <div class="swiper-container gallery-top">
        <ul class="swiper-wrapper">
          <li class="swiper-slide" v-for="(item,i) in picGroup">
            <div class="slide-pic-wrapper"><div><img :src="item" class="big-pic"/></div></div>
          </li>
          <!--<li class="swiper-slide">-->
            <!--<img src="http://9i.dvmama.com/goods/2016/03/29/640_640_1761855843e4a221ef576c9df0d24491.jpg?x-oss-process=image/resize,m_fill,w_640,h_640/format,webp" class="big-pic"/>-->
          <!--</li>-->
        </ul>
      </div>
      <div class="swiper-container gallery-thumbs" :class="{to_bottom:!operate}">
        <ul class="swiper-wrapper">
          <li class="swiper-slide" v-for="(item,i) in picGroup" :class="{active: activeIndex == i}" @click="changeSlide(i)">
            <img :src="item" class="small-pic"/>
            <span v-if="i == 0 && operate" class="pic-cover">封面</span>
          </li>
          <!--<li class="swiper-slide">-->
          <!--<img src="http://9i.dvmama.com/goods/2016/03/29/640_640_1761855843e4a221ef576c9df0d24491.jpg?x-oss-process=image/resize,m_fill,w_640,h_640/format,webp" class="small-pic"/>-->
          <!--<span v-if="1" class="pic-cover">封面</span>-->
          <!--</li>-->
        </ul>
      </div>
    </div>
    <a class="set-btn" @click="setCover" v-if="operate">设为封面</a>
  </div>
</template>
<script>
  import ua from 'dvd-base-js-ua';
  import util from 'dvd-service-js-util';
  import popup from 'dvd-service-js-popup';
  import login from 'dvd-service-js-login';
  import share from 'dvd-service-js-share';
  import native from 'dvd-service-js-native';
  import encrypt from 'dvd-service-js-encrypt';
  import $ from 'jquery'

  export default {
//    props: {
//      operate: {
//        type: Boolean,
//        default: false
//      },
////      imgGroup: ['http://9i.dvmama.com/goods/2016/03/29/640_640_1761855843e4a221ef576c9df0d24491.jpg?x-oss-process=image/resize,m_fill,w_640,h_640/format,webp'],
//      imgGroup: [],
//      index: 0//传入点击图片的序号
//    },
    props:['operate','picGroup','picIndex'],
    data() {
      return {
        activeIndex: 0,
        galleryTop: null,
        galleryThumbs: null,
        first: true
      }
    },
    created() {
      this.activeIndex = this.picIndex;
    },
    mounted() {
      let ts = this;
      ts.galleryTop = new Swiper('.gallery-top', {
        spaceBetween: 0,
        initialSlide: ts.picIndex,
        normalizeSlideIndex:false,
        onSlideChangeEnd: function(swiper){
          console.log(swiper.activeIndex);
          ts.activeIndex = swiper.activeIndex;
          console.log(ts.activeIndex - 2);
          if(!ts.first) {
            ts.galleryThumbs.slideTo(ts.activeIndex - 2);
          } else {
            ts.first = false;
          }
        }
      });
      ts.galleryThumbs = new Swiper('.gallery-thumbs', {
        spaceBetween: 0,
        slidesPerView: 'auto',
//        centeredSlides: true,
        touchRatio: 0.5,
        initialSlide: ts.picIndex - 2,
//        slideToClickedSlide: true,
      });
//      ts.galleryTop.params.control = ts.galleryThumbs;
//      ts.galleryThumbs.params.control = ts.galleryTop;

//      var galleryTop = new Swiper('.gallery-top', {
//        spaceBetween: 10,
//        navigation: {
//          nextEl: '.swiper-button-next',
//          prevEl: '.swiper-button-prev',
//        },
//      });
//      var galleryThumbs = new Swiper('.gallery-thumbs', {
//        spaceBetween: 10,
//        centeredSlides: true,
//        slidesPerView: 'auto',
//        touchRatio: 1,
//        slideToClickedSlide: true,
//      });
//      galleryTop.params.control = galleryThumbs;
//      galleryThumbs.params.control = galleryTop;

    },
    beforeDestroy() {
      this.galleryTop = null;
    },
    watch: {

    },
    methods: {
      destroy() {
        this.$emit("modifiedPicGroup", this.picGroup);
        this.$destroy();
        this.$el.parentNode.removeChild(this.$el);
      },
      deletePic() {
        var ts = this;
        ts.picGroup.splice(this.activeIndex,1);
        if(ts.picGroup.length == 0) {
          ts.$emit("modifiedPicGroup", ts.picGroup);
          ts.$destroy();
          ts.$el.parentNode.removeChild(ts.$el);
        } else {
          ts.galleryTop.slideTo(ts.activeIndex - 1);
        }
      },
      changeSlide(i) {
        this.galleryTop.slideTo(i);
        this.activeIndex = i;
      },
      setCover() {
        var coverPic = this.picGroup.splice(this.activeIndex,1);
        this.picGroup.unshift(coverPic[0]);
        console.log(this.picGroup);
        this.activeIndex = 0;
        this.galleryTop.slideTo(0);
        this.galleryThumbs.slideTo(0);
      }
    }
  }

</script>

