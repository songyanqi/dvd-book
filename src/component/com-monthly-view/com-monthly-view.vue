<style lang="sass" lang="scss" rel="stylesheet/scss">
  @import '../../../node_modules/dvd-base-scss-util/dvd-base-scss-util.scss';
  @import '../../../node_modules/dvd-service-scss-common/dvd-service-scss-common.scss';

  [v-cloak] {
    display:none;
  }
  .calendar {
    padding:r(30) r(36) 0;
    background:#fff;

    .time {
      font-size: r(14);
      color: #FF4A7D;
      @include height(r(20));
      text-align:center;

      span {
        display:inline-block;
        padding:0 r(27);
      }
      .prev, .next {
        display: inline-block;
        width: 0.12rem;
        height: 0.12rem;
        cursor: pointer;
        position:relative;
        top:0.01rem;
      }
      .prev {
        background:url(./img/left.png?v=1.0) center no-repeat;
        background-size:r(6);
        &.active {
          background:url(./img/leftActive.png?v=1.0) center no-repeat;
          background-size:r(6);
        }
      }
      .next {
        background:url(./img/right.png?v=1.0) center no-repeat;
        background-size:r(6);
        &.active {
          background:url(./img/rightActive.png?v=1.0) center no-repeat;
          background-size:r(6);
        }
      }
    }
    .week-head {
      padding:r(20) 0 r(30);
      overflow:hidden;;

      li {
        float:left;
        width:r(32);
        @include height(r(14));
        font-size:r(10);
        color: #999999;
        text-align:center;
        &:not(:last-child) {
          padding-right:r(13);
        }
      }
    }
    .date-list {
      overflow:hidden;
      li {
        float:left;
        margin-bottom:r(16);

        &:not(:nth-of-type(7n+0)) {
          margin-right:r(13);
        }

        p {
          width:r(32);
          @include height(r(32));
          text-align:center;
        }
      }
      .normal-date {
        font-size: r(16);
        color: #D7D7D7;
        box-sizing:border-box;

        &.month_day {
          color:#777;
        }
        &.card {
          background: #FFB7B7;
          border-radius:50%;
          color:#fff;
        }
      }
      .today_style {
        font-size: r(15);
        color: #FF4A7D;

        &.card {
          background: #FF4A7D;
          line-height:r(34);
          font-weight: normal;
        }

        &:after {
          content:'';
          display:block;
          width:r(3);
          height:r(3);
          border-radius:50%;
          background: #FF4A7D;
          margin:r(-6) auto 0;
        }
      }
    }
  }
  .android .date-list .today_style {
    &.card {
      line-height:r(35);
    }
  }
</style>
<template>
  <div class="calendar" v-if="response && response.data && calendar" :class="{android: ua.isAndroid()}" v-cloak>
    <p class="time">
      <i class="prev active" @click="prevMonth" v-if="isPrev"></i>
      <i class="prev" v-else></i>
      <span>{{change_year}}年{{change_month}}月</span>
      <i class="next active" @click="nextMonth" v-if="isNext"></i>
      <i class="next" v-else></i>
    </p>
    <ul class="week-head">
      <li>周日</li>
      <li>周一</li>
      <li>周二</li>
      <li>周三</li>
      <li>周四</li>
      <li>周五</li>
      <li>周六</li>
    </ul>
    <ul class="date-list">
      <li v-for="(item,index) in calendar">
          <p class="normal-date today_style" v-if="change_year == the_year && change_month == the_month && today == (index-firstday+1)" :class="{card:response.data.dateInfo&&response.data.dateInfo[index-firstday+1]}">今</p>
          <p class="normal-date month_day" v-else-if="index >= firstday && index <= monthday+firstday-1" :class="{card:response.data.dateInfo&&response.data.dateInfo[index-firstday+1]}">{{item}}</p>
          <p class="normal-date" v-else>{{item}}</p>
      </li>
    </ul>
    <!--<ul>-->
      <!--<li v-for="(item,index) in calendar">-->
        <!--<p class="normal-date today_style" v-if="change_year == the_year && change_month == the_month && today == (index-firstday+1)" :class="{card:response.dateInfo[index-firstday+1]}">今</p>-->
        <!--<p class="normal-date month_day" v-else-if="index >= firstday && index <= monthday+firstday-1" :class="{card:response.dateInfo[index-firstday+1]}">{{item}}</p>-->
        <!--<p class="normal-date" v-else>{{item}}</p>-->
      <!--</li>-->
    <!--</ul>-->
  </div>
</template>
<script>
  import ua from 'dvd-base-js-ua';
  import util from 'dvd-service-js-util';
  import popup from 'dvd-service-js-popup';
  import login from 'dvd-service-js-login';
  import share from 'dvd-service-js-share';
  import native from 'dvd-service-js-native';
  import param from 'dvd-base-js-param';
  import encrypt from 'dvd-service-js-encrypt';
  import date from 'dvd-base-js-date';
//
  export default {
    props:['record','transresponse'],
    data() {
      return {
        the_year: '',
        the_month: '',
        change_year: '',
        change_month: '',
        firstday: '',
        monthday: '',
        calendar: [],
        today: '',
        response: null,
        isPrev: false,
        isNext: false,
        actId: this.$route.query.actId,
        ua: ua
      }
    },
    created() {
      let ts = this;
      ts.response = ts.transresponse;
      var sys_time = ts.response.sys_time + '000';
      console.log(sys_time);
      sys_time = date.format(sys_time, 'yyyy-MM-dd');
      let time = sys_time.split('-');
      this.the_year =Number(time[0]);
      this.change_year =Number(time[0]);
      this.the_month= Number(time[1]);
      this.change_month= Number(time[1]);
      console.log(this.the_month);
      this.today = Number(time[2]);
//      var date = new Date();
//      this.the_year = date.getFullYear();
//      this.change_year = date.getFullYear();
//      this.the_month= date.getMonth() + 1;
//      this.change_month= date.getMonth() + 1;
//      this.today = date.getDate();
      this.showCalendar(this.the_year,this.the_month);
      console.log((ts.change_year + '-' + (String(ts.change_month).length == 2 ? ts.change_month : ('0' + ts.change_month).substr(0, 2))));
      console.log((ts.the_year + '-' + ts.the_month));
      if(ts.response.data && ts.response.data.startMonth) {
        ts.isPrev = (ts.change_year + '-' + (String(ts.change_month).length == 2 ? ts.change_month : ('0' + ts.change_month).substr(0, 2))) > ts.response.data.startMonth;
        ts.isNext = (ts.change_year + '-' + (String(ts.change_month).length == 2 ? ts.change_month : ('0' + ts.change_month).substr(0, 2))) < (ts.the_year + '-' + (String(ts.the_month).length == 2 ? ts.change_month : ('0' + ts.change_month).substr(0, 2)));
      }
      //      this.getCardState();
    },
    mounted() {
      let ts =this;
      var mybody = document.getElementsByClassName('date-list')[0];
      //滑动处理

      var startX, startY, moveEndX, moveEndY, X, Y;

      mybody.addEventListener('touchstart', function(e) {
//        e.preventDefault();
        startX = e.touches[0].pageX;
        startY = e.touches[0].pageY;
      }, false);

      mybody.addEventListener('touchmove', function(e) {
//        e.preventDefault();
        moveEndX = e.changedTouches[0].pageX;
        moveEndY = e.changedTouches[0].pageY;
      });
      mybody.addEventListener('touchend',function(e) {
        X = moveEndX - startX;
        Y = moveEndY - startY;
        if ( Math.abs(X) > Math.abs(Y) && X > 100) {
          startX = undefined;
          startY = undefined;
          moveEndX = undefined;
          moveEndY = undefined;
          if(ts.isPrev) {
            ts.prevMonth();
          }
        }
        else if ( Math.abs(X) > Math.abs(Y) && X < -100) {
          startX = undefined;
          startY = undefined;
          moveEndX = undefined;
          moveEndY = undefined;
          if(ts.isNext) {
            ts.nextMonth();
          }
        }
      });
    },
    methods: {
      runNian(The_Year) {
        if ((The_Year%400==0) || ((The_Year%4==0) && (The_Year%100!=0)))
          return true;
        else return false;
      },
      getMonthDay(The_Month,The_Year) {
        let ts = this;
        console.log(The_Month,The_Year);
        var Month_Day;
        switch (The_Month) {
          case 1 :
            Month_Day = 31;
            break;
          case 2 :
            if (ts.runNian(The_Year)) Month_Day = 29;
            else Month_Day = 28;
            break;
          case 3 :
            Month_Day = 31;
            break;
          case 4 :
            Month_Day = 30;
            break;
          case 5 :
            Month_Day = 31;
            break;
          case 6 :
            Month_Day = 30;
            break;
          case 7 :
            Month_Day = 31;
            break;
          case 8 :
            Month_Day = 31;
            break;
          case 9 :
            Month_Day = 30;
            break;
          case 10 :
            Month_Day = 31;
            break;
          case 11 :
            Month_Day = 30;
            break;
          case 12 :
            Month_Day = 31;
            break;
        }
        return Month_Day;
      },
      showCalendar(The_Year,The_Month) {
        let ts = this;
//        var time = The_Year + '-' + The_Month + '-' + '1';
//        alert(time);
        var date = new Date(The_Year,The_Month - 1,'1');
        ts.firstday = date.getDay();
        ts.monthday = ts.getMonthDay(The_Month,The_Year);
        console.log(ts.monthday);
        //补齐当前月份前面空缺的
        if(The_Month == 1) {
          let pre_Month_Day = 31;
          for(let i=0;i<ts.firstday;i++) {
            ts.calendar[i] = pre_Month_Day;
            pre_Month_Day -= 1;
          }
        } else {
          let pre_Month_Day = ts.getMonthDay(The_Month - 1,The_Year);
          for(let i = ts.firstday -1,j=0;i>=0;i--,j++) {
            ts.calendar[j] = pre_Month_Day - i;
          }
        }
        //当前月份
        for(let i = 1,j=ts.firstday;i <= ts.monthday;i++,j++) {
          ts.calendar[j] = i;
        }
        let num = 42 - ts.firstday - ts.monthday; //当前月份后面空缺的
        if(The_Month == 12) {
          let next_Month_Day = 31;
          for(let i=1;i<=num;i++) {
            ts.calendar.push(i);
          }
        } else {
          let next_Month_Day = ts.getMonthDay(The_Month + 1,The_Year);
          for(let i = 1;i <= num;i++) {
            ts.calendar.push(i);
          }
        }
      },
      prevMonth() {
        let ts = this;
        if(ts.change_month == 1) {
          ts.change_month = 12;
          ts.change_year--;
        } else {
          ts.change_month--;
        }
        ts.getCardState(); //获取打卡状态
        ts.calendar = [];
        ts.showCalendar(ts.change_year,ts.change_month);
      },
      nextMonth() {
        let ts = this;
        if(ts.change_month == 12) {
          console.log('test');
          ts.change_month = 1;
          ts.change_year++;
        } else {
          ts.change_month++;
        }
        ts.getCardState();
        ts.calendar = [];
        ts.showCalendar(ts.change_year,ts.change_month);
      },
      getCardState() {
        let ts = this;
        let month = ts.change_year + '-' + ts.change_month;
        if(ts.record) {
          var url = '/api/mg/content/bookstore/actSignRecord?_=';
          var obj = {
            month: month,
            actId: ts.actId
          }
        } else {
          var url = '/api/mg/content/bookstore/signRecord?_=';
          var obj = {
            month: month
          }
        }
        console.log(month);
        $.ajax({
          cache: false,
          async: true,
          url: url + Date.now(),
          type: 'post',
          dataType: 'json',
          data: encrypt(obj),
          success(response) {
            try {
              ts.response = response;
              ts.isPrev = (ts.change_year + '-' + (String(ts.change_month).length == 2?ts.change_month:('0' + ts.change_month).substr(0,2))) > ts.response.data.startMonth;
//              ts.isNext = (ts.change_year + '-' + (String(ts.change_month).length == 2?ts.change_month:('0' + ts.change_month).substr(0,2))) < (ts.the_year + '-' + ts.the_month);
              ts.isNext = (ts.change_year + '-' + (String(ts.change_month).length == 2 ? ts.change_month : ('0' + ts.change_month).substr(0, 2))) < (ts.the_year + '-' + (String(ts.the_month).length == 2 ? ts.change_month : ('0' + ts.change_month).substr(0, 2)));
              console.log(ts.response.dateInfo);
            } catch (err) {
              // 这个try-catch不要去掉，因为有异常时会阻止强制跳转
            }
          },
          error(error) {
//            console.error(`ajax已执行error回调方法: url=${this.url}, reason=${error.status} ${error.statusText} `);
//            this.success(require('./monthly_view.json'));
//            console.warn(`ajax已使用mock数据: url=${this.url}, mock=card_achievement.json`);
          }
        });
      }
    }
  }
</script>
