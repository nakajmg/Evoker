import typeOf from "./util/typeof";

export default class ConsoleToDom {
  constructor({target}) {
    this.colors = {
      log:   'rgb(240, 240, 240)',
      warn:  'rgb(245, 228, 38)',
      error: 'rgb(255, 52, 52)'
    };
    this.types = ['log', 'warn', 'error'];
    this.el = target || document.body;
    
    this._interrupt({type: "log"});
  }
  _interrupt({type}) {
    var _origin = console[type];
    
    console[type] = (...args) => {
      _origin.apply(console, args);
      var _wrap = document.createElement("div");
      
      args.forEach((log) => {
        _wrap.appendChild(this._convert(log));
      }.bind(this));
      
      this._add(_wrap);
    };
  }
  _convert(log) {
    return this._createElement(log);
    console.log(log);
    // switch(typeOf(log)) {
    //   case "Function":
    //     break;
    // }
  }
  _createElement(str) {
    return document.createTextNode(`${str}\n`);
  }
  _add(el) {
    this.el.appendChild(el);
  }
}
