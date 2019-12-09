/**
 * 作者：刘伟涛
 */
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData(options)
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

  },
  saomaCb(){ //扫码
    wx.scanCode({
      success(res) {
        if(!res.result){
          wx.showToast({
            icon: "none",
            title: '数据解析失败',
          })
        }
        if (res.result.toUpperCase().indexOf("CZ") == 0) {
          app.checkUserLogin(() => {
            wx.navigateTo({
              url: `../reportDetail/reportDetail?id=${res.result}`,
            })
          })
          return
        }else{
          wx.navigateTo({
            url: `../reportDetail/reportDetail?id=${res.result}`,
          })
        }
      }
    })
  },
  ershouCb(){
    app.checkUserAuthorize(() => {
      wx.navigateTo({
        url: `../reportSearch/reportSearch?type=1`,
      })
    })
  },
  sifaCb(){
    app.checkUserLogin(() => {
      wx.navigateTo({
        url: `../reportSearch/reportSearch?type=2`,
      })
    })
  },
  guojianCb(){
    wx.navigateTo({
      url: `../reportSearch/reportSearch?type=3`,
    })
  },
  baoxiuCb(){
    wx.navigateTo({
      url: `../reportSearch/reportSearch?type=4`,
    })
  }
})