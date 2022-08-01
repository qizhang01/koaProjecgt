const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
router.prefix('/api/testing')

const tableDesc = "testinglib1(name,topic,oneSelect,answer,A,B,C,D,E,F,G)"
//登录接口
router.post('/importonetopic', async (ctx, next)=> {
  const {name,topic,A,B,C="",D="",E="",F="",G="",oneSelect,answer} = ctx.request.body
  const  sql = `INSERT INTO ${tableDesc} VALUES("${name}","${topic}", ${oneSelect}, "${answer}","${A}", "${B}", "${C}", "${D}","${E}","${F}","${G}")`
  let res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
        console.log(err.message);
        reject(err)
      }else{
        resolve(result)
      }
    });
  })
  ctx.type =  'json'
  if(res.protocol41){
    ctx.body = {
      code : 200,
      msg : '提交成功',
    }
  }else{
    ctx.body = {
      code : 300,
      msg : '提交失败, 请重新提交',
    }
  }
})


//获取试题
router.post('/alltopics', async (ctx, next)=> {
  const {tablename} = ctx.request.body
  const  sql = `select topic from ${tablename}`
  let res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
        console.log(err.message);
        reject(err)
      }else{
        resolve(result)
      }
    });
  })
  ctx.type =  'json'
  ctx.body = {
    code : 200,
    msg : '获取成功',
    data: res
  }
})
module.exports = router
