var express = require('express')
var bodyParser = require('body-parser');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'mysql6.gear.host',
    // port     : 3306,
    //socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    user     : 'itafinalproject',
    password : 'Kb55_K49-gMe', //this is bad mkay
    database : 'itafinalproject',
    multipleStatements: true //allowing mutliple update statements
  });

var app = express();
app.use(bodyParser.json());
app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin',"*"); //allowing any origin to make http request
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE'); //defining methods allowed
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
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

app.get('/categories',(req,res) => {
    var sqlString = 'SELECT * FROM categories'
    connection.query(sqlString,(error,results,fields) => {
            if(error) {
                res.send(error);
            } 
            res.send(results);
        })
});

app.get('/orders/:id',(req,res) => {
    //TODO: update response data to include a promise
    var sqlString = `
    SELECT 
    OD.*,
    P.Name
    FROM itafinalproject.orders_details OD
    left join itafinalproject.products P using (ProductID)
     WHERE OrderID = ?;`
    connection.query(sqlString,[req.params.id],(error,results,fields) => {
            if(error) {
                res.status(404).send(error);
            } else if(results.length <= 0) {
                res.status(404).send('Order Id not found.');
            } else {
                res.send(results);
            }
        })
})

app.post('/orders',(req,res) => {
    //TODO: update response data to include a promise
    var orderSql = "INSERT INTO `orders` (`OrderTotal`, `CustomerID`) VALUES (?, ?);";
    //first insert order total and customer Id into orders table
    connection.query(orderSql,[req.body.total,req.body.customer],(error,results,fields) => { 
        if(error) {
            res.send(error);
        } else{
            //use returned insertId to tie foreign key identifier on order_details table
            var orderID = results.insertId;
            var detailsSql = "INSERT INTO `orders_details` (`OrderID`, `ProductID`, `Quantity`, `Price`) VALUES ?"
            connection.query(detailsSql,[
                Array.from(req.body.items).map((item) => {
                    
                    return [orderID,item.ProductID,item.Quantity,item.Price]
                })
            ],(error,results,fields) => {
                if(error){
                    res.send(error)
                } else {
                    res.send(results);
                }
            })
        }
        
    })
})

app.post('/products',(req,res) => {
    var productSql = 
    `INSERT INTO
     \`products\` (\`Name\`, \`ImgURL\`, \`CategoryID\`, \`Price\`, \`Description\`)
      VALUES ('${req.body.productName}', '${req.body.imgUrl}', '${req.body.categoryId}', '${req.body.price}', '${req.body.description}')`
    connection.query(productSql,(error,results,fields) => {
        if(error) {
            res.send(error);
        } else {
            res.send(results);
        }
    })
})

app.delete('/orders/:id',(req,res) => {
    //TODO: update response data to include a promise
    var sql = "DELETE FROM `orders` WHERE `orders`.`OrderID` = ?;"
    //only need to call delete script on orders table as cascade relationship is setup on orders_details
    connection.query(sql,[req.params.id],(error,results,fields) => {
        if(error){
            res.send(error);
        } else {
            res.send(results);
        }
    })
})

app.put('/orders', (req,res) => {
    //TODO: find a better way to handle this update process
    var updateSql = '';
    //first concat a sql string for all the order_details rows to be updated
    req.body.items.forEach((item) => {
       updateSql += 
       `UPDATE \`orders_details\`
        SET \`Quantity\` = '${item.Quantity}'
         WHERE \`orders_details\`.\`OrderDetailID\` = ${item.OrderDetailID};` 
    });
    //second - concat the sql string to update the main orders table
    updateSql += 
    `UPDATE \`orders\`
     SET \`OrderTotal\` = '${req.body.newTotal}' 
     WHERE \`orders\`.\`OrderID\` = ${req.body.orderId};`

    connection.query(updateSql,(error,results,fields) => {
        if(error){
            res.send(error)
        } else {
            var orderDetailIds = req.body.items.map((item) => {
                return item.OrderDetailID;
            })
            //delete any order_detail Ids that were NOT passed into body request
            //**this accounts for the user "removing" items from an already submitted order
            //**as any order_detail Id not in the params is to be assumed removed  
            var deleteSql = 
            `DELETE FROM \`orders_details\` 
            WHERE 
            \`orders_details\`.\`OrderID\` = ${req.body.orderId}
            AND \`orders_details\`.\`OrderDetailID\` NOT IN (${orderDetailIds})`;
            connection.query(deleteSql,(error,results,fields) => {
                if(error){
                    res.send(error);
                } else {
                    res.send(results);
                }
            })
            
            
        }
    })
})

app.put('/products',(req,res) => {
    //currently all column data must be sent over in the body request to complete the product update
    var productUpdateSql = 
        `UPDATE \`products\` 
        SET 
        \`Name\` = '${req.body.productName}', 
        \`CategoryID\` = '${req.body.categoryId}',
        \`Price\` = '${req.body.price}',
        \`Description\` = '${req.body.description}'
        WHERE 
        \`products\`.\`ProductID\` = ${req.body.productId}`;
    connection.query(productUpdateSql,(error,results,fields) => {
        if(error){
            res.send(error)
        } else {
            res.send(results);
        }
    })
})

app.listen(80, () => {
    console.log('Server is up.')
});