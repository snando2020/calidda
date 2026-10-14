/* ============================================================================
   hu03-historico-y-descarga.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-03 · Como usuario quiero consultar los recibos de los últimos doce
   meses y descargar el que necesite, para sustentar mi gasto.
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
  var confirmarPago = dif("confirmarPago"), elegirSuministro = dif("elegirSuministro"), pantallaBloqueo = dif("pantallaBloqueo");

  A.V.recibos = function (sc) {
    tabbar("recibos"); chrome(appbar("Mis recibos", { left: true }));
    var s = sum();
    var selector = el("button", { class: "item", style: "flex:none" });
    selector.appendChild(el("div", { class: "col", html: '<span class="tiny">Suministro</span><b>' + s.alias + " · " + s.id + "</b>" }));
    selector.appendChild(el("span", { style: "margin-left:auto;color:var(--ink-3)", html: ICON.chevron }));
    selector.onclick = elegirSuministro;
    sc.appendChild(selector);
    sc.appendChild(el("div", { class: "eyebrow" }, "Últimos 12 meses"));
    var list = el("div", { class: "list" });
    s.recibos.forEach(function (r) {
      var it = el("div", { class: "item" });
      var open = el("button", { class: "col", style: "flex:1;text-align:left" });
      open.appendChild(el("b", { style: "font-size:14px" }, r.mes + " " + r.anio));
      open.appendChild(el("span", { class: "tiny" }, "Emitido " + r.emitido + " · vence " + r.vence));
      open.onclick = function () { go("detalle", { recibo: r.id }); };
      it.appendChild(open);
      var right = el("div", { class: "col", style: "align-items:flex-end;gap:5px" });
      right.appendChild(el("b", { style: "font-variant-numeric:tabular-nums" }, money(r.total)));
      right.appendChild(el("span", { class: "pill " + (r.estado === "Pendiente" ? "warn" : "ok"), html: '<i class="dot"></i>' + r.estado }));
      it.appendChild(right);
      var dl = el("button", { class: "iconbtn", "aria-label": "Descargar " + r.mes, html: ICON.down });
      dl.onclick = function (e) { e.stopPropagation(); accionesPdf(r, s); };
      it.appendChild(dl);
      list.appendChild(it);
    });
    sc.appendChild(list);
  };


  function accionesPdf(r, s) {
    var nodes = [];
    nodes.push(el("div", { class: "muted" }, "Recibo " + r.mes + " " + r.anio + " · " + money(r.total) + " · suministro " + s.id));
    var opciones = [["Ver el recibo en PDF", function () { verDocumento("Recibo " + r.mes + " " + r.anio, [["Suministro", s.id + " · " + s.alias], ["Consumo", r.m3 + " m³"], ["Consumo de gas", money(r.gas)], ["Cargo fijo", money(r.fijo)], ["Mantenimiento de red", money(r.mant)]].concat(r.cuota ? [["Cuota CrediCálidda", money(r.cuota)]] : []).concat([["Total", money(r.total)], ["Estado", r.estado]])); }],
      ["Enviar a mi correo", function () { toast("Enviado a " + A.S.correo); }],
      ["Compartir por WhatsApp", function () { compartir("Recibo " + r.mes + " " + r.anio + " de Cálidda: " + money(r.total)); }]];
    opciones.forEach(function (o) {
      var b = el("button", { class: "item" });
      b.appendChild(el("span", { style: "flex:1;font-weight:600" }, o[0]));
      b.appendChild(el("span", { style: "color:var(--ink-3)", html: ICON.chevron }));
      b.onclick = function () { ov.remove(); o[1](); };
      nodes.push(b);
    });
    var ov = sheet("Acciones del recibo", nodes);
  }
  function verDocumento(titulo, filas) {
    var cont = el("div", { class: "card", style: "display:flex;flex-direction:column;gap:9px" });
    cont.appendChild(el("div", { class: "row between", html: "<b>CÁLIDDA</b><span class='tiny'>" + hoy() + "</span>" }));
    cont.appendChild(el("div", { style: "height:1px;background:var(--line)" }));
    filas.forEach(function (f) { cont.appendChild(rowKV(f[0], f[1])); });
    cont.appendChild(el("div", { class: "tiny" }, "Documento generado por el prototipo con los datos de la sesión."));
    var copiar = el("button", { class: "btn ghost sm" }, "Copiar contenido");
    copiar.onclick = function () {
      var txt = titulo + "\n" + filas.map(function (f) { return f[0] + ": " + f[1]; }).join("\n");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast("Contenido copiado"); }, function () { toast("Copia manualmente el texto del documento"); });
      else toast("Copia manualmente el texto del documento");
    };
    sheet(titulo, [cont, copiar]);
  }
  function compartir(texto) {
    if (navigator.share) { navigator.share({ text: texto }).catch(function () { toast("Texto listo para compartir: " + texto); }); }
    else toast("Listo para compartir: " + texto);
  }
  function historialPagos() {
    var nodes = [];
    if (!A.S.pagos.length) nodes.push(el("div", { class: "note info" }, "Todavía no registras pagos en esta sesión del prototipo."));
    A.S.pagos.forEach(function (p) {
      nodes.push(el("div", { class: "item", html: "<div class='col' style='flex:1'><b>" + money(p.monto) + "</b><span class='tiny'>" + p.fecha + " · " + p.metodo + " · " + p.op + "</span></div>" }));
    });
    sheet("Historial de pagos", nodes);
  }

  /* Registro en el espacio de nombres compartido */
  A.accionesPdf = accionesPdf;
  A.verDocumento = verDocumento;
  A.compartir = compartir;
  A.historialPagos = historialPagos;
})(window.APP);
