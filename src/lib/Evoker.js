import {EventEmitter2 as EventEmitter} from "eventemitter2";
import ConsoleToDom from "./ConsoleToDom";
import OutputElement from "./el/Output";
// import scriptToCodeblock from "./util/scriptToCodeblock";
import Vision from "./Vision";

class Evoker extends EventEmitter {
  constructor() {
    super();
    this.visions = [];
  }
  _eventify() {
    
  }
  add({script, code, html, autorun}) {
    var vision = new Vision({script, code, html, autorun});
    this.visions.push(vision);
    
    return this;
  }
}

var output = new OutputElement();
var logger = new ConsoleToDom({target: output.el});

var evoker = new Evoker();

export default evoker;
