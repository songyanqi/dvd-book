<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../css/custom_card";
</style>

<template>
  <div class="custom_card" v-cloak v-if="response && response.list">
    <!--标题-->
    <dvd-service-com-title :title="$route.meta.title" back :back-click="setInfo"></dvd-service-com-title>

    <div class="custom_card_content" v-cloak>
      <p class="card-title">参与打卡活动：</p>
      <ul>
        <li class="activity-item" v-for="(item,index) in response.list" v-if="item.actId == actId" v-cloak>
          <span class="checkbox checked"></span>
          <span class="act-title">#{{item.title}}#</span>
          <span @click="clicked = true" class="change" v-if="!nochange">更换</span>
        </li>
        <li v-if="!actId" class="activity-choose" @click="clicked = true"><i class="add-icon"></i>请选择打卡活动</li>
      </ul>
      <div class="text-input">
        <textarea placeholder="记录你的感想" class="content" maxlength="300" rows="6" id="content" v-model="content" @input="mesChange(content)"></textarea>
        <i class="num" v-text="textNum" :class="{special: textNum <= 15}"></i>
      </div>
      <p class="card-title title2">添加图片</p>
      <ul class="pic-group-wrapper">
        <ul  v-cloak v-if="picGroup">
          <li v-for="(item,index) in picGroup" class="pic-group" @click="show(index)">
            <img :src="item" class="pic" />
            <i class="cancle" @click.stop="delatePic(index)"></i>
            <span class="text" v-if="index == 0">封面</span>
          </li>
        </ul>
        <li class="add-pic" v-if="picGroup.length < 9" @click="upload">
          <img :src="require('../img/camera.png')" class="camera-icon"/>
          <span v-if="!picGroup.length" class="add-tip">添加图片</span>
          <span v-else class="add-tip" v-text="(picGroup.length + 1)+'/9'"></span>
        </li>
      </ul>
      <a class="publish-button" :class="{publish: canpublish == 1}" @click="publish">发布</a>

    </div>
    <!--选择活动的弹窗-->
    <div class="pop-up-bg" v-if="clicked" @click="clicked = false">
      <div class="pop-up-content">
        <p class="content-title">选择打卡活动</p>
        <div>
          <div class="activity-item" @click.stop="select(index)" v-for="(item,index) in response.list"><span class="checkbox" :class="{checked: actId == item.actId}"></span><span class="act-title">#{{item.title}}#</span><span class="join-days">（已加入{{item.joinedDays}}天）</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default require('../js/custom_card.js').default;
</script>
