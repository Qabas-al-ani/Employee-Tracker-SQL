// importing needed modules 
const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");

// create connection to the local database
const dbConnection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "0000",
  database: "employee_db",
});
