// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todoList: null,
    reload: false,
    startX: 0,
    endX: 0,
    triggerSlideInAnim: false,
    triggerSlideOutAnim: false,
    currentEditIndex: -1
  },
  creatTodo: function () {
    wx.switchTab({
      url: '/pages/add/add'
    })
  },
  reloadList: function () {
    this.data.reload = false;
    this.setData({
      reload: this.data.reload
    })
    this.loadList();
  },
  loadList: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'tomato',
      data: {
        type: 'get'
      }
    }).then(res => {
      var todoList = res.result.data || [];
      todoList.forEach(item => {
        if (item.todotype === 4) {
          var startime = item.startime;
          var duration = item.duration;
          if (Date.now() - startime - duration >= 0) {
            item.todotype = 2;
          }
        }
      })
      this.data.todoList = todoList;
      this.setData({
        todoList: todoList
      })
      wx.hideLoading();
    }).catch(res => {
      wx.hideLoading();
      this.data.reload = true;
      this.setData({
        reload: this.data.reload
      })
    })
  },
  enterTomato: function (e) {
    let index = e.currentTarget.dataset.idx;
    if (this.data.triggerSlideInAnim && this.data.currentEditIndex === index) {
      this.data.triggerSlideOutAnim = true;
      this.data.triggerSlideInAnim = false;
      this.setData({
        triggerSlideInAnim: this.data.triggerSlideInAnim,
        triggerSlideOutAnim: this.data.triggerSlideOutAnim
      });
    } else {
      var appInstance = getApp()
      appInstance.globalData.todo = this.data.todoList[index];
      wx.navigateTo({
        url: '/pages/tomato/tomato?'
      })
    }

  },
  startHandler: function (e) {
    var startX = 0;
    if (e.changedTouches.length > 0) {
      startX = e.changedTouches[0].clientX;
    } else if (e.touches.length > 0) {
      startX = e.touches[0].clientX;
    }
    this.data.startX = startX;
  },
  endHandler: function (e) {
    var endX = 0;
    if (e.changedTouches.length > 0) {
      endX = e.changedTouches[0].clientX;
    } else if (e.touches.length > 0) {
      endX = e.touches[0].clientX;
    } else {
      endX = this.data.startX;
    }
    this.data.endX = endX;
    if (this.data.startX - endX > 50) {
      this.data.currentEditIndex = e.currentTarget.dataset.idx;
      this.triggerSlidein();
    }
  },
  triggerSlidein: function () {
    if (!this.data.triggerSlideInAnim) {
      this.data.triggerSlideInAnim = true;
      this.setData({
        triggerSlideInAnim: this.data.triggerSlideInAnim,
        currentEditIndex: this.data.currentEditIndex
      })
    }
  },
  animationend: function(e) {
    if(e.detail.animationName === 'slideout'){
      this.data.triggerSlideOutAnim = false;
      this.setData({
        triggerSlideOutAnim: this.data.triggerSlideOutAnim
      })
    }
  },
  deleteHandler: function(e) {
    var index = e.currentTarget.dataset.idx;
    wx.showModal({
      content: '确定要删除吗?',
      success: res => {
        if (res.confirm) {
          let todo = this.data.todoList[index];
          this.sendDelete(todo._id);
        } else if (res.cancel) {
        }
      }
    })
    
  },
  sendDelete: function(todoid) {
    wx.showLoading({
      title: '删除中...',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'tomato',
      data: {
        type: 'remove',
        id: todoid
      }
    }).then(res => {
      var index = this.data.todoList.findIndex(item => {
        return item._id === todoid;
      })
      this.data.todoList.splice(index,1);
      this.data.currentEditIndex = -1;
      this.data.triggerSlideInAnim = false;
      this.data.triggerSlideOutAnim = false;
      this.setData({
        todoList: this.data.todoList,
        currentEditIndex: this.data.currentEditIndex,
        triggerSlideInAnim: this.data.triggerSlideInAnim,
        triggerSlideOutAnim: this.data.triggerSlideOutAnim
      })
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      
    }).catch(res => {
      wx.hideLoading();
      wx.showToast({
        title: '删除失败'
      })
    })
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
    this.data.todoList = null;
    this.data.triggerSlideInAnim = false;
    this.data.triggerSlideOutAnim = false;
    this.data.currentEditIndex = -1;
    this.setData({
      todoList: this.data.todoList,
      currentEditIndex: this.data.currentEditIndex,
      triggerSlideInAnim: this.data.triggerSlideInAnim,
      triggerSlideOutAnim: this.data.triggerSlideOutAnim
    })
    this.loadList()
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