/**
 * 作者：刘伟涛
 */
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    needLogin: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData(options)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getWxUserInfo: function(res) {
    let rawData
    if (res.detail) { //用户点击按钮触发。
      rawData = res.detail.rawData || ''
    }
    if (!rawData) { //拒绝授权
      wx.showModal({
        title: '提示',
        content: '拒绝获取用户信息权限，您将无法获取完整用户体验!',
        confirmText: '知道了',
        showCancel: false
      })
    } else {
      app.globalData.authorizeData = res.detail;
      if (this.data.needLogin == 1) { //如果是需要绑定手机号
        wx.navigateTo({
          url: '../bindPhone/bindPhone',
        })
      } else {
        let that = this;
        let authorizeData = app.globalData.authorizeData
        let httpData = {
          "avatarUrl": authorizeData.userInfo.avatarUrl,
          "gender": authorizeData.userInfo.gender,
          "nickName": authorizeData.userInfo.nickName
        }
        app.http({
          url: 'menhu/login/wx/getByCode',
          data: httpData
        }).then(function(res) {
          if (res.data.code = 0) {
            wx.showToast({
              title: '绑定成功！',
            })
            if (res.data && res.data.data) {
              app.globalData.userInfo = res.data.result;
            }
            wx.redirectTo({
              url: '../index/index',
            })
          }
        })
      }
    }
  }
})