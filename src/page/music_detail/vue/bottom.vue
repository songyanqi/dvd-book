<template>
  <div>
    <div class="icon">
      <div class="block left_block" v-if="isFavored==0" @click="favor">
        <div class="img"><img src="//9i.dvmama.com/free/2017/12/16/btn1.png" alt=""></div>
        <div class="count" v-text="favorNum"></div>
      </div>
      <div class="block left_block" v-if="isFavored==1" @click="alert">
        <div class="img"><img src="//9i.dvmama.com/free/2017/12/16/hasBeenPraised.png" alt=""></div>
        <div class="count" v-text="favorNum"></div>
      </div>
      <div class="block" @click="callShare">
        <div class="img"><img src="//9i.dvmama.com/free/2017/12/16/btn2.png" alt=""></div>
        <div class="count" v-text="shareNum"></div>
      </div>

    </div>
    <div ref="all" class="all_comment_text" id="all">全部留言 <span class="all_count" v-text="add(commentNum)"></span></div>
    <div class="all_comment">
      <template v-for="(item,index) in commentList">
        <div class="all_comment_item" v-if="item.isMine==1" @click="deleteComment(item.commentId,index)">
          <div class="all_comment_item_top">
            <div class="head"><img :src="item.headIcon" alt=""></div>
            <div class="all_comment_item_text nickName" v-text="item.nickName"></div>
            <div class="my_comment">我的评论</div>
            <div class="all_comment_item_text right" v-text="doTime(item.createTime)"></div>
          </div>
          <div class="all_comment_item_bottom" v-html="security.filterXsshtml(item.content)"></div>
        </div>
        <div class="all_comment_item" v-if="item.isMine==0">
          <div class="all_comment_item_top">
            <div class="head"><img :src="item.headIcon" alt=""></div>
            <div class="all_comment_item_text nickName" v-text="item.nickName"></div>
            <div class="all_comment_item_text right" v-text="doTime(item.createTime)"></div>
          </div>
          <div class="all_comment_item_bottom" v-html="security.filterXsshtml(item.content)"></div>
        </div>
        <div class="line" v-if="index!=commentList.length-1"></div>
      </template>

    </div>
    <div class="write_comment">
      <div class="empty_div"></div>
      <div class="write_comment_input"><input type="text" id="comment_input" maxlength="500" v-model="input_text" placeholder="每天聆听一条 每次记录一句"></div>
      <div class="btn" @click="comment">留言</div>
    </div>
    <div class="no_comment" v-if="no_comment==1">
      <div class="no_find"><img src="//9i.dvmama.com/free/no_find.png" alt=""></div>
      <div class="no_text" style="margin-bottom: 0.1rem">没有过评论哦</div>
      <div class="no_text">马上来评论吧</div>
    </div>
  </div>
</template>
<script>
  import api from "../js/api.js"
  import param from "dvd-base-js-param";
  import popup from 'dvd-service-js-popup';
  import share from "dvd-service-js-share";
  import login from "dvd-service-js-login";
  import native from "dvd-service-js-native"
  import ua from "dvd-base-js-ua";
  import security from 'dvd-service-js-security';

  export default {
    mounted(){
      console.log(this.doTime("1514741304"));
      var that = this;
      this.$nextTick(function(){
        this.init();
        this.scroll();
//        this.aa();
      })
    },
    props:["a"],
    computed:{
      musicId(){
        return this.a;
      }
    },
    data(){
      return {
        albumId: this.$route.query.albumId,
        pageIndex:0,
        pageFlag:true,
        cursorId:0,
        commentList:[],
        hasMore:1,
        favorNum:null,
        commentNum:null,
        shareNum:null,
        isFavored:null,
        input_text:"",
        no_comment:-1,
        shareInfo:{},
        canRead:-1,
        security,
      }
    },
    watch:{
      canRead(){
        this.$emit("canRead",this.canRead);
      },
      musicId(){
        this.changeCommentByBtn();
      },
      shareInfo(){
        this.$emit("shareInfo",this.shareInfo);
      }
    },
    methods:{
      aa(){
        var bfscrolltop = document.body.scrollTop;//获取软键盘唤起前浏览器滚动部分的高度
        var timer=null;
        $("#comment_input").focus(function(){//在这里‘input.inputframe’是我的底部输入栏的输入框，当它获取焦点时触发事件
          timer = setInterval(function(){//设置一个计时器，时间设置与软键盘弹出所需时间相近
            window.scrollTo(0,document.body.scrollHeight+50);//获取焦点后将浏览器内所有内容高度赋给浏览器滚动部分高度
          },100)
        }).blur(function(){//设定输入框失去焦点时的事件
          clearInterval(timer);//清除计时器
          document.body.scrollTop = bfscrolltop;//将软键盘唤起前的浏览器滚动部分高度重新赋给改变后的高度
        });
      },
      isWechat(){
        var ua = window.navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i)=="micromessenger") {
          return true;
        } else {
          return false;
        }
      },
      alert(){
        popup.toast('您已经点过赞了');
      },
      changeCommentByBtn(){
        this.initData();
        this.init();
      },
      initData(){
        var that=this;
        that.albumId = this.$route.query.albumId;
        that.pageIndex=0;
        that.pageFlag=true;
        that.cursorId=0;
        that.commentList=[];
        that.hasMore=1;
        that.favorNum=null;
        that.commentNum=null;
        that.shareNum=null;
        that.isFavored=null;
        that.input_text="";
        that.no_comment=-1;
        that.canRead=-1;
      },
      callShare(){
        var _this=this;
        share.setShareInfo({
          title: _this.shareInfo.title,
          desc: _this.shareInfo.desc,
          link: _this.shareInfo.link,
          imgUrl: _this.shareInfo.imgUrl
        });
        var obj={
          "albumId":_this.albumId,
          "musicId":_this.musicId
        };
        api("/api/mg/content/music/onSub",obj)
          .then(function (res) {
          if(!res.code && res.data.res==1){
            if(_this.shareNum.toString().indexOf("万")==-1 && _this.shareNum.toString().indexOf("亿")==-1){
              _this.shareNum++;
            }
          }else{
            alert(res.code);
          }
        }).catch(function (e) {
        });
        if (ua.isDvdApp()) {
          native.custom.share();
        } else{
          share.callBrowserShare();
        }
      },
      add(count){
        if(count!=null) return "("+count+")";
        else return "";
      },
      comment(){
        var that=this;
        if(that.input_text==""){
          popup.toast("请输入留言内容！");
        }else{
          var obj={
            "albumId":that.albumId,
            "musicId":that.musicId,
            "content":that.input_text
          };
          api("/api/mg/content/prime/commentCreate",obj)
            .then(function (res) {
              if(!res.code){
                var newData=res.data.comment;
                that.no_comment=-1;
                that.commentList.unshift(newData);
                that.input_text="";
                console.log(that.commentNum);
                if(that.commentNum.toString().indexOf("万")==-1 && that.commentNum.toString().indexOf("亿")==-1){
                  that.commentNum++;
                }
                popup.confirm({
                  title: '提示',            // 标题（支持传入html。有则显示。）
                  text: res.data.msg,             // 文本（支持传入html。有则显示。）
                  okBtnTitle: '',
                });
              }else{
                if(res.code=="10009"){
                  if (!!navigator.userAgent.match(/davdian|bravetime|vyohui/)){
                    native.Account.login()
                  }else {
                    window.location.href = '/login.html?'+'referer=' + encodeURIComponent(window.location.href)
                  }
                }else{
                  if(res.code=="59010"){
                    popup.toast("留言内容不可为空！");
                  }else{
                    alert(res.code+":"+res.data.msg);
                  }
                }
              }
            }).catch(function () {

          });
        }

      },
      deleteComment(commentId,index){
        var that=this;
//        popup.confirm({
//          title: '提示',            // 标题（支持传入html。有则显示。）
//          text: '确定删除您的评论吗？',             // 文本（支持传入html。有则显示。）
//          okBtnTitle: '',
//          cancelBtnTitle: '',
//          okBtnCallback() {     // 确定按钮点击回调（有则执行该回调）
//            that.commentList.splice(index,1);
//          }
//        });

        popup.confirm({
          title: '提示',            // 标题（支持传入html。有则显示。）
          text: '确定删除您的评论吗？',             // 文本（支持传入html。有则显示。）
          okBtnTitle: '',
          cancelBtnTitle: '',
          okBtnCallback() {     // 确定按钮点击回调（有则执行该回调）
            var obj={
              "commentId":commentId
            }
            api("/api/mg/content/prime/commentDelete",obj)
              .then(function (res) {
                if(!res.code){
                  popup.confirm({
                    title: '提示',            // 标题（支持传入html。有则显示。）
                    text: res.data.msg,             // 文本（支持传入html。有则显示。）
                    okBtnTitle: '',
                    okBtnCallback() {     // 确定按钮点击回调（有则执行该回调）
                      that.commentList.splice(index,1);
                      if(that.commentNum>0){
                        that.commentNum--;
                      }else{
                        that.commentNum=0;
                      }
                    }
                  });
                }else{
                  if(res.code=="10009"){
                    if (!!navigator.userAgent.match(/davdian|bravetime|vyohui/)){
                      native.Account.login()
                    }else {
                      window.location.href = '/login.html?'+'referer=' + encodeURIComponent(window.location.href)
                    }
                  }else{
                    alert(res.code+":"+res.data.msg);
                  }
                }
              }).catch(function () {

              });
          }
        });



      },
      favor(){
        var that=this;
        var obj={
          "albumId":this.albumId,
          "musicId":this.musicId
        };
        api("/api/mg/content/prime/praise",obj)
          .then(function (res) {
            if(!res.code){
              that.isFavored=1;
              that.favorNum++;
            }else{
              if(res.code=="10009"){
                if (!!navigator.userAgent.match(/davdian|bravetime|vyohui/)){
                  native.Account.login()
                }else {
                  window.location.href = '/login.html?'+'referer=' + encodeURIComponent(window.location.href)
                }
              }else{
                alert(res.code+":"+res.data.msg);
              }
            }
        }).catch(function () {

        })
      },
      doTime(ns){
        //当前时间戳
        var now=parseInt(new Date().getTime().toString().substr(0,10));

        //传入的的时间戳->10位
        var time_10=parseInt(ns.substr(0,10));
        //传入的的时间戳->13位
        var time_13=parseInt(ns*1000);

        //当前的年月日
        var now_year=new Date().getFullYear();
        var now_month=new Date().getMonth()+1;
        var now_day=new Date().getDate();

        //传入的年月日(必须13位)
        var year=new Date(time_13).getFullYear();
        var month=new Date(time_13).getMonth()+1;
        var day=new Date(time_13).getDate();

        //当前日期（字符串）
        var now_date=now_year+"-"+now_month+"-"+now_day;

        //传入日期（字符串）
        var date=year+"-"+month+"-"+day;

        //差值（10位）
        var res=now-time_10;

        var real_day=res/86400;
        var hour=res%86400/3600;
        var min=res%86400%3600/60;

        if(res>=0 && real_day>=0 && real_day<1 && hour>=0 && hour<1 && min>=0 && min<1){
          return "1分钟前";
        }
        if(res>=0 && real_day>=0 && real_day<1 && hour>=0 && hour<1 && min>=1 && min<=30){
          return "30分钟前";
        }
        if(res>=0 && real_day>=0 && real_day<=1 && now_date==date && ((hour>=0 && hour<1 && min>30) || hour>=1)){
          return "今天";
        }
        if(res>=0 && now_date!=date){
          return date;
        }
      },
      scroll(){
        var that=this;
        $(window).scroll(function(){
          var el = $("body").get(0);
          var bottom = el.offsetHeight + el.offsetTop - (window.screen.availHeight + window.scrollY);
          if (bottom<100){
            that.getMoreData();
          }
        });
      },
      getLastCommentId(commentList){
        var lastCommentId=null;
        commentList.map(function (item) {
          lastCommentId=item.commentId;
        });
        this.cursorId=lastCommentId;
      },
      init(){
        var that=this;
        if(that.pageFlag && that.hasMore){
          that.pageFlag=false;
          var obj={
            "albumId":this.albumId,
            "musicId":that.musicId,
            "pageIndex":this.pageIndex,
            "cursorId":this.cursorId
          };
          api('/api/mg/content/prime/detailBottom',obj)
            .then(function (res) {
              that.pageFlag=true;
              if(!res.code){
                that.pageIndex++;
                if(res.data.commentList){
                  that.commentList=that.commentList.concat(res.data.commentList);
                }
                if(res.data.commentList[0]===undefined){
                  that.no_comment=1;
                }
                that.hasMore=res.data.hasMore;
                that.favorNum=res.data.favorNum;
                that.commentNum=res.data.commentNum;
                that.shareNum=res.data.shareNum;
                that.isFavored=res.data.isFavored;
                that.getLastCommentId(res.data.commentList);
                that.shareInfo=res.data.shareInfo;
                that.canRead=res.data.canRead;
              }else{
                alert("res.msg123123"+res.data.msg);
              }
            }).catch(function () {
              that.pageFlag=true;
            })
        }
      },
      getMoreData(){
        var that=this;
        if(that.pageFlag && that.hasMore){
          that.pageFlag=false;
          var obj={
            "albumId":this.albumId,
            "musicId":that.musicId,
            "pageIndex":this.pageIndex,
            "cursorId":this.cursorId
          };
          api('/api/mg/content/prime/detailBottom',obj)
            .then(function (res) {
              that.pageFlag=true;
              if(!res.code){
                that.pageIndex++;
                if(res.data.commentList){
                  that.commentList=that.commentList.concat(res.data.commentList);
                }
                that.hasMore=res.data.hasMore;
                that.favorNum=res.data.favorNum;
                that.commentNum=res.data.commentNum;
                that.shareNum=res.data.shareNum;
                that.isFavored=res.data.isFavored;
                that.getLastCommentId(res.data.commentList);

              }else{
                alert("res.msg123123"+res.data.msg);
              }
            }).catch(function () {
            that.pageFlag=true;
          })
        }
      }
    }
  }
</script>
<style scoped>
  .icon{
    padding-top: 0.15rem;
    padding-left: 0.2rem;
    padding-bottom: 0.2rem;
    font-size: 0;
  }
  .img{
    height: 0.17rem;
    width: 0.17rem;
  }
  .img img{
    height: 0.17rem;
    width: 0.17rem;
  }
  .block{
    display: inline-block;
    font-size: 0.13rem;
    vertical-align: top;
    height: 0.19rem;
  }
  .block> div{
    display: inline-block;
    vertical-align: top;
  }
  .block .count{
    margin-left: 0.05rem;
    height: 100%;
    line-height: 0.19rem;
  }
  .icon .left_block{
    padding-right: 0.15rem;
    border-right: 1px solid #EEEEEE;
    margin-right: 0.15rem;
  }
  .all_comment_text{
    margin-top: 0.1rem;
    margin-left: 0.2rem;
    color:#000000;
    font-size: 0.18rem;
    margin-bottom: 0.1rem;
  }
  .all_comment_text .all_count{
    color:#000000;
    font-size: 0.12rem;
  }
  .all_comment{
    padding-left: 0.2rem;
  }
  .line{
    height: 0.01rem;
    background: #E1E1E1;
    transform: scale(0.5);
    width: 200%;
    margin-top: 0.1rem;
    margin-bottom: 0.1rem;
    margin-left: -50%;
  }
  .all_comment_item_top{
    font-size: 0;
    height: 0.3rem;
    position: relative;
    margin-bottom: 0.1rem;
  }
  .all_comment_item_top > div{
    display: inline-block;
    vertical-align: top;
    font-size: 0.12rem;
  }
  .all_comment_item_top .all_comment_item_text{
    height: 100%;
    line-height: 0.3rem;
  }
  .all_comment_item_top img{
    height: 0.3rem;
    width: 0.3rem;
    border-radius: 50%;
  }
  .head{
    margin-right: 0.1rem;
  }
  .all_comment_item_top .my_comment {
    background: #FFF1F5;
    height: 0.14rem;
    color: #FF4A7D;
    text-align: center;
    line-height: 0.14rem;
    font-size: 0.1rem;
    margin-top: 0.06rem;
    margin-left: 0.05rem;
    border-radius: 0.1rem;
    padding: 0.01rem 0.05rem;
  }
  .right{
    position: absolute;
    right: 0;
    color:#999999;
    font-size:0.11rem;
  }
  .all_comment_item_bottom{
    font-size: 0.13rem;
    line-height: 0.18rem;
  }
  .write_comment{
    font-size: 0;
    height: 0.5rem;
    background: #F9F7F8;
    opacity: 0.98;
    position: fixed;
    bottom: 0;
    width: 100%;
    max-width: 640px;
  }
  .write_comment > div{
    display: inline-block;
    font-size: 0.14rem;
  }
  .write_comment_input{
    position: absolute;
    height: 0.34rem;
    margin-top: 0.08rem;
    left: 0.1rem;
    width: 2.75rem;
    line-height: 0.34rem;
  }
  .write_comment input{
    width: 100%;
    height: 0.34rem;
    border:0;
    text-indent: 0.1rem;
    line-height: 0.34rem;
  }
  .btn{
    text-align: center;
    height: 0.34rem;
    line-height: 0.34rem;
    color:#ffffff;
    width: 0.7rem;
    border-radius: 0.17rem;
    position: absolute;
    right: 0.1rem;
    margin-top: 0.08rem;
    background-image: url("//9i.dvmama.com/free/2017/12/16/111.png");
    background-size: 0.7rem 0.34rem;
    background-repeat: no-repeat;
    font-weight: 400;
  }
  .all_comment_item{
    padding-right: 0.2rem;
  }
  .no_comment{
    width: 100%;
    padding-bottom: 1.3rem;
  }
  .no_comment .no_find{
    margin-left: 1.345rem;
    padding-top: 0.9rem;
    width: 1.06rem;
    height: 0.73rem;
    margin-bottom: 0.2rem;
  }
  .no_comment img{
    width: 1.06rem;
    height: 0.73rem;
  }
  .no_text{
    text-align: center;
    width: 100%;
    color:#666666;
    font-size: 0.13rem;
  }
  .empty_div{
    height: 0.01rem;
    background: #E3DFD8;
    transform: scale(0.5);
    width: 7.5rem;
    margin-left: -50%;
  }
  .nickName{
    color:#666666;
  }
</style>
