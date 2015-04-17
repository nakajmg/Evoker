import {EventEmitter2 as EventEmitter} from "eventemitter2";
import fnToString from "./util/fnToString";
import scriptToCodeblock from "./util/scriptToCodeblock";

var Prism = Prism || undefined;

var className = {
  el: "evoker__vision",
  btn: "evoker__runBtn"
};

export default class Vision extends EventEmitter {
  constructor({script, code, html, autorun, description}) {
    super();
    this.script = script;
    this.code = code;
    this.html = html;
    this.autorun = autorun;
    
    this._eventify();
    this._setup();
  }
  _eventify() {
    this.on("run", this.run);
  }
  _setup() {
    this.el = document.createElement("div");
    this.el.classList.add(className.el);
    this._transform();
    this._autorun();
  }
  _autorun() {
    if (this.autorun) {
      this.emit("run");
    }
  }
  _transform() {
    this._addCodeblock();
    this._addHtmlblock();
    this._addRunbtn();
  }
  _addCodeblock() {
    var source = this.code ? this.code : this.script;
    this.codeblock = scriptToCodeblock(source);
    this.el.appendChild(this.codeblock);
  }
  _addHtmlblock() {
    if (!this.html) return;
    var pre = document.createElement("pre");
    var code = document.createElement("code");
    code.classList.add("language-markup");
    pre.appendChild(code);
    code.textContent = this.html.join('\n');
    
    this.el.appendChild(pre);
  }
  _addRunbtn() {
    if (!this.script) return;
    var runbtn = document.createElement("button");
    runbtn.classList.add(className.btn);
    runbtn.textContent = "run";
    runbtn.addEventListener("click", () => this.emit("run") );
    this.el.appendChild(runbtn);
  }
  run() {
    if (typeof this.script === "function") {
      this.script();
    }
  }
  evoke(targetElement) {
    targetElement.appendChild(this.el);
    if (Prism) {
      [].forEach.call(this.el.querySelectorAll("code"), (code) => {
        Prism.highlightElement(code);
      });
    }
  }
}
