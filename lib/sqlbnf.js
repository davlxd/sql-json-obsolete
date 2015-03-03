module.exports.yaccRules = {
  'sql': [['manipulative_statement']
         ],
  'manipulative_statement':[['delete_statement_searched'],
                            ['insert_statement'],
                            ['select_statement'],
                            ['update_statement_searched'], 
                           ],
  'delete_statement_searched':[['DELETE', 'FROM', 'table', 'opt_where_clause']
                                ],
  'insert_statement': [['INSERT', 'INTO', 'table', 'opt_column_commalist', 'values_or_query_spec'],
                      ],
  'select_statement':[['SELECT', 'opt_all_distinct', 'selection', 'table_exp']
                     ],
  'update_statement_searched':[['UPDATE', 'table', 'SET', 'assignment_commalist', 'opt_where_clause']
                              ],

  'table': [['NAME']
            ['NAME', '.', 'NAME']
           ],
  'opt_where_clause':[[],
                      ['where_clause']
                     ],
  'opt_column_commalist': [[],
                           ['(', 'column_commalist', ')'],
                          ],
  'values_or_query_spec': [['VALUES', '(', 'insert_atom_commalist', ')']
                          ],
  'opt_all_distinct': [[],
                       ['ALL'],
                       ['DISTINCT']
                      ],
  'selection': [['scalar_exp_commalist'],
                ['*']
               ],

  'table_exp': [['from_clause'],
                ['opt_where_clause'],
                ['opt_group_by_clause'],
                ['opt_having_clause']
               ],

  'assignment_commalist': [['assignment'],
                           ['assignment_commalist', ',', 'assignment']
                          ],
  'where_clause':[['WHERE', 'search_condition']
                 ],
  'column_commalist': [['column'],
                      ['column_commalist', ',', 'column']
                      ],
  'insert_atom_commalist': [['insert_atom'],
                           ['insert_atom_commalist', ',', 'insert_atom']
                           ],
  'scalar_exp_commalist': [['scalar_exp'],
                          ['scalar_exp_commalist', ',', 'scalar_exp']
                          ],
  'from_clause': [['FROM', 'table_ref_commalist']
                 ],
  'opt_group_by_clause': [[]
                          ['GROUP', 'BY', 'column_ref_commalist']
                         ],
  'opt_having_clause': [[]
                        ['HAVING', 'search_condition']
                       ],
  'assignment': [['column', '=', 'scalar_exp']
                 ['column', '=', 'NULLX']
                ],
  'search_condition': [['search_condition', 'OR', 'search_condition'],
                       ['search_condition', 'AND', 'search_condition'],
                       ['NOT', 'search_condition'],
                       ['(', 'search_condition', ')'],
                       ['predicate']
                      ],
  'column': [['NAME']
            ],
  'insert_atom': [['atom']
                  ['NULLX']
                 ],
  'scalar_exp': [['scalar_exp', '+', 'scalar_exp'],
                 ['scalar_exp', '-', 'scalar_exp'],
                 ['scalar_exp', '*', 'scalar_exp'],
                 ['scalar_exp', '/', 'scalar_exp'],
                 ['+', 'scalar_exp', '%prec', 'UMINUS'],
                 ['-', 'scalar_exp', '%prec', 'UMINUS'],
                 ['atom'],
                 ['column_ref'],
                 ['function_ref'],
                 ['(', 'scalar_exp', ')'],
                ],
  'table_ref_commalist': [['table_ref']
                          ['table_ref_commalist', ',', 'table_ref']
                         ],
  'column_ref_commalist': [['column_ref']
                           ['column_ref_commalist', ',', 'column_ref']
                          ],
  'search_condition': [['search_condition', 'OR', 'search_condition'],
                       ['search_condition', 'AND', 'search_condition'],
                       ['NOT', 'search_condition'],
                       ['(', 'search_condition', ')'],
                       ['predicate'],
                      ],
  'predicate': [['comparison_predicate'],
                ['between_predicate'],
                ['like_predicate'],
                ['test_for_null'],
                ['in_predicate'],
                ['all_or_any_predicate'],
                ['existence_test'],
               ],
  'atom': [['parameter_ref'],
           ['literal']
          ],
  'column_ref': [['NAME'],
                 ['NAME', '.', 'NAME']
                ],
  'function_ref': [['AMMSC', '(', '*', ')'],
                   ['AMMSC', '(', 'DISTINCT', 'column_ref', ')'],
                   ['AMMSC', '(', 'ALL', 'scalar_exp', ')'],
                   ['AMMSC', '(', 'scalar_exp', ')'],
                  ],
  'table_ref': [['table'],
                ['table', 'range_variable']
               ],
  'table': [['NAME']
            ['NAME', '.', 'NAME']
           ],
  'range_variable': [['NAME']
                    ],
  'comparison_predicate': [['scalar_exp', 'COMPARISON', 'scalar_exp'],
                           ['scalar_exp', 'COMPARISON', 'subquery'],
                          ],
  'between_predicate': [['scalar_exp', 'NOT', 'BETWEEN', 'scalar_exp', 'AND', 'scalar_exp'],
                        ['scalar_exp', 'BETWEEN', 'scalar_exp', 'AND', 'scalar_exp'],
                       ],
  'like_predicate': [['scalar_exp', 'NOT', 'LIKE', 'atom', 'opt_escape'],
                     ['scalar_exp', 'LIKE', 'atom', 'opt_escape'],
                    ],
  'test_for_null': [['column_ref', 'IS', 'NOT', 'NULLX'],
                    ['column_ref', 'IS', 'NULLX'],
                   ],
  'in_predicate': [['scalar_exp', 'NOT', 'IN', '(', 'subquery', ')'],
                   ['scalar_exp', 'IN', '(', 'subquery', ')'],
                   ['scalar_exp', 'NOT', 'IN', '(', 'atom_commalist', ')'],
                   ['scalar_exp', 'IN', '(', 'atom_commalist', ')'],
                  ],
  'all_or_any_predicate': [['scalar_exp', 'COMPARISON', 'any_all_some', 'subquery']
                          ],
  'any_all_some':[['ANY'],
                  ['ALL'],
                  ['SOME']
                 ],
  'existence_test': [['EXISTS', 'subquery']
                     ],
  'parameter_ref': [['parameter'],
                    ['parameter', 'parameter'],
                    ['parameter', 'INDICATOR', 'parameter'],
                    ],
  'parameter': [['PARAMETER']
               ],
  'literal': [['STRING']
              ['NUM']
             ],
  'subquery': [['(', 'SELECT', 'opt_all_distinct', 'selection', 'table_exp', ')'],
              ],
  'opt_escape': [[]
                 ['ESCAPE', 'atom']
                ],
  'atom_commalist': [['atom'],
                     ['atom_commalist', ',', 'atom'],
                     ],
};

