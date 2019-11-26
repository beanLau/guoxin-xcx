var app = new getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    information: "",
    imgCode: `http://39.105.127.212:8080/jeecg-boot/menhu/login/captcha?v=${Date.now()}`,
    phoneMessage: "获取短信验证码",
    phoneCode: {
      isshow: false,
      title: "验证码已发送，可能会有延后请耐心等待"
    },
    phoneValue: '',
    valiDateCode: '',
    checkCode: '',
    canGetPhoneCode: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData(options);
    // this.setData({
    //   imgCode: `https://api.wangxiao.cn/app/Validate.ashx?validatekey=${options.validatekey}`
    // })
    var that = this;
    // /that.getCode();
  },
  bindPhoneValue: function (e) {
    this.setData({
      phoneValue: e.detail.value
    })
  },
  bindValiDateCode: function (e) {
    this.setData({
      valiDateCode: e.detail.value
    })
  },
  bindCheckCode: function (e) {
    this.setData({
      checkCode: e.detail.value
    })
  },
  onLogin: function (e) {
    if (!this.data.phoneValue) {
      wx.showToast({
        icon: 'none',
        title: '请输入用户名',
      })
      return
    }
    if (!this.data.valiDateCode) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return;
    }
    if (this.data.valiDateCode.length !== 4) {
      wx.showToast({
        title: '验证码错误',
        icon: 'none'
      })
      return;
    }
    if (!this.data.checkCode) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return;
    }
    this.bindPhone(e);
  },
  /**
   * 手机快捷登录
   */
  bindPhone: function (e) {
    let that = this;
    let authorizeData = app.globalData.authorizeData
    let httpData = {
      "avatarUrl": authorizeData.userInfo.avatarUrl,
      "captcha": this.data.valiDateCode,
      "gender": authorizeData.userInfo.gender,
      "loginName": this.data.phoneValue,
      "nickName": authorizeData.userInfo.nickName,
      "password": this.data.checkCode
    }
    app.http({
      url: 'menhu/login/wx/getByCode',
      data: httpData
    }).then(function (res) {
      if (res.data.code != 0) {
        wx.showToast({
          title: res.data.message || "网络异常，稍后再试",
        })
        return
      }
      wx.showToast({
        title: '登录成功！',
      })
      if (res.data && res.data.result) {
        app.globalData.userInfo = res.data.result;
      }
      wx.hideLoading()
      setTimeout(() => { //先提示用户信息，1.5秒后嗲用公共的login方法，更新用户数据
        app.login(() => {
          if (app.globalData.cbUrl) { //判断cburl跳转到对应页面
            if (app.globalData.cbUrl.indexOf('pages/index/index') != -1) {
              wx.switchTab({
                url: '/' + app.globalData.cbUrl,
                success: function (e) {
                  var page = getCurrentPages().pop();
                  if (page == undefined || page == null) return;
                  page.onLoad();
                  app.globalData.loginedCb && app.globalData.loginedCb()
                }
              })
            } else {
              wx.navigateTo({
                url: '/' + app.globalData.cbUrl,
                success: function (e) {
                  var page = getCurrentPages().pop();
                  if (page == undefined || page == null) return;
                  app.globalData.loginedCb && app.globalData.loginedCb()
                }
              })
            }
          } else {
            wx.switchTab({
              url: '/pages/index/index',
              success: function (e) {
                var page = getCurrentPages().pop();
                if (page == undefined || page == null) return;
                page.onLoad();
              }
            })
          }
        }, true)
      }, 1500)
    })
  },
  // 输入手机号
  userPboneNum: function (e) {
    if (!this.data.phoneValue) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return false;
    }
    if (!(/^1\d{10}$/).test(this.data.phoneValue)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return false;
    }
    return true;
  },
  // 获取图形验证码
  getimageCode: function () {
    var that = this,
      imgCode = that.data.imgCode;
    that.setData({
      imgCode: imgCode.replace(/&v=.*/g, "") + "&v=" + Date.now()
    })
  },
  // 验证短信验证码
  getphoneCode: function () {
    
    if (this.data.canGetPhoneCode) {
      var that = this;
      that.setTime();
    }
  },
  //获取手机号验证码
  gotopassLogin: function () {
    wx.redirectTo({
      url: `../passLogin/passLogin?IsShowValidatecode=${this.data.IsShowValidatecode}&validatekey=${this.data.validatekey}`
    })
  },
  //倒计时
  setTime: function () {
    if (!this.data.canGetPhoneCode) {
      return;
    }
    let that = this;
    app.http({
      url: 'login/sendBindingSmsCode',
      data: {
        mobile: that.data.phoneValue
      }
    }).then(function (res) {
      if (res.data.code != 0) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        return
      }
      that.setData({
        canGetPhoneCode: false
      })
      let timer = 60;
      let interval = setInterval(() => {
        if (timer <= 0) {
          clearInterval(interval);
          interval = null;
          that.setData({
            phoneMessage: "重新获取验证码",
            phoneCode: {
              isshow: false,
              title: ""
            },
            canGetPhoneCode: true
          })
        } else {
          timer--;
          that.setData({
            phoneMessage: timer + "s后重新获取",
            phoneCode: {
              isshow: true,
              title: "验证码已发送，可能会有延后请耐心等待"
            }
          })
        }
      }, 1000)
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})