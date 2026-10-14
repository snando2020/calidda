/* ============================================================================
   hu04-grafica-de-consumo.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-04 · Como usuario quiero comparar mi consumo en metros cúbicos y en
   soles, para identificar si mi consumo subió.
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

  A.V.consumo = function (sc) {
    tabbar(null); chrome(appbar("Mi consumo", { back: true }));
    var s = sum(), unidad = A.S.unidad;
    var seg = el("div", { class: "seg" });
    var t1 = el("button", { "aria-pressed": "false" }, "Recibo"), t2 = el("button", { "aria-pressed": "true" }, "Mi consumo");
    t1.onclick = function () { go("detalle", { recibo: (pendientes(s)[0] || s.recibos[0]).id }, true); };
    seg.appendChild(t1); seg.appendChild(t2); sc.appendChild(seg);

    var head = el("div", { class: "row between" });
    head.appendChild(el("b", null, "Últimos 6 meses"));
    var ug = el("div", { class: "seg", style: "width:120px" });
    ["m3", "soles"].forEach(function (u) {
      var b = el("button", { "aria-pressed": unidad === u ? "true" : "false" }, u === "m3" ? "m³" : "S/");
      b.onclick = function () { A.S.unidad = u; save(); render(); };
      ug.appendChild(b);
    });
    head.appendChild(ug); sc.appendChild(head);

    var datos = s.consumo.map(function (c) { return { m: c.m, v: unidad === "m3" ? c.v : +(c.v * TARIFA).toFixed(2) }; });
    var proy = datos[5].v * 0.95;
    var prom = datos.reduce(function (a, c) { return a + c.v; }, 0) / datos.length;
    var maxv = Math.max.apply(null, datos.map(function (d) { return d.v; }).concat([proy])) * 1.18;
    var W = 330, H = 190, pad = 26, bw = 28, step = (W - pad - 10) / 7;
    var svg = ['<svg viewBox="0 0 ' + W + " " + (H + 34) + '" width="100%" height="' + (H + 34) + '" role="img" aria-label="Consumo de los últimos seis meses">'];
    for (var g = 0; g <= 3; g++) {
      var gy = H - (H - 24) * g / 3;
      svg.push('<line x1="' + pad + '" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="var(--line)" stroke-width="1"/>');
      svg.push('<text x="' + (pad - 6) + '" y="' + (gy + 4) + '" font-size="9" fill="var(--ink-3)" text-anchor="end">' + Math.round(maxv * g / 3) + "</text>");
    }
    datos.concat([{ m: "Oct*", v: proy, proy: true }]).forEach(function (d, i) {
      var h = (H - 24) * d.v / maxv, x = pad + 6 + i * step, y = H - h;
      if (d.proy) svg.push('<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + h + '" rx="6" fill="none" stroke="var(--brand)" stroke-dasharray="4 3"/>');
      else svg.push('<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + h + '" rx="6" fill="' + (i === 5 ? "var(--brand)" : "var(--line)") + '"/>');
      svg.push('<text x="' + (x + bw / 2) + '" y="' + (H + 15) + '" font-size="9.5" fill="' + (i === 5 ? "var(--ink)" : "var(--ink-3)") + '" text-anchor="middle">' + d.m + "</text>");
      svg.push('<text x="' + (x + bw / 2) + '" y="' + (y - 5) + '" font-size="9" fill="var(--ink-2)" text-anchor="middle">' + (unidad === "m3" ? Math.round(d.v) : d.v.toFixed(0)) + "</text>");
    });
    var py = H - (H - 24) * prom / maxv;
    svg.push('<line x1="' + pad + '" y1="' + py + '" x2="' + W + '" y2="' + py + '" stroke="var(--warn)" stroke-dasharray="5 4" stroke-width="1.5"/>');
    svg.push('<text x="' + W + '" y="' + (py - 5) + '" font-size="9" fill="var(--warn)" text-anchor="end">Promedio ' + (unidad === "m3" ? prom.toFixed(1) + " m³" : money(prom)) + "</text>");
    svg.push("</svg>");
    var chart = el("div", { class: "card chart-wrap", html: svg.join("") });
    sc.appendChild(chart);
    sc.appendChild(el("div", { class: "tiny" }, "* Octubre es una proyección calculada con tu tendencia de consumo."));

    var k = el("div", { style: "display:grid;grid-template-columns:repeat(3,1fr);gap:8px" });
    var actual = datos[5].v, dif = Math.round((actual / prom - 1) * 100);
    [["Promedio", unidad === "m3" ? prom.toFixed(1) + " m³" : money(prom), ""],
     ["Mes actual", unidad === "m3" ? actual + " m³" : money(actual), (dif >= 0 ? "+" : "") + dif + "% vs prom."],
     ["Proyección", unidad === "m3" ? proy.toFixed(0) + " m³" : money(proy), "Octubre"]].forEach(function (p) {
      k.appendChild(el("div", { class: "kpi", html: '<span class="tiny">' + p[0] + "</span><b>" + p[1] + '</b><span class="tiny">' + p[2] + "</span>" }));
    });
    sc.appendChild(k);
    sc.appendChild(el("div", { class: "note warn", html: "<div><b>Consumiste " + Math.abs(dif) + "% " + (dif >= 0 ? "más" : "menos") + " que tu promedio.</b><br>Revisa el uso de la terma y la cocina para ajustar tu próximo recibo.</div>" }));
  };
})(window.APP);
