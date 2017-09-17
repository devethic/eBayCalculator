let Local = {
  defaults: ["fr","en"],
  current: null,
  init: function () {
    let key = Local.defaults.indexOf(navigator.language.substr(0,2));
    Local.current = Local.defaults[key == -1 ? 0 : key];
    Local.translateIds();
  },
  translateIds: function () {
    for(let key in Local[Local.current]["ID"]) {
      let o = document.getElementById(key);
      if (o)
        o.innerHTML = Local.text(key, null, null, null, "ID");
    }
  },
  text: function (key, varname1 = "", varname2 = "", varname3 = "", type = "TEXT") {
    if (Local[Local.current][type] != undefined) {
      let text = Local[Local.current][type][key];
      if (text != undefined)
        return Local.isLiteralTemplate(text) ? eval(text) : text;
    }
    return "";
  },
  isLiteralTemplate: function (val) {
    return (/^`.*`$/).test(val);
  },
  fr: {
    "ID": {
      "lblPrixDeVente": "prix de vente",
      "prixExpedMainPropre": "En main propre",
      "prixExpedMondialRelais": "Mondial Relais",
      "prixExpedAutre": "Autre",
      "lblPrixExpedPayeAutre": "prix livreur",
      "lblSelPrixExpedMondialRelais": "prix livreur",
      "lblPrixColisExped": "prix colis",
      "btnSubmit": "Ok",
      "lastModified": "`© ${varname1} DevEthic, modifié le ${varname2} à ${varname3}`"
    },
    "TEXT": {
      "chartLegendProfit": "Revenu",
      "chartLegendEbay": "eBay",
      "chartLegendPaypal": "Paypal",
      "chartLegendDelivery": "Livraison",
      "chartLblHandDelivery": "`${varname1}€ En main propre`",
      "chartLblDeliveryFreeEmbedded": "`${varname1}€ Livraison gratuite`",
      "chartLblDeliveryFreeIntegrated": "`${varname1}€ Livraison gratuite`",
      "chartLblDeliveryCostZero": "`${varname1}€ + ${varname2}€ = ${varname3}€ Livraison coût zéro`"
    }
  },
  en: {
    "ID": {
      "lblPrixDeVente": "sell price",
      "prixExpedMainPropre": "hand delivery",
      "prixExpedMondialRelais": "Mondial Relais",
      "prixExpedAutre": "Other",
      "lblPrixExpedPayeAutre": "shipping price",
      "lblSelPrixExpedMondialRelais": "shipping price",
      "lblPrixColisExped": "packet cost",
      "btnSubmit": "Ok",
      "lastModified": "`© ${varname1} DevEthic, modified ${varname2} at ${varname3}`"
    },
    "TEXT": {
      "chartLegendProfit": "Profit",
      "chartLegendEbay": "eBay",
      "chartLegendPaypal": "Paypal",
      "chartLegendDelivery": "Shipping",
      "chartLblHandDelivery": "`${varname1}€ Hand delivery`",
      "chartLblDeliveryFreeEmbedded": "`${varname1}€ Free delivery`",
      "chartLblDeliveryFreeIntegrated": "`${varname1}€ Free delivery`",
      "chartLblDeliveryCostZero": "`${varname1}€ + ${varname2}€ = ${varname3}€ Zero cost delivery`"
    }
  }
};