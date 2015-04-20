import {EventEmitter2 as EventEmitter} from "eventemitter2";
import fnToString from "./util/fnToString";
import scriptToCodeblock from "./util/scriptToCodeblock";
import VisionLog from "./VisionLog";
import elem from "./util/elem";
import {addClass} from "./util/elem";
import {removeClass} from "./util/elem";
import {attr} from "./util/elem";

var Prism = Prism || undefined;

var className = {
  logarea: "evoker__log",
  main: "evoker__vision",
  btn: "evoker__btn",
  runbtn: "evoker__runBtn",
  caption: "evoker__caption",
  description: "evoker__description",
  tabs: "evoker__tabs",
  tab: "evoker__tab",
  tabactive: "evoker__tab--active",
  info: "evoker__info",
  contents: "evoker__contents",
  content: "evoker__content",
  contentactive: "evoker__content--active",
  html: "evoker__html",
  code: "evoker__script",
  css: "evoker__css",
  separate: "evoker__separate"
};
var _attr = "data-evoker-name";

export default class Vision extends EventEmitter {
  constructor({script, code, html, autorun, caption, description, log}) {
    super();
    this.script = script;
    this.code = code;
    this.html = html;
    this.autorun = autorun;
    this.caption = caption;
    this.description = description;
    this.log = log !== undefined ? log : true;
    
    this._setup();
    this._eventify();
    this._autorun();
  }
  _eventify() {
    this.on("run", this.run);
    var $tabs = this.el.tabs.querySelectorAll(".evoker__tab");
    var $contents = this.el.contents.querySelectorAll(".evoker__content");
    
    [].forEach.call($tabs, ($tab) => {
      $tab.addEventListener("click", () => {
        _reset();
        var name = attr($tab, _attr);
        var $target = this.el.contents.querySelector(`[${_attr}="${name}"]`);
        addClass($tab, className.tabactive);
        addClass($target, className.contentactive);
      }.bind(this));
    });
    var _reset = () => {
      [].forEach.call($tabs, ($tab) => {
        removeClass($tab, className.tabactive);
      });
      [].forEach.call($contents, ($content) => {
        removeClass($content, className.contentactive);
      });
    };
  }
  _setup() {
    this.el = {};
    this.el.main = elem({className: className.main});
    this.el.info = elem({className: className.info});
    this.el.contents = elem({className: className.contents});
    this.el.main.appendChild(this.el.info);
    this.el.main.appendChild(this.el.contents);
    this._transform();
  }
  _autorun() {
    if (this.autorun) {
      this.emit("run");
    }
  }
  _transform() {
    this._addCaption();
    this._addDescription();
    this._addCodeblock();
    this._addHtmlblock();
    this._addLogarea();
    this._addTab();
    this._addRunbtn();
  }
  _addCaption() {
    if (!this.caption) return;
    this.el.caption = elem({className: className.caption, text: this.caption});
    this._add(this.el.caption, true);
  }
  _addDescription() {
    if (!this.description) return;
    this.el.description = elem({className: className.content, text: this.description, attribute: {name: _attr, value:"description"}});
    addClass(this.el.description, className.description);
    this._add(this.el.description);
  }
  _addCodeblock() {
    var source = this.code ? this.code : this.script;
    this.el.codeblock = elem({className: className.content, attribute: {name: _attr, value:"js"}});
    this.el.codeblock.appendChild(scriptToCodeblock(source));
    addClass(this.el.codeblock, className.code);
    addClass(this.el.codeblock, className.contentactive);
    
    this._add(this.el.codeblock);
  }
  _addHtmlblock() {
    if (!this.html) return;
    this.el.htmlblock = elem({className: className.content, attribute: {name: _attr, value:"html"}});
    addClass(this.el.htmlblock, className.html);
    var pre = elem({type: "pre"});
    var code = elem({type: "code", className: "language-markup", text: this.html.join("\n")});
    pre.appendChild(code);
    this.el.htmlblock.appendChild(pre);
    this._add(this.el.htmlblock);
  }
  _addLogarea() {
    if (!this.log) return;
    var separate = elem({className: className.separate});
    this.el.logarea = elem({className: className.logarea});
    this.el.main.appendChild(separate);
    this.el.main.appendChild(this.el.logarea);
    this.console = new VisionLog({target: this.el.logarea});
  }
  _addRunbtn() {
    if (!this.script) return;
    var runbtn = elem({type: "button", className: className.runbtn, text: "run"});
    runbtn.addEventListener("click", () => this.emit("run") );
    this.el.tabs.appendChild(runbtn);
    this.el.runbtn = runbtn;
  }
  _addTab() {
    var tabs = elem({className: className.tabs});
    var current;
    if (this.script) {
      current = elem({className: className.tab, text:"JS", attribute: {name: _attr, value:"js"}});
      addClass(current, className.tabactive);
      tabs.appendChild(current);
      
    }
    if (this.html) {
      tabs.appendChild(elem({className: className.tab, text:"HTML", attribute: {name: _attr, value:"html"}}));
    }
    if (this.css) {
      tabs.appendChild(elem({className: className.tab, text:"CSS", attribute: {name: _attr, value:"css"}}));
    }
    if (this.description) {
      tabs.appendChild(elem({className: className.tab, text: "Description", attribute: {name: _attr, value:"description"}}));
    }
    this.el.main.insertBefore(tabs, this.el.contents);
    this.el.tabs = tabs;
  }
  _add(el, info) {
    if (info) {
      this.el.info.appendChild(el);
    }
    else {
      this.el.contents.appendChild(el);
    }
  }
  run() {
    if (typeof this.script === "function") {
      if (this.log) {
        this.console.enable();
        this.script();
        this._scrollBottom();
        this.console.disable();
      }
      else {
        this.script();
      }
    }
  }
  _scrollBottom() {
    this.el.logarea.scrollTop = this.el.logarea.scrollHeight;
  }
  evoke(targetElement) {
    targetElement.appendChild(this.el.main);
    if (Prism) {
      [].forEach.call(this.el.main.querySelectorAll("code"), (code) => {
        Prism.highlightElement(code);
      });
    }
  }
}
