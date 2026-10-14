/* ============================================================================
   app.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   Arranque: carga el estado guardado, construye el panel de demostración
   y dibuja la primera pantalla. La lógica vive en nucleo/ e historias/.
   ========================================================================== */

(function (A) {
  "use strict";
  var $ = A.$, el = A.el, toast = A.toast, go = A.go, root = A.root, save = A.save;
  var sum = A.sum, pendientes = A.pendientes;

  /* 1 · Estado: lo guardado en el navegador o el juego de datos inicial. */
  A.S = A.load();

  /* 2 · Panel de demostración: accesos directos a cada historia de usuario. */
  var HU = [
    ["HU-01", "Estado “Al día” explícito en el inicio y en la pestaña Pagar", function () { root("pagar"); }],
    ["HU-02", "Desglose de conceptos del recibo en dos niveles", function () { A.S.activo = "447886"; go("detalle", { recibo: pendientes(sum("447886"))[0] ? pendientes(sum("447886"))[0].id : sum("447886").recibos[0].id, open: true }); }],
    ["HU-03", "Histórico de 12 meses y descarga del recibo", function () { root("recibos"); }],
    ["HU-04", "Gráfica de consumo en m³ y en soles", function () { go("consumo"); }],
    ["HU-05", "Pago con Yape o Plin y código de aprobación", function () { var s = sum(), p = pendientes(s)[0]; if (!p) { toast("No hay recibos pendientes: reinicia los datos"); return; } go("metodo", { items: [{ sid: s.id, rid: p.id }] }); }],
    ["HU-06", "Confirmación con número de operación y comprobante", function () { var s = sum(), p = pendientes(s)[0]; if (!p) { toast("No hay recibos pendientes: reinicia los datos"); return; } go("metodo", { items: [{ sid: s.id, rid: p.id }] }); toast("Completa el pago para ver la confirmación"); }],
    ["HU-07", "Selección multirrecibo con total en vivo", function () { root("pagar"); }],
    ["HU-08", "Alertas de vencimiento y aviso en pantalla de bloqueo", function () { go("ajustes"); }],
    ["HU-09", "Asociar suministro por escáner o DNI", function () { go("escaner"); }],
    ["HU-10", "Navegación con retorno y sin elementos flotantes", function () { go("datos"); }]
  ];
  var huList = $("#huList");
  HU.forEach(function (h) {
    var b = el("button", { class: "hu" });
    b.appendChild(el("b", null, h[0]));
    b.appendChild(el("span", null, h[1]));
    b.onclick = h[2];
    huList.appendChild(b);
  });
  $("#btnWire").onclick = function () { FX.wireframe(this, $("#device")); };
  $("#btnDelay").onclick = function () {
    A.demoDelay = !A.demoDelay;
    this.setAttribute("aria-pressed", A.demoDelay ? "true" : "false");
    toast(A.demoDelay ? "El próximo pago simulará una demora del banco" : "Los pagos se confirmarán de inmediato");
  };
  $("#btnReset").onclick = function () { A.S = A.base(); save(); root("home"); toast("Datos del prototipo reiniciados"); };

  FX.reloj("#clock");            // hora real en la barra de estado
  FX.ondas(document);            // efecto de onda al pulsar botones y filas

  /* 3 · Primera pantalla. */
  A.render();
})(window.APP);
