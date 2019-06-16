//Require npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
var numeral = require("numeral");


//MYSQL Connection Activity 06
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazonDB"
});

connection.connect(function (err) {
  if (err) throw err;
  //console.log("connected as id" + connection.threadId);
  displayProducts();
});

function displayProducts() {
  //NPM CLI-Table 
  var query = "SELECT * FROM products";
  connection.query(query, function (error, results) {
    var table = new Table({
      head: ["Item", "Product", "Department", "Price"],
      colWidths: [10, 30, 20, 10]
    });

    //Push Items to Table Array
    for (var i = 0; i < results.length; i++) {
      table.push(
        [results[i].item_id, results[i].product_name, results[i].department_name, numeral(results[i].price).format("$0,0.00")]
      );
    }

    console.log("\nHere is a display of all items available for sale.")
    console.log(table.toString());
    console.log("\n");
    return results;
  });
  start();
}

function start() {
  // Activity 10 
  var query = "SELECT * FROM products";
  connection.query(query, function (err, response) {
    if (err) throw err;
    //console.log(response);
    inquirer.prompt([
      {
        name: "itemId",
        type: "input",
        message: "What item would you like to purchase? "
      }, {
        name: "quantity",
        type: "input",
        message: "How many units would you like to buy?: "
      }])
      .then(function (answer) {
        // get the information of the chosen item.  Activity 10.  
        connection.query("SELECT * FROM products", function (err, results) {
          if(answer.quantity > results[0].stock_quantity){
            console.log('Insufficient Quantity');
            console.log('This order has been cancelled');
            console.log('');
            start();
          }
          else{
            amountOwed = results[0].price * answer.quantity;
            currentDepartment = results[0].DepartmentName;
            console.log('Thanks for your order');
            console.log('You owe $' + amountOwed);
            console.log('');
            //update products table
            connection.query('UPDATE products SET ? Where ?', [{
              stock_quantity: results[0].stock_quantity - answer.quantity
            },{
              id: answer.itemId
            }], function(err, results){});
            //update departments table
            // logSaleToDepartment();
            start();
          }
        })
        // closing bracket of .then
      });
  });
}

