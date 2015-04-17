import {EventEmitter2 as EventEmitter} from "eventemitter2";

export default class OutputElement extends EventEmitter {
  constructor() {
    super();
    this.logarea = document.createElement("div");
    this.codearea = document.createElement("div");
    this.logarea.classList.add("evoker__log");
    this.codearea.classList.add("evoker__visions");
    
    document.body.appendChild(this.codearea);
    document.body.appendChild(this.logarea);
  }
  showLogarea() {
    this._show(this.logarea);
  }
  hideLogarea() {
    this._hide(this.logarea);
  }
  _show(el) {
    el.style.display = "block";
  }
  _hide(el) {
    el.style.display = "none";
  }
}
