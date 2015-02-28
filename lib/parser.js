var _  = require('underscore');

// http://yaxx.googlecode.com/svn/trunk/sql/sql2.y

var bnf = {
  'column_def': [['column data_type', 'column_def_opt_list']],
  'column_def_opt_list': [[],
                          ['column_def_opt_list', 'column_def_opt']],
  'column_def_opt': [['NOT', 'NULL'],
                     ['NOT', 'NULL', 'UNIQUE']
                     ['DEFAULT', 'NULL', 'UNIQUE']
                    ],
['NOT', 'NULLX'],
['NOT', 'NULLX', 'UNIQUE'],
['NOT', 'NULLX', 'PRIMARY', 'KEY'],
['DEFAULT', 'literal'],
['DEFAULT', 'NULLX']
DEFAULT USER
CHECK '(' search_condition ')'
REFERENCES table
REFERENCES table '(' column_commalist ')'
  '': [[]],
  '': [[]],
  '': [[]],
  '': [[]],
  '': [[]],
  '': [[]],
  '': [[]],
  '': [[]],
  '': [[]],
  '': [[]],
  
};


function eliminateLeftRecursion(productionHead){
  var leftRecurArr = [], nonLeftRecurArr = [];
  bnf[productionHead].forEach(function(body){
    if (body[0] === productionHead)
      leftRecurArr.push(body);
    else
      nonLeftRecurArr.push(body);
  });

  var newProductionHead = productionHead + '_';
  bnf[productionHead] = nonLeftRecurArr.map(function(body){return body.concat([newProductionHead]);});
  bnf[newProductionHead] = leftRecurArr.map(function(body){return body.slice(1).concat([newProductionHead]);}).concat([[]]);
}


exports.precompile = function(){
  Object.keys(bnf).forEach(function(head){
    for (productionIdx in bnf[head]) {
      var production = bnf[head][productionIdx];
      if (production[0] === head)
        return eliminateLeftRecursion(head);
    }
  });
  console.log(bnf);
}


function doCheck(arr){
  console.log(arr);
  var goOn = false;
  for (var idx in arr) {
    var ele = arr[idx];
    if (ele === ele.toUpperCase()) continue; // terminals

    if (bnf[ele] === undefined) {
      console.log(ele + ' IS UNDERIVED!!!');
      arr[idx] = 'UNDEFINED';
    } else {
      var newArr = _.flatten(bnf[ele]);
      arr[idx] = newArr.filter(function(value){return value !== ele});
    }
    goOn = true;
  }
  return goOn ? doCheck(_.uniq(_.flatten(arr))) : arr;
}


exports.check = function(){
  var arr = _.flatten(bnf.direct_SQL_statement);
  console.log(doCheck(arr));
}
