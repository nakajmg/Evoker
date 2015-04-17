import typeOf from "./util/typeof";

var className = {
  log: "evoker__color--log",
  warn: "evoker__color--warn",
  error: "evoker__color--error"
};

export default class ConsoleToDom {
  constructor({output}) {
    this.types = ["log", "warn", "error"];
    this.output = output;
    this.origins = {};
    this.target = output.logarea || document.body;
    this._eventify();
    this._consolify();
  }
  _eventify() {
    this.output.on("enable", this._consolify.bind(this));
    this.output.on("disable", this._resetify.bind(this));
  }
  _resetify() {
    this.output.hideLogarea();
    this.types.forEach((type) => {
      console[type] = this.origins[type];
    });
  }
  _consolify() {
    this.output.showLogarea();
    this.types.forEach((type) => {
      this._interrupt({type});
    });
  }
  _interrupt({type}) {
    this.origins[type] = console[type];
    
    console[type] = (...args) => {
      this.origins[type].apply(console, args);
      var _wrap = document.createElement("div");
      _wrap.classList.add(className[type]);
      
      args.forEach((log) => {
        _wrap.appendChild(this._convert(log));
      }.bind(this));
      
      this._add(_wrap);
    };
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
    
    return this._createElement(ret);
  }
  _createElement(str) {
    return document.createTextNode(`${str}\n`);
  }
  _add(el) {
    this.target.appendChild(el);
  }
}
