import typeOf from "./util/typeof";
import elem from "./util/elem";
import {addClass} from "./util/elem";
import {removeClass} from "./util/elem";

var className = {
  log: "evoker__color--log",
  warn: "evoker__color--warn",
  error: "evoker__color--error",
  latest: "evoker__color--latest"
};

var types = ["log", "warn", "error"];
var origins = {};

types.forEach((type) => {
  origins[type] = console[type];
});

var _log = (type, args, vlog) => {
  var wrapElem = vlog._createWrapElem(type);
  args.forEach((log) => {
    wrapElem.appendChild(vlog._convert(log));
  });
  
  vlog.target.appendChild(wrapElem);
};


export default class VisionLog {
  constructor({target}) {
    this.target = target;
  }
  log(...args) {
    var type = "log";
    origins[type].call(console, ...args);
    _log(type, args, this);
  }
  warn(...args) {
    var type = "warn";
    origins[type].call(console, ...args);
    _log(type, args, this);
  }
  error(...args) {
    var type ="error";
    origins[type].call(console, ...args);
    _log(type, args, this);
  }
  enable() {
    types.forEach((type) => {
      console[type] = this[type].bind(this);
    }.bind(this));
  }
  disable() {
    types.forEach((type) => {
      console[type] = origins[type];
    });
  }
  removeLatestClass() {
    var $latests = this.target.querySelectorAll(`.${className.latest}`);
    [].forEach.call($latests, ($latest) => {
      removeClass($latest, className.latest);
    });
  }
  _createWrapElem(type) {
    var el = elem({className: className[type]});
    addClass(el, className.latest);
    return el;
  }
  _convert(log) {
    var ret;
    switch(typeOf(log)) {
      case "String":
        ret = log;
        break;
      case "Object":
        ret = JSON.stringify(log, null, 2);
        break;
      // Todo: ElementとかFunctionのときの書く
      default:
        ret = log;
    }
    
    return this._createLog(ret);
  }
  _createLog(str) {
    return document.createTextNode(`${str}\n`);
  }
}
