const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
const querystring = require('querystring')

router.prefix('/api/testing')

const tableDesc = "testinglib1(name,topic,oneSelect,answer,A,B,C,D,E,F,G)"

const excelTableDesc = "testinglib1(G,topic,A,B,C,D,answer,oneSelect)"

var randomIntNum = function(maxNum, n) {
  var oArr = [];
  var newArr = [];
  var rNum;
  for (var i = 0; i < n;) {
      rNum = parseInt(Math.random() * maxNum + 1);
      if (!oArr[rNum]) {
          oArr[rNum] = rNum;
          (rNum < 10) && (rNum = '0' + rNum);
          newArr.push(rNum);
          i++;
      }
  }
  return newArr;
}

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

//excel 导入测试题
router.post('/importalltestcasebyexcel', async (ctx, next)=> {
  const datalist = ctx.request.body
  const  sql = `INSERT INTO ${excelTableDesc} VALUES ${datalist.join(',')}`
  console.log(sql)
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
    sql = `select id, topic, answer from ${tablename}`
  }else{
    sql = `select id,topic,A,B,C,D,E,F,G from ${tablename}`
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

//修改试题库名称
router.post('/modifylibname', async (ctx, next)=> {
  let  sql = `select name, tablename from testinglibname`
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
  console.log(res)
  const {orginname, newname} = ctx.request.body 
  const value = res[0].name.replace(orginname,newname)

  sql = `update testinglibname set name="${value}" `
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
    msg : '修改成功',
    data: res
  }
})

//删除id试题
router.post('/deletetopic', async (ctx, next)=> {
  const {tablename , id} = ctx.request.body
  const sql = `delete from ${tablename} where id="${id}"`
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
    msg : '删除成功',
    data: res
  }
})
module.exports = router
