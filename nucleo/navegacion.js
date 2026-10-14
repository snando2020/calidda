/* ============================================================================
   navegacion.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   Enrutador: pila de pantallas, avance y retorno, y ciclo de dibujado con
   los efectos de entrada.
   ========================================================================== */

(function (A) {
  "use strict";
  var $ = A.$;

  A.stack = ["home"];
  A.ctx = {};
  A.demoDelay = false;
  function go(name, data, replace) {
    A.ctx = data || {};
    if (replace) A.stack[A.stack.length - 1] = name; else A.stack.push(name);
    render();
  }
  function back() { if (A.stack.length > 1) { A.stack.pop(); render(); } }
  function root(name) { A.stack = [name]; A.ctx = {}; render(); }
  var current = function () { return A.stack[A.stack.length - 1]; };

  A.V = {};

  var _prof = 1;
  function render() {
    var sc = $("#screen");
    var dir = A.stack.length > _prof ? "push" : (A.stack.length < _prof ? "pop" : "fade");
    _prof = A.stack.length;
    sc.innerHTML = "";
    (A.V[current()] || A.V.home)(sc);
    sc.scrollTop = 0;
    FX.transicion(sc, dir);      // entrada escalonada de las tarjetas
    FX.contarMontos(sc);         // los importes suben desde 0
    FX.aparecer($(".badge-circle", sc));
    FX.pasos(sc);                // avance automático de los pasos del pago
  }

  /* Registro en el espacio de nombres compartido */
  A.go = go;
  A.back = back;
  A.root = root;
  A.current = current;
  A.render = render;
})(window.APP);
