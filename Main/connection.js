const mysql = require ("mysql2");
const prompts = require("./db/prompts")

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "rootroot123",
    database: "employees"
  });

  connection.connect((err)=>{
    if (err) throw err;
    console.log("connected!!");
    prompts.question();
  });
  
  exports.connection = connection