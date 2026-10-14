/* ============================================================================
   hu10-navegacion-y-datos.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-10 · Como usuario quiero navegar con retorno claro y sin elementos
   flotantes, y mantener mis datos actualizados.
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
  var compartir = dif("compartir"), historialPagos = dif("historialPagos"), pantallaBloqueo = dif("pantallaBloqueo");

  A.V.mas = function (sc) {
    tabbar("mas"); chrome(appbar("Más", { left: true }));
    var perfil = el("div", { class: "card", style: "display:flex;gap:11px;align-items:center" });
    perfil.appendChild(el("span", { class: "appicon", style: "width:40px;height:40px;border-radius:14px;font-size:16px" }, A.S.nombre[0]));
    perfil.appendChild(el("div", { class: "col", html: "<b>" + A.S.nombre + "</b><span class='tiny'>" + A.S.correo + "</span>" }));
    sc.appendChild(perfil);
    var opciones = [["Mis datos", function () { go("datos"); }], ["Mis suministros", elegirSuministro], ["Notificaciones", function () { go("ajustes"); }],
      ["Asociar un suministro", function () { go("escaner"); }], ["Certificado de no adeudo", function () { verDocumento("Certificado de no adeudo", [["Cliente", A.S.nombre], ["Suministro", sum().id], ["Estado", deuda(sum()) === 0 ? "Sin deuda pendiente" : "Con deuda de " + money(deuda(sum()))], ["Emitido", hoy()]]); }],
      ["Historial de pagos", historialPagos], ["Ayuda y reclamos", function () { toast("Central de atención: 614-9000"); }]];
    var list = el("div", { class: "list" });
    opciones.forEach(function (o) {
      var b = el("button", { class: "item" });
      b.appendChild(el("span", { style: "flex:1" }, o[0]));
      b.appendChild(el("span", { style: "color:var(--ink-3)", html: ICON.chevron }));
      b.onclick = o[1]; list.appendChild(b);
    });
    sc.appendChild(list);
    var out = el("button", { class: "btn quiet", style: "color:var(--bad)" }, "Cerrar sesión");
    out.onclick = function () { toast("En el prototipo la sesión permanece activa"); };
    sc.appendChild(out);
  };


  A.V.datos = function (sc) {
    tabbar(null); chrome(appbar("Actualizar datos", { back: true }));
    var f = {};
    f.nombre = campo("Nombre completo", A.S.nombre, true);
    f.correo = campo("Correo electrónico", A.S.correo);
    f.celular = campo("Celular", A.S.celular);
    f.direccion = campo("Dirección de envío del recibo", A.S.direccion);
    ["nombre", "correo", "celular", "direccion"].forEach(function (k) { sc.appendChild(f[k]); });
    sc.appendChild(el("div", { style: "flex:1" }));
    var g = el("div", { class: "grid2" });
    var c = el("button", { class: "btn quiet sm" }, "Cancelar"); c.onclick = back;
    var s = el("button", { class: "btn sm" }, "Guardar");
    s.onclick = function () {
      A.S.correo = f.correo.querySelector("input").value || A.S.correo;
      A.S.celular = f.celular.querySelector("input").value || A.S.celular;
      A.S.direccion = f.direccion.querySelector("input").value || A.S.direccion;
      save(); back(); toast("Datos actualizados");
    };
    g.appendChild(c); g.appendChild(s); sc.appendChild(g);
  };


  function elegirSuministro() {
    var nodes = [];
    A.S.suministros.forEach(function (s) {
      var b = el("button", { class: "item" + (s.id === A.S.activo ? " sel" : "") });
      b.appendChild(el("div", { class: "col", style: "flex:1", html: "<b>" + s.alias + "</b><span class='tiny'>N° " + s.id + " · " + (deuda(s) ? money(deuda(s)) + " pendiente" : "Al día") + "</span>" }));
      b.onclick = function () { A.S.activo = s.id; save(); ov.remove(); render(); toast("Suministro activo: " + s.alias); };
      nodes.push(b);
    });
    var add = el("button", { class: "btn ghost sm" }, "Asociar otro suministro");
    add.onclick = function () { ov.remove(); go("escaner"); };
    nodes.push(add);
    var ov = sheet("Mis suministros", nodes);
  }

  /* Registro en el espacio de nombres compartido */
  A.elegirSuministro = elegirSuministro;
})(window.APP);
