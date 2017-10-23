var express = require('express')
var bodyParser = require('body-parser');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'mysql6.gear.host',
    // port     : 3306,
    //socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    user     : 'itafinalproject',
    password : 'Kb55_K49-gMe',
    database : 'itafinalproject',
    multipleStatements: true //allowing mutliple update statements
  });

var app = express();
app.use(bodyParser.json());
app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin',"*");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
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
                res.send(error);
            } 
            res.send(results);
        })
})

app.post('/orders',(req,res) => {
   // console.log(req.body);
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
                    
                    return [orderID,item.ProductID,item.Quantity,item.Price]
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

app.post('/products',(req,res) => {
    console.log(req.body);
    var productSql = 
    `INSERT INTO
     \`products\` (\`Name\`, \`ImgURL\`, \`CategoryID\`, \`Price\`, \`Description\`)
      VALUES ('${req.body.productName}', '${req.body.imgUrl}', '${req.body.categoryId}', '${req.body.price}', '${req.body.description}')`
    connection.query(productSql,(error,results,fields) => {
        if(error) {
            console.log(error);
            res.send(error);

        } else {
            res.send(results);
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

app.put('/orders', (req,res) => {
    //TODO: find a better way to handle this update process
    console.log(JSON.stringify(req.body));
    var updateSql = '';
    req.body.items.forEach((item) => {
       updateSql += 
       `UPDATE \`orders_details\`
        SET \`Quantity\` = '${item.Quantity}'
         WHERE \`orders_details\`.\`OrderDetailID\` = ${item.OrderDetailID};` 
    });

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
            //console.log(orderDetailIds);
            var deleteSql = 
            `DELETE FROM \`orders_details\` 
            WHERE 
            \`orders_details\`.\`OrderID\` = ${req.body.orderId}
            AND \`orders_details\`.\`OrderDetailID\` NOT IN (${orderDetailIds})`;
            console.log(deleteSql);
            connection.query(deleteSql,(error,results,fields) => {
                if(error){
                    res.send(error);
                    console.log(error);
                } else {
                    res.send(results);
                    console.log(results);
                }
            })
            
            
        }
    })
})

app.put('/products',(req,res) => {
    console.log(req.body);
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
            console.log(error);
            res.send(error)
        } else {
            console.log(results);
            res.send(results);
        }
    })
})

app.listen(5000, () => {
    console.log('Server is up.')
});