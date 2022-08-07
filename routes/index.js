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
  console.log(id)
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

module.exports = router
