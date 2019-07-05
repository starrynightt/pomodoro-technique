// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'mytest-gynlq'
})

async function add(event, context) {
  const wxContext = cloud.getWXContext()
  let {duration, description, starttime} = event;
  return await db.collection('todo').add({
    data: {
      openid: wxContext.OPENID,
      duration,
      description,
      todotype: 0,
      starttime: new Date(starttime)
    }
  }) 
}

async function edit(event, context) {
  let {id, todotype, starttime} = event;
  return await db.collection('todo').doc(id).update({
    // data 传入需要局部更新的数据
    data: {
      todotype: todotype,
      starttime: starttime
    }
  });
}

async function remove(event) {
  let {id} = event;
  return await db.collection('todo').doc(id).remove()
}

const MAX_LIMIT = 100
async function get() {
  const wxContext = cloud.getWXContext()
  // 先取出集合记录总数
  const countResult = await db.collection('todo').where({
    openid: wxContext.OPENID
  }).count()
  const total = countResult.total
  if(total === 0) {
    return {
      data: [],
      errMsg: 'ok'
    }
  }
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('todo').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg
    }
  })
}

// 云函数入口函数
exports.main = async (event) => {
  let type = event.type;
  if(type === 'add') {
    return await add(event);
  }else if(type === 'get') {
    return await get();
  }else if(type === 'edit') {
    return await edit(event);
  }else if(type === 'remove'){
    return await remove(event);
  }

  
}