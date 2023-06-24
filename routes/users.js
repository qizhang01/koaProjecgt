const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
const getScoreById= require('./utils.js')
router.prefix('/api/users')

const tableDesc = "authlist(userno,name,password,roles,departmentname)"
//登录接口
router.post('/login', async (ctx, next)=> {
  const {username,password} = ctx.request.body
  const  sql = `SELECT id, roles, departmentname, name FROM authlist where userno="${username}" and password="${password}" and ifopen=1`
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
  const {userno,name,password, roles, departmentname} = ctx.request.body
  const sql = `INSERT INTO ${tableDesc} VALUES("${userno}","${name}","${password}","${roles}"),"${departmentname}"`
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

//更新项目部
router.post('/updatedepartment', async (ctx, next) =>{
  const {departmentname,id} = ctx.request.body  
  console.log(id)
  const sql = `update authlist set departmentname="${departmentname}" where id="${id}"`
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

//本人修改密码
router.post('/modifypasswordbyself', async (ctx, next) =>{
  const {password, id, newpassword} = ctx.request.body  
  console.log(id)
  const sql = `update authlist set password="${newpassword}" where id="${id}" and password="${password}"`
  const res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
        reject(err)
      }else{
        resolve(result)
      }
    });
  })
  ctx.type =  'json'
  if(res.changedRows!=0){
    ctx.body = {
      code : 200,
      msg : '更新密码成功',
    }
  }else if(res.changedRows==0){
    ctx.body = {
      code : 200,
      msg : '原密码输入错误, 请重新输入',
    }
  }
})


//获取测验成绩
router.post('/alltestingscore', async (ctx, next)=> {
  const {id} = ctx.request.body  
  const res=await getScoreById(id)
  console.log(res)
  ctx.type =  'json'
  ctx.body = {
    code : 200,
    msg : '获取成功',
    data: res
  }
})
module.exports = router
