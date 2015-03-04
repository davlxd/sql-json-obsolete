var tokens = [

];

var yaccRules = [

];

exports.terminals = function(){
  return tokens;
}

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

exports.getRule = function(head){
  var rule = yaccRules.filter(function(rule){
    return rule.head === head;
  })[0];

  if (rule) {
    rule.body.forEach(function(bodyEntry){
      bodyEntry.dotIndex = 0;
    });
  }
  
  return rule;
}

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


exports.cloneRule = function(ruleToClone){
  if (!ruleToClone) return ruleToClone;
  var rule = {};

  rule.head = ruleToClone.head;
  rule.body = [];
  
  ruleToClone.body.forEach(function(bodyEntry){
    rule.body.push(cloneBodyEntry(bodyEntry));
  });
  return rule;
}

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
