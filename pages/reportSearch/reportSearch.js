let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: "冀SD191124EC(2)"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  bindSearchValue: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  searchCb:function(){
    let searchValue = this.data.searchValue
    if (!searchValue){
      wx.showToast({
        icon:'none',
        title: '请输入样品编号',
      })
      return
    }
    if (searchValue.toUpperCase().indexOf("CZ") == 0){
      app.checkUserLogin(()=>{
        wx.navigateTo({
          url: `../reportDetail/reportDetail?id=${searchValue}`,
        })
      })
      return
    }
    wx.navigateTo({
      url: `../reportDetail/reportDetail?id=${searchValue}`,
    })
  }
})