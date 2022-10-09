const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
router.prefix('/api/salary')

//保存按日结的一个记录
router.post('/savesimpleday', async (ctx, next) => {
  const {salarytype, name,employeeid,workday, salaryday, worklong, worklongmoney,totalSalary, userno} = ctx.request.body 
  const value = `("${salarytype}","${name}","${employeeid}","${workday}", ${salaryday}, ${worklong}, ${worklongmoney}, ${totalSalary}, ${userno})`
  const sql = `INSERT INTO salary_day(salarytype, name,employeeid, workday, salaryday, worklong, worklongmoney, totalSalary, userno) VALUES ${value}`
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
  const {salarytype, name,employeeid,workday, monthholiday, salaryday, totalSalary, userno} = ctx.request.body 
  const value = `("${salarytype}","${name}","${employeeid}","${workday}","${monthholiday}",${salaryday}, ${totalSalary}, ${userno})`
  const sql = `INSERT INTO salary_month(salarytype, name, employeeid, workday, monthholiday, salaryday, totalSalary, userno) VALUES ${value}`
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
  const sql = `select  a.salarytype, a.name, a.employeeid, a.salaryday, a.totalSalary, a.worklong, a.worklongmoney from  salary_day a union all select  b.salarytype, b.name, b.employeeid, b.salaryday, b.totalSalary, 0 as worklong, 0 as worklongmoney from salary_month b`
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
  let salary_month =""
  let monthArr = []
  Reflect.ownKeys(d).forEach(item=>{
    const {totalSalary, salarytype} = d[item]
    if(salarytype=="日结"){
      dayArr.push(item)
      salary_daysql = salary_daysql + `WHEN ${totalSalary} THEN ${item}`
    }else {
      monthArr.push(item)
      salary_month = salary_month + `WHEN ${totalSalary} THEN ${item}`
      // UPDATE salary_month SET
      //   column1 = CASE column2
      //       WHEN column1Value1 THEN column2Value1
      //       WHEN column1Value2 THEN column2Value2
      //       WHEN column1Value3 THEN column2Value3
      //   END
      // WHERE column2 IN (column2Value1, column2Value2, column2Value3)
    }
  })
  console.log(dayArr)
  const sqlday = `UPDATE salary_day SET totalSalary = CASE employeeid ${salary_daysql} END WHERE employeeid IN(${dayArr.join(',')})`
  console.log(sqlday)
  // let res = await new Promise((resolve,reject)=>{
  //   connection.query(sql,function (err, result) {
  //     if(err){
  //       console.log(err.message);
  //       reject(err)
  //     }else{
  //       resolve(result)
  //     }
  //   });
  // })
  ctx.type =  'json'
  ctx.body = {
    code : 200,
    msg : '',
    data : d
  }
})
module.exports = router
