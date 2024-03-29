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


router.post('/getallemployeesalary', async (ctx, next) => {
  const {roles, departmentname} = ctx.request.body
  let sql =""
  if(roles.includes("ADMIN") || roles.includes("HR")){
    sql = `select  a.salarytype, a.name, a.employeeid, c.departmentname, a.salaryday, a.salaryworkovertime, 
    a.salarymiddleworkday, a.salarynightworkday, a.totalSalary, a.worklong, a.worklongmoney, a.foodpayday 
    from  salary_day as a inner join employeeinfo as c where a.employeeid = c.employeeid
    union all 
          select  b.salarytype, b.name, b.employeeid, d.departmentname, b.salaryday, b.salaryworkovertime,
          b.salarymiddleworkday, b.salarynightworkday, b.totalSalary, 0 as worklong, 0 as worklongmoney, 
          b.foodpayday from salary_month as b inner join employeeinfo as d where b.employeeid = d.employeeid`
  }else {
    sql = `select  a.salarytype, a.name, a.employeeid, c.departmentname, a.salaryday, a.salaryworkovertime, 
    a.salarymiddleworkday, a.salarynightworkday, a.totalSalary, a.worklong, a.worklongmoney, a.foodpayday 
    from  salary_day as a inner join employeeinfo as c on a.employeeid = c.employeeid where c.departmentname="${departmentname}"
    union all 
          select  b.salarytype, b.name, b.employeeid, d.departmentname, b.salaryday, b.salaryworkovertime,
          b.salarymiddleworkday, b.salarynightworkday, b.totalSalary, 0 as worklong, 0 as worklongmoney, 
          b.foodpayday from salary_month as b inner join employeeinfo as d on b.employeeid = d.employeeid where d.departmentname="${departmentname}"`  
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
  //首先把上个月的薪水先设置为0

  await new Promise((resolve,reject)=>{
    connection.query('UPDATE salary_day SET totalSalary = null ',function (err, result) {
      if(err){
        console.log(err.message);
        reject(err)
      }else{
        resolve(result)
      }
    });
  })

  await new Promise((resolve,reject)=>{
    connection.query('UPDATE salary_month SET totalSalary = null ',function (err, result) {
      if(err){
        console.log(err.message);
        reject(err)
      }else{
        resolve(result)
      }
    });
  })

  //
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

//保存按月结的一个记录
router.post('/updatedepartment', async (ctx, next) => {
  const body = ctx.request.body
  console.log(body)
  let sql1="", sql2 = ""

  Object.keys(body).forEach(key=>{
    sql1 = sql1 + `update salary_day set departmentname="${body[key]}" where employeeid="${key}";`
    sql2 = sql2 + `update salary_month set departmentname="${body[key]}" where employeeid="${key}";`
  })
  // let sql1= `update salary_day set salaryday=${salaryday}, salaryworkovertime=${salaryworkovertime}, worklong=${worklong}, worklongmoney=${worklongmoney}, foodpayday = ${foodpayday} where employeeid="${employeeid}"`

  let res = await new Promise((resolve,reject)=>{
    connection.query(sql1,function (err, result) {
      if(err){
        console.log(err.message);
        reject(err)
      }else{
        resolve(result)
      }
    });
  })
  let res2 = await new Promise((resolve,reject)=>{
    connection.query(sql2,function (err, result) {
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
//获取员工薪水信息by employeeid

router.post('/getemployeesalarybyid', async (ctx, next) => {
  const {employeeid}= ctx.request.body
  const sql = `select  a.salarytype, a.salaryday from  salary_day a where employeeid="${employeeid}" union all select  b.salarytype, b.salaryday from salary_month b where employeeid="${employeeid}"`
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

//submitaddsalary

router.post('/submitaddsalary', async (ctx, next) => {
  const {employeeid, name, departmentname,salarytype, nowsalary, expectedsalary,submitname}= ctx.request.body
  const value = `("${employeeid}", "${name}", "${departmentname}", "${salarytype}", ${nowsalary}, ${expectedsalary}, "${submitname}")`
  const sql = `insert into applyforaddsalary(employeeid, name, departmentname,salarytype, nowsalary, expectedsalary,submitname) VALUES ${value}`
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
module.exports = router
