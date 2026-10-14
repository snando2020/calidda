/* ============================================================================
   hu06-confirmacion-del-pago.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-06 · Como usuario quiero una confirmación con número de operación y
   comprobante, para tener constancia de que pagué.
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
  var accionesPdf = dif("accionesPdf"), verDocumento = dif("verDocumento"), compartir = dif("compartir");
  var historialPagos = dif("historialPagos"), elegirSuministro = dif("elegirSuministro"), pantallaBloqueo = dif("pantallaBloqueo");

  A.V.procesando = function (sc) {
    tabbar(null); chrome(null);
    var via = A.ctx.metodo === "card" ? "tu banco" : (A.ctx.metodo === "plin" ? "Plin" : "Yape");
    var c = el("div", { class: "center", style: "padding-top:30px" });
    c.appendChild(el("div", { class: "spinner" }));
    c.appendChild(el("h3", { style: "font-size:19px;margin-top:10px" }, "Validando pago con " + via + "…"));
    c.appendChild(el("p", { class: "muted", style: "margin:0" }, "Esto toma unos segundos. No cierres la app ni vuelvas a pagar."));
    sc.appendChild(c);
    var pasos = el("div", { class: "card", style: "display:flex;flex-direction:column;gap:12px" });
    var defs = [["Solicitud enviada", "done"], ["Confirmando con " + via, "run"], ["Generando comprobante", ""]];
    defs.forEach(function (p) {
      pasos.appendChild(el("div", { class: "step " + p[1], html: '<span class="bullet">' + (p[1] === "done" ? ICON.check : "") + "</span><span>" + p[0] + "</span>" }));
    });
    sc.appendChild(pasos);
    sc.appendChild(el("div", { class: "note info", html: "Si la operación tarda más de 30 segundos, consultaremos el estado automáticamente para no duplicar el cobro." }));
    var items = A.ctx.items, tot = A.ctx.total, met = A.ctx.metodo;
    clearTimeout(A.V._t);
    A.V._t = setTimeout(function () {
      if (current() !== "procesando") return;
      if (A.demoDelay) go("verificando", { items: items, total: tot, metodo: met }, true);
      else confirmarPago(items, tot, met);
    }, 1900);
  };

  A.V.verificando = function (sc) {
    tabbar(null); chrome(appbar("Estado del pago", { left: true }));
    var c = el("div", { class: "center", style: "padding-top:16px" });
    c.appendChild(el("div", { class: "badge-circle", style: "background:var(--warn-soft);color:var(--warn)", html: '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>' }));
    c.appendChild(el("h3", { style: "font-size:19px" }, "Estamos confirmando tu pago"));
    c.appendChild(el("p", { class: "muted", style: "margin:0" }, "Tu banco está demorando más de lo habitual. No vuelvas a pagar: si el cargo se realizó, lo detectaremos y evitaremos un cobro duplicado."));
    sc.appendChild(c);
    var box = el("div", { class: "card flat", style: "display:flex;flex-direction:column;gap:8px" });
    box.appendChild(rowKV("N° de operación", "CAL-" + hoyCompacto() + "-" + (A.ctx.op || (A.ctx.op = aleatorio()))));
    box.appendChild(rowKV("Monto", money(A.ctx.total)));
    box.appendChild(rowKV("Estado", "En verificación"));
    sc.appendChild(box);
    var b = el("button", { class: "btn" }, "Consultar estado ahora");
    b.onclick = function () { confirmarPago(A.ctx.items, A.ctx.total, A.ctx.metodo, A.ctx.op); };
    sc.appendChild(b);
    var h = el("button", { class: "btn quiet" }, "Ir al inicio"); h.onclick = function () { root("home"); };
    sc.appendChild(h);
  };

  A.V.exito = function (sc) {
    tabbar(null); chrome(null);
    var p = A.ctx.pago;
    var c = el("div", { class: "center", style: "padding-top:18px" });
    c.appendChild(el("div", { class: "badge-circle", html: '<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12.5 10 17l9-10"/></svg>' }));
    c.appendChild(el("h3", { style: "font-size:22px;color:var(--ok)" }, "¡Pago exitoso!"));
    c.appendChild(el("div", { class: "amount" }, money(p.monto)));
    c.appendChild(el("p", { class: "muted", style: "margin:0" }, "La deuda de tu suministro se actualizó."));
    sc.appendChild(c);
    var box = el("div", { class: "card", style: "display:flex;flex-direction:column;gap:9px" });
    box.appendChild(rowKV("N° de operación", p.op));
    box.appendChild(rowKV("Fecha y hora", p.fecha + " · " + p.hora));
    box.appendChild(rowKV("Método", p.metodo));
    box.appendChild(rowKV("Suministro", p.suministro));
    box.appendChild(rowKV("Recibos pagados", p.detalle));
    sc.appendChild(box);
    sc.appendChild(el("div", { class: "note info", html: "Enviamos el comprobante a " + A.S.correo + "." }));
    var g = el("div", { class: "grid2" });
    var b1 = el("button", { class: "btn ghost sm" }, "Ver constancia");
    b1.onclick = function () { verDocumento("Constancia de pago", [["N° de operación", p.op], ["Fecha", p.fecha + " " + p.hora], ["Monto", money(p.monto)], ["Método", p.metodo], ["Suministro", p.suministro], ["Detalle", p.detalle]]); };
    var b2 = el("button", { class: "btn ghost sm" }, "Compartir");
    b2.onclick = function () { compartir("Pago de " + money(p.monto) + " · operación " + p.op); };
    g.appendChild(b1); g.appendChild(b2); sc.appendChild(g);
    var h = el("button", { class: "btn" }, "Volver al inicio");
    h.onclick = function () { root("home"); toast("Pago registrado · deuda actualizada"); };
    sc.appendChild(h);
  };


  function confirmarPago(items, tot, met, op) {
    var nombres = [];
    items.forEach(function (i) {
      var s = sum(i.sid), r = s.recibos.filter(function (x) { return x.id === i.rid; })[0];
      if (r) { r.estado = "Pagado"; nombres.push(r.mes + " " + r.anio); }
    });
    var metodoTxt = met === "card" ? "Visa •••• 4821" : (met === "plin" ? "Plin" : (met === "gpay" ? "Google Pay" : "Yape"));
    var pago = { op: "CAL-" + hoyCompacto() + "-" + (op || aleatorio()), fecha: hoy(), hora: horaActual(), monto: tot, metodo: metodoTxt,
      suministro: sum(items[0].sid).id + " · " + sum(items[0].sid).alias, detalle: nombres.length > 1 ? nombres.length + " recibos (" + nombres.join(", ") + ")" : nombres[0] || "—" };
    A.S.pagos.unshift(pago); save();
    go("exito", { pago: pago }, true);
  }

  /* Registro en el espacio de nombres compartido */
  A.confirmarPago = confirmarPago;
})(window.APP);
