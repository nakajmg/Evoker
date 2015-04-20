export default function elem({className, type, text}) {
  var el;
  type = type || "div";
  el = document.createElement(type);
  
  if (className) {
    el.classList.add(className);
  }
  
  if (text) {
    el.textContent = text;
  }
  
  return el;
}
