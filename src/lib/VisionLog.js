import typeOf from "./util/typeof";

var className = {
  log: "evoker__color--log",
  warn: "evoker__color--warn",
  error: "evoker__color--error"
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
  _createWrapElem(type) {
    var div = document.createElement("div");
    div.classList.add(className[type]);
    return div;
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
