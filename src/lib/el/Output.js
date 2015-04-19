import {EventEmitter2 as EventEmitter} from "eventemitter2";

export default class OutputElement extends EventEmitter {
  constructor() {
    super();
    this.codearea = document.createElement("div");
    this.codearea.classList.add("evoker__visions");
    document.body.appendChild(this.codearea);
  }
  showLogarea() {
    this._show(this.codearea);
  }
  hideLogarea() {
    this._hide(this.codearea);
  }
  _show(el) {
    el.style.display = "block";
  }
  _hide(el) {
    el.style.display = "none";
  }
}
