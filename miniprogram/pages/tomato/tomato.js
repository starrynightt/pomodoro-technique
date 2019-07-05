// pages/tomato/tomato.js

var util = require('../../lib/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    displayTime: '00:00:00',
    countdown: 0,
    type: 0, // 0 新建, 1 完成, 2:待完成, 3:放弃 4: 进行中
    timer: null,
    todo: null,
    displayBtnText: '开始任务',
    _counter: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data._counter = 0;
    var appInstance = getApp()
    this.data.todo = appInstance.globalData.todo
    var starttime = this.data.todo.starttime;
    var duration = this.data.todo.duration;
    if (this.data.todo.todotype === 0) {
      // 新建
      this.data.type = 0;
      this.data.displayTime = util.dateFomater.hhmmss(this.data.todo.duration);
      this.data.displayBtnText = '开始任务';
    } else if (this.data.todo.todotype === 1) {
      this.data.type = 1;
      this.data.displayBtnText = '已完成';
    } else if (this.data.todo.todotype === 2) {
      this.data.type = 2;
      this.data.displayBtnText = '时间已到, 标记为完成';
    } else if (this.data.todo.todotype === 3) {
      this.data.type = 3;
      this.data.displayBtnText = '已放弃';
    } else if (this.data.todo.todotype === 4) {
      if (Date.now() >= (duration + starttime)) {
        this.data.type = 2;
        this.changeType(2);
        this.data.displayBtnText = '时间已到, 标记为完成';
      } else {
        this.data.countdown = starttime + duration - Date.now() 
        this.data.type = 4;
      }
    }
  },
  tapHandler: function () {
    if (this.data.type === 0) {
      wx.showLoading({
        mask: true
      })
      var nowDate = Date.now();
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'tomato',
        // 传递给云函数的event参数
        data: {
          type: 'edit',
          id: this.data.todo._id,
          todotype: 4,
          starttime: nowDate
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '操作成功',
          mask: true
        });
        this.data.countdown = nowDate + this.data.todo.duration - nowDate;
        this.data.type = 4;
        this.setData({
          type: 4
        })
        this.showDisplayTime();
        this.startTimer();
      }).catch(res => {
        wx.hideLoading();
        wx.showToast({
          title: '操作失败,请重试',
          mask: true
        });
      })
    }else if(this.data.type === 2) {
      wx.showLoading({
        mask: true
      })
      var nowDate = Date.now();
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'tomato',
        // 传递给云函数的event参数
        data: {
          type: 'edit',
          id: this.data.todo._id,
          todotype: 1,
          starttime: nowDate
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '操作成功',
          mask: true
        });
        this.data.type = 1;
        this.setData({
          type: 1
        })
        this.showDisplayTime();
      }).catch(res => {
        wx.hideLoading();
        wx.showToast({
          title: '操作失败,请重试',
          mask: true
        });
      })
    }
  },
  clearTimer: function () {
    if (this.data.timer !== null) {
      clearInterval(this.data.timer);
      this.data.timer = null;
    }
  },
  startTimer: function () {
    this.data.timer = setInterval(() => {
      this.data.countdown = this.data.countdown - 1000;
      this.showDisplayTime();
      if (this.data.countdown < 1000) {
        this.clearTimer();
        this.changeType(2)
      }
    }, 1000);
  },
  showDisplayTime: function () {
    this.data.displayTime = util.dateFomater.hhmmss(this.data.countdown);
    this.setData({
      displayTime: this.data.displayTime
    })
  },
  changeType: function (todotype) {
    if (todotype === 2) {
      this.data.type = 2
      this.setData({
        type: this.data.type
      })
      this.syncCloud();
    }else if(todotype === 3) {
      wx.showLoading({
        mask: true
      })
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'tomato',
        // 传递给云函数的event参数
        data: {
          type: 'edit',
          id: this.data.todo._id,
          todotype: todotype,
          starttime: Date.now()
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '操作成功',
          mask: true
        })
        this.data.displayTime = '00:00:00';
        this.data.type = 3
        this.setData({
          type: this.data.type,
          displayTime: this.data.displayTime
        })
        this.clearTimer();
      }).catch(res => {
        wx.hideLoading();
        wx.showToast({
          title: '操作失败,请重试',
          mask: true
        })
      })
    }

  },
  syncCloud: function () {
    this.data._counter++;
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'tomato',
      // 传递给云函数的event参数
      data: {
        type: 'edit',
        id: this.data.todo._id,
        todotype: 2,
        starttime: Date.now()
      }
    }).then(res => {}).catch(res => {
      console.log('设置待完成失败');
      if(this.data._counter < 5) {
        this.syncCloud();
      }
      
    })

  },
  giveUp: function() {
    wx.showModal({
      content: '确定放弃吗?',
      success: res => {
        if (res.confirm) {
          this.changeType(3);
        } else if (res.cancel) {
          
        }
      }
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
    this.setData({
      type: this.data.type,
      displayBtnText: this.data.displayBtnText,
      displayTime: this.data.displayTime
    });
    if (this.data.type === 4) {
      this.showDisplayTime();
      this.startTimer();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.clearTimer();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.clearTimer();
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