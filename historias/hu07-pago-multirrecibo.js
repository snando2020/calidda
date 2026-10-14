/* ============================================================================
   hu07-pago-multirrecibo.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-07 · Como usuario con varios suministros quiero seleccionar varios
   recibos y ver el total en vivo, para pagar todo en una sola operación.
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

  A.V.pagar = function (sc) {
    tabbar("pagar"); chrome(appbar("Pagar servicios", { left: true }));
    var items = [];
    A.S.suministros.forEach(function (s) { pendientes(s).forEach(function (r) { items.push({ sid: s.id, rid: r.id }); }); });
    if (!items.length) {
      sc.appendChild(el("div", { class: "center", style: "padding-top:34px" }));
      var c = sc.lastChild;
      c.appendChild(el("div", { class: "badge-circle", html: '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12.5 10 17l9-10"/></svg>' }));
      c.appendChild(el("h3", { style: "font-size:20px;margin-top:6px" }, "¡Estás al día con Cálidda!"));
      c.appendChild(el("p", { class: "muted", style: "margin:0" }, "No tienes recibos ni cuotas pendientes en ninguno de tus suministros."));
      var info = el("div", { class: "card flat", style: "width:100%;display:flex;flex-direction:column;gap:8px;margin-top:8px" });
      info.appendChild(rowKV("Próxima emisión", "15 Oct 2026"));
      var ultimo = A.S.pagos[0];
      info.appendChild(rowKV("Último pago", ultimo ? ultimo.fecha + " · " + money(ultimo.monto) : "21 Set 2026 · S/ 48.50"));
      c.appendChild(info);
      var h = el("button", { class: "btn ghost", style: "margin-top:8px" }, "Ver histórico de recibos"); h.onclick = function () { root("recibos"); };
      var cert = el("button", { class: "btn quiet" }, "Descargar certificado de no adeudo");
      cert.onclick = function () { verDocumento("Certificado de no adeudo", [["Cliente", A.S.nombre], ["Suministro", sum().id + " · " + sum().alias], ["Estado", "Sin deuda pendiente"], ["Emitido", hoy()]]); };
      c.appendChild(h); c.appendChild(cert);
      return;
    }
    // HU-07 · gestión multirrecibo
    var sel = {};
    items.forEach(function (i) { sel[i.sid + i.rid] = A.ctx.pre ? (A.ctx.pre === i.sid + i.rid) : true; });
    var all = el("button", { class: "item" });
    all.appendChild(el("span", { class: "check", "data-on": "1", html: ICON.check }));
    all.appendChild(el("b", { style: "font-size:13.5px" }, "Seleccionar todos los pendientes (" + items.length + ")"));
    sc.appendChild(all);
    var cont = el("div", { class: "list" }); sc.appendChild(cont);
    var resumen = el("div", { class: "card", style: "position:sticky;bottom:0;display:flex;flex-direction:column;gap:9px" });
    sc.appendChild(resumen);

    function total() { var t = 0, n = 0; items.forEach(function (i) { if (sel[i.sid + i.rid]) { t += rec(i).total; n++; } }); return [t, n]; }
    function rec(i) { return sum(i.sid).recibos.filter(function (r) { return r.id === i.rid; })[0]; }
    function pinta() {
      cont.innerHTML = "";
      A.S.suministros.forEach(function (s) {
        var ps = pendientes(s); if (!ps.length) return;
        cont.appendChild(el("div", { class: "eyebrow" }, s.alias + " · " + s.id));
        ps.forEach(function (r) {
          var k = s.id + r.id, on = sel[k];
          var it = el("button", { class: "item" + (on ? " sel" : "") });
          it.appendChild(el("span", { class: "check", "data-on": on ? "1" : "0", html: on ? ICON.check : "" }));
          it.appendChild(el("div", { class: "col", style: "flex:1", html: "<b style='font-size:13.5px'>Recibo " + r.mes + " " + r.anio + "</b><span class='tiny'>Vence " + r.vence + (r.cuota ? " · incluye cuota CrediCálidda" : "") + "</span>" }));
          it.appendChild(el("b", { style: "font-variant-numeric:tabular-nums" }, money(r.total)));
          it.onclick = function () { sel[k] = !sel[k]; pinta(); };
          cont.appendChild(it);
        });
      });
      var t = total();
      all.querySelector(".check").setAttribute("data-on", t[1] === items.length ? "1" : (t[1] === 0 ? "0" : "mixed"));
      all.querySelector(".check").innerHTML = t[1] === items.length ? ICON.check : (t[1] === 0 ? "" : "–");
      resumen.innerHTML = "";
      resumen.appendChild(el("div", { class: "row between", html: '<span class="muted">Recibos seleccionados</span><b>' + t[1] + "</b>" }));
      resumen.appendChild(el("div", { class: "row between", html: '<span class="muted">Total a pagar</span><span class="amount">' + money(t[0]) + "</span>" }));
      var b = el("button", { class: "btn" }, t[1] ? "Continuar al pago · " + money(t[0]) : "Selecciona al menos un recibo");
      b.disabled = !t[1];
      b.onclick = function () { go("metodo", { items: items.filter(function (i) { return sel[i.sid + i.rid]; }) }); };
      resumen.appendChild(b);
    }
    all.onclick = function () { var t = total(); var on = t[1] !== items.length; items.forEach(function (i) { sel[i.sid + i.rid] = on; }); pinta(); };
    pinta();
  };
})(window.APP);
