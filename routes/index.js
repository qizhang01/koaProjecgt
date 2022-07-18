const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
router.prefix('/api')
const tableDesc = 'productlist(name,goods_type,goods_no,model_type,price,unit,ifopen,goods_prod_address,buy_date,buy_number,store_house,delivery_address,ifdelete)'

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/productlist', async (ctx, next) => {
   
  var  sql = 'SELECT * FROM productlist where ifdelete != 1';

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

function generateSql(arr){
  let sql = `INSERT INTO ${tableDesc}`;

  const strArr = arr.map(item=>{
    const {name="",goodsType="",goodsNo="",modelType="",price,unit="",ifopen=1, goodsProdAddress="",buyDate="",buyNumber=0,storeHouse="",deliveryAddress="",ifdelete=0}=item
    const res = `("${name}","${goodsType}","${goodsNo}","${modelType}",${price},"${unit}","${ifopen}","${goodsProdAddress}","${buyDate}",${buyNumber},"${storeHouse}","${deliveryAddress}",${ifdelete})`
    return res
  })
  const value = strArr.join(',')
  return `${sql} VALUES ${value}`
}

router.post('/addOneProduct', async (ctx, next) => {
  const {name,goods_type,goods_no,model_type,price,unit,ifopen,goods_prod_address,buy_date,buy_number,store_house,delivery_address="NULL",ifdelete} = ctx.request.body
  var  sql = `INSERT INTO ${tableDesc} VALUES("${name}","${goods_type}","${goods_no}","${model_type}",${price},"${unit}",${ifopen},"${goods_prod_address}","${buy_date}",${buy_number},"${store_house}","${delivery_address}",${ifdelete})`
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
  const body = ctx.request.body
  const sql = generateSql(body)
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

module.exports = router
