<style lang="sass" lang="scss" rel="stylesheet/scss" scoped>
  @import "../css/music_detail";
</style>

<template>
  <div class="music_detail">
    <template v-if="!(isapp && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0)">
      <audio preload="auto" class='allAudio'></audio>
      <!--<div v-if='!isapp' class="tab2" @click='goback'><img src="//9i.dvmama.com/free/2017/08/21/backRound.png" alt=""></div>-->
      <!--<div v-if='!isapp' class="tab3" @click='goindex'><img src="//9i.dvmama.com/free/goodsDetail/homeRound.png" alt=""></div>-->

      <com-top-title :title="$route.meta.title" opacity back share
                     :home="!ua.isDvdApp()" :home-img="require('../../../common/img/title-home.png')" home-href="/book/router.html#/">
      </com-top-title>

      <div class="top_img">
        <div class="big_img" v-if='musicList[musicList.length-index-1] && musicList[musicList.length-index-1].imageUrl'>
          <img :src="musicList[musicList.length-index-1].imageUrl" alt="">
        </div>
        <div class="left_icon" v-if="musicList && musicList[musicList.length-index-1] && musicList[musicList.length-index-1].showXmlyIcon==1"><img :src="musicList[musicList.length-index-1].xmlyIcon" alt=""></div>
        <div class="big_mask" v-if='musicList[musicList.length-index-1] && musicList[musicList.length-index-1].isPlay != 1'></div>
        <div class="mask_tab" v-if='musicList[musicList.length-index-1] && musicList[musicList.length-index-1].isPlay != 1'>
          <div class="mask_text">
            <div class="mask_content">付费内容</div>
            <div class="mask_content2">¥<span v-text="price"></span>订阅即可收听本专辑全部内容</div>
            <div class="mask_free">会员免费订阅</div>
            <div class="mask_btn" @click='subscription'>立即订阅</div>
          </div>
        </div>
      </div>
      <div class="text" v-if='musicList[musicList.length-index-1] && musicList[musicList.length-index-1].music' v-text='musicList[musicList.length-index-1].music'></div>
      <!--<div class="range">
        <div class="gray"></div>
        <div v-if='musicList[musicList.length-index-1] && musicList[musicList.length-index-1].time' class="red" :style='{width: playTime/musicList[musicList.length-index-1].time*95 + "%"}'></div>
      </div>
      <div class="time">
        <div v-text='timeFormat(playTime)'></div>
        <div v-if='musicList[musicList.length-index-1] && musicList[musicList.length-index-1].time' v-text='timeFormat(musicList[musicList.length-index-1].time)'></div>
      </div>-->

      <!--大V店公用音频播放器组件-->
      <dvd-service-com-audio-player ref="audio" loop :play-list="musicPlayList" @change="onChange"></dvd-service-com-audio-player>

      <div class="btn">
        <div class="btn1" v-if="!isapp"><img src="//9i.dvmama.com/free/2017/08/16/time.png" alt="" @click='dialog'></div>
        <!--<div class="btn2" v-if='musicList && musicList[musicList.length-1-index] && musicList[musicList.length-1-index].sortNo == allAudio-1'><img src="//9i.dvmama.com/free/2017/08/26/noupdata.png" alt=""></div>-->
        <!--<div class="btn2" v-if='musicList && musicList[musicList.length-1-index] && musicList[musicList.length-1-index].sortNo != allAudio-1'><img src="//9i.dvmama.com/free/2017/08/16/combinedShape2.png" alt="" @click='playAudio(index-1)'></div>-->
        <div class="btn2"><img :src="index <= 0 ? '//9i.dvmama.com/free/2017/08/26/noupdata.png' : '//9i.dvmama.com/free/2017/08/16/combinedShape2.png'" @click='prev'></div>

        <div class="btn3">
          <div class="small_icon" v-if='!isPlay'><img src="//9i.dvmama.com/free/2017/08/16/playBtn.png" alt="" @click='playAudio()'></div>
          <div class="small_icon" v-if='isPlay'><img src="//9i.dvmama.com/free/2017/08/18/timeOut.png" alt="" @click='playAudio()'></div>
        </div>
        <!--<div class="btn4" v-if='musicList && musicList[musicList.length-1-index] && musicList[musicList.length-1-index].sortNo == 0'><img src="//9i.dvmama.com/free/2017/08/26/npdownData.png" alt=""></div>-->
        <!--<div class="btn4" v-if='musicList && musicList[musicList.length-1-index] && musicList[musicList.length-1-index].sortNo != 0'><img src="//9i.dvmama.com/free/2017/08/28/right.png" alt="" @click='playAudio(index+1)'></div>-->
        <div class="btn4"><img :src="index >= musicList.length - 1 ? '//9i.dvmama.com/free/2017/08/26/npdownData.png' : '//9i.dvmama.com/free/2017/08/28/right.png'" @click='next'></div>
        <!--<div style="font-size: 20px">
          {{index}} {{musicList.length - 1}}
        </div>-->
        <div class="btn5"><img src="//9i.dvmama.com/free/2017/08/16/list.png" alt="" @click='openAudioList'></div>
      </div>

      <div class="empty_div"></div>
    </template>

    <div class="bottom_text" id="bottom_text" v-if='introduction || introduction==0' v-html='introduction'></div>

    <template v-if="!(isapp && ua.compareVersion(ua.getDvdAppVersion(), '5.3.0') >= 0)">
      <bottom :a="musicId" @shareInfo="shareInfo" @canRead="canReadFn"></bottom>
      <div class="mask" v-if='audioListFlag' @click="closeAudioList"></div>
      <div class="mask_div" v-if='audioListFlag'>
        <div class="mask_top mask_padding">
          <div class="mi_left" @click='dialog'><img src="//9i.dvmama.com/free/2017/08/16/playOrder.png" alt=""></div>
          <div class="play" @click='dialog'>顺序播放</div>
          <div class="sort" @click='dialog'>排序</div>
          <div class="mi_right" @click='dialog'><img src="//9i.dvmama.com/free/2017/08/16/sorting.png" alt=""></div>
        </div>

        <div class="mask_banner">
          <div class='mask_banner_content'>
            <div class="mask_padding mask_list" v-for='(item, i) in musicList' @click='playAudio(i)'>
              <div class="list_name" v-text='musicList[musicList.length-i-1].music' :class='{list_name_select: i==index}'></div>
              <div class="list_img">
                <img src="//9i.dvmama.com/free/2017/08/16/listPlay.png" alt="" v-if='i!=index && item.isPlay == 1'>
                <img src="//9i.dvmama.com/free/2017/08/16/Group1.png" alt="" v-if='i!=index && item.isPlay == 0'>
                <img src="//9i.dvmama.com/free/2017/08/22/audioIcon.gif" alt="" v-if='i==index' class='list_img_select'>
              </div>
            </div>
            <div v-if='musicListBlock'>
              <div class="mask_padding1 mask_list1"  v-for='(item, i) in musicListBlock'></div>
            </div>
          </div>
        </div>
        <div class="mask_bottom" @click='closeAudioList'>关闭</div>
      </div>
    </template>

  </div>
</template>

<script>
  export default require('../js/music_detail.js').default;
</script>
