import {EventEmitter2 as EventEmitter} from "eventemitter2";
import fnToString from "./util/fnToString";
import scriptToCodeblock from "./util/scriptToCodeblock";

export default class Vision extends EventEmitter {
  constructor({script, code, html, autorun}) {
    super();
    this.script = script;
    this.code = code;
    this.html = html;
    this.autorun = autorun;
    
    this._setup();
    this._eventify();
  }
  _eventify() {
    this.on("run", this.run);
  }
  _setup() {
    this.el = document.createElement("div");
    this._transform();
    this._evoke();
    this._autorun();
  }
  _autorun() {
    if (this.autorun) {
      this.emit("run");
    }
  }
  _transform() {
    this._addCodeblock();
    this._addRunbtn();
  }
  _addCodeblock() {
    var source = this.code ? this.code : this.script;
    this.el.appendChild(scriptToCodeblock(source));
  }
  _addRunbtn() {
    if (!this.script) return;
    var runbtn = document.createElement("button");
    runbtn.textContent = "run";
    runbtn.addEventListener("click", () => this.emit("run") );
    this.el.appendChild(runbtn);
  }
  run() {
    if (typeof this.script === "function") {
      this.script();
    }
  }
  _evoke() {
    document.body.appendChild(this.el);
  }
}
