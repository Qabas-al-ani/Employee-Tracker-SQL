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


// added employee function that will be call the errors if found or results 
const viewAllEmployees = () => {
  dbConnection.query(
    'SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(employee.first_name, " ", employee.last_name) AS manager FROM employee ',
    (err, results) => {
      if (err) {
        throw err;
      }
      console.table(results);
      promptStarter();
    }
  );
};


// added the prompt to add employee
const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the employee's first name?",
        name: "first_name",
      },
      {
        type: "input",
        message: "what is the employee's last name?",
        name: "last_name",
      },
      {
        type: "list",
        message: "what is the employee's role?",
        name: "role",
        choices: [
          "Sales lead",
          "Salesperson",
          "Lead Engineer",
          "Software Engineer",
          "Account Manager",
          "Accountant",
          "Legal Team Lead",
        ],
      },
    ])
    .then(results => {
        // created a const for role_id so i can connect to tables in the same function
    const role_id;
    dbConnection.query(`SELECT department_id FROM role WHERE ${results.role} = role.title`, (err, result ) => {
        role_id = result;
    })

      dbConnection.query(`INSERT INTO employee
      (first_name, last_name, role_id, manager_id)
      VALUES
      (${employee.first_name}, ${employee.last_name}, ${role_id}, NULL)`);
    });
};
