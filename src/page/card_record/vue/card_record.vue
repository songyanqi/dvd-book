<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import "../css/card_record";
</style>

<template>
  <div class="card_record" v-cloak v-if="response && response.data">
    <!--标题-->
    <dvd-service-com-title :title="$route.meta.title" back></dvd-service-com-title>

    <!--月视图-->
    <monthly-view :record="true" :transresponse="response"></monthly-view>

    <ul class="record-detail">
      <li class="detail-item">
        <span>已加入天数</span>
        <p class="time"><span>{{response.data.joinDays}}</span>天</p>
      </li>
      <li class="detail-item">
        <span>已坚持天数</span>
        <p class="time"><span>{{response.data.signDays}}</span>天</p>
      </li>
      <li class="detail-item">
        <span>连续签到天数</span>
        <p class="time"><span>{{response.data.ContinuousDays}}</span>天</p>
      </li>
    </ul>
  </div>
</template>

<script>
  export default require('../js/card_record.js').default;
</script>
