// importing needed modules
const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");
const promisemysql = require("promise-mysql");

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
function promptStarter() {
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
}

// added employee function that will be call the errors if found or results
function viewAllEmployees() {
  dbConnection.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
    (err, results) => {
      if (err) {
        throw err;
      }
      console.table(results);
      promptStarter();
    }
  );
}

// added the prompt to add employee
function addEmployee() {
  let managerArray = [];
  let roleArray = [];

  dbConnection.query(
    "SELECT first_name, last_name FROM employee WHERE manager_id IS NULL",
    (err, results) => {
      results.map(manager =>
        managerArray.push(`${manager.first_name} ${manager.last_name}`)
      );
      return managerArray;
    }
  );

  dbConnection.query("SELECT * FROM role ", (err, results) => {
    if (err) throw err;
    results.map(role => roleArray.push(`${role.title}`));
    return roleArray;
  });
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
        type: "rawlist",
        message: "what is the employee's role?",
        name: "role",
        choices: roleArray,
      },
      {
        name: "manager",
        message: "What is their manager's name?",
        type: "rawlist",
        choices: managerArray,
      },
    ])
    .then(results => {
      // created a const for role_id so i can connect to tables in the same function
      const role_id = roleArray.indexOf(results.role) + 1;
      const manager_id = managerArray.indexOf(results.manager) + 1;

      const newEmployee = {
        first_name: results.first_name,
        last_name: results.last_name,
        manager_id: manager_id,
        role_id: role_id,
      };

      dbConnection.query("INSERT INTO employee SET ?", newEmployee, err => {
        if (err) throw err;

        promptStarter();
      });
    });
}

function updateEmployeeRole() {
  let employeeArray = [];
  let roleArray = [];

  dbConnection.query(
    "SELECT first_name, last_name FROM employee;",

    (err, results) => {
      results.map(employee => {
       
        employeeArray.push(`${employee.first_name} ${employee.last_name}`);
      });
     
      return employeeArray;
    }
  );

  dbConnection.query("SELECT * FROM role ", (err, results) => {
    if (err) throw err;
    results.map(role => roleArray.push(`${role.title}`));
    return roleArray;
  });
  console.log(employeeArray);
  inquirer
    .prompt([
      {
        name: "employeeName",
        type: "rawList",
        choices: employeeArray,
        message: "which employee's role do you want to update?",
      },
      {
        name: "role",
        type: "rawList",
        message: "which role do you want to assign the selected employee?",
        choices: roleArray,
      },
    ])
    .then(([role, employeeName]) => {
      let last_name = employeeName.split(" ")[0];
      dbConnection.query(
        `UPDATE employee SET role = ${role} WHERE last_name = ${last_name}`,
        err => {
          if (err) throw err;

          promptStarter();
        }
      );
    });
}
