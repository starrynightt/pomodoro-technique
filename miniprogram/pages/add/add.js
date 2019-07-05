// pages/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    multiArray: [
      ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10'],
      ['05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
    ],
    multiIndex: [0, 3],
    todoDesc: ''
  },
  bindMultiPickerChange: function (e) {
    let multiIndex = e.detail.value;
    this.setData({
      multiIndex: multiIndex
    })
  },
  bindMultiPickerColumnChange: function (e) {
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;

    switch (e.detail.column) {
      case 0:
        switch (data.multiArray[0][data.multiIndex[0]]) {
          case '00':
            data.multiArray[1] = ['05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
            break;
          default:
            data.multiArray[1] = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
            break;
        }
        data.multiIndex[1] = 0;
        break;
      case 1:
        switch (data.multiArray[1][data.multiIndex[1]]) {
          case 0:
            data.multiArray[0] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']
            break;
          default:
            data.multiArray[0] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10']
            break;
        }
        data.multiIndex[0] = 0;
        break;
    }
    this.setData(data)

  },
  inputHandler: function (e) {
    this.data.todoDesc = e.detail.value;
  },
  saveTodo: function () {
    let todoDesc = this.data.todoDesc.trim();
    if (!todoDesc || todoDesc.lenth === 0) {
      return
    }
    let hour = parseInt(this.data.multiArray[0][this.data.multiIndex[0]]);
    let min = parseInt(this.data.multiArray[1][this.data.multiIndex[1]]);
    let duration = (hour * 60 + min) * 60 * 1000;

    wx.showLoading({
      title: "加载中...",
      mask: true
    })
    var toastDuraion = 1500;
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'tomato',
      // 传递给云函数的event参数
      data: {
        type: 'add',
        duration: duration,
        description: todoDesc,
        starttime: Date.now()
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        duration: toastDuraion,
        mask: true
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/home'
        })
      }, toastDuraion);
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '保存失败, 请重试',
        duration: toastDuraion,
        mask: true
      })
    })
  },
  init: function () {
    this.setData({
        todoDesc: '',
        multiArray: [
          ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10'],
          ['05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
        ],
        multiIndex: [0, 3]
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
  console.log('onshow');
  this.init();
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