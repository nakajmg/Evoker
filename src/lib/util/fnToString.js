export default function fnToString(fn) {
  var codestring = fn.toString().split('\n');
  codestring.splice(-1, 1);
  codestring.splice(0, 1);
  var firstIndent = codestring[0].match(/^\s*/)[0];
  var reg = new RegExp(`\^${firstIndent}`);
  for(var i = 0, leng = codestring.length; i < leng; i++) {
    codestring[i] = codestring[i].replace(reg, '');
  }
  return codestring.join('\n');
}
