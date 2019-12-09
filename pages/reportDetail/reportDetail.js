let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reportDetail: null,
    active: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let query = options.q || "";
    let id = ""
    if (query){
      try {
        query = decodeURIComponent(query).split("?")[1];
        id = query.split("=")[1];
        id = decodeURI(id)
        this.setData({ id: id })
      } catch (error) {
        wx.showToast({
          icon: "none",
          title: '数据解析失败',
        })
      }
    }
    this.setData(options)
    if (this.data.id.toUpperCase().indexOf("CZ") != -1) {
      app.checkUserLogin(() => {
        this.getDetail()
      })
      return
    }else{
      this.getDetail()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

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
  showHide(e) {
    this.setData({
      active: e.target.dataset.index
    })
  },
  getDetail(){
    if (!this.data.id){
      return
    }
    app.http({
      method: "GET",
      url: `menhu/mhReport/getBySampleCode?code=${this.data.id}`
    })
      .then(res => {
        if (res.code == 0){
          this.setData({
            reportDetail: res.result
          })
        }else{
          wx.showToast({
            icon: 'none',
            title: res.message,
          })
        }
      })
  }
})