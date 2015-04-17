import fnToString from "./fnToString";

var className = {
  code: "language-javascript"
};

export default function scriptToCodeblock(script) {
  var pre = document.createElement("pre");
  var code = document.createElement("code");
  code.classList.add(className.code);
  code.textContent = fnToString(script);
  pre.appendChild(code);
  
  return pre;
}
