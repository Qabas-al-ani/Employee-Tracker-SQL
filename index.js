// importing needed modules
const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");
const promiseMySql = require("promise-mysql");
var figlet = require("figlet");

const connectionProperties = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "0000",
  database: "employee_db",
};

//added two figlet functions to separate the manager employee
figlet("  E m p l o y e e  ", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});

figlet("   M a n a g e r  ", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});

// create connection to the local database
const dbConnection = mysql.createConnection(connectionProperties);

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
          "Exit",
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
        // added Exit function
        case "Exit":
          dbConnection.end();
          console.log("See you later!");
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

  // adding first and last name to the new manager of his branch
  dbConnection.query(
    "SELECT first_name, last_name FROM employee WHERE manager_id IS NULL",
    (err, results) => {
      results.map(manager =>
        managerArray.push(`${manager.first_name} ${manager.last_name}`)
      );
      return managerArray;
    }
  );

  // to select all roles in the table
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

      //  create a variable for new employees
      const newEmployee = {
        first_name: results.first_name,
        last_name: results.last_name,
        manager_id: manager_id,
        role_id: role_id,
      };

      // function to insert new employee to the database
      dbConnection.query("INSERT INTO employee SET ?", newEmployee, err => {
        if (err) throw err;
        promptStarter();
      });
    });
}

// function to update Employee Role for each with their role salary and departments
function updateEmployeeRole() {
  let employeeArray = [];
  let roleArray = [];

  promiseMySql
    .createConnection(connectionProperties)
    .then(conn => {
      return Promise.all([
        conn.query("SELECT id, title FROM role ORDER BY title ASC"),
        conn.query(
          "SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC"
        ),
      ]);
    })
    .then(([roles, employees]) => {
      roles.map(role => roleArray.push(role.title));

      employees.map(employee => employeeArray.push(employee.Employee));

      return Promise.all([roles, employees]);
    })
    .then(([roles, employees]) => {
      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            message: "which employee's role do you want to update?",
            choices: employeeArray,
          },
          {
            name: "role",
            type: "list",
            message: "which role do you want to assign the selected employee?",
            choices: roleArray,
          },
        ])
        .then(results => {
          let role_id;
          let employee_id;

          for (let i = 0; i < roles.length; i++) {
            if (results.role == roles[i].title) {
              role_id = roles[i].id;
            }
          }

          for (let i = 0; i < employees.length; i++) {
            if (results.employee == employees[i].Employee) {
              employee_id = employees[i].id;
            }
          }
          // to update role values
          dbConnection.query(
            `UPDATE employee SET role_id = ${role_id} WHERE id = ${employee_id}`,
            (err, results) => {
              if (err) return err;
              promptStarter();
            }
          );
        });
    });
}
//  function to view All Roles for id, title and salary and log it to the data base
function viewAllRoles() {
  dbConnection.query(
    "SELECT role.id, role.title, role.salary FROM role",
    (err, results) => {
      if (err) {
        throw err;
      }
      console.table(results);
      promptStarter();
    }
  );
}
//  function add Role with prompts for department and salary
function addRole() {
  let departmentArray = [];

  promiseMySql
    .createConnection(connectionProperties)
    .then(conn => {
      return conn.query(
        "SELECT department.id, department.name FROM department"
      );
    })
    .then(results => {
      results.map(result => departmentArray.push(result.name));
      return results;
    })
    .then(results => {
      inquirer
        .prompt([
          {
            name: "role",
            type: "input",
            message: "what is the name of the department?",
          },
          {
            name: "salary",
            type: "number",
            message: "what is salary of the role?",
          },
          {
            name: "department",
            type: "list",
            message: "which department does the role belong to?",
            choices: departmentArray,
          },
        ])
        .then(answer => {
          let department_id;

          for (let i = 0; i < results.length; i++) {
            if (answer.department == results[i].name) {
              department_id = results[i].id;
            }
          }
          // insert  in to department the salary and the id
          dbConnection.query(
            `INSERT INTO role (title, salary, department_id) VALUES ("${answer.role}", ${answer.salary}, ${department_id})`,
            (err, res) => {
              if (err) throw err;

              promptStarter();
            }
          );
        });
    });
}
//  function to view All Departments in table
function viewAllDepartments() {
  dbConnection.query(
    "SELECT department.id, department.name AS 'department name' FROM department",
    (err, results) => {
      if (err) {
        throw err;
      }
      console.table(results);
      promptStarter();
    }
  );
}
//  function to add Department if needed
function addDepartment() {
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "what is the name of the department?",
      },
    ])
    .then(answer => {
      dbConnection.query(
        `INSERT INTO department (name) VALUES ("${answer.department}")`,
        (err, results) => {
          if (err) throw err;
          promptStarter();
        }
      );
    });
}
