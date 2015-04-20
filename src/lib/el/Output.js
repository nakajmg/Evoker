import {EventEmitter2 as EventEmitter} from "eventemitter2";
import elem from "../util/elem";

export default class OutputElement extends EventEmitter {
  constructor() {
    super();
    this.codearea = elem({className: "evoker__visions"});
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
