/* ============================================================================
   hu09-asociar-suministro.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-09 · Como usuario quiero asociar un suministro por escáner o por DNI,
   para no digitar un número largo.
   ========================================================================== */

(function (A) {
  "use strict";
  var $ = A.$, el = A.el, money = A.money, MES = A.MES, ICON = A.ICON;
  var sum = A.sum, pendientes = A.pendientes, deuda = A.deuda, deudaTotal = A.deudaTotal, recibo = A.recibo;
  var go = A.go, back = A.back, root = A.root, current = A.current, render = A.render, save = A.save;
  var appbar = A.appbar, tabbar = A.tabbar, chrome = A.chrome, rowKV = A.rowKV, campo = A.campo, filaToggle = A.filaToggle;
  var toast = A.toast, sheet = A.sheet, hoy = A.hoy, hoyCompacto = A.hoyCompacto, horaActual = A.horaActual, aleatorio = A.aleatorio;
  /* Acciones que implementan otras historias: se resuelven al usarlas. */
  var dif = function (n) { return function () { return A[n].apply(null, arguments); }; };
  var confirmarPago = dif("confirmarPago"), accionesPdf = dif("accionesPdf"), verDocumento = dif("verDocumento");
  var compartir = dif("compartir"), historialPagos = dif("historialPagos"), elegirSuministro = dif("elegirSuministro");
  var pantallaBloqueo = dif("pantallaBloqueo");

  A.V.escaner = function (sc) {
    tabbar(null); chrome(appbar("Asociar suministro", { back: true }));
    sc.appendChild(el("div", { class: "col", html: "<b style='font-size:15px'>Escanea el código de barras o QR</b><span class='muted'>Apunta la cámara al código impreso en tu recibo.</span>" }));
    var box = el("div", { class: "scanbox" });
    [["top:12px;left:12px;border-right:0;border-bottom:0"], ["top:12px;right:12px;border-left:0;border-bottom:0"], ["bottom:12px;left:12px;border-right:0;border-top:0"], ["bottom:12px;right:12px;border-left:0;border-top:0"]]
      .forEach(function (p) { box.appendChild(el("span", { class: "corner", style: p[0] })); });
    var bars = el("div", { class: "bars" });
    for (var i = 0; i < 34; i++) bars.appendChild(el("i", { style: "height:" + (34 + (i % 5) * 9) + "px;width:" + (1 + (i % 4)) + "px" }));
    box.appendChild(bars);
    box.appendChild(el("span", { class: "scanline" }));
    sc.appendChild(box);
    var b = el("button", { class: "btn" }, "Detectar código");
    b.onclick = function () {
      var libre = A.S.catalogo.filter(function (c) { return !A.S.suministros.some(function (s) { return s.id === c.id; }); })[0];
      if (!libre) { toast("Ya asociaste todos los suministros de prueba"); return; }
      go("confirmar", { nuevo: libre });
    };
    sc.appendChild(b);
    var m = el("button", { class: "btn ghost" }, "Ingresar N° de suministro o DNI");
    m.onclick = function () { go("dni"); };
    sc.appendChild(m);
    sc.appendChild(el("div", { class: "tiny" }, "El código está en la parte inferior de tu recibo impreso."));
  };

  A.V.dni = function (sc) {
    tabbar(null); chrome(appbar("Asociar con DNI", { back: true }));
    sc.appendChild(campo("DNI del titular", "4289 1024"));
    sc.appendChild(campo("Fecha de emisión del DNI", "12 / 03 / 2019"));
    sc.appendChild(el("div", { class: "eyebrow" }, "Suministros encontrados"));
    var libres = A.S.catalogo.filter(function (c) { return !A.S.suministros.some(function (s) { return s.id === c.id; }); });
    if (!libres.length) sc.appendChild(el("div", { class: "note info" }, "No hay suministros pendientes de asociar en este prototipo."));
    libres.forEach(function (c) {
      var it = el("button", { class: "item" });
      it.appendChild(el("span", { class: "radio", "data-on": "1" }));
      it.appendChild(el("div", { class: "col", html: "<b>N° " + c.id + "</b><span class='tiny'>" + c.dir + "</span>" }));
      it.onclick = function () { go("confirmar", { nuevo: c }); };
      sc.appendChild(it);
    });
  };

  A.V.confirmar = function (sc) {
    tabbar(null); chrome(appbar("Confirmar suministro", { back: true }));
    var n = A.ctx.nuevo;
    sc.appendChild(el("div", { class: "note ok", html: "<b>Código detectado.</b> Verifica los datos antes de asociar el suministro." }));
    sc.appendChild(campo("N° de suministro", n.id, true));
    sc.appendChild(campo("Titular", n.titular + " · DNI " + n.dni, true));
    sc.appendChild(campo("Dirección", n.dir, true));
    var alias = campo("Alias (opcional)", A.ctx.alias || "");
    sc.appendChild(alias);
    var chips = el("div", { class: "row", style: "gap:7px;flex-wrap:wrap" });
    ["Casa", "Depa", "Local", "Casa Mamá"].forEach(function (a) {
      var b = el("button", { class: "chip-btn" }, a);
      b.onclick = function () { alias.querySelector("input").value = a; };
      chips.appendChild(b);
    });
    sc.appendChild(chips);
    var ok = el("button", { class: "btn" }, "Validar y asociar");
    ok.onclick = function () {
      var nombre = alias.querySelector("input").value || "Suministro " + n.id;
      A.S.suministros.push({ id: n.id, alias: nombre, dir: n.dir, titular: n.titular, lect: [860, 874],
        consumo: [{ m: "Abr", v: 9 }, { m: "May", v: 11 }, { m: "Jun", v: 12 }, { m: "Jul", v: 10 }, { m: "Ago", v: 13 }, { m: "Set", v: 14 }],
        recibos: [recibo(8, 2026, 14, "Pagado", 0, "30/09/2026"), recibo(7, 2026, 13, "Pagado", 0, "30/08/2026")] });
      A.S.activo = n.id; save(); root("home"); toast("Suministro " + n.id + " asociado como “" + nombre + "”");
    };
    sc.appendChild(ok);
  };
})(window.APP);
