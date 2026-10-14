/* ============================================================================
   hu02-desglose-del-recibo.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-02 · Como usuaria quiero ver el desglose del recibo concepto por
   concepto, para entender por qué subió el monto.
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

  A.V.detalle = function (sc) {
    tabbar(null);
    var s = sum(), r = s.recibos.filter(function (x) { return x.id === A.ctx.recibo; })[0] || pendientes(s)[0] || s.recibos[0];
    chrome(appbar("Detalle de recibo", { back: true, right: ICON.share, rightLabel: "Compartir", onRight: function () { compartir("Recibo " + r.mes + " " + r.anio + " · " + money(r.total)); } }));
    var seg = el("div", { class: "seg" });
    var t1 = el("button", { "aria-pressed": "true" }, "Recibo"), t2 = el("button", { "aria-pressed": "false" }, "Mi consumo");
    t2.onclick = function () { go("consumo"); };
    seg.appendChild(t1); seg.appendChild(t2); sc.appendChild(seg);

    var head = el("div", { class: "card", style: "display:flex;flex-direction:column;gap:6px" });
    head.appendChild(el("div", { class: "row between", html: '<span class="muted">Recibo ' + r.mes + " " + r.anio + '</span><span class="pill ' + (r.estado === "Pendiente" ? "warn" : "ok") + '"><i class="dot"></i>' + r.estado + "</span>" }));
    head.appendChild(el("div", { class: "amount" }, money(r.total)));
    head.appendChild(el("div", { class: "tiny" }, "Emitido " + r.emitido + " · vence " + r.vence + " · suministro " + s.id));
    sc.appendChild(head);

    var lect = el("div", { class: "card flat", style: "display:grid;grid-template-columns:repeat(3,1fr);gap:8px" });
    [["Lectura anterior", s.lect[0] + " m³"], ["Lectura actual", s.lect[1] + " m³"], ["Consumo", r.m3 + " m³"]].forEach(function (p, i) {
      lect.appendChild(el("div", { class: "col", html: '<span class="tiny">' + p[0] + '</span><b style="font-size:15px;color:' + (i === 2 ? "var(--brand)" : "inherit") + '">' + p[1] + "</b>" }));
    });
    sc.appendChild(lect);

    // HU-02 · desglose en dos niveles
    var box = el("div", { class: "card", style: "display:flex;flex-direction:column;gap:10px" });
    var toggle = el("button", { class: "row between", style: "width:100%" });
    toggle.appendChild(el("b", null, "Desglose de conceptos"));
    var caret = el("span", { class: "tiny" }, A.ctx.open ? "Ocultar" : "Ver detalle");
    toggle.appendChild(caret); box.appendChild(toggle);
    var det = el("div", { class: "list", style: "gap:7px" });
    if (A.ctx.open) {
      [["Consumo de gas (" + r.m3 + " m³)", r.gas, "Variable"], ["Cargo fijo de distribución", r.fijo, "Fijo"], ["Mantenimiento de red", r.mant, "Fijo"]]
        .concat(r.cuota ? [["Cuota CrediCálidda", r.cuota, "Financiamiento"]] : [])
        .forEach(function (c) {
          det.appendChild(el("div", { class: "row between", html: "<div class='col'><span style='font-size:13.5px'>" + c[0] + "</span><span class='tiny'>" + c[2] + "</span></div><b style='font-variant-numeric:tabular-nums'>" + money(c[1]) + "</b>" }));
        });
      det.appendChild(el("div", { style: "height:1px;background:var(--line)" }));
      det.appendChild(el("div", { class: "row between", html: "<b>Total facturado (IGV incluido)</b><b style='font-variant-numeric:tabular-nums'>" + money(r.total) + "</b>" }));
    } else {
      det.appendChild(el("div", { class: "tiny" }, (r.cuota ? 4 : 3) + " conceptos: consumo variable, cargos fijos" + (r.cuota ? " y cuota de financiamiento" : "") + "."));
    }
    box.appendChild(det);
    toggle.onclick = function () { A.ctx.open = !A.ctx.open; render(); };
    sc.appendChild(box);

    var acts = el("div", { class: "grid2" });
    var pdf = el("button", { class: "btn ghost sm" }, "Descargar PDF");
    pdf.onclick = function () { accionesPdf(r, s); };
    var pay = el("button", { class: "btn sm" }, r.estado === "Pendiente" ? "Pagar este recibo" : "Recibo pagado");
    pay.disabled = r.estado !== "Pendiente";
    pay.onclick = function () { go("metodo", { items: [{ sid: s.id, rid: r.id }] }); };
    acts.appendChild(pdf); acts.appendChild(pay); sc.appendChild(acts);
  };
})(window.APP);
