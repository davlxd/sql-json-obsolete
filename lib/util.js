function itemBodyEqual(itemBody1, itemBody2){
  if (itemBody1.length !== itemBody2.length) return false;
  for (var index in itemBody1) {
    if (itemBody1[index] !== itemBody2[index]) return false;
  }
  return true;
}


exports.itemOnlyInFirstSet = function(set1, set2){
  var retSet = [];

  set1.forEach(function(itemBody1){
    var ifNotInSet2 = set2.every(function(itemBody2){
      return !itemBodyEqual(itemBody1, itemBody2);
    });
    if (ifNotInSet2){
      retSet.push(itemBody1);
    }
  });
  return retSet;
}
