var lexRules = [
  [/ALL/i, keyword],
  [/AND/i, keyword],
  [/AVG/i, keyword],
  [/MIN/i, function keyword(lexeme){return ['AMMSC', lexeme.toUpperCase()];}],
  [/MAX/i, function keyword(lexeme){return ['AMMSC', lexeme.toUpperCase()];}],
  [/SUM/i, function keyword(lexeme){return ['AMMSC', lexeme.toUpperCase()];}],
  [/COUNT/i, function keyword(lexeme){return ['AMMSC', lexeme.toUpperCase()];}],
  [/ANY/i, keyword],
  [/AS/i, keyword],
  [/ASC/i, keyword],
  [/AUTHORIZATION/i, keyword],
  [/BETWEEN/i, keyword],
  [/BY/i, keyword],
  [/CHAR(ACTER)?/i, function keyword(lexeme){return ['CHARACTER'];}],
  [/CHECK/i, keyword],
  [/CLOSE/i, keyword],
  [/COMMIT/i, keyword],
  [/CONTINUE/i, keyword],
  [/CREATE/i, keyword],
  [/CURRENT/i, keyword],
  [/CURSOR/i, keyword],
  [/DECIMAL/i, keyword],
  [/DECLARE/i, keyword],
  [/DEFAULT/i, keyword],
  [/DELETE/i, keyword],
  [/DESC/i, keyword],
  [/DISTINCT/i, keyword],
  [/DOUBLE/i, keyword],
  [/ESCAPE/i, keyword],
  [/EXISTS/i, keyword],
  [/FETCH/i, keyword],
  [/FLOAT/i, keyword],
  [/FOR/i, keyword],
  [/FOREIGN/i, keyword],
  [/FOUND/i, keyword],
  [/FROM/i, keyword],
  [/GO[ \t]*TO/i, function keyword(lexeme){return ['GOTO'];}],
  [/GRANT/i, keyword],
  [/GROUP/i, keyword],
  [/HAVING/i, keyword],
  [/IN/i, keyword],
  [/INDICATOR/i, keyword],
  [/INSERT/i, keyword],
  [/INT(EGER)?/i, function keyword(lexeme){return ['INTEGER'];}],
  [/INTO/i, keyword],
  [/IS/i, keyword],
  [/KEY/i, keyword],
  [/LANGUAGE/i, keyword],
  [/LIKE/i, keyword],
  [/NOT/i, keyword],
  [/NULL/i, function keyword(lexeme){return ['NULLX'];}],
  [/NUMERIC/i, keyword],
  [/OF/i, keyword],
  [/ON/i, keyword],
  [/OPEN/i, keyword],
  [/OPTION/i, keyword],
  [/OR/i, keyword],
  [/ORDER/i, keyword],
  [/PRECISION/i, keyword],
  [/PRIMARY/i, keyword],
  [/PRIVILEGES/i, keyword],
  [/PROCEDURE/i, keyword],
  [/PUBLIC/i, keyword],
  [/REAL/i, keyword],
  [/REFERENCES/i, keyword],
  [/ROLLBACK/i, keyword],
  [/SCHEMA/i, keyword],
  [/SELECT/i, keyword],
  [/SET/i, keyword],
  [/SMALLINT/i, keyword],
  [/SOME/i, keyword],
  [/SQLCODE/i, keyword],
  [/TABLE/i, keyword],
  [/TO/i, keyword],
  [/UNION/i, keyword],
  [/UNIQUE/i, keyword],
  [/UPDATE/i, keyword],
  [/USER/i, keyword],
  [/VALUES/i, keyword],
  [/VIEW/i, keyword],
  [/WHENEVER/i, keyword],
  [/WHERE/i, keyword],
  [/WITH/i, keyword],
  [/WORK/i, keyword],
  [/=/, comparison],
  [/<>/, comparison],
  [/</, comparison],
  [/>/, comparison],
  [/<=/, comparison],
  [/>=/, comparison],
  [/[-+*\/(),.;]/, function(lexeme){return [lexeme];}],
  [/[A-Za-z_][A-Za-z0-9_]*/,	function(lexeme){return ['NAME', lexeme];}],
  [/[0-9]+/, number],
  [/[0-9]+\.[0-9]*/, number],
  [/\.[0-9]*/, number],
  [/\'[^'\n]*\'/, function(lexeme){return ['STRING', lexeme.slice(1, -1)];}],
  [/\"[^"\n]*\"/, function(lexeme){return ['STRING', lexeme.slice(1, -1)];}],
  [/[ \t\r\n]+/, function(lexeme){}]
];

function keyword(lexeme){
  return [lexeme.toUpperCase()];
}

function comparison(lexeme){
  return ['COMPARISON', lexeme];
}

function punctuation(lexeme){
  return [lexeme];
}

function number(lexeme){
  return ['NUM', parseFloat(lexeme)];
}


function Lexer(input){
  this.input = input;
  this.pos = 0;
}

Lexer.prototype.next = function(){
  var input = this.input;
  var pos = this.pos;

  if (pos === input.length){
    throw new Error ('End of input');
  }

  var matchedRuleArr = lexRules.map(function(rule){
    return {'rule': rule, 'match': rule[0].exec(input.substring(pos))};
  }).filter(function(ruleAndMatch){
    return ruleAndMatch.match != null && ruleAndMatch.match.index === 0;
  }).sort(function(matchedRule0, matchedRule1){
    return matchedRule1.match[0].length - matchedRule0.match[0].length;
  });

  var rule = matchedRuleArr[0].rule;
  var match = matchedRuleArr[0].match;

  this.pos += match[0].length;
  var token = rule[1](match[0]);
  if (token) {
    return token;
  }
  return Lexer.prototype.next.call(this); // resurse to escape spaces

  throw new Error ('Unknow input charactar');
}

module.exports = Lexer;
