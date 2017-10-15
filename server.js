var express = require('express')
var bodyParser = require('body-parser');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    user     : 'ita_finalproject',
    password : '4c4WSSTtEvZJl5xu',
    database : 'ita_finalproject'
  });

var app = express();
app.use(bodyParser.json());
app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin',"*");
    res.header('Access-Control-Allow-Methods','GET,UPDATE,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})
app.get('/',(req,res) => {
    res.send('Hello World');
})

app.get('/products',(req,res) => {
    //TODO: update response data to include a promise
    var sqlString = 'SELECT * FROM products'
    connection.query(sqlString,(error,results,fields) => {
            if(error) {
                res.send(error);
            } 
            res.send(results);
        })
})

app.get('/orders',(req,res) => {
    //TODO: update response data to include a promise
    var sqlString = 'SELECT * FROM orders'
    connection.query(sqlString,(error,results,fields) => {
            if(error) {
                res.send(error);
            } 
            res.send(results);
        })
})

app.get('/orders/:id',(req,res) => {
    //TODO: update response data to include a promise
    var sqlString = 'SELECT * FROM orders_details WHERE OrderID = ?;'
    connection.query(sqlString,[req.params.id],(error,results,fields) => {
            if(error) {
                res.send(error);
            } 
            res.send(results);
        })
})

app.post('/orders',(req,res) => {
    
    //TODO: replace sql variable names
    //TODO: update response data to include a promise
    var sqlString = "INSERT INTO `orders` (`OrderTotal`, `CustomerID`) VALUES (?, ?);";
    connection.query(sqlString,[req.body.total,req.body.customer],(error,results,fields) => {
        if(error) {
            res.send(error);
        } else{
            var orderID = results.insertId;
            var sqlString3 = "INSERT INTO `orders_details` (`OrderID`, `ProductID`, `Quantity`, `Price`) VALUES ?"
            connection.query(sqlString3,[
                Array.from(req.body.items).map((item) => {
                    
                    return [orderID,...item]
                })
            ],(error,results,fields) => {
                if(error){
                    res.send(error)
                }
                res.send(results);
            })
        }
        
    })
})

app.delete('/orders/:id',(req,res) => {
    //TODO: update response data to include a promise
    var sql = "DELETE FROM `orders` WHERE `orders`.`OrderID` = ?;"
    connection.query(sql,[req.params.id],(error,results,fields) => {
        if(error){
            res.send(error);
        }
        res.send(results);
    })
})

app.listen(5000, () => {
    console.log('Server is up.')
});