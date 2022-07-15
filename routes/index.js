const router = require('koa-router')()
const connection = require('../public/javascripts/mysql.js')
router.prefix('/api')
const tableDesc = 'productList(name,goods_type,goods_no,model_type,price,unit,ifopen,goods_prod_address,buy_date,buy_number,store_house,delivery_address,ifdelete)'

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/productlist', async (ctx, next) => {
   
  var  sql = 'SELECT * FROM productlist';

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

module.exports = router
