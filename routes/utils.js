const connection = require('../public/javascripts/mysql.js')

const getScoreById=async(id)=>{
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
    return res
}

module.exports=getScoreById