var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    user     : 'ita_finalproject',
    password : '4c4WSSTtEvZJl5xu',
    database : 'ita_finalproject'
  });

connection.connect(function (err) {
    if(err){
        console.log(err);
        return;
    }
    console.log('connected and ' + connection.threadId)
});
console.log('test');
var sqlString = 'SELECT * FROM products'
var query = connection.query(sqlString,(error,results,fields) => {
    console.log(query.sql);
      if(error) {
          console.log(error)
      } else {
          console.log(results);
      }
  });


connection.end((err) => {
    if(err){
        console.log(err);
    }
});