
exports.concatUniqInplace = function(arr0, arr1){
  arr1.forEach(function(element){
    if (arr0.indexOf(element) !== -1) return;
    arr0.push(element);
  });
  return arr0;
}


exports.clone2dArray = function(arr){
  var clonedArr = []
  arr.forEach(function(element){
    clonedArr.push(element.concat());
  });
  return clonedArr;
}

exports.array2dEqual = function(arr0, arr1){
  if (arr0.length !== arr1.length)  return false;

  for (var index = 0; index < arr0.length; index++){
    if (arr0[index].length !== arr1[index].length)  return false;

    for (var elementIndex = 0; elementIndex < arr0[index].length; elementIndex++){
      if (arr0[index][elementIndex] !== arr1[index][elementIndex])  return false;
    }
  }

  return true;
}



function cloneArray(arr){
  var clonedArr = []
  arr.forEach(function(element){
    Array.isArray(element) ? clonedArr.push(cloneArray(element)) : clonedArr.push(element);
  });
  return clonedArr;
}
exports.cloneArray = cloneArray;


function arrayEqual(arr0, arr1){
  if (arr0.length !== arr1.length)  return false;

  for (var index = 0; index < arr0.length; index++){
    if (Array.isArray(arr0[index]) && Array.isArray(arr1[index])) {
      if (!arrayEqual(arr0[index], arr1[index]))  return false;

    } else {
      if (arr0[index] !== arr1[index])  return false;
    }
  }
  return true;
}
exports.arrayEqual = arrayEqual;
