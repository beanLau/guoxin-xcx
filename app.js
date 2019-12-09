/**
 * 作者：刘伟涛 2018-12-7
 */
import utils from 'utils/util.js';
//app.js
App({
  onLaunch: function() {
    //this.login(()=>{},true) //获取用户信息
    // 获取用户权限信息
    // wx.getUserInfo({
    // })
  },
  onShow(options) { //默认先拉取一下用户信息
    
  },
  onHide: function() {
    this.globalData.showContinuePlay = true;
  },
  globalData: {
    needBeginLogin: true,
    exeQueue: true,
    promiseQueue: [],
    promiseQueueKey: 0,
    userInfo: {
      token: ""
    },
    apiUrl: 'https://server.hgstc.com/', //正式地址
  },
  /**
   * 封装的promise
   * 参数： requestObj 请求成功回调
   * throwError: true|false  如果传true则不判断code直接执行requestObj。否则code为100000时提示网络异常
   */
  http: function(requestObj, throwError) {
    let that = this;
    return new Promise((resolve, reject) => {
      //网络请求
      let url = that.globalData.apiUrl + requestObj.url;
      console.log(url)
      wx.request({
        url: url,
        method: requestObj.method || "POST",
        header: {
          token: that.globalData.userInfo.token || ""
        },
        data: requestObj.data || {},
        success: function(res) { //返回取得的数据
          let promiseQueue = that.globalData.promiseQueue;
          that.globalData.canGetContinuePlay = true;
          if (res.data.code == '0' || res.data.code == '200' || throwError) {
            if (requestObj.resolve) { //如果是promise队列中的请求。
              requestObj.resolve(res);
              let promiseQueueItem = promiseQueue.shift();
              if (that.globalData.exeQueue) { //如果队列可执行则循环队列，保持队列只被循环一次。
                that.globalData.exeQueue = false; //防止被多次循环。
                while (promiseQueueItem) {
                  that.http(promiseQueueItem);
                  promiseQueueItem = promiseQueue.shift();
                  that.globalData.promiseQueue = promiseQueue;
                }
                if (!promiseQueueItem) {
                  that.globalData.exeQueue = true;
                  that.globalData.needBeginLogin = true;
                }
              }
            } else {
              resolve(res.data);
            }
          } else if (res.data.code == '600000' || res.data.code == '700000') { //token失效，重新调用login换取token
            requestObj.resolve = resolve;
            promiseQueue.push(requestObj); //请求失败了，把该请求放到promise队列，等待更新token后重新调用。
            if (!that.globalData.needBeginLogin) { //如果不需要重新登录
              return;
            }
            that.globalData.needBeginLogin = false;
            that.login(() => { //获取完token以后执行回调
              //重新登陆以后调用一次队列中的promise；并设置队列为可循环状态。
              let promiseQueueItem = promiseQueue.shift();
              if (promiseQueueItem) {
                that.globalData.exeQueue = true;
                that.http(promiseQueueItem);
                that.globalData.promiseQueue = promiseQueue;
              }
            }, true, throwError)
          } else if (res.data.code == '800000') { //同一个接口并行调用了。
            wx.hideLoading();
            wx.showToast({
              title: res.data.message || "网络异常",
              icon: 'none',
              duration: 2000
            })
          } else {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: res.data.message || "网络异常"
            })
          }
        },
        error: function(e) {
          that.globalData.canGetContinuePlay = true;
          wx.hideLoading();
          reject(e);
        }
      })
    });
  },
  /**
   * 登录校验，获取openid
   * successCb 获取用户信息成功回调
   * cantCheck :如果该值为true，不执行验证用户是否绑定手机号方法。(可以认为是更细用户信息的)
   */
  login: function (successCb, cantCheck, throwError) {
    let that = this;
    wx.login({
      success: function(res) {
        let requestObj = {
          url: "/menhu/login/wx/getByCode",
          method: 'post',
          data: {
            code: res.code
          },
        }
        wx.showLoading({
          title: '努力加载中...',
        })
        that.globalData.userInfo
        that.http(requestObj, throwError).then((res) => {
          let resData = res.data.data;
          if (res.data.code == "0") { // 成功获取useInfo保存起来。
            that.globalData.userInfo = resData;
            if (!cantCheck) {
              that.checkUserLogin(successCb);
            } else {
              successCb && successCb()
            }
            //}
          } else {
            wx.hideLoading()
            if (!throwError){
              wx.showModal({
                title: '提示',
                content: res.data.errMsg || '网络错误！',
                showCancel: false
              })
            }
            
          }

        }).catch((errMsg) => {
          wx.hideLoading()
          console.log(errMsg); //错误提示信息
        });
        wx.hideLoading()
      }
    })

  },
  checkUserAuthorize: function(cb){
    if (!this.globalData.userInfo.nick) {
      wx.navigateTo({
        url: '/pages/authorize/authorize',
      })
    }else{
      cb && cb()
    }
  },
  /**
   * 验证用户是否登录了（是否已绑定手机号）
   * 参数successCb：已登录（绑定手机号）的回调
   * cbUrl:登录成功后跳转的页面
   */
  checkUserLogin: function(successCb) {
    let that = this;
    wx.showLoading({
      title: '努力加载中',
    })
    if (that.globalData.userInfo.token) { //如果已获取用户token
      wx.hideLoading()
      that.globalData.cbUrl = ''
      successCb();
    } else { //去获取用户openid
      that.globalData.cbUrl = utils.getCurrentPageUrlWithArgs() //设置全局url，回来后再执行回调。
      that.globalData.loginedCb = successCb;
      wx.navigateTo({
        url: '/pages/bindPhone/bindPhone', //needLogin=1表示需要登陆
      })
    }
  },
  /**
   * 支付接口
   * timeStamp：时间戳
   * nonceStr：随机字符串
   * _package：统一下单接口返回的 prepay_id 参数值
   * signType：签名算法
   * paySign：签名
   * successCb：支付成功回调
   * errorCb：支付失败回调
   */
  interfacePay: function(timeStamp, nonceStr, _package, paySign, successCb, errorCb, payData) {
    let that = this;
    wx.requestPayment({
      'timeStamp': timeStamp,
      'nonceStr': nonceStr,
      'package': _package,
      'signType': 'MD5',
      'paySign': paySign,
      'success': function(res) {
        typeof successCb == "function" && successCb(res)
      },
      'fail': function(res) {
        if (payData.goodType != 2) { //购买测一测失败不调用发送通知接口
          let requestObj = {
            url: "/order/payFail",
            method: 'post',
            dataobj: {
              orderId: payData.orderId || payData.resData.orderId,
              payWay: 4
            },
          }
          wx.showLoading({
            title: '努力加载中...',
          })
          that.http(requestObj).then((res) => {

          }).catch((errMsg) => {
            wx.hideLoading()
            console.log(errMsg); //错误提示信息
          });
        }
        typeof errorCb == "function" && errorCb(res)
      }
    })
  }
})