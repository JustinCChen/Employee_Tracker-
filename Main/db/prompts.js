const mysql = require("mysql2");
const db = require("../connection");
const inquirer = require('inquirer');




function question() {
    inquirer.prompt([
      {
        type: "list",
        message: "would you like to do?",
        name: "firstQuestionC",
        choices: ["add", "view", "update"]
      }
    ]).then((answer)=>{
      if (answer.firstQuestionC === "add") {
        addWhat(answer);
        } else if (answer.firstQuestionC === "view") {
        viewWhat(answer);
        } else {
        updateWhat(answer);
        }
    });  
  }

function addWhat(){
    inquirer.prompt([
        {
            type : 'list',
            message: 'What would you like to add?',
            name: 'addWhatC',
            choices: ['Department', 'Role', 'Employee']
        }
    ]).then((answer)=>{
        if (answer.addWhatC === "Department") {
            addDepartment()
            } else if (answer.addWhatC === "Role") {
            addRole()
            } else {
            addEmployee()
            }
    });
}

function viewWhat(){
    inquirer.prompt([
        {
            type: 'list',
            message: 'what would you like to veiw?',
            name: 'viewWhatC',
            choices:['Department','Role','Employee']
        }
    ]).then((answer)=>{
        if (answer.viewWhatC === 'Department'){
            viewAllDeparment();
        } else if(answer.viewWhatC === 'Role'){
            viewAllRole();
        }else{
            viewAllEmployee();
        }
    })
}

function updateWhat(){
    inquirer.prompt([
        {
            type:'list',
            message: 'what would you like to update?',
            name: 'updateWhatC',
            choices:["New manager",'employee role']
        }
    ]).then((answer)=>{
        if(answer.updateWhatC === 'New manager'){
            updateManager();
        }else{
            updateEmployee();
        }
    })
}





 
function addDepartment(){
    inquirer.prompt([
        {
            type: 'input',
            message: 'Please enter department name',
            name: 'addNewDept',
        }
    ]).then((answer)=>{
        db.connection.query('INSERT INTO department SET?',{name: answer.addNewDept},(err,res)=>{
            if (err) throw err;
            console.log(`You have added the department ${answer.addNewDept} to database`)
            moreOption();
        })
    })
}
 
function addRole(){
    db.connection.query("SELECT * FROM department",(err, res)=> {
        if (err) throw err;
    inquirer.prompt([
        {
            type: 'input',
            message: 'Please enter role title',
            name: 'addRoleName',
        },
        {
            type: 'input',
            message: 'Please enter salary',
            name :'salary'
        },
        {
            type : 'input',
            message: 'Please enter department_id',
            name:'dp_id',
            choices:function (){
                const departId = []
                for (let i =0 ; i < res.length ; i++){
                    departId.push(`${res[i].id} | ${res[i].name}` )
                }
                console.log(departId)
                return departId;
            }
        }
    ]).then((answer)=> {
        db.connection.query('INSERT INTO role SET?',
        {
            title: answer.addRoleName,
            salary: answer.salary,
            department_id: parseInt(answer.dp_id.slice(0, 3))
        },
        (err,res)=>{
            if (err) throw err;
            console.log(`You have added the role ${answer.addRoleName} to database`);
            moreOption();
        })
    })
    })
}


function addEmployee(){
    db.connection.query("SELECT * FROM role", (err, res)=> {
      if (err) throw err;
        inquirer.prompt([
          {
            type: "input",
            message: "Please enter the employee's first name",
            name: "addEmployeeNameF",
          },
          {
            type: "input",
            message: "Please enter the employee's last name",
            name: "addEmployeeNameL",
          },
          {
            type: "list",
            message: "Which team will they be joining?",
            name: "addEmployeeRole",
            choices: function(){
              const choiceArrayRoles = []
              for (let i = 0; i<res.length; i++) {
                  choiceArrayRoles.push(`${res[i].id} | ${res[i].title}`);
              }
              return choiceArrayRoles
          }
          },
          { 
            type: "confirm",
            message: "And will this person be a people manager?",
            name: "addEmployeeIsMgr",
          },
          { 
            type: "confirm",
            message: "Great, will this employee report to a manager?",
            name: "addEmployeeHasMgr",
          },
        ]).then((answer) => {
          let query = db.connection.query(
            "INSERT INTO employee SET ?",
            {
            first_name: answer.addEmployeeNameF,
            last_name: answer.addEmployeeNameL,
            role_id: parseInt(answer.addEmployeeRole.slice(0, 5)),
            is_manager: answer.addEmployeeIsMgr,
            },
            (err, res)=> {
              if (err) throw err;
              console.log(res.affectedRows + " employee inserted!\n");
              if (answer.addEmployeeHasMgr === true) {
                getMgr()
              } else {
                console.log(`You have added` `${answer.addEmployeeNameF} ${answer.addEmployeeNameL} to the team!`)
                moreOption();
              }
            }
          )
        })
    })
  };   
  
  
  function getMgr(){
    db.connection.query("SELECT * FROM employee WHERE is_manager=1", (err, res)=> {
      if (err) throw err;
      inquirer.prompt([
        {
          type: "list",
          message: "Who will their leader be?",
          name: "addEmployeeMgr",
          choices: function(){
            const choiceArrayMgrs = []
            for (let i = 0; i<res.length-1; i++) {
                choiceArrayMgrs.push(`${res[i].id} | ${res[i].first_name} ${res[i].last_name}`);
            }
            return choiceArrayMgrs
          }
        }
      ]).then(function(mgrQ) {
        const idArr = []
        db.connection.query("SELECT id FROM employee", (err, ans)=> {
          for (let i = 0; i < ans.length; i++) {
          idArr.push(ans[i].id)
          }
          const newest = idArr[idArr.length-1];
          const mgr = parseInt(mgrQ.addEmployeeMgr.slice(0, 5));
          if (newest === mgr) {
            console.log(`Looks like you have the same id as the employee and the manager.  Please try again.`)
            getMgr();
          } else {
            addMgr(newest, mgr);
          }
        });
      })
    })
  }
  
  
  function addMgr(manager, employee) {
    db.connection.query("UPDATE employee SET manager_id = ? WHERE id = ?", [employee, manager], (err, res)=> {
      if (err) {
        console.log(err)
      } else {
        console.log(`Congrats!  Employee and manager added.`)
        moreOption();
      }
    })
  }
  
  
  function viewAllDeparment() {
      db.connection.query("SELECT * FROM department", (err, res)=> {
        if (err) throw err;
        const deptArr = []
        for (var i = 0; i < res.length; i++) {
          deptArr.push(res[i])
        }
        console.table(deptArr);
        moreOption();
      });
  }   
  
  
  function viewAllRole() {
      db.connection.query("SELECT * FROM role", (err, res)=> {
        if (err) throw err;
        const roleArr = []
        for (var i = 0; i < res.length; i++) {
          roleArr.push(res[i])      
        }
        console.table(roleArr);
        moreOption();
      });
  }   
  
  
  function viewAllEmployee() {
      db.connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        const empArr = []
        for (var i = 0; i < res.length; i++) {
          empArr.push(res[i]);
        }
        console.table(empArr);
        moreOption();
      });
  }   
  
  
  function updateEmployee() {
    db.connection.query("SELECT id, first_name, last_name FROM employee", (err, res) =>{
      if (err) throw err;
      inquirer.prompt([
        {
        type: "list",
        message: "Which employee will you be changing?",
        name: "modifyRoleChangedE",
        choices: function(){
          const choiceArrayEmpl = []
          for (let i = 0; i<res.length; i++) {
              choiceArrayEmpl.push(`${res[i].id} | ${res[i].first_name} ${res[i].last_name}`);
          }
          return choiceArrayEmpl
        }
        },
      ]).then(function(empl){
        const changingEmpl = parseInt(empl.modifyRoleChangedE.slice(0,5));
        modifyRole(changingEmpl)
      })
    })
  }
  
  
  function modifyRole(empl) {
    const employee = empl
    db.connection.query("SELECT id, title FROM role", (err, res)=> {
      inquirer.prompt([
        {
        type: "list",
        message: "And what will be their new role be?",
        name: "modifyRoleChangedR",
        choices: function(){
          const choiceArrayRole = []
          for (let i = 0; i<res.length; i++) {
              choiceArrayRole.push(`${res[i].id} | ${res[i].title}`);
          }
          return choiceArrayRole
        }
        },
      ]).then(function(role) {
        const newRole = parseInt(role.modifyRoleChangedR.slice(0,5));
        const changingEmpl = role.employee
        let query = db.connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [newRole, employee], (err, res)=>{
          if (err) {
          } else {
            console.log("All set!")
            moreOption();
          }
        })
      })
    })
  }
  
  
  function updateManager() {
    db.connection.query("SELECT id, first_name, last_name FROM employee", (err, res) =>{
      if (err) throw err;
      inquirer.prompt([
        {
        type: "list",
        message: "Which employee will you be changing?",
        name: "modifyMgrChangedE",
        choices: function(){
          const choiceArrayEmpl = []
          for (let i = 0; i<res.length; i++) {
              choiceArrayEmpl.push(`${res[i].id} | ${res[i].first_name} ${res[i].last_name}`);
          }
          return choiceArrayEmpl
        }
        },
      ]).then(function(empl){
        const changingEmpl = parseInt(empl.modifyMgrChangedE.slice(0,5));
        modifyMgrMgrSel(changingEmpl)
      })
    })
  }
  
  
  function modifyMgrMgrSel(empl) {
    const employee = empl
    db.connection.query("SELECT id, first_name, last_name FROM employee WHERE is_manager = 1", (err, res) => {
      inquirer.prompt([
        {
        type: "list",
        message: "And who will be their new leader?",
        name: "modifyMgrChangedM",
        choices: function(){
          const choiceArrayMgr = []
          for (let i = 0; i<res.length; i++) {
              choiceArrayMgr.push(`${res[i].id} | ${res[i].first_name} ${res[i].last_name}`);
          }
          return choiceArrayMgr
        }
        },
      ]).then(function(people) {
        const mgr = parseInt(people.modifyMgrChangedM.slice(0,5));
        const changingEmpl = employee
  
        if (mgr === changingEmpl) {
          console.log(`Looks like you have the same manager and employee id.  Please try again.`)
          updateManager()
        } else {
          db.connection.query("UPDATE employee SET manager_id = ? WHERE id = ?", [mgr, changingEmpl], (err, res)=>{
            if (err) {
            } else {
              console.log(`All set, thanks!`)
              moreOption();
            }
          })
        }
      })
    })
  }
  
  
  function moreOption() {
    inquirer.prompt([
        {
        type:"list",
        message:"Would you like to perform another action?",
        name: "loopAnswer",
        choices: ["yes", "no"]
        }
      ]).then(function(answer){
          if (answer.loopAnswer === "yes") {
              question()
          } else {
              console.log("all finished!")
              db.connection.end()
          }
      })
  }




  
     
  exports.question = question