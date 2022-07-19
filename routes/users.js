const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
router.prefix('/api/users')

const tableDesc = "authlist(userno,name,password,roles)"
//登录接口
router.post('/login', async (ctx, next)=> {
  const {username,password} = ctx.request.body
  const  sql = `SELECT id, roles  FROM authlist where userno="${username}" and password="${password}"`
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
  if(res.length==1){
    ctx.body = {
      code : 200,
      msg : '',
      data : res[0]
    }
  }else{
    ctx.body = {
      code : 300,
      msg : '用户名或者密码错误',
      data : res
    }
  }
})

//查询所有用户信息
router.get('/allusers', async (ctx, next)=> {
  const  sql = 'SELECT * FROM authlist'
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
    msg : '',
    data : res
  }
})
//添加一个账户
router.post('/addaccount', async (ctx, next) =>{
  const {userno,name,password, roles} = ctx.request.body
  const sql = `INSERT INTO ${tableDesc} VALUES("${userno}","${name}","${password}","${roles}")`
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
    msg : '提交成功',
  }
})
//更新或者重置密码
router.post('/updatepassword', async (ctx, next) =>{
  const {password,id} = ctx.request.body  
  console.log(id)
  const sql = `update authlist set password="${password}" where id="${id}"`
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
    msg : '更新密码成功',
  }
})

//更新权限
router.post('/updateroles', async(ctx, next)=> {
  const {roles, id} = ctx.request.body  
  console.log(roles)
  const sql = `update authlist set roles="${roles}" where id="${id}"`
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
    msg : '更新权限成功',
  }
})
//停用账户
router.post('/enduse', async(ctx, next)=> {
  const {ifopen, id} = ctx.request.body  
  const status = ifopen==1? 0: 1
  const sql = `update authlist set ifopen="${status}" where id="${id}"`
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
    msg : '操作成功',
  }
})
module.exports = router
