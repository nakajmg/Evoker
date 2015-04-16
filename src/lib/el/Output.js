export default class OutputElement {
  constructor() {
    this.el = document.createElement("div");
    this._applyStyle(this._defaultStyle());
    document.body.appendChild(this.el);
  }
  _defaultStyle() {
    return {
      color: '#15df30',
      padding: '5px 7px',
      backgroundColor: '#333',
      lineHeight: '1.5',
      fontSize: '12px',
      fontFamily: '"Ubuntu Mono", sans-serif',
      border: '1px solid #000',
      borderRadius: '2px',
      margin: '0',
      minHeight: '19px',
      whiteSpace: 'pre',
      letterSpacing: '0.1em'
    };
  }
  _applyStyle(style) {
    for(var key in style) {
      if (style.hasOwnProperty(key)) {
        this.el.style[key] = style[key];
      }
    }
  }
}
