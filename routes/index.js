const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
router.prefix('/api')
const tableDesc = 'productlist(name,goods_type,goods_no,model_type,price,unit,ifopen,goods_prod_address,buy_date,buy_number,store_house,delivery_address,ifdelete,userno)'

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.post('/productlist', async (ctx, next) => {
  const {id, roles} = ctx.request.body
  // select p.id, p.name, p.goods_type, p.goods_no, p.model_type, p.price, p.unit,p.ifopen, p.goods_prod_address, p.buy_date, p.buy_number, p.store_house, p.delivery_address, a.name as username from productlist p left join authlist a on p.userno=a.id
  let sql = 'select p.id, p.name, p.goods_type, p.goods_no, p.model_type, p.price, p.unit,p.ifopen, p.goods_prod_address, p.buy_date, p.buy_number, p.store_house, p.delivery_address, p.userno, a.name as username from productlist p left join authlist a on p.userno=a.id where p.ifdelete != 1'
  if(!roles.includes("ADMIN")){
    sql = `select p.id, p.name, p.goods_type, p.goods_no, p.model_type, p.price, p.unit,p.ifopen, p.goods_prod_address, p.buy_date, p.buy_number, p.store_house, p.delivery_address, p.userno, a.name as username from productlist p left join authlist a on p.userno=a.id where p.ifdelete != 1 and p.userno="${id}"`
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

function generateSql(arr,userno){
  let sql = `INSERT INTO ${tableDesc}`;
  const strArr = arr.map(item=>{
    const {name="",goodsType="",goodsNo="",modelType="",price,unit="",ifopen=1, goodsProdAddress="",buyDate="",buyNumber=0,storeHouse="",deliveryAddress="",ifdelete=0}=item
    const res = `("${name}","${goodsType}","${goodsNo}","${modelType}",${price},"${unit}","${ifopen}","${goodsProdAddress}","${buyDate}",${buyNumber},"${storeHouse}","${deliveryAddress}",${ifdelete},"${userno}")`
    return res
  })
  const value = strArr.join(',')
  return `${sql} VALUES ${value}`
}

router.post('/addOneProduct', async (ctx, next) => {
  const {name,goods_type,goods_no,model_type,price,unit,ifopen,goods_prod_address,buy_date,buy_number,store_house,delivery_address="NULL",ifdelete, userno} = ctx.request.body
  var  sql = `INSERT INTO ${tableDesc} VALUES("${name}","${goods_type}","${goods_no}","${model_type}",${price},"${unit}",${ifopen},"${goods_prod_address}","${buy_date}",${buy_number},"${store_house}","${delivery_address}",${ifdelete},"${userno}")`
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
    data : {}
  }
})

router.post('/addExcelImportProduct', async (ctx, next) => {
  // const {name,goods_type,goods_no,model_type,price,unit,ifopen,goods_prod_address,buy_date,buy_number,store_house,delivery_address,ifdelete} = ctx.request.body
  const {excelData, userno} = ctx.request.body
  const sql = generateSql(excelData,userno)
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
    data : {}
  }
})

router.post('/login', async (ctx, next)=>{
  const {username, password} = ctx.request.body
  
  const sql = `select name from authlist where name="${username}" and password="${password}"`
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
  if(result.length>0){
    ctx.body = {
      code : 200,
      msg : '',
    }
  }else{
    ctx.body = {
      code : 200,
      msg : '用户名或者密码错误',
    }
  }

})

router.post('/delete', async (ctx, next)=>{
  const {id} = ctx.request.body  
  const sql = `update productlist set ifdelete=1 where id="${id}"`
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

router.post('/startorend', async (ctx, next)=>{
  const {id,ifopen} = ctx.request.body 
  const modify = ifopen==1?0:1 
  const sql = `update productlist set ifopen=${modify} where id="${id}"`
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
    msg : '修改成功',
  }
})


router.post('/updateProduction', async (ctx, next)=>{
  const { productName,modelType, id} = ctx.request.body 
  const sql = `update productlist set name="${productName}",model_type="${modelType}" where id="${id}"`
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
    msg : '修改成功',
  }
})

router.post('/importstandard', async (ctx, next) => {
  const {excelData, userno} = ctx.request.body 
  const strArr = excelData.map(item=>{
    const {name="",goodsType="",goodsNo="", goodsCode="", goodsNorms=""}=item
    const res = `("${name}","${goodsNo}","${goodsType}","${goodsCode}","${goodsNorms}", ${userno})`
    return res
  })
  const value = strArr.join(',')
  const sql = `INSERT INTO standard(name, goodsno, goodstype, goodscode, goodsnorms, userno) VALUES ${value}`
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

router.get('/getstandard', async (ctx, next) => {
  const sql = `select * from  standard`
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

const generateNewId =(id)=>{
  const str = id +""
  let num = Number(str.substr(1)) + 1
  if(num>=100 && num<1000) return `J000${num}`
  if(num>=1000 && num<10000) return `J00${num}`
  if(num>=10000) return `J0${num}`
}

// transaction 入职
router.post('/submitonwork', async (ctx, next) => {
  const {
    type, name, departmentname, submitname, identityid, tel, gender,
    emergency1="", emergencytel1="",relationship1="",
    emergency2="", emergencytel2="", relationship2="", position="", station="",startworktime
  } = ctx.request.body 
  const maxEmployeeidSql = "select max(employeeid) from employeeinfo"

  let result = await new Promise((resolve,reject)=>{
    connection.query(maxEmployeeidSql,function (err, result) {
      if(err){
        reject(err)
      }else{
        resolve(result)
      }
    });
  })
  const employeeid = generateNewId(result[0]['max(employeeid)']) 
  const day = new Date()
  const str = `("${employeeid}","${departmentname}","${name}","${identityid}","${gender}","${position}","${station}","${startworktime}","${tel}","${emergency1}", "${emergencytel1}", "${relationship1}","${emergency2}", "${emergencytel2}", "${relationship2}", 1)`
  const value = `("${type}", "${name}", "${departmentname}", "${submitname}","${identityid}","${tel}","${emergency1}","${emergencytel1}","${startworktime}")`
  const sql = `INSERT INTO transaction(
    type, name, departmentname, offerpersonname, identityid, 
    tel,emergency, emergencytel, timepoint ) VALUES ${value}; INSERT INTO employeeinfo(employeeid, departmentname, name, identityid, gender, position,
      station, startworktime, tel, emergency1, emergencytel1, relationship1,
      emergency2, emergencytel2, relationship2, status) VALUES ${str}`

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

//离职
router.post('/submitoffwork', async (ctx, next) => {
  const {type, name, departmentname, submitname, identityid, startworktime} = ctx.request.body 
  const value = `("${type}", "${name}", "${departmentname}", "${submitname}","${identityid}", "${startworktime}")`
  const sql = `INSERT INTO transaction(type, name, departmentname, offerpersonname, identityid, timepoint) VALUES ${value}; update employeeinfo set status=3 where identityid="${identityid}"`
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

//营运部审批状态
router.post('/submitoperate', async (ctx, next) => {
  const {type, id, identityid,  operatestatus, transactiontype="" } = ctx.request.body 
  let tablename = gettablename(type)
  let sql = `update ${tablename} set operatestatus="${operatestatus}" where id=${id}`
  if(type==1 && operatestatus=="Y"&&transactiontype=="入职"){
     sql =  `${sql}; update employeeinfo set status=2 where identityid="${identityid}"`
  }else if(type==1 && operatestatus=="Y"&&transactiontype=="离职"){
    sql =  `${sql}; update employeeinfo set status=4 where identityid="${identityid}"`
  }else if(type==1 && operatestatus=="N"&&transactiontype=="入职"){
    sql =  `${sql}; delete from employeeinfo  where identityid="${identityid}"`
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
const gettablename=(type)=>{
    if(type==1){
       return "transaction"
    }else if(type==2){
        return "applyforovertimework"
    }else if(type==3){
        return "applyforaddsalary"
    }
}
//hr审批状态
router.post('/submithr', async (ctx, next) => {
  const {id, type, hrstatus} = ctx.request.body 
  let tablename = gettablename(type)
  const sql = `update ${tablename} set hrstatus = "${hrstatus}" where id=${id}`
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


//入职离职审批状态
router.post('/getonoroffworkstatus', async (ctx, next) => {
  const {departmentname=""} = ctx.request.body 
  let sql = `select * from transaction`
  if(departmentname){
    sql = `select * from transaction where departmentname='${departmentname}'`
  }
  let res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
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


//加薪申请查询applyforaddsalary
router.post('/applyforaddsalarystatus', async (ctx, next) => {
  const {departmentname=""} = ctx.request.body
  let sql = `select * from applyforaddsalary`
  if(departmentname){
    sql = `select * from applyforaddsalary where departmentname='${departmentname}'`
  } 
  let res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
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

//加班申请提交

//离职
router.post('/submitovertimework', async (ctx, next) => {
  const { overtimeworklist, departmentname, submitname, startoverworktime,endoverworktime, overworkreason} = ctx.request.body 
  const value = overtimeworklist.map(item=>`("${item.employeeid}", "${item.name}",  "${departmentname}", "${submitname}","${startoverworktime}", "${endoverworktime}", "${overworkreason}")`)
  const sql = `INSERT INTO applyforovertimework(employeeid,  name, departmentname, submitname, startoverworktime, endoverworktime, reason) VALUES ${value.join(",")}`
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

//加班申请查询applyforovertimework
router.post('/applyforovertimeworkstatus', async (ctx, next) => {
  const {departmentname=""} = ctx.request.body
  let sql = `select * from applyforovertimework`
  if(departmentname){
    sql = `select * from applyforovertimework where departmentname='${departmentname}'`
  }

  let res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
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

//importallemployeeinfo 导入员工信息表
router.post('/importallemployeeinfo', async (ctx, next) => {
  const datalist = ctx.request.body
  const resultlist = []
  datalist.map(item=>{
    const{employeeid, departmentname, name, identityid, borntime, gender,  position="",
        station="", startworktime="", tel, emergency1="", emergencytel1=0, relationship1="",
        emergency2="", emergencytel2=0, relationship2=""
    } = item 
    const str = `("${employeeid}","${departmentname}","${name}","${identityid}","${borntime}","${gender}","${position}","${station}","${startworktime}","${tel}","${emergency1}", "${emergencytel1}", "${relationship1}","${emergency2}", "${emergencytel2}", "${relationship2}")`
    resultlist.push(str)
  })
  const value = resultlist.join(",")

  const sql = `INSERT INTO employeeinfo(
                employeeid, departmentname, name, identityid, borntime, gender,  position,
                station, startworktime, tel, emergency1, emergencytel1, relationship1,
                emergency2, emergencytel2, relationship2
  ) VALUES ${value}`

  let res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
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
router.post('/updateemployeeinfobyid', async (ctx, next) => {
  const {
    departmentname ="",
    tel = "",
    position = "",
    station ="",  
    emergency1="", 
    emergencytel1="", 
    relationship1="",
    emergency2="", 
    emergencytel2="", 
    relationship2="",
    employeeid
  } = ctx.request.body
  let list = []
  if(departmentname){
    list.push(`departmentname="${departmentname}"`)
  }
  if(tel){
    list.push(`tel="${tel}"`)
  }
  if(position){
    list.push(`position="${position}"`)
  }
  if(station){
    list.push(`station="${station}"`)
  }
  if(emergency1){
    list.push(`emergency1="${emergency1}"`)
  }
  if(emergencytel1){
    list.push(`emergencytel1="${emergencytel1}"`)
  }
  if(relationship1){
    list.push(`relationship1="${relationship1}"`)
  }
  if(emergency2){
    list.push(`emergency2="${emergency2}"`)
  }
  if(emergencytel2){
    list.push(`emergencytel2="${emergencytel2}"`)
  }
  if(relationship2){
    list.push(`relationship2="${relationship2}"`)
  }
  const sql = `update employeeinfo set ${list.join(",")} where employeeid="${employeeid}"`

  let res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
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

//根据项目部查询所有员工
router.post('/applyallemployee', async (ctx, next) => {
  const {roles, departmentname} = ctx.request.body
  let sql = `select * from employeeinfo`
  if(roles!=="ADMIN"){
    sql = `select * from employeeinfo where departmentname="${departmentname}"`
  } 
  let res = await new Promise((resolve,reject)=>{
    connection.query(sql,function (err, result) {
      if(err){
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
