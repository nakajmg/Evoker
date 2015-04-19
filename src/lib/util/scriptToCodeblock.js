import fnToString from "./fnToString";
import elem from "./elem";

var className = {
  code: "language-javascript"
};

export default function scriptToCodeblock(script) {
  var pre = elem({type: "pre"});
  var code = elem({className: className.code, type: "code", text: fnToString(script)});
  pre.appendChild(code);
  
  return pre;
}
