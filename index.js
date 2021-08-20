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

// set up the data base connection to show if there is an err or not and fire the prompStarter function
dbConnection.connect(err => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
  promptStarter();
});

// set up the prompt function to have a specific question needed
const promptStarter = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "choice",
        choices: [
          "View All Employees?",
          "Add Employee?",
          "Update Employee Role",
          "View All Roles?",
          "Add Role?",
          "View all Departments",
          "Add Department?",
        ],
      },
    ])
    .then(value => {
        // check if the question matches then call the function
      switch (value.choice) {
        case "View All Employees?":
          viewAllEmployees();
          break;

        case "Add Employee?":
          addEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "View All Roles?":
          viewAllRoles();
          break;

        case "Add Role?":
          addRole();
          break;

        case "View all Departments":
          viewAllDepartments();
          break;

        case "Add Department?":
          addDepartment();
          break;
      }
    });
};
