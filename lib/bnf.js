var tokens = [

];

var yaccRules = [

];




// -- rule misc routines --
function terminals(){
  return tokens;
}
exports.terminals = terminals;

function nonTerminals(){
  return yaccRules.map(function(rule){
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


function bodyEntryEqual(bodyEntry0, bodyEntry1){
  if (bodyEntry0.dotIndex !== bodyEntry1.dotIndex) return false;
  if (bodyEntry0.expr.length !== bodyEntry1.expr.length) return false;

  for (var index in bodyEntry0.expr) {
    if (bodyEntry0.expr[index] !== bodyEntry1.expr[index]) return false;
  }
  return true;
}


function itemEqual(item0, item1){
  if (item0.head !== item1.head) return false;
  if (item0.body.length !== item1.body.length) return false;

  for (var index in item0.body) {
    if (!bodyEntryEqual(item0.body[index], item1.body[index])) return false;
  }
  return true;

}

function itemSetEqual(itemSet0, itemSet1){
  if (itemSet0.length !== itemSet1.length) return false;
  for (var index in itemSet0){
    if (!itemEqual(itemSet0[index], itemSet1[index])) return false;
  }
  return true;
}
exports.itemSetEqual = itemSetEqual;


exports.bodyDiffFirst = function(set0, set1){
  var retSet = [];

  set0.forEach(function(bodyEntry0){
    var ifNotInSet1 = set1.every(function(bodyEntry1){
      return !bodyEntryEqual(bodyEntry0, bodyEntry1);
    });
    if (ifNotInSet1){
      retSet.push(bodyEntry0);
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

  var newRuleHead = rule.head + '_';
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
  terminals().forEach(function(terminal){
    firstTable[terminal] = [terminal];
  });

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
      for (index in bodyEntry.expr){
        set = set.concat(first(bodyEntry.expr[index]));
        if (!nullable(bodyEntry.expr[index])) break;
      }
    });
    return set;
  }

  nonTerminals().forEach(function(nonTerminal){
    firstTable[nonTerminal] = first(nonTerminal);
  });
  return firstTable;
}


function generateFollowTable(){

}

