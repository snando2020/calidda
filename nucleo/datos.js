/* ============================================================================
   datos.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   Modelo de datos y reglas de negocio: estructura del recibo, cálculo del
   importe, estado inicial, persistencia y selectores de deuda.
   ========================================================================== */

(function (A) {
  "use strict";
  var MES = A.MES, el = A.el, money = A.money;

  var TARIFA = 1.7625, FIJO = 6.80, MANT = 3.50;
  function recibo(mes, anio, m3, estado, cuota, vence) {
    var gas = +(m3 * TARIFA).toFixed(2), total = +(gas + FIJO + MANT + (cuota || 0)).toFixed(2);
    return { id: "R" + anio + mes, mes: MES[mes], anio: anio, m3: m3, gas: gas, fijo: FIJO, mant: MANT, cuota: cuota || 0, total: total, estado: estado, vence: vence, emitido: "15/" + String(mes + 1).padStart(2, "0") + "/" + anio };
  }
  function base() {
    return {
      nombre: "Valeria Mendoza", correo: "valeria.m***@gmail.com", celular: "+51 987 654 321", direccion: "Av. Los Olivos 1420, Lima",
      activo: "447886", unidad: "m3", pagos: [],
      notif: { nuevo: true, previo: true, dia: true, corte: true, confirm: true, anticipacion: 3, push: true, wsp: true, correo: false, sms: false },
      suministros: [
        { id: "447886", alias: "Casa principal", dir: "Av. Los Olivos 1420, Lima", titular: "A.V. M***", lect: [1234, 1250],
          consumo: [{ m: "Abr", v: 12 }, { m: "May", v: 14 }, { m: "Jun", v: 17 }, { m: "Jul", v: 13 }, { m: "Ago", v: 13 }, { m: "Set", v: 16 }],
          recibos: [recibo(8, 2026, 16, "Pendiente", 10, "28/09/2026"), recibo(7, 2026, 14, "Pagado", 10, "28/08/2026"), recibo(6, 2026, 17, "Pagado", 10, "28/07/2026"),
            recibo(5, 2026, 13, "Pagado", 10, "28/06/2026"), recibo(4, 2026, 12, "Pagado", 10, "28/05/2026"), recibo(3, 2026, 14, "Pagado", 10, "28/04/2026"),
            recibo(2, 2026, 15, "Pagado", 0, "28/03/2026"), recibo(1, 2026, 18, "Pagado", 0, "28/02/2026"), recibo(0, 2026, 19, "Pagado", 0, "28/01/2026"),
            recibo(11, 2025, 17, "Pagado", 0, "28/12/2025"), recibo(10, 2025, 15, "Pagado", 0, "28/11/2025"), recibo(9, 2025, 14, "Pagado", 0, "28/10/2025")] },
        { id: "512903", alias: "Local comercial", dir: "Av. Brasil 2140, Magdalena", titular: "A.V. M***", lect: [980, 1016],
          consumo: [{ m: "Abr", v: 28 }, { m: "May", v: 31 }, { m: "Jun", v: 36 }, { m: "Jul", v: 30 }, { m: "Ago", v: 33 }, { m: "Set", v: 36 }],
          recibos: [recibo(8, 2026, 36, "Pendiente", 0, "30/09/2026"), recibo(7, 2026, 33, "Pagado", 0, "30/08/2026"), recibo(6, 2026, 30, "Pagado", 0, "30/07/2026")] }
      ],
      catalogo: [{ id: "778213", alias: "", dir: "Jr. Las Gaviotas 245, Callao", titular: "M. R***", dni: "****1024" }]
    };
  }
  var KEY = "calidda-proto-v1";
  A.S = null;
  function load() { try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {} return base(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(A.S)); } catch (e) {} }
  /* El estado se carga en app.js (arranque). */

  var sum = function (id) { return A.S.suministros.filter(function (s) { return s.id === (id || A.S.activo); })[0] || A.S.suministros[0]; };
  var pendientes = function (s) { return s.recibos.filter(function (r) { return r.estado === "Pendiente"; }); };
  var deuda = function (s) { return pendientes(s).reduce(function (a, r) { return a + r.total; }, 0); };
  var deudaTotal = function () { return A.S.suministros.reduce(function (a, s) { return a + deuda(s); }, 0); };

  /* Registro en el espacio de nombres compartido */
  A.recibo = recibo;
  A.base = base;
  A.load = load;
  A.save = save;
  A.sum = sum;
  A.pendientes = pendientes;
  A.deuda = deuda;
  A.deudaTotal = deudaTotal;
})(window.APP);
