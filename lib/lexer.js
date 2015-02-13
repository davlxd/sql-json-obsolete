var keyWords = ['SELECT', 'UPDATE', 'DELETE', 'INSERT', 'FROM'];

function letterAction(lexeme){
  if (keyWords.indexOf(lexeme.toUpperCase()) !== -1)
    return {'tag' : lexeme.toUpperCase()};
  return {'tag': 'ID', 'value': lexeme }
}

var lexTable = [
  {
    'regexp': /^\s+/,
    'action': function(lexeme) {}
  },{
    'regexp': /^[-+]?[0-9]*\.?[0-9]+/,
    'action': function(lexeme) {return {'tag':'NUM', 'value': parseFloat(lexeme) }}
  },{
    'regexp': /^\w+/,
    'action': letterAction
  },{
    'regexp': /^\*/,
    'action': function(lexeme) {return {'tag': 'ASTERISK'}}
  }

];


function Lexer(input){
  this.input = input;
  this.pos = 0;
}

Lexer.prototype.next = function(){
  if (this.pos === this.input.length){
    throw new Error ('End of input');
  }

  for (var index in lexTable) {
    var rule = lexTable[index];
    var match = rule.regexp.exec(this.input.substring(this.pos));
    if (match) {
      this.pos += match[0].length;
      var token = rule.action(match[0]);
      if (token) {
        return token;
      }
      return Lexer.prototype.next.call(this); // escape spaces
    }
  }

  throw new Error ('Unknow input charactar');
}

module.exports = Lexer;
