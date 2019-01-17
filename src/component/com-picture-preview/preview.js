let getEl = function () {
  return (document.querySelector('.app') || document.body).appendChild(document.createElement('div'));
};
import Vue from 'vue';
export default {
  /**
   * 功能: 大图预览
   * @param picIndex      点击图片序号
   * @param picGroup   展示的图片数组
   * @param operate    是否需要删除以及设为封面操作,传true/false
   * @param showModifiedPic    用于接收大图预览组件传回的数据
   * 示例：
   * preview(picIndex, picGroup, operate, showModifiedPic);
   */
  preview(picIndex, picGroup, operate, showModifiedPic = function(){}) {
    new Vue({
      components: {
        'pic-preview': require('./com-picture-preview.vue').default
      },
      el: getEl(),
      data: {picIndex, picGroup, operate},
      template: '<pic-preview :picIndex="picIndex" :picGroup="picGroup" :operate="operate" @modifiedPicGroup="showModifiedPic"/>',
      methods:{
        showModifiedPic: showModifiedPic,
      }
    });
  }
}
