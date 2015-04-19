import {EventEmitter2 as EventEmitter} from "eventemitter2";
import ConsoleToDom from "./ConsoleToDom";
import OutputElement from "./el/Output";
// import scriptToCodeblock from "./util/scriptToCodeblock";
import Vision from "./Vision";

class Evoker extends EventEmitter {
  constructor({output}) {
    super();
    this.visions = [];
    this.output = output;
    this.target = output.codearea;
    this._define();
  }
  _define() {
    Object.defineProperty(this, "log", {
      get() {
        return c;
      },
      set(tf) {
        if (tf === false) {
          this.output.emit("disable");
        }
        else {
          this.output.emit("enable");
        }
      }
    });
  }
  add({script, code, html, autorun}) {
    var vision = new Vision({script, code, html, autorun});
    vision.evoke(this.target);
    this.visions.push(vision);
    
    return this;
  }
}

var output = new OutputElement();
// var logger = new ConsoleToDom({output});

var evoker = new Evoker({output});

export default evoker;
