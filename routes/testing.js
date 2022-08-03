const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
const querystring = require('querystring')

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
  const {tablename , answer} = ctx.request.body
  let sql = ''
  if(answer){
    sql = `select topic, answer from ${tablename}`
  }else{
    sql = `select topic,A,B,C,D,E,F,G from ${tablename}`
  }
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

//获取试题库名称
router.get('/alltestinglibname', async (ctx, next)=> {
  const  sql = `select name, tablename from testinglibname`
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


//提交测试结果
router.post('/submittestingresult', async(ctx, next)=> {
  const {tablename, selectedArr, id} = ctx.request.body 

  let sql = `select topic, answer from ${tablename}`
  let res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
        reject(err)
      }else{
        resolve(result)
      }
    });
  })

  let rightNumber = 0,
        tempObj= []
  for (let i = 0; i < selectedArr.length; i++) {
      if (selectedArr[i] !== res[i].answer) {
          tempObj.push({
              value: selectedArr[i],
              isTrue: false,
          })
      } else {
          rightNumber++
          tempObj.push({
              value: selectedArr[i],
              isTrue: true,
          })
      }
  }

  const searchsql = `select score from authlist where id="${id}"`
  res = await new Promise((resolve,reject)=>{
    connection.query(searchsql,function (err, result) {
      if(err){
        console.log(err.message);
        reject(err)
      }else{
        resolve(result)
      }
    });
  })
  
  let lastScore=""
  if(res[0].score){
      const temp = querystring.parse(res[0].score)
      lastScore = querystring.stringify({
        ...temp,
        [tablename]: rightNumber 
      })
  }else{
    lastScore=querystring.stringify({[tablename]: rightNumber })
  }

  sql = `update authlist set score="${lastScore}" where id="${id}"`
  res = await new Promise((resolve,reject)=>{
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
    msg : '操作成功',
    data: {rightNumber, tempObj}
  }
})
module.exports = router
