/* ============================================================================
   hu05-metodo-de-pago.js — Prototipo Cálidda · Recibos y Pagos
   Grupo 6 · UPC · Diseño y Tecnologías UX · TB2
   HU-05 · Como usuaria quiero pagar con Yape o Plin ingresando el código de
   aprobación, para no salir a otra aplicación.
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

  A.V.metodo = function (sc) {
    tabbar(null);
    var items = A.ctx.items || [];
    var tot = items.reduce(function (a, i) { return a + sum(i.sid).recibos.filter(function (r) { return r.id === i.rid; })[0].total; }, 0);
    chrome(appbar("Método de pago", { back: true }));
    var res = el("div", { class: "card", style: "display:flex;flex-direction:column;gap:4px" });
    res.appendChild(el("div", { class: "row between", html: '<span class="muted">Total a pagar</span><span class="amount">' + money(tot) + "</span>" }));
    res.appendChild(el("div", { class: "tiny" }, items.length + (items.length === 1 ? " recibo · " : " recibos · ") + sum(items[0] ? items[0].sid : null).alias));
    sc.appendChild(res);
    sc.appendChild(el("div", { class: "eyebrow" }, "Selecciona tu forma de pago"));

    var metodo = A.ctx.metodo || "yape", otp = A.ctx.otp || "";
    var opciones = [["yape", "Yape", "Billetera digital · " + A.S.celular.slice(-9)], ["plin", "Plin", "Billetera digital"], ["card", "Tarjeta de crédito o débito", "Visa •••• 4821"], ["gpay", "Google Pay", "Pago con tu cuenta Google"]];
    opciones.forEach(function (o) {
      var on = metodo === o[0];
      var card = el("div", { class: "card" + (on ? "" : " flat"), style: "display:flex;flex-direction:column;gap:10px;border-color:" + (on ? "var(--brand)" : "var(--line)") });
      var head = el("button", { class: "row", style: "width:100%" });
      head.appendChild(el("span", { class: "radio", "data-on": on ? "1" : "0" }));
      head.appendChild(el("div", { class: "col", style: "flex:1", html: "<b style='font-size:14px'>" + o[1] + "</b><span class='tiny'>" + o[2] + "</span>" }));
      head.onclick = function () { A.ctx.metodo = o[0]; A.ctx.otp = ""; A.ctx.err = null; render(); };
      card.appendChild(head);
      if (on && (o[0] === "yape" || o[0] === "plin")) {
        var f = el("div", { class: "field" });
        f.appendChild(el("label", { for: "otp0" }, "Código de aprobación (6 dígitos)"));
        var box = el("div", { class: "otp" });
        for (var i = 0; i < 6; i++) {
          (function (i) {
            var inp = el("input", { id: "otp" + i, inputmode: "numeric", maxlength: "1", "aria-label": "Dígito " + (i + 1), value: otp[i] || "" });
            inp.oninput = function () {
              var v = inp.value.replace(/\D/g, "").slice(0, 1); inp.value = v;
              var arr = (A.ctx.otp || "").padEnd(6, " ").split(""); arr[i] = v || " "; A.ctx.otp = arr.join("").replace(/\s+$/, "");
              if (v && i < 5) $("#otp" + (i + 1)).focus();
              actualizarBoton();
            };
            inp.onkeydown = function (e) { if (e.key === "Backspace" && !inp.value && i > 0) $("#otp" + (i - 1)).focus(); };
            box.appendChild(inp);
          })(i);
        }
        f.appendChild(box);
        f.appendChild(el("span", { class: "tiny" }, "Obténlo en " + o[1] + " › Menú › Código de aprobación. En este prototipo sirve cualquier combinación de 6 dígitos."));
        card.appendChild(f);
      }
      if (on && o[0] === "card") {
        card.appendChild(campo("Tarjeta guardada", "Visa •••• 4821 · " + A.S.nombre, true));
        var cvv = campo("CVV", "", false, "cvv");
        cvv.querySelector("input").setAttribute("inputmode", "numeric");
        cvv.querySelector("input").setAttribute("maxlength", "3");
        cvv.querySelector("input").value = A.ctx.cvv || "";
        cvv.querySelector("input").oninput = function (e) { A.ctx.cvv = e.target.value.replace(/\D/g, ""); actualizarBoton(); };
        card.appendChild(cvv);
      }
      sc.appendChild(card);
    });

    var aviso = el("div", { class: "row", style: "gap:7px;color:var(--ink-3);font-size:12px" });
    aviso.appendChild(el("span", { html: ICON.lock }));
    aviso.appendChild(el("span", null, "Pago protegido · sin comisiones adicionales"));
    sc.appendChild(aviso);
    var err = el("div", { class: "note bad", html: A.ctx.err || "" }); err.hidden = !A.ctx.err; sc.appendChild(err);
    var pagar = el("button", { class: "btn" }, "Pagar " + money(tot));
    sc.appendChild(pagar);

    function listo() {
      if (A.ctx.metodo === "card") return (A.ctx.cvv || "").length === 3;
      if (!A.ctx.metodo || A.ctx.metodo === "yape" || A.ctx.metodo === "plin") return (A.ctx.otp || "").replace(/\s/g, "").length === 6;
      return true;
    }
    function actualizarBoton() { pagar.disabled = !listo(); }
    actualizarBoton();
    pagar.onclick = function () {
      if ((A.ctx.metodo || "yape") !== "card" && A.ctx.otp === "000000") {
        A.ctx.err = "<div><b>Código inválido.</b><br>Revisa el código de aprobación en tu billetera y vuelve a intentarlo. No se realizó ningún cargo.</div>";
        A.ctx.otp = ""; render();
        FX.sacudir($(".otp"));
        FX.toast("Código inválido: ingresa el código nuevamente");
        return;
      }
      A.ctx.err = null;
      go("procesando", { items: items, total: tot, metodo: A.ctx.metodo || "yape" });
    };
  };
})(window.APP);
