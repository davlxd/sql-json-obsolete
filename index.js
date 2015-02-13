var fs = require('fs');
var readline = require('readline');


var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', function (l) {
  console.log('You just typed: ' + l);
  rl.prompt();
});

rl.on('SIGINT', function() {
  console.log('Bye~');
  process.exit(0);
});

rl.prompt();


//var data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

//console.log(data);
