var yaccRules = [

];

exports.yaccRules = function(){
  return yaccRules;
}

exports.getRule = function(key){
  var rule = yaccRules.filter(function(rule){
    return rule.head === key;
  })[0];

  if (rule) {
    rule.body.forEach(function(bodyElement){
      bodyElement.dotIndex = 0;
    });
  }
  
  return rule;
}

exports.cloneRule = function(ruleToClone){
  if (!ruleToClone) return ruleToClone;
  var rule = {};

  rule.head = ruleToClone.head;
  rule.body = [];
  
  ruleToClone.body.forEach(function(bodyElement){
    var clonedBody = {};
    for (var bodyAttrKey in bodyElement){
      if (Array.isArray(bodyElement[bodyAttrKey]))
        clonedBody[bodyAttrKey] = bodyElement[bodyAttrKey].slice();
      else
        clonedBody[bodyAttrKey] = bodyElement[bodyAttrKey]
    }
    rule.body.push(clonedBody);
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
