var mysql  = require('mysql');  
 
var connection = mysql.createConnection({     
  host     : 'localhost',       
  // user     : 'root',              
  // password : 'root',  
  user     : 'product',              
  password : 'product1234',  
  port: '3306',                   
  database: 'product' ,
  multipleStatements: true
}); 

connection.connect();
module.exports = connection

