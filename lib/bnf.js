var util = require('./util');

var tokens = [

];

var yaccRules = [

];

var ambiguousRules = [
];




// -- rule misc routines --
function terminals(){
  return tokens;
}
exports.terminals = terminals;


exports.isTerminal = function(symbol){
  return tokens.indexOf(symbol) !== -1;
}


function nonTerminals(yaccRules1){
  var yaccRules1 = yaccRules1 || yaccRules;
  return yaccRules1.map(function(rule){
    return rule.head;
  });
}
exports.nonTerminals = nonTerminals;

exports.symbols = function() {
  return nonTerminals().concat(tokens);
}

exports.yaccRules = function(){
  return yaccRules;
}

function indexOfRule(head, expr){
  for (var ruleIndex = 0; ruleIndex < yaccRules.length; ruleIndex++){
    var rule = yaccRules[ruleIndex];
    if (rule.head !== head)  continue;
    for (var exprIndex = 0; exprIndex < rule.body.length; exprIndex++){
      if (util.arrayEqual(expr, rule.body[exprIndex].expr)) return [ruleIndex, exprIndex];
    }
  }
}
exports.indexOfRule = indexOfRule;

function getRuleByIndex(index){
  var ruleIndex = index[0], exprIndex = index[1]
  var rule = {};
  rule.head = yaccRules[ruleIndex].head;
  rule.expr = yaccRules[ruleIndex].body[exprIndex].expr;

  if (yaccRules[ruleIndex].body[exprIndex].semAction)
    rule.semAction = yaccRules[ruleIndex].body[exprIndex].semAction;

  if (yaccRules[ruleIndex].body[exprIndex].prec)
    rule.prec = yaccRules[ruleIndex].body[exprIndex].prec;

  return rule;
}
exports.getRuleByIndex = getRuleByIndex;


function getRule(head, yaccRules1){
  var yaccRules1 = yaccRules1 || yaccRules;

  var rule = yaccRules1.filter(function(rule){
    return rule.head === head;
  })[0];

  if (rule) {
    rule.body.forEach(function(bodyEntry){
      bodyEntry.dotIndex = 0;
    });
  }
  return rule;
}
exports.getRule = getRule;


exports.ambiguousRuleFor = function(symbol){
  return ambiguousRules[symbol];
}

exports.ambiguousSymbols = function(){
  return Object.keys(ambiguousRules);
}



// -- rule and itemSet deep-clone & compare routines --
function cloneBodyEntry(bodyEntry){
  var clonedBodyEntry = {};
  for (var bodyAttrKey in bodyEntry){
    if (Array.isArray(bodyEntry[bodyAttrKey]))
      clonedBodyEntry[bodyAttrKey] = bodyEntry[bodyAttrKey].slice();
    else
      clonedBodyEntry[bodyAttrKey] = bodyEntry[bodyAttrKey]
  }
  return clonedBodyEntry;
}
exports.cloneBodyEntry = cloneBodyEntry;


function cloneRule(ruleToClone){
  if (!ruleToClone) return ruleToClone;
  var rule = {};

  rule.head = ruleToClone.head;
  rule.body = [];
  
  ruleToClone.body.forEach(function(bodyEntry){
    rule.body.push(cloneBodyEntry(bodyEntry));
  });
  return rule;
}
exports.cloneRule = cloneRule;


function cloneItemSet(itemSetToClone){
  if (!itemSetToClone) return itemSetToClone;
  var itemSet = [];

  itemSetToClone.forEach(function(item){
    itemSet.push(cloneRule(item));
  });
  return itemSet;
}
exports.cloneItemSet = cloneItemSet;



exports.augmentRule = function(){
  if (yaccRules[0].head.slice(-1) !== '_') {
    var augmentRule = {};
    var head = yaccRules[0].head
    var head_ = head + '_';

    augmentRule.head = head_
    augmentRule.body = [{'expr': [head], 'dotIndex': 0}];

    yaccRules = [augmentRule].concat(yaccRules);
  }

  return yaccRules[0];
}


function arrayEqual(arr0, arr1){  //one level
  if (!arr0 && !arr1)  return true;

  if (arr0 && !arr1 || !arr0 && arr1 ) return false;

  if (arr0 && arr1  && arr0.length !== arr1.length ) return false;

  for (var index = 0; index < arr0.length; index++)
    if (arr0[index] !== arr1[index]) return false;

  return true;
}
exports.arrayEqual = arrayEqual;


function bodyEntryEqual(bodyEntry0, bodyEntry1, noCheckLookahead){
  if (bodyEntry0.dotIndex !== bodyEntry1.dotIndex) return false;

  if (!noCheckLookahead) {
    if (bodyEntry0.lookahead) bodyEntry0.lookahead.sort();
    if (bodyEntry1.lookahead) bodyEntry1.lookahead.sort();
    if (!arrayEqual(bodyEntry0.lookahead, bodyEntry1.lookahead))
      return false;
  }

  if (!bodyEntry0.expr || !bodyEntry1.expr) return false;
  if (!arrayEqual(bodyEntry0.expr, bodyEntry1.expr)) return false;

  return true;
}
exports.bodyEntryEqual = bodyEntryEqual;


function itemEqual(item0, item1, noCheckLookahead){
  if (item0.head !== item1.head) return false;
  if (item0.body.length !== item1.body.length) return false;

  for (var index = 0; index < item0.body.length; index++) {
    if (!bodyEntryEqual(item0.body[index], item1.body[index], noCheckLookahead)) return false;
  }
  return true;
}
exports.itemEqual = itemEqual;

function itemSetEqual(itemSet0, itemSet1, noCheckLookahead){
  if (itemSet0.length !== itemSet1.length) return false;
  for (var index = 0; index < itemSet0.length; index++){
    if (!itemEqual(itemSet0[index], itemSet1[index], noCheckLookahead)) return false;
  }
  return true;
}
exports.itemSetEqual = itemSetEqual;


exports.bodyDiffFirst = function(set0, set1){  // Uniq in set0 comparing to set1
  var retSet = [];

  set0.forEach(function(bodyEntry0){
    var bodyEntry1Index = 0;
    var ifNotInSet1 = set1.every(function(bodyEntry1, index){
      bodyEntry1Index = index;
      return !bodyEntryEqual(bodyEntry0, bodyEntry1, 'noCheckLookahead');
    });
    if (ifNotInSet1){
      retSet.push(bodyEntry0); return ;
    }

    var bodyEntry1 = set1[bodyEntry1Index];
    if (bodyEntry0.lookahead && bodyEntry1.lookahead){
      var bodyEntry0ContainsUniqLooahead = !bodyEntry0.lookahead.every(function(lookaheadChar){
        return bodyEntry1.lookahead.indexOf(lookaheadChar) === -1 ? false : true;
      });
      if (bodyEntry0ContainsUniqLooahead) retSet.push(bodyEntry0);

    } else if (bodyEntry0.lookahead || bodyEntry1.lookahead) {
      retSet.push(bodyEntry0); return ;
    }

  });
  return retSet;
}




// -- left recursion elimination --
var nonLeftRecursionYaccRules = [];

function eliminateLeftRecursion(rule){
  var newRule = {};

  var leftRecurArr = [], nonLeftRecurArr = [];
  rule.body.forEach(function(bodyEntry){
    if (bodyEntry.expr[0] === rule.head)
      leftRecurArr.push(bodyEntry);
    else
      nonLeftRecurArr.push(bodyEntry);
  });

  var newRuleHead = rule.head + '~';
  rule.body = nonLeftRecurArr.map(function(bodyEntry){
    return {'expr': bodyEntry.expr.concat([newRuleHead])};
  });

  newRule.head = newRuleHead;
  newRule.body = leftRecurArr.map(function(bodyEntry){
    return {'expr': bodyEntry.expr.slice(1).concat([newRuleHead])};
  }).concat({'expr': []});

  return newRule;
}

function ifLeftRecursion(rule){
  return !rule.body.every(function(bodyEntry){
    return rule.head !== bodyEntry.expr[0];
  });
}

function nonLeftRecursion(){
  if (nonLeftRecursionYaccRules.length > 0) return nonLeftRecursionYaccRules;

  yaccRules.forEach(function(rule){
    var newRule = cloneRule(rule);
    nonLeftRecursionYaccRules.push(newRule);

    if (ifLeftRecursion(newRule)){
      nonLeftRecursionYaccRules.push(eliminateLeftRecursion(newRule));
    }
  });

  return nonLeftRecursionYaccRules;
}




// -- FIRST and FOLLOW set --
var firstTable = {}
var followTable = {}

function generateFirstTable(){
  if (Object.keys(firstTable).length > 0) return firstTable;

  terminals().forEach(function(terminal){
    firstTable[terminal] = [terminal];
  });
  firstTable['#'] = ['#'];

  var yaccRules = nonLeftRecursion();

  function nullable(symbol){
    if (terminals().indexOf(symbol) !== -1) return false;
    return !getRule(symbol, yaccRules).body.every(function(bodyEntry){
      return bodyEntry.expr.length !== 0;
    });
  }

  function first(symbol){
    if (firstTable[symbol]) return firstTable[symbol];

    var set = [];
    getRule(symbol, yaccRules).body.forEach(function(bodyEntry){
      if (bodyEntry.expr.length === 0) set.push('');
      for (var index = 0; index < bodyEntry.expr.length; index++){
        util.concatUniqInplace(set, first(bodyEntry.expr[index]));
        if (!nullable(bodyEntry.expr[index])) break;
      }
    });
    return set;
  }

  nonTerminals(yaccRules).forEach(function(nonTerminal){
    firstTable[nonTerminal] = first(nonTerminal);
  });
  return firstTable;
}


function first(symbolArr){
  var arrFirstSet = [];

  function containsEmpty(arr){
    return !arr.every(function(element){
      return element !== '';
    });
  }

  for (var index = 0; index < symbolArr.length; index++){
    var symbol = symbolArr[index];
    if (!symbol) continue;

    var firstSet = Array.isArray(symbol) ? symbol.concat() : generateFirstTable()[symbol];
    if (!firstSet) continue;

    arrFirstSet = arrFirstSet.concat(firstSet);
    if (!containsEmpty(firstSet)) break;
  }
  return arrFirstSet;
}
exports.first = first;



function generateFollowTable(){
  if (Object.keys(followTable).length > 0) return followTable;
  generateFirstTable();

  nonTerminals().forEach(function(nonTerminal){
    followTable[nonTerminal] = [];
  });

  followTable[nonTerminals()[0]].push('EOF');

  function containsEmpty(arr){
    return !arr.every(function(element){
      return element !== '';
    });
  }

  nonTerminals().forEach(function(nonTerminal){
    yaccRules.forEach(function(rule){
      rule.body.forEach(function(bodyEntry){
        if (bodyEntry.expr.length === 0) return ;

        var nonTerminalIndex = bodyEntry.expr.indexOf(nonTerminal);
        if (nonTerminalIndex === -1) return ;

        if (nonTerminalIndex === bodyEntry.expr.length - 1) {
          util.concatUniqInplace(followTable[nonTerminal], followTable[rule.head]); return ;
        }

        var nextSymbol = bodyEntry.expr[nonTerminalIndex + 1];
        util.concatUniqInplace(followTable[nonTerminal],
                               firstTable[nextSymbol].filter(function(el){return el !== ''}));

        var ifFollowUpEmpty = bodyEntry.expr.slice(nonTerminalIndex + 1).every(function(symbol){
          return containsEmpty(firstTable[symbol]);
        });
        if (ifFollowUpEmpty)
          util.concatUniqInplace(followTable[nonTerminal], followTable[rule.head]);
      });
    });
  });

  return followTable;
}

function follow(symbol){
  return generateFollowTable()[symbol];
}
exports.follow = follow;

