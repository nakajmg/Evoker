export default function elem({className, type, text, attribute}) {
  var el;
  type = type || "div";
  el = document.createElement(type);
  
  if (className) {
    addClass(el, className);
  }
  
  if (text) {
    el.textContent = text;
  }
  
  if (attribute) {
    attr(el, attribute.name, attribute.value);
  }
  
  return el;
}

export function addClass(el, className) {
  el.classList.add(className);
}

export function removeClass(el, className) {
  el.classList.remove(className);
}

export function attr(el, attributeName, newValue) {
  if (newValue) {
    el.setAttribute(attributeName, newValue);
  }
  else {
    return el.getAttribute(attributeName);
  }
}
