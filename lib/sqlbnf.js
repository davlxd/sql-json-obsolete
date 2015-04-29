module.exports.yaccRules = [
  {'head': 'sql',
   'body': [
     {'expr': ['manipulative_statement']}
   ]
  },
  {'head': 'manipulative_statement',
   'body': [
     {'expr': ['delete_statement_searched']},
     {'expr': ['insert_statement']},
     {'expr': ['select_statement']},
     {'expr': ['update_statement_searched']}
   ]
  },
  {'head': 'delete_statement_searched',
   'body': [
     {'expr': ['DELETE', 'FROM', 'table', 'opt_where_clause']}
   ]
  },
  {'head': 'insert_statement',
   'body': [
     {'expr': ['INSERT', 'INTO', 'table', 'opt_column_commalist', 'values_or_query_spec']}
   ]
  },
  {'head': 'select_statement',
   'body': [
     {'expr': ['SELECT', 'opt_all_distinct', 'selection', 'table_exp']}
   ]
  },
  {'head': 'update_statement',
   'body': [
     {'expr': ['UPDATE', 'table', 'SET', 'assignment_commalist', 'opt_where_clause']}
   ]
  },
  {'head': 'table',
   'body': [
     {'expr': ['NAME']},
     {'expr': ['NAME', '.', 'NAME']}
   ]
  },
  {'head': 'opt_where_clause',
   'body': [
     {'expr': []},
     {'expr': ['where_clause']}
   ]
  },
  {'head': 'opt_column_commalist',
   'body': [
     {'expr': []},
     {'expr': ['(', 'column_commalist', ')']}
   ]
  },
  {'head': 'values_or_query_spec',
   'body': [
     {'expr': ['VALUES', '(', 'insert_atom_commalist', ')']}
   ]
  },
  {'head': 'opt_all_distinct',
   'body': [
     {'expr': []},
     {'expr': ['ALL']},
     {'expr': ['DISTINCT']}
   ]
  },
  {'head': 'selection',
   'body': [
     {'expr': ['scalar_exp_commalist']},
     {'expr': ['*']}
   ]
  },
  {'head': 'table_exp',
   'body': [
     {'expr': ['from_clause']},
     {'expr': ['opt_where_clause']},
     {'expr': ['opt_group_by_clause']},
     {'expr': ['opt_where_clause']}
   ]
  },
  {'head': 'assignment_commalist',
   'body': [
     {'expr': ['assignment']},
     {'expr': ['assignment_commalist', ',', 'assignment']}
   ]
  },
  {'head': 'where_clause',
   'body': [
     {'expr': ['WHERE', 'search_condition']}
   ]
  },
  {'head': 'column_commalist',
   'body': [
     {'expr': ['column']},
     {'expr': ['column_commalist', ',', 'column']}
   ]
  },
  {'head': 'insert_atom_commalist',
   'body': [
     {'expr': ['insert_atom']},
     {'expr': ['insert_atom_commalist', ',', 'insert_atom']}
   ]
  },
  {'head': 'scalar_exp_commalist',
   'body': [
     {'expr': ['scalar_exp']},
     {'expr': ['scalar_exp_commalist', ',', 'scalar_exp']}
   ]
  },
  {'head': 'from_clause',
   'body': [
     {'expr': ['FROM', 'table_ref_commalist']}
   ]
  },
  {'head': 'opt_group_by_clause',
   'body': [
     {'expr': []},
     {'expr': ['GROUP', 'BY', 'column_ref_commalist']}
   ]
  },
  {'head': 'opt_having_clause',
   'body': [
     {'expr': []},
     {'expr': ['HAVING', 'search_condition']}
   ]
  },
  {'head': 'assignment',
   'body': [
     {'expr': ['column', '=', 'scalar_exp']},
     {'expr': ['column', '=', 'NULLX']}
   ]
  },
  {'head': 'search_condition',
   'body': [
     {'expr': ['search_condition', 'OR', 'search_condition']},
     {'expr': ['search_condition', 'AND', 'search_condition']},
     {'expr': ['NOT', 'search_condition']},
     {'expr': ['(', 'search_condition', ')']},
     {'expr': ['predicate']}
   ]
  },
  {'head': 'column',
   'body': [
     {'expr': ['NAME']}
   ]
  },
  {'head': 'insert_atom',
   'body': [
     {'expr': ['atom']},
     {'expr': ['NULLX']}
   ]
  },
  {'head': 'scalar_exp',
   'body': [
     {'expr': ['scalar_exp', '+', 'scalar_exp']},
     {'expr': ['scalar_exp', '-', 'scalar_exp']},
     {'expr': ['scalar_exp', '*', 'scalar_exp']},
     {'expr': ['scalar_exp', '/', 'scalar_exp']},
     {'expr': ['+', 'scalar_exp'], 'prec': 'UMINUS'},
     {'expr': ['-', 'scalar_exp'], 'prec': 'UMINUS'},
     {'expr': ['atom']},
     {'expr': ['column_ref']},
     {'expr': ['function_ref']},
     {'expr': ['(', 'scalar_exp', ')']}
   ]
  },
  {'head': 'table_ref_commalist',
   'body': [
     {'expr': ['table_ref']},
     {'expr': ['table_ref_commalist', ',', 'table_ref']}
   ]
  },
  {'head': 'column_ref_commalist',
   'body': [
     {'expr': ['column_ref']},
     {'expr': ['column_ref_commalist', ',', 'column_ref']}
   ]
  },
  {'head': 'search_condition',
   'body': [
     {'expr': ['search_condition', 'OR', 'search_condition']},
     {'expr': ['search_condition', 'AND', 'search_condition']},
     {'expr': ['NOT', 'search_condition']},
     {'expr': ['(', 'search_condition', ')']},
     {'expr': ['predicate']}
   ]
  },
  {'head': 'predicate',
   'body': [
     {'expr': ['comparison_predicate']},
     {'expr': ['between_predicate']},
     {'expr': ['like_predicate']},
     {'expr': ['test_for_null']},
     {'expr': ['in_predicate']},
     {'expr': ['all_or_any_predicate']},
     {'expr': ['existence_test']}
   ]
  },
  {'head': 'atom',
   'body': [
     {'expr': ['parameter_ref']},
     {'expr': ['literal']}
   ]
  },
  {'head': 'column_ref',
   'body': [
     {'expr': ['NAME']},
     {'expr': ['NAME', '.', 'NAME']}
   ]
  },
  {'head': 'function_ref',
   'body': [
     {'expr': ['AMMSC', '(', '*', ')']},
     {'expr': ['AMMSC', '(', 'DISTINCT', 'column_ref', ')']},
     {'expr': ['AMMSC', '(', 'ALL', 'scalar_exp', ')']},
     {'expr': ['AMMSC', '(', 'scalar_exp', ')']}
   ]
  },
  {'head': 'table_ref',
   'body': [
     {'expr': ['table']},
     {'expr': ['table', 'range_variable']}
   ]
  },
  {'head': 'table',
   'body': [
     {'expr': ['NAME']},
     {'expr': ['NAME', '.', 'NAME']}
   ]
  },
  {'head': 'range_variable',
   'body': [
     {'expr': ['NAME']}
   ]
  },
  {'head': 'comparison_predicate',
   'body': [
     {'expr': ['scalar_exp', 'COMPARISON', 'scalar_exp']},
     {'expr': ['scalar_exp', 'COMPARISON', 'subquery']}
   ]
  },
  {'head': 'between_predicate',
   'body': [
     {'expr': ['scalar_exp', 'NOT', 'BETWEEN', 'scalar_exp', 'AND', 'scalar_exp']},
     {'expr': ['scalar_exp', 'BETWEEN', 'scalar_exp', 'AND', 'scalar_exp']}
   ]
  },
  {'head': 'like_predicate',
   'body': [
     {'expr': ['scalar_exp', 'NOT', 'LIKE', 'atom', 'opt_escape']},
     {'expr': ['scalar_exp', 'LIKE', 'atom', 'opt_escape']}
   ]
  },
  {'head': 'test_for_null',
   'body': [
     {'expr': ['column_ref', 'IS', 'NOT', 'NULLX']},
     {'expr': ['column_ref', 'IS', 'NULLX']}
   ]
  },
  {'head': 'in_predicate',
   'body': [
     {'expr': ['scalar_exp', 'NOT', 'IN', '(', 'subquery', ')']},
     {'expr': ['scalar_exp', 'IN', '(', 'subquery', ')']},
     {'expr': ['scalar_exp', 'NOT', 'IN', '(', 'atom_commalist', ')']},
     {'expr': ['scalar_exp', 'IN', '(', 'atom_commalist', ')']},
   ]
  },
  {'head': 'all_or_any_predicate',
   'body': [
     {'expr': ['scalar_exp', 'COMPARISON', 'any_all_some', 'subquery']}
   ]
  },
  {'head': 'any_all_some',
   'body': [
     {'expr': ['ANY']},
     {'expr': ['ALL']},
     {'expr': ['SOME']}
   ]
  },
  {'head': 'existence_test',
   'body': [
     {'expr': ['EXISTS', 'subquery']}
   ]
  },
  {'head': 'parameter_ref',
   'body': [
     {'expr': ['parameter']},
     {'expr': ['parameter', 'parameter']},
     {'expr': ['parameter', 'INDICATOR', 'parameter']}
   ]
  },
  {'head': 'parameter',
   'body': [
     {'expr': ['PARAMETER']}
   ]
  },
  {'head': 'literal',
   'body': [
     {'expr': ['STRING']},
     {'expr': ['NUM']}
   ]
  },
  {'head': 'subquery',
   'body': [
     {'expr': ['(', 'SELECT', 'opt_all_distinct', 'selection', 'table_exp', ')']}
   ]
  },
  {'head': 'opt_escape',
   'body': [
     {'expr': []},
     {'expr': ['ESCAPE', 'atom']},
   ]
  },
  {'head': 'atom_commalist',
   'body': [
     {'expr': ['atom']},
     {'expr': ['atom_commalist', ',', 'atom']}
   ]
  }
];

