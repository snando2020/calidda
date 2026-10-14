/* ============================================================================
   efectos.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX

   Capa de EFECTOS: animaciones, transiciones y micro-interacciones.
   No contiene reglas de negocio. app.js la usa a través del objeto global FX.

   Todo respeta la preferencia del sistema "prefers-reduced-motion": si la
   persona pidió menos animación, los efectos se desactivan y la app sigue
   funcionando igual.
   ========================================================================== */
(function (global) {
  "use strict";

  var doc = global.document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  function nodo(tag, attrs, texto) {
    var n = doc.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  var CHECK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12.5 10 17l9-10"/></svg>';
  var VISTO = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12.5 10 17l9-10"/></svg>';

  /* ¿Movimiento reducido? */
  var quieto = false;
  try { quieto = !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}

  var FX = { reducido: quieto };

  /* ------------------------------------------------------------------ capa */
  function capa() { return $("#layer") || doc.body; }

  /* ---------------------------------------------------------------- toasts */
  /* Mensaje flotante inferior; se va solo a los 4.2 s y admite una acción. */
  FX.toast = function (mensaje, accion) {
    var cont = capa();
    var previo = $(".toast", cont); if (previo) previo.remove();
    var t = nodo("div", { class: "toast", role: "status" });
    t.appendChild(nodo("span", { html: VISTO }));
    t.appendChild(nodo("span", { style: "flex:1" }, mensaje));
    if (accion) {
      var a = nodo("button", { style: "font-weight:800;color:var(--brand-2)" }, accion[0]);
      a.onclick = function () { cerrar(); accion[1](); };
      t.appendChild(a);
    }
    cont.appendChild(t);
    function cerrar() {
      if (!t.parentNode) return;
      if (quieto) { t.remove(); return; }
      t.classList.add("fx-salir");
      setTimeout(function () { if (t.parentNode) t.remove(); }, 180);
    }
    FX._tt = setTimeout(cerrar, 4200);
    return t;
  };

  /* ------------------------------------------------------- hoja inferior */
  /* Bottom sheet: entra deslizando desde abajo y se cierra al tocar fuera. */
  FX.sheet = function (titulo, nodos) {
    var cont = capa();
    var fondo = nodo("div", { class: "sheet" });
    var caja = nodo("div", { class: "sheet-inner" });
    caja.appendChild(nodo("div", { class: "handle" }));
    if (titulo) caja.appendChild(nodo("h3", { style: "font-size:17px" }, titulo));
    (nodos || []).forEach(function (n) { caja.appendChild(n); });
    var cerrar = nodo("button", { class: "btn quiet" }, "Cerrar");
    cerrar.onclick = function () { salir(); };
    caja.appendChild(cerrar);
    fondo.appendChild(caja);
    fondo.onclick = function (e) { if (e.target === fondo) salir(); };
    cont.appendChild(fondo);

    function salir() {
      if (!fondo.parentNode) return;
      if (quieto) { fondo.remove(); return; }
      fondo.classList.add("fx-salir");
      caja.classList.add("fx-bajar");
      setTimeout(function () { if (fondo.parentNode) fondo.remove(); }, 200);
    }
    fondo.cerrar = salir;
    return fondo;
  };

  /* ------------------------------------------------ transición de pantalla */
  /* dir: "push" (avanza), "pop" (vuelve) o "fade" (misma profundidad). */
  FX.transicion = function (scope, dir) {
    if (!scope) return;
    scope.classList.remove("fx-push", "fx-pop", "fx-fade");
    if (quieto) return;
    void scope.offsetWidth;                                   // reinicia la animación
    scope.classList.add(dir === "pop" ? "fx-pop" : dir === "push" ? "fx-push" : "fx-fade");
    FX.escalonar(scope);
  };

  /* Entrada en cascada de los hijos directos del contenedor. */
  FX.escalonar = function (scope, paso) {
    if (!scope || quieto) return;
    paso = paso || 34;
    var hijos = scope.children;
    for (var i = 0; i < hijos.length; i++) hijos[i].style.animationDelay = Math.min(i * paso, 300) + "ms";
  };

  /* ------------------------------------------------- conteo de los importes */
  /* Cualquier ".amount" con formato "S/ 1234.56" sube desde 0 en ~0.6 s. */
  FX.contarMontos = function (scope) {
    if (!scope || quieto) return;
    $$(".amount", scope).forEach(function (n) {
      var m = /^S\/\s*([\d.]+)$/.exec((n.textContent || "").trim());
      if (!m) return;
      var fin = parseFloat(m[1]);
      if (!(fin > 0)) return;
      var ini = performance.now(), dur = 620;
      (function paso(ahora) {
        var p = Math.min(1, (ahora - ini) / dur);
        var e = 1 - Math.pow(1 - p, 3);                        // easeOutCubic
        n.textContent = "S/ " + (fin * e).toFixed(2);
        if (p < 1) requestAnimationFrame(paso);
        else n.textContent = "S/ " + fin.toFixed(2);
      })(ini);
    });
  };

  /* ------------------------------------------------------- error / sacudida */
  FX.sacudir = function (n) {
    if (!n || quieto) return;
    n.classList.remove("fx-shake"); void n.offsetWidth; n.classList.add("fx-shake");
  };

  /* --------------------------------------------- aparición (éxito del pago) */
  FX.aparecer = function (n) {
    if (!n || quieto) return;
    n.classList.remove("fx-pop-in"); void n.offsetWidth; n.classList.add("fx-pop-in");
  };

  /* ------------------------------------- pasos del pago que avanzan solos */
  FX.pasos = function (scope) {
    clearTimeout(FX._tp);
    if (!scope) return;
    var pasos = $$(".step", scope);
    if (pasos.length < 2) return;
    var i = 1;
    pasos[i].classList.add("run");
    function avanzar() {
      if (!doc.body.contains(pasos[i])) return;
      pasos[i].classList.remove("run");
      pasos[i].classList.add("done");
      var b = $(".bullet", pasos[i]); if (b) b.innerHTML = CHECK;
      i++;
      if (i < pasos.length) { pasos[i].classList.add("run"); FX._tp = setTimeout(avanzar, 740); }
    }
    FX._tp = setTimeout(avanzar, 820);
  };

  /* ---------------------------------------------------- onda al pulsar */
  /* Retroalimentación táctil en botones, filas y pestañas (delegada). */
  FX.ondas = function (raiz) {
    (raiz || doc).addEventListener("pointerdown", function (e) {
      if (quieto) return;
      var t = e.target;
      var b = t && t.closest ? t.closest(".btn,.item,.tab,.chip-btn,.iconbtn,.hu") : null;
      if (!b || b.disabled) return;
      var r = b.getBoundingClientRect();
      var d = Math.max(r.width, r.height) * 1.15;
      var o = nodo("span", { class: "fx-ripple" });
      o.style.width = o.style.height = d + "px";
      o.style.left = (e.clientX - r.left - d / 2) + "px";
      o.style.top = (e.clientY - r.top - d / 2) + "px";
      b.appendChild(o);
      setTimeout(function () { if (o.parentNode) o.remove(); }, 540);
    }, true);
  };

  /* ---------------------------------------------- reloj de la barra superior */
  FX.reloj = function (sel) {
    var n = $(sel); if (!n) return;
    function pinta() {
      var d = new Date();
      n.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }
    pinta();
    clearInterval(FX._tr);
    FX._tr = setInterval(pinta, 30000);
  };

  /* ------------------------------------------- vista wireframe (escala grises) */
  FX.wireframe = function (boton, device) {
    var on = device.classList.toggle("wire");
    boton.setAttribute("aria-pressed", on ? "true" : "false");
    boton.textContent = on ? "Ver en alta fidelidad" : "Ver como wireframe";
    FX.toast(on ? "Vista wireframe: escala de grises" : "Vista en alta fidelidad");
    return on;
  };

  global.FX = FX;
})(window);
