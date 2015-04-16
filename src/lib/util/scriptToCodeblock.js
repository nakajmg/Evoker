import fnToString from "./fnToString";

export default function scriptToCodeblock(script) {
  var pre = document.createElement("pre");
  var code = document.createElement("code");
  code.classList.add("language-javascript");
  code.textContent = fnToString(script);
  pre.appendChild(code);
  
  return pre;
}
