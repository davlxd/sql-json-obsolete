
exports.concatUniqInplace = function(arr0, arr1){
  arr1.forEach(function(element){
    if (arr0.indexOf(element) !== -1) return;
    arr0.push(element);
  });
  return arr0;
}

