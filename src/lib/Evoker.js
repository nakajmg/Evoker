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
  }
  add({script, code, html, autorun, caption, description, log}) {
    var vision = new Vision({script, code, html, autorun, caption, description, log});
    vision.evoke(this.target);
    this.visions.push(vision);
    
    return this;
  }
}

var output = new OutputElement();

var evoker = new Evoker({output});

export default evoker;
