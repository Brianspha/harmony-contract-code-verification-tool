const program = require("./src/index")
  .program; /* the current working directory so that means main.js because of package.json */
program.parse(process.argv); /* what the user enters as first argument */
