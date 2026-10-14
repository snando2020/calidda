/* ============================================================================
   hu01-estado-de-cuenta.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-01 · Como usuaria titular de un suministro quiero ver cuánto debo y
   cuándo vence en la primera pantalla, para saber si estoy al día.
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

  A.V.home = function (sc) {
    tabbar("home"); chrome(null);
    var head = el("div", { class: "row between" });
    head.appendChild(el("div", { class: "col", html: '<div class="h-title">Hola, ' + A.S.nombre.split(" ")[0] + '</div><div class="muted">Mis suministros</div>' }));
    var bell = el("button", { class: "iconbtn", "aria-label": "Notificaciones", html: ICON.bell }); bell.onclick = function () { go("ajustes"); };
    head.appendChild(bell); sc.appendChild(head);

    A.S.suministros.forEach(function (s) {
      var d = deuda(s), pend = pendientes(s);
      var c = el("div", { class: "card", style: "display:flex;flex-direction:column;gap:11px" });
      var top = el("div", { class: "row between" });
      top.appendChild(el("div", { class: "col", html: '<b style="font-size:15.5px">' + s.alias + '</b><span class="tiny">N° ' + s.id + " · " + s.dir + "</span>" }));
      top.appendChild(el("span", { class: "pill ok", html: '<i class="dot"></i>Activo' }));
      c.appendChild(top);
      c.appendChild(el("div", { style: "height:1px;background:var(--line)" }));
      if (d === 0) {
        c.appendChild(el("div", { class: "note ok", html: '<b>¡Estás al día!</b> Deuda actual: S/ 0.00' }));
        c.appendChild(el("div", { class: "tiny" }, "Próximo recibo estimado: 15 Oct 2026"));
      } else {
        var r0 = pend[0];
        c.appendChild(el("span", { class: "pill warn", html: '<i class="dot"></i>Vence el ' + r0.vence }));
        c.appendChild(el("div", { class: "col", html: '<span class="tiny">' + (pend.length > 1 ? pend.length + " conceptos pendientes" : "Recibo " + r0.mes + " " + r0.anio) + '</span><span class="amount">' + money(d) + "</span>" }));
      }
      var acts = el("div", { class: "grid2" });
      var b1 = el("button", { class: "btn ghost sm" }, d === 0 ? "Ver consumo" : "Ver detalle");
      b1.onclick = function () { A.S.activo = s.id; save(); d === 0 ? go("consumo") : go("detalle", { recibo: pend[0].id }); };
      var b2 = el("button", { class: (d === 0 ? "btn quiet sm" : "btn sm") }, d === 0 ? "Ver recibos" : "Pagar ahora");
      b2.onclick = function () { A.S.activo = s.id; save(); d === 0 ? root("recibos") : go("metodo", { items: pend.map(function (r) { return { sid: s.id, rid: r.id }; }) }); };
      acts.appendChild(b1); acts.appendChild(b2); c.appendChild(acts);
      sc.appendChild(c);
    });

    var prom = (sum().consumo.reduce(function (a, c) { return a + c.v; }, 0) / 6).toFixed(1);
    sc.appendChild(el("div", { class: "note info", html: "<div><b>Tu consumo está en tu rango habitual.</b><br>Promedio de los últimos 6 meses: " + prom + " m³/mes.</div>" }));

    sc.appendChild(el("div", { class: "eyebrow" }, "Acciones rápidas"));
    var qa = el("div", { class: "grid2" });
    var q1 = el("button", { class: "item", html: '<span class="check" data-on="1" style="background:var(--brand-soft);border-color:var(--brand-soft);color:var(--brand)">' + ICON.plus + '</span><b style="font-size:13px">Asociar suministro</b>' });
    q1.onclick = function () { go("escaner"); };
    var q2 = el("button", { class: "item", html: '<span class="check" style="background:var(--bad-soft);border-color:var(--bad-soft);color:var(--bad)">!</span><b style="font-size:13px">Reportar fuga</b>' });
    q2.onclick = function () { toast("Línea de emergencias: 614-9000"); };
    qa.appendChild(q1); qa.appendChild(q2); sc.appendChild(qa);
  };
})(window.APP);
