/* ============================================================================
   ui.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   Componentes de interfaz compartidos: utilidades del DOM, iconografía,
   encabezado, barra de pestañas, avisos, hojas inferiores y campos de formulario.
   ========================================================================== */

(function (A) {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (t, a, h) { var n = document.createElement(t); if (a) for (var k in a) { if (k === "class") n.className = a[k]; else if (k === "html") n.innerHTML = a[k]; else n.setAttribute(k, a[k]); } if (h !== undefined) n.textContent = h; return n; };
  var money = function (v) { return "S/ " + v.toFixed(2); };
  var MES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];
  var ICON = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M7 3h7l4 4v14H7z"/><path d="M10 12h6M10 16h6"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10.5h18"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="18" cy="12" r="1.9"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 5l-7 7 7 7"/></svg>',
    share: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 15V4m0 0L8 8m4-4 4 4"/><path d="M5 13v6h14v-6"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 16V11a6 6 0 1 0-12 0v5l-1.5 2.5h15z"/><path d="M10 20.5h4"/></svg>',
    down: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12.5 10 17l9-10"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };

  function appbar(title, opt) {
    opt = opt || {};
    var bar = el("div", { class: "appbar" + (opt.left ? " left" : "") });
    if (opt.back) { var b = el("button", { class: "iconbtn", "aria-label": "Volver", html: ICON.back }); b.onclick = opt.onBack || function () { A.back(); }; bar.appendChild(b); }
    else bar.appendChild(el("span", { style: "width:44px;flex:none" }));
    bar.appendChild(el("h2", null, title));
    if (opt.right) { var r = el("button", { class: "iconbtn", "aria-label": opt.rightLabel || "Acción", html: opt.right }); r.onclick = opt.onRight || function () {}; bar.appendChild(r); }
    else bar.appendChild(el("span", { style: "width:44px;flex:none" }));
    return bar;
  }
  function tabbar(active) {
    var tabs = [["home", "Inicio", ICON.home], ["recibos", "Recibos", ICON.doc], ["pagar", "Pagar", ICON.card], ["mas", "Más", ICON.more]];
    var nav = $("#tabbar"); nav.innerHTML = "";
    tabs.forEach(function (t) {
      var b = el("button", { class: "tab", html: t[2] + "<span>" + t[1] + "</span>" });
      if (t[0] === active) b.setAttribute("aria-current", "page");
      b.onclick = function () { A.root(t[0]); };
      nav.appendChild(b);
    });
    nav.hidden = !active;
  }
  // Las animaciones y micro-interacciones viven en efectos.js (objeto global FX).
  var toast = function (msg, accion) { return FX.toast(msg, accion); };
  var sheet = function (titulo, nodos) { return FX.sheet(titulo, nodos); };
  // ---------------------------------------------------------------- utilidades de UI
  function rowKV(k, v) { return el("div", { class: "row between", html: "<span class='muted'>" + k + "</span><b style='font-size:13px;text-align:right;font-variant-numeric:tabular-nums'>" + v + "</b>" }); }
  function campo(label, valor, readonly, id) {
    var f = el("div", { class: "field" });
    var i = "f" + (id || label.replace(/[^a-z]/gi, "").toLowerCase());
    f.appendChild(el("label", { for: i }, label));
    var inp = el("input", { id: i, value: valor || "" });
    if (readonly) inp.setAttribute("readonly", "readonly");
    f.appendChild(inp);
    return f;
  }
  function filaToggle(key, label) {
    var r = el("div", { class: "row between" });
    r.appendChild(el("span", { style: "font-size:13.5px" }, label));
    var b = el("button", { class: "toggle", "aria-pressed": A.S.notif[key] ? "true" : "false", "aria-label": label });
    b.onclick = function () { A.S.notif[key] = !A.S.notif[key]; save(); b.setAttribute("aria-pressed", A.S.notif[key] ? "true" : "false"); };
    r.appendChild(b);
    return r;
  }
  function chrome(node) { var c = $("#chrome"); c.innerHTML = ""; if (node) c.appendChild(node); }
  function hoy() { var d = new Date(); return d.getDate() + " " + MES[d.getMonth()].slice(0, 3) + " " + d.getFullYear(); }
  function hoyCompacto() { var d = new Date(); return "" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }
  function horaActual() { var d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
  function aleatorio() { return String(Math.floor(1000 + Math.random() * 8999)); }

  /* Registro en el espacio de nombres compartido */
  A.$ = $;
  A.el = el;
  A.money = money;
  A.MES = MES;
  A.ICON = ICON;
  A.appbar = appbar;
  A.tabbar = tabbar;
  A.toast = toast;
  A.sheet = sheet;
  A.rowKV = rowKV;
  A.campo = campo;
  A.filaToggle = filaToggle;
  A.chrome = chrome;
  A.hoy = hoy;
  A.hoyCompacto = hoyCompacto;
  A.horaActual = horaActual;
  A.aleatorio = aleatorio;
})(window.APP);
