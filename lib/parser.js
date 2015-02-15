var _  = require('underscore');

var bnf = { // comes from `http://savage.net.au/SQL/sql-2003-2.bnf.html`
  'direct_SQL_statement' : [['direct_executable_statement', 'SEMICOLOMN']],
  'direct_executable_statement': [['direct_SQL_data_statement']],
  'direct_SQL_data_statement': [['direct_select_statement_multiple_rows']],
  'direct_select_statement_multiple_rows': [['cursor_specification']],
  'cursor_specification': [['query_expression',['order_by_clause']]],
  'query_expression': [['query_expression_body']],
  'query_expression_body': [['non_join_query_expression']],
  'non_join_query_expression': [['non_join_query_term']],
  'non_join_query_term': [['non_join_query_primary']],
  'non_join_query_primary': [['simple_table']],
  'simple_table' : [['query_specification']],
  'query_specification': [['SELECT', ['set_quantifier'], 'select_list', 'table_expression']],
  'set_quantifier': [['DISTINCT'], ['ALL']],
  'select_list': [['ASTERISK'], ['select_sublist', ['COMMA', 'select_sublist', '...']]],
  'select_sublist': [['derived_column']],
  'derived_column': [['value_expression', ['as_clause']]],
  'as_clause': [[['AS'], 'column_name']],
  'column_name': [['IDENTIFIER']],
  'order_by_clause': [['ORDER', 'BY', 'sort_specification_list']],
  'sort_specification_list':[['sort_specification', ['COMMA', 'sort_specification', '...']]],
  'sort_specification': [['sort_key', ['ordering_specification', 'null_ordering']]],
  'sort_key':[['value_expression']],
  'ordering_specification':[['ASC'], ['DESC']],
  'null_ordering': [['NULLS', 'FIRST'], ['NULLS', 'LAST']],
  'value_expression': [['row_value_expression']],
  'row_value_expression': [['row_value_special_case']],
  'row_value_special_case' : [['nonparenthesized_value_expression_primary']],
  'nonparenthesized_value_expression_primary': [['column_reference']],
  'column_reference': [['basic_identifier_chain']],
  'basic_identifier_chain': [['identifier_chain']],
  'identifier_chain': [['IDENTIFIER']],

  'table_expression': [['from_clause', ['where_clause']]],
  'where_clause': [['WHERE', 'search_condition']],
  'search_condition': [['boolean_value_expression']],
  
  'boolean_value_expression': [['boolean_term'], ['boolean_value_expression', 'OR', 'boolean_term']]
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
  return goOn ? doCheck(_.flatten(arr)) : arr;
}


exports.check = function(){
  var arr = _.flatten(bnf.direct_SQL_statement);
  console.log(doCheck(arr));
}
