const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
router.prefix('/api/salary')

//保存按日结的一个记录
router.post('/savesimpleday', async (ctx, next) => {
  const {salarytype, name,employeeid,salaryworkovertime, salaryday, worklong, worklongmoney, salarymiddleworkday, salarynightworkday, userno, foodpayday} = ctx.request.body 
  const value = `("${salarytype}","${name}","${employeeid}",${salaryworkovertime}, ${salaryday}, ${worklong}, ${worklongmoney}, ${salarymiddleworkday}, ${salarynightworkday}, ${userno}, ${foodpayday})`
  const sql = `INSERT INTO salary_day(salarytype, name,employeeid, salaryworkovertime, salaryday, worklong, worklongmoney, salarymiddleworkday, salarynightworkday, userno, foodpayday) VALUES ${value}`
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

//保存按月结的一个记录
router.post('/savesimplemonth', async (ctx, next) => {
  const {salarytype, name,employeeid, salaryworkovertime, salaryday, salarymiddleworkday, salarynightworkday, userno, foodpayday} = ctx.request.body 
  const value = `("${salarytype}","${name}","${employeeid}",${salaryworkovertime},${salaryday}, ${salarymiddleworkday}, ${salarynightworkday}, ${userno}, ${foodpayday})`
  const sql = `INSERT INTO salary_month(salarytype, name, employeeid, salaryworkovertime, salaryday, salarymiddleworkday, salarynightworkday, userno, foodpayday) VALUES ${value}`
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


router.get('/getallemployeesalary', async (ctx, next) => {
  const sql = `select  a.salarytype, a.name, a.employeeid, a.salaryday, a.salaryworkovertime, a.salarymiddleworkday,  a.salarynightworkday, a.totalSalary, a.worklong, a.worklongmoney, a.foodpayday from  salary_day a union all select  b.salarytype, b.name, b.employeeid, b.salaryday, b.salaryworkovertime, b.salarymiddleworkday, b.salarynightworkday, b.totalSalary, 0 as worklong, 0 as worklongmoney, b.foodpayday from salary_month b`
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


//保存按月结的一个记录
router.post('/updatetotalsalary', async (ctx, next) => {
  const d = ctx.request.body 
  let salary_daysql = ""
  let dayArr = []
  let salary_monthsql =""
  let monthArr = []
  Reflect.ownKeys(d).forEach(item=>{
    const {totalSalary, salarytype} = d[item]
    if(salarytype=="日结"){
      dayArr.push(item)
      salary_daysql = salary_daysql + `UPDATE salary_day SET totalSalary = ${totalSalary} where employeeid = '${item}' ; `
    }else {
      monthArr.push(item)
      salary_monthsql = salary_monthsql + `UPDATE salary_month SET totalSalary = ${totalSalary} where employeeid = '${item}' ; `
      // UPDATE salary_month SET
      //   column1 = CASE column2
      //       WHEN column1Value1 THEN column2Value1
      //       WHEN column1Value2 THEN column2Value2
      //       WHEN column1Value3 THEN column2Value3
      //   END
      // WHERE column2 IN (column2Value1, column2Value2, column2Value3)
    }
  })

  // const sqlday = `UPDATE salary_day SET totalSalary = CASE employeeid${salary_daysql} END WHERE employeeid IN(${dayArr.join(',')})`
  // const sqlmonth = `UPDATE salary_month SET totalSalary = CASE employeeid${salary_monthsql} END WHERE employeeid IN(${monthArr.join(',')})`
  if(salary_daysql){
    let res1 = await new Promise((resolve,reject)=>{
      connection.query(salary_daysql,function (err, result) {
        if(err){
          console.log(err.message);
          reject(err)
        }else{
          resolve(result)
        }
      });
    })
  }
  if(salary_monthsql){
    let res2 = await new Promise((resolve,reject)=>{
      connection.query(salary_monthsql,function (err, result) {
        if(err){
          console.log(err.message);
          reject(err)
        }else{
          resolve(result)
        }
      });
    })
  }
  ctx.type =  'json'
  ctx.body = {
    code : 200,
    msg : '提交成功',
  }
})

//保存按月结的一个记录
router.post('/update', async (ctx, next) => {
  const {salarytype, name, employeeid,  salaryday, worklong=0, worklongmoney=0, salaryworkovertime=0, foodpayday=0} = ctx.request.body
  let sql=""
  if(salarytype=="日结"){
    sql = `update salary_day set salaryday=${salaryday}, salaryworkovertime=${salaryworkovertime}, worklong=${worklong}, worklongmoney=${worklongmoney}, foodpayday = ${foodpayday} where employeeid="${employeeid}"`
  }else {
    sql = `update salary_month set salaryday=${salaryday}, salaryworkovertime=${salaryworkovertime}, foodpayday = ${foodpayday}  where employeeid="${employeeid}"`
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
    msg : '更新成功',
  }
})

//保存按月结的一个记录
router.post('/delete', async (ctx, next) => {
  const {salarytype, name, employeeid} = ctx.request.body
  let tablename=""
  if(salarytype=="日结"){
    tablename="salary_day"
  }else {
    tablename="salary_month"
  }
  const sql = `delete from ${tablename} where employeeid="${employeeid}"`
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
  }
})
module.exports = router
