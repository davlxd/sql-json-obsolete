var _  = require('underscore');

// http://yaxx.googlecode.com/svn/trunk/sql/sql2.y

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
  'value_expression': [['common_value_expression'], ['boolean_value_expression'], ['row_value_expression']],
  'row_value_expression': [['row_value_special_case']],
  'row_value_special_case' : [['nonparenthesized_value_expression_primary']],
  'nonparenthesized_value_expression_primary': [['unsigned_value_specification'], ['column_reference']],
  'column_reference': [['basic_identifier_chain']],
  'basic_identifier_chain': [['identifier_chain']],
  'identifier_chain': [['IDENTIFIER']],

  'unsigned_value_specification': [['unsigned_literal']],
  'unsigned_literal': [['unsigned_numeric_literal'], ['general_literal']],
  'unsigned_numeric_literal': [['exact_numeric_literal']],
  'exact_numeric_literal': [['UNSIGNED_INTEGER', ['PERIOD', 'UNSIGNED_INTEGER']]],
  'general_literal': [['character_string_literal'], ['datetime_literal'], ['boolean_literal']]
  'character_string_literal': [['QUOTE', [], 'QUOTE']],
  'datetime_literal': [[]],
  'boolean_literal': [[]]

  'table_expression': [['from_clause', ['where_clause']]],
  'from_clause': [['FROM', 'table_reference_list']],
  'table_reference_list': [['table_reference', ['COMMA', 'table_reference']]],
  'table_reference': [['table_primary_or_joined_table']],
  'table_primary_or_joined_table': [['table_primary']],
  'table_primary': [['table_or_query_name', ['AS', 'correlation_name']]],
  'correlation_name': [['IDENTIFIER']],
  'table_or_query_name': [['table_name'], ['query_name']],
  'table_name': [['local_or_schema_qualified_name']],
  'local_or_schema_qualified_name': [['qualified_identifier']],
  'qualified_identifier': [['IDENTIFIER']],
  'query_name': [['IDENTIFIER']],
  'where_clause': [['WHERE', 'search_condition']],
  'search_condition': [['boolean_value_expression']],
  'boolean_value_expression': [['boolean_term'], ['boolean_value_expression', 'OR', 'boolean_term']],

  'boolean_term': [['boolean_factor'], ['boolean_term', 'AND', 'boolean_factor']],
  'boolean_factor': [[['NOT'], 'boolean_test']],
  'boolean_test': [['boolean_primary', ['IS', ['NOT'], 'truth_value']]],
  'boolean_primary': [['predicate']],
  'truth_value': [['TRUE'], ['FALSE'], [['UNKNOWN']]],
  'predicate': [['comparison_predicate'], ['between_predicate']],

  'comparison_predicate': [['row_value_predicand'], ['comparison_predicate_part_2']],
  'comparison_predicate_part_2': [['comp_op', 'row_value_predicand']],
  'comp_op': [['EQUALS_OPERATOR'], ['NOT_EQUALS_OPERATOR'], ['LESS_THAN_OPERATOR'], ['GREATER_THAN_OPERATOR'], ['LESS_THAN_OR_EQALLS_OPERATOR'], ['GREATER_THAN_OR_EQUALS_OPERATOR']],
  'row_value_predicand': [['row_value_special_case'], ['row_value_constructor_predicand']],
  'row_value_special_case': [['nonparenthesized_value_expression_primary']],

  'row_value_constructor_predicand': [['common_value_expression'], ['boolean_predicand']],
  'boolean_predicand': [['parenthesized_boolean_value_expression'], ['nonparenthesized_value_expression_primary']],
  'parenthesized_boolean_value_expression': [['LEFT_PAREN'], ['boolean_value_expression'], ['RIGHT_PAREN']],

  'common_value_expression': [['numeric_value_expression'], ['string_value_expression'], ['datetime_value_expression']],
  'numeric_value_expression': [['term'], ['numeric_value_expression', 'PLUS_SIGN', 'term'], ['numeric_value_expression', 'MINUS_SIGN', 'term']],
  'term': [['factor'], ['term', 'ASTERISK', 'factor'], ['term', 'SOLIDUS', 'factor']],
  'factor': [[['sign'], 'numeric_primary']],
  'sign': [['PLUS_SIGN'], ['MINUS_SIGN']],
  'numeric_primary': [['value_expression_primary']],
  'value_expression_primary': [['parenthesized_value_expression'], ['nonparenthesized_value_expression_primary']],
  'parenthesized_value_expression': [['LEFT_PAREN', 'value_expression', 'RIGHT_PAREN']],
  'between_predicateredicate': [[]], // --
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
