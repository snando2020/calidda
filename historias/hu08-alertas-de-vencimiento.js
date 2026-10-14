/* ============================================================================
   hu08-alertas-de-vencimiento.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-08 · Como usuario quiero elegir con cuánta anticipación y por qué canal
   recibir el aviso, para pagar a tiempo y evitar el corte.
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

  A.V.ajustes = function (sc) {
    tabbar(null); chrome(appbar("Notificaciones", { back: true }));
    sc.appendChild(el("div", { class: "eyebrow" }, "Alertas de recibos y corte"));
    var g1 = el("div", { class: "card", style: "display:flex;flex-direction:column;gap:12px" });
    [["nuevo", "Nuevo recibo emitido"], ["previo", "Aviso antes del vencimiento"]].forEach(function (p) { g1.appendChild(filaToggle(p[0], p[1])); });
    var chips = el("div", { class: "row", style: "gap:7px;flex-wrap:wrap" });
    chips.appendChild(el("span", { class: "tiny", style: "flex:none" }, "Anticipación:"));
    [1, 3, 5].forEach(function (d) {
      var b = el("button", { class: "chip-btn", "aria-pressed": A.S.notif.anticipacion === d ? "true" : "false" }, d + (d === 1 ? " día" : " días"));
      b.onclick = function () { A.S.notif.anticipacion = d; save(); render(); };
      chips.appendChild(b);
    });
    g1.appendChild(chips);
    [["dia", "Alerta el día del vencimiento"], ["corte", "Aviso urgente previo al corte"], ["confirm", "Confirmación de pago"]].forEach(function (p) { g1.appendChild(filaToggle(p[0], p[1])); });
    sc.appendChild(g1);
    sc.appendChild(el("div", { class: "eyebrow" }, "Canales preferidos"));
    var g2 = el("div", { class: "card", style: "display:flex;flex-direction:column;gap:12px" });
    [["push", "Notificaciones push"], ["wsp", "WhatsApp"], ["correo", "Correo electrónico"], ["sms", "SMS"]].forEach(function (p) { g2.appendChild(filaToggle(p[0], p[1])); });
    sc.appendChild(g2);
    var b = el("button", { class: "btn" }, "Guardar preferencias");
    b.onclick = function () { save(); back(); toast("Preferencias guardadas · aviso " + A.S.notif.anticipacion + " días antes"); };
    sc.appendChild(b);
    var sim = el("button", { class: "btn quiet" }, "Simular aviso de vencimiento");
    sim.onclick = pantallaBloqueo;
    sc.appendChild(sim);
  };


  function pantallaBloqueo() {
    var layer = $("#layer");
    var lock = el("div", { class: "lock" });
    lock.appendChild(el("div", { class: "time" }, "9:41"));
    lock.appendChild(el("div", { style: "text-align:center;color:#C9D6E4;font-size:13px" }, "Lunes, 25 de setiembre"));
    var pend = [];
    A.S.suministros.forEach(function (s) { pendientes(s).forEach(function (r) { pend.push({ sid: s.id, rid: r.id, r: r }); }); });
    var p = pend[0];
    var push = el("div", { class: "push" });
    push.appendChild(el("div", { class: "row", html: '<span class="appicon">C</span><span class="tiny" style="color:#4B596B">CÁLIDDA · ahora</span>' }));
    push.appendChild(el("b", { style: "font-size:14.5px" }, p ? "Tu recibo vence en " + A.S.notif.anticipacion + " días" : "Estás al día con Cálidda"));
    push.appendChild(el("span", { style: "font-size:12.5px;color:#4B596B" }, p ? "Suministro " + p.sid + " · " + money(p.r.total) + ". Evita cargos por reconexión pagando ahora." : "No tienes recibos pendientes."));
    var acts = el("div", { class: "grid2" });
    var pay = el("button", { class: "btn sm" }, p ? "Pagar ahora" : "Abrir la app");
    pay.onclick = function () { lock.remove(); if (p) { A.S.activo = p.sid; save(); root("pagar"); A.ctx.pre = p.sid + p.rid; render(); } else root("home"); };
    var later = el("button", { class: "btn quiet sm" }, "Recordar mañana");
    later.onclick = function () { lock.remove(); toast("Te recordaremos mañana"); };
    acts.appendChild(pay); acts.appendChild(later); push.appendChild(acts);
    lock.appendChild(push);
    if (A.S.notif.wsp) {
      var w = el("div", { class: "push" });
      w.appendChild(el("div", { class: "row", html: '<span class="appicon" style="background:#1FA855">W</span><span class="tiny" style="color:#4B596B">WHATSAPP · Cálidda (verificada)</span>' }));
      w.appendChild(el("span", { style: "font-size:12.5px;color:#121A24" }, p ? "Hola " + A.S.nombre.split(" ")[0] + ", tu recibo de " + money(p.r.total) + " vence el " + p.r.vence + ". Págalo en dos toques con Yape o Plin." : "Hola " + A.S.nombre.split(" ")[0] + ", no tienes recibos pendientes."));
      lock.appendChild(w);
    }
    var close = el("button", { class: "btn quiet sm", style: "margin-top:auto;background:rgba(255,255,255,.15);color:#fff;border:0" }, "Desbloquear");
    close.onclick = function () { lock.remove(); };
    lock.appendChild(close);
    layer.appendChild(lock);
  }

  /* Registro en el espacio de nombres compartido */
  A.pantallaBloqueo = pantallaBloqueo;
})(window.APP);
