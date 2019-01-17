import encrypt from "dvd-service-js-encrypt"
/**
 * @module dvd-service-js-encrypt
 * @author swg [源码地址](http://gitlab.rd.vyohui.com/FE-Service/dvd-service-js-encrypt.git)
 */
import $ from 'jquery';
let api = (url,o) =>{
  let obj = o || {};
  let urlT = url + '?' +new Date().getTime();
  return $.ajax({
    cache: false,
    async: true,
    url: urlT,
    type: 'post',
    dataType: 'json',
    data: encrypt(obj),
    success(response) {
      return response.data;
    }
  });
}
export default api
