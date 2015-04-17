(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.evoker = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "./lib/Evoker"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("./lib/Evoker"));
  }
})(function (exports, module, _libEvoker) {
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var evoker = _interopRequire(_libEvoker);

  module.exports = evoker;
});

},{"./lib/Evoker":4}],2:[function(require,module,exports){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {

      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    configure.call(this, conf);
  }

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else if(typeof tree._listeners === 'function') {
          tree._listeners = [tree._listeners, listener];
        }
        else if (isArray(tree._listeners)) {

          tree._listeners.push(listener);

          if (!tree._listeners.warned) {

            var m = defaultMaxListeners;

            if (typeof this._events.maxListeners !== 'undefined') {
              m = this._events.maxListeners;
            }

            if (m > 0 && tree._listeners.length > m) {

              tree._listeners.warned = true;
              console.error('(node) warning: possible EventEmitter memory ' +
                            'leak detected. %d listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit.',
                            tree._listeners.length);
              console.trace();
            }
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    this._events || init.call(this);
    this._events.maxListeners = n;
    if (!this._conf) this._conf = {};
    this._conf.maxListeners = n;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(this, arguments);
    }

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) { return false; }
    }

    // Loop through the *_all* functions and invoke them.
    if (this._all) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        this._all[i].apply(this, args);
      }
    }

    // If there is no 'error' event listener then throw.
    if (type === 'error') {

      if (!this._all &&
        !this._events.error &&
        !(this.wildcard && this.listenerTree.error)) {

        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }

    var handler;

    if(this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    }
    else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      if (arguments.length === 1) {
        handler.call(this);
      }
      else if (arguments.length > 1)
        switch (arguments.length) {
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            handler.apply(this, args);
        }
      return true;
    }
    else if (handler) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        this.event = type;
        listeners[i].apply(this, args);
      }
      return (listeners.length > 0) || !!this._all;
    }
    else {
      return !!this._all;
    }

  };

  EventEmitter.prototype.on = function(type, listener) {

    if (typeof type === 'function') {
      this.onAny(type);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if(this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else if(typeof this._events[type] === 'function') {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
    else if (isArray(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (!this._events[type].warned) {

        var m = defaultMaxListeners;

        if (typeof this._events.maxListeners !== 'undefined') {
          m = this._events.maxListeners;
        }

        if (m > 0 && this._events[type].length > m) {

          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    }
    return this;
  };

  EventEmitter.prototype.onAny = function(fn) {

    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if(!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }
        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }
      }
    }

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          return this;
        }
      }
    } else {
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else {
      if (!this._events[type]) return this;
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if(this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
     // AMD. Register as an anonymous module.
    define(function() {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    exports.EventEmitter2 = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

},{}],3:[function(require,module,exports){
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "./util/typeof"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("./util/typeof"));
  }
})(function (exports, module, _utilTypeof) {
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var typeOf = _interopRequire(_utilTypeof);

  var className = {
    log: "evoker__color--log",
    warn: "evoker__color--warn",
    error: "evoker__color--error"
  };

  var ConsoleToDom = (function () {
    function ConsoleToDom(_ref) {
      var output = _ref.output;

      _classCallCheck(this, ConsoleToDom);

      this.types = ["log", "warn", "error"];
      this.output = output;
      this.origins = {};
      this.target = output.logarea || document.body;
      this._eventify();
      this._consolify();
    }

    _createClass(ConsoleToDom, {
      _eventify: {
        value: function _eventify() {
          this.output.on("enable", this._consolify.bind(this));
          this.output.on("disable", this._resetify.bind(this));
        }
      },
      _resetify: {
        value: function _resetify() {
          var _this = this;

          this.output.hideLogarea();
          this.types.forEach(function (type) {
            console[type] = _this.origins[type];
          });
        }
      },
      _consolify: {
        value: function _consolify() {
          var _this = this;

          this.output.showLogarea();
          this.types.forEach(function (type) {
            _this._interrupt({ type: type });
          });
        }
      },
      _interrupt: {
        value: function _interrupt(_ref) {
          var _this = this;

          var type = _ref.type;

          this.origins[type] = console[type];

          console[type] = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            _this.origins[type].apply(console, args);
            var _wrap = document.createElement("div");
            _wrap.classList.add(className[type]);

            args.forEach((function (log) {
              _wrap.appendChild(_this._convert(log));
            }).bind(_this));

            _this._add(_wrap);
          };
        }
      },
      _convert: {
        value: function _convert(log) {
          var ret;
          switch (typeOf(log)) {
            case "String":
              ret = log;
              break;
            case "Object":
              ret = JSON.stringify(log, null, 2);
              break;
            default:
              ret = log;
          }

          return this._createElement(ret);
        }
      },
      _createElement: {
        value: function _createElement(str) {
          return document.createTextNode("" + str + "\n");
        }
      },
      _add: {
        value: function _add(el) {
          this.target.appendChild(el);
        }
      }
    });

    return ConsoleToDom;
  })();

  module.exports = ConsoleToDom;
});

},{"./util/typeof":9}],4:[function(require,module,exports){
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "eventemitter2", "./ConsoleToDom", "./el/Output", "./Vision"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("eventemitter2"), require("./ConsoleToDom"), require("./el/Output"), require("./Vision"));
  }
})(function (exports, module, _eventemitter2, _ConsoleToDom, _elOutput, _Vision) {
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var EventEmitter = _eventemitter2.EventEmitter2;

  var ConsoleToDom = _interopRequire(_ConsoleToDom);

  var OutputElement = _interopRequire(_elOutput);

  // import scriptToCodeblock from "./util/scriptToCodeblock";

  var Vision = _interopRequire(_Vision);

  var Evoker = (function (_EventEmitter) {
    function Evoker(_ref) {
      var output = _ref.output;

      _classCallCheck(this, Evoker);

      _get(Object.getPrototypeOf(Evoker.prototype), "constructor", this).call(this);
      this.visions = [];
      this.output = output;
      this.target = output.codearea;
      this._define();
    }

    _inherits(Evoker, _EventEmitter);

    _createClass(Evoker, {
      _define: {
        value: function _define() {
          Object.defineProperty(this, "log", {
            get: function get() {
              return c;
            },
            set: function set(tf) {
              if (tf === false) {
                this.output.emit("disable");
              } else {
                this.output.emit("enable");
              }
            }
          });
        }
      },
      add: {
        value: function add(_ref) {
          var script = _ref.script;
          var code = _ref.code;
          var html = _ref.html;
          var autorun = _ref.autorun;

          var vision = new Vision({ script: script, code: code, html: html, autorun: autorun });
          vision.evoke(this.target);
          this.visions.push(vision);

          return this;
        }
      }
    });

    return Evoker;
  })(EventEmitter);

  var output = new OutputElement();
  var logger = new ConsoleToDom({ output: output });

  var evoker = new Evoker({ output: output });

  module.exports = evoker;
});

},{"./ConsoleToDom":3,"./Vision":5,"./el/Output":6,"eventemitter2":2}],5:[function(require,module,exports){
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "eventemitter2", "./util/fnToString", "./util/scriptToCodeblock"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("eventemitter2"), require("./util/fnToString"), require("./util/scriptToCodeblock"));
  }
})(function (exports, module, _eventemitter2, _utilFnToString, _utilScriptToCodeblock) {
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var EventEmitter = _eventemitter2.EventEmitter2;

  var fnToString = _interopRequire(_utilFnToString);

  var scriptToCodeblock = _interopRequire(_utilScriptToCodeblock);

  var Prism = Prism || undefined;

  var className = {
    el: "evoker__vision",
    btn: "evoker__runBtn"
  };

  var Vision = (function (_EventEmitter) {
    function Vision(_ref) {
      var script = _ref.script;
      var code = _ref.code;
      var html = _ref.html;
      var autorun = _ref.autorun;
      var description = _ref.description;

      _classCallCheck(this, Vision);

      _get(Object.getPrototypeOf(Vision.prototype), "constructor", this).call(this);
      this.script = script;
      this.code = code;
      this.html = html;
      this.autorun = autorun;

      this._eventify();
      this._setup();
    }

    _inherits(Vision, _EventEmitter);

    _createClass(Vision, {
      _eventify: {
        value: function _eventify() {
          this.on("run", this.run);
        }
      },
      _setup: {
        value: function _setup() {
          this.el = document.createElement("div");
          this.el.classList.add(className.el);
          this._transform();
          this._autorun();
        }
      },
      _autorun: {
        value: function _autorun() {
          if (this.autorun) {
            this.emit("run");
          }
        }
      },
      _transform: {
        value: function _transform() {
          this._addCodeblock();
          this._addHtmlblock();
          this._addRunbtn();
        }
      },
      _addCodeblock: {
        value: function _addCodeblock() {
          var source = this.code ? this.code : this.script;
          this.codeblock = scriptToCodeblock(source);
          this.el.appendChild(this.codeblock);
        }
      },
      _addHtmlblock: {
        value: function _addHtmlblock() {
          if (!this.html) {
            return;
          }var pre = document.createElement("pre");
          var code = document.createElement("code");
          code.classList.add("language-markup");
          pre.appendChild(code);
          code.textContent = this.html.join("\n");

          this.el.appendChild(pre);
        }
      },
      _addRunbtn: {
        value: function _addRunbtn() {
          var _this = this;

          if (!this.script) {
            return;
          }var runbtn = document.createElement("button");
          runbtn.classList.add(className.btn);
          runbtn.textContent = "run";
          runbtn.addEventListener("click", function () {
            return _this.emit("run");
          });
          this.el.appendChild(runbtn);
        }
      },
      run: {
        value: function run() {
          if (typeof this.script === "function") {
            this.script();
          }
        }
      },
      evoke: {
        value: function evoke(targetElement) {
          targetElement.appendChild(this.el);
          if (Prism) {
            [].forEach.call(this.el.querySelectorAll("code"), function (code) {
              Prism.highlightElement(code);
            });
          }
        }
      }
    });

    return Vision;
  })(EventEmitter);

  module.exports = Vision;
});

},{"./util/fnToString":7,"./util/scriptToCodeblock":8,"eventemitter2":2}],6:[function(require,module,exports){
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "eventemitter2"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("eventemitter2"));
  }
})(function (exports, module, _eventemitter2) {
  var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var EventEmitter = _eventemitter2.EventEmitter2;

  var OutputElement = (function (_EventEmitter) {
    function OutputElement() {
      _classCallCheck(this, OutputElement);

      _get(Object.getPrototypeOf(OutputElement.prototype), "constructor", this).call(this);
      this.logarea = document.createElement("div");
      this.codearea = document.createElement("div");
      this.logarea.classList.add("evoker__log");
      this.codearea.classList.add("evoker__visions");

      document.body.appendChild(this.codearea);
      document.body.appendChild(this.logarea);
    }

    _inherits(OutputElement, _EventEmitter);

    _createClass(OutputElement, {
      showLogarea: {
        value: function showLogarea() {
          this._show(this.logarea);
        }
      },
      hideLogarea: {
        value: function hideLogarea() {
          this._hide(this.logarea);
        }
      },
      _show: {
        value: function _show(el) {
          el.style.display = "block";
        }
      },
      _hide: {
        value: function _hide(el) {
          el.style.display = "none";
        }
      }
    });

    return OutputElement;
  })(EventEmitter);

  module.exports = OutputElement;
});

},{"eventemitter2":2}],7:[function(require,module,exports){
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module);
  }
})(function (exports, module) {
  module.exports = fnToString;

  function fnToString(fn) {
    var codestring = fn.toString().split("\n");
    codestring.splice(-1, 1);
    codestring.splice(0, 1);
    var firstIndent = codestring[0].match(/^\s*/)[0];
    var reg = new RegExp("^" + firstIndent);
    for (var i = 0, leng = codestring.length; i < leng; i++) {
      codestring[i] = codestring[i].replace(reg, "");
    }
    return codestring.join("\n");
  }
});

},{}],8:[function(require,module,exports){
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "./fnToString"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("./fnToString"));
  }
})(function (exports, module, _fnToString) {
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  module.exports = scriptToCodeblock;

  var fnToString = _interopRequire(_fnToString);

  var className = {
    code: "language-javascript"
  };

  function scriptToCodeblock(script) {
    var pre = document.createElement("pre");
    var code = document.createElement("code");
    code.classList.add(className.code);
    code.textContent = fnToString(script);
    pre.appendChild(code);

    return pre;
  }
});

},{"./fnToString":7}],9:[function(require,module,exports){
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module);
  }
})(function (exports, module) {
  module.exports = typeOf;

  function typeOf(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  }
});

},{}]},{},[1])(1)
});