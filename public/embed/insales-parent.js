(function () {
  function submitToCart(variantId, quantity) {
    var form = document.createElement("form");
    form.method = "post";
    form.action = "/cart_items";
    form.style.display = "none";

    var variantInput = document.createElement("input");
    variantInput.type = "hidden";
    variantInput.name = "variant_id";
    variantInput.value = String(variantId);
    form.appendChild(variantInput);

    var quantityInput = document.createElement("input");
    quantityInput.type = "hidden";
    quantityInput.name = "quantity";
    quantityInput.value = String(quantity || 1);
    form.appendChild(quantityInput);

    document.body.appendChild(form);
    form.submit();
  }

  function resizeIframe(iframe, height) {
    if (!iframe || !height) {
      return;
    }

    iframe.style.height = String(height) + "px";
  }

  window.InSalesConstructorEmbed = {
    bind: function bind(options) {
      var iframe = options && options.iframe;
      var allowedOrigin = options && options.allowedOrigin;

      if (!iframe) {
        throw new Error("InSalesConstructorEmbed.bind requires iframe.");
      }

      window.addEventListener("message", function (event) {
        if (allowedOrigin && event.origin !== allowedOrigin) {
          return;
        }

        if (!event.data || typeof event.data !== "object") {
          return;
        }

        if (event.data.type === "constructor:add-to-cart") {
          submitToCart(
            event.data.payload && event.data.payload.variantId,
            event.data.payload && event.data.payload.quantity,
          );
        }

        if (event.data.type === "constructor:resize") {
          resizeIframe(iframe, event.data.payload && event.data.payload.height);
        }
      });
    },
  };
})();
