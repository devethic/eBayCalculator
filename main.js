//import {Local} from "local";
let ctx = document.getElementById("myChart").getContext('2d');
let myChart = null;
let Menu = {
  clickLangs: function () {
    Local.setCurrent(this.getAttribute("data-local"));
    return false;
  },
  initLangs: function () {
    let t = document.querySelectorAll('#menuLangs li>a');
    for(let i=0; i<t.length; i++) {
      t[i].onclick = Menu.clickLangs;
    }
  },
  init: function () {
    Menu.initLangs();
  }
};
let Fee = {
  paypalCom: 0.034, //%
  paypalComByTransac: 0.25, //€
  ebayCom: 0.08, //%
  eBayCost: function (pPrice) {
    return round(pPrice * Fee.ebayCom);
  },
  paypalCost: function (pPrice) {
    return round((pPrice * Fee.paypalCom) + Fee.paypalComByTransac);
  }
};
let Delivery = {
  prixExpedPayeAutre: document.getElementById('prixExpedPayeAutre'),
  prixColisExped: document.getElementById('prixColisExped'),
  // prixExpedAcheteur = document.getElementById('prixExpedAcheteur'),
  cost: function () {
    return round(Delivery.packetPrice() + Delivery.price());
  },
  costZero: function () {
    return round(Delivery.cost() / (1 - Fee.ebayCom));
  },
  price: function () {
    let ret = 0;
    switch (Delivery.currentTabId()) {
      case "prixExpedAutre":
        ret = Delivery.prixExpedPayeAutre.value;
        break;
      case "prixExpedMondialRelais":
        ret = document.querySelector("#selPrixExpedMondialRelais option:checked").value;
        break;
      case "prixExpedMainPropre":
      default:
        break;
    }
    return round(ret);
  },
  packetPrice: function () {
    return round(Delivery.prixColisExped.value);
  },
  currentTabId: function () {
    return Delivery.currentTabObj().id;
  },
  currentTabObj: function () {
    return document.querySelector('#expedition button[aria-selected="true"]');
  },
  setCurrentTab: function (pId) {
    let t = document.querySelectorAll('#expedition button');
    for(let i=0; i<t.length; i++) {
      let bCurrent = (pId == t[i].id);
      t[i].setAttribute('aria-selected', bCurrent);
      document.getElementById(t[i].getAttribute('aria-controls')).style.display = (bCurrent ? "block" : "none");
      if (bCurrent) {
        let bIsMainPropre = (pId == "prixExpedMainPropre");
        document.getElementById('infosExpedCommon').style.display = bIsMainPropre ? "none" : "block";
        Delivery.setRequiredEltForTab(t[i].id);
      }
    }
  },
  setRequiredEltForTab: function (psTabId) {
    switch (psTabId) {
      case "prixExpedAutre":
      case "prixExpedMondialRelais":
        Delivery.prixExpedPayeAutre.required = (psTabId=="prixExpedAutre");
        Delivery.prixColisExped.required = true;
        break;
      case "prixExpedMainPropre":
      default:
        Delivery.prixColisExped.required = Delivery.prixExpedPayeAutre.required = false;
        break;
    }
  },
  clickTab: function () {
    Delivery.setCurrentTab(this.id);
  },
  initTabs: function () {
    let t = document.querySelectorAll('#expedition button');
    for(let i=0; i<t.length; i++) {
      t[i].onclick = Delivery.clickTab;
    }
  },
  init: function () {
    Delivery.initTabs();
  }
};
let Graphic = {
  tmp: null,
  conf: {
    showDeliveryFreeEmbedded:true,
    showDeliveryFreeIntegrated:true,
    showDeliveryCostZero:true
  },
  colors: {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
  },
  registerPlugins: function () {
    // Define a plugin to provide data labels
    Chart.plugins.register({
      afterDatasetsDraw: function(chart, easing) {
        // To only draw at the end of animation, check for easing === 1
        var ctx = chart.ctx;
        var alternPos = 6;
        chart.data.datasets.forEach(function (dataset, i) {
          // alternate label position
          alternPos*=-1;
          var meta = chart.getDatasetMeta(i);
          if (!meta.hidden) {
            meta.data.forEach(function(element, index) {
              // Draw the text in black, with the specified font
              ctx.fillStyle = 'rgb(0, 0, 0)';

              var fontSize = 10;
              var fontStyle = 'normal';
              var fontFamily = 'Helvetica Neue';
              ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

              // Just naively convert to string for now
              var dataString = dataset.data[index].toString();
              if (dataString=="0") return false;

              // Make sure alignment settings are correct
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              var padding = 0;
              var position = element.tooltipPosition();

              ctx.fillText(dataString, position.x - fontSize - padding, position.y - alternPos);
            });
          }
        });
      }
    });
  },
  init: function (poData) {
    Graphic.registerPlugins();
    myChart = new Chart(ctx, {
      type: 'horizontalBar',
      data: poData,
      options: {
       responsive: true,
       scales: {
         xAxes: [{
           stacked: true,
           ticks: {
             //stepSize: 5
           }
         }],
         yAxes: [{
           stacked: true
         }]
       },
       tooltips: {
         mode: 'index',
         callbacks: {
           // Use the footer callback to display the percentage of the items showing in the tooltip
           footer: function(tooltipItems, data) {
             var frais = 0;
             tooltipItems.forEach(function(tooltipItem) {
               frais = round(100*(data.datasets[1].data[tooltipItem.index] / (data.datasets[0].data[tooltipItem.index] + data.datasets[1].data[tooltipItem.index])));
               return;
             });
             return 'Frais = ' + frais + '%';
           },
         },
         footerFontStyle: 'normal'
       }
     }
    });
  },
  data: function (pfPrice, pbHandDelivery) {
    let tLabels = [];
    let tProfit = [];
    let tEbayCost = [];
    let tPaypalCost = [];
    let tDeliveryCost = [];

    pfPrice = round(pfPrice);
    let paypalCost = Fee.paypalCost(pfPrice);
    let eBayCost = Fee.eBayCost(pfPrice);

    // Remis en main propre : pas de frais ni coûts de livraison
    tLabels.push(Local.text("chartLblHandDelivery", pfPrice));
    tProfit.push(round(pfPrice - eBayCost - paypalCost));
    tEbayCost.push(eBayCost);
    tPaypalCost.push(paypalCost);
    tDeliveryCost.push(0);

    if (!pbHandDelivery) {
      if (Graphic.conf.showDeliveryFreeEmbedded) {
        // Livraison gratuite : on intègre la livraison sans modif du prix de vente
        tLabels.push(Local.text("chartLblDeliveryFreeEmbedded", pfPrice));
        tProfit.push(round(pfPrice - eBayCost - paypalCost - Delivery.cost()));
        tEbayCost.push(eBayCost);
        tPaypalCost.push(paypalCost);
        tDeliveryCost.push(Delivery.cost());
      }
      if (Graphic.conf.showDeliveryFreeIntegrated) {
        // Livraison gratuite : on intègre la livraison au prix de vente
        eBayCost = Fee.eBayCost(pfPrice + Delivery.cost());
        paypalCost = Fee.paypalCost(pfPrice + Delivery.cost());
        tLabels.push(Local.text("chartLblDeliveryFreeIntegrated", round(pfPrice + Delivery.cost())));
        tProfit.push(round(pfPrice + Delivery.cost() - eBayCost - paypalCost - Delivery.cost()));
        tEbayCost.push(eBayCost);
        tPaypalCost.push(paypalCost);
        tDeliveryCost.push(Delivery.cost());
      }
      if (Graphic.conf.showDeliveryCostZero) {
        // Livraison à coût zéro ==> (prix colis + prix Livraison) / (1 - eBay comm) == prix acheteur
        eBayCost = Fee.eBayCost(pfPrice + Delivery.costZero());
        paypalCost = Fee.paypalCost(pfPrice);
        tLabels.push(Local.text("chartLblDeliveryCostZero", round(pfPrice), Delivery.costZero(), round(pfPrice + Delivery.costZero())));
        tProfit.push(round(pfPrice + Fee.eBayCost(Delivery.costZero()) - eBayCost - paypalCost));
        tEbayCost.push(eBayCost);
        tPaypalCost.push(paypalCost);
        tDeliveryCost.push(0);
      }
    }
    return {tLabels, tProfit, tEbayCost, tPaypalCost, tDeliveryCost};
  },
  make: function (pfPrice, pbHandDelivery) {
    let {tLabels, tProfit, tEbayCost, tPaypalCost, tDeliveryCost} = Graphic.data(pfPrice, pbHandDelivery);
    let oData = {
      labels: tLabels,
      datasets: [{
        label: Local.text("chartLegendProfit"),
        data: tProfit,
        backgroundColor: Graphic.colors.green
      }, {
        label: Local.text("chartLegendEbay"),
        data: tEbayCost,
        backgroundColor: Graphic.colors.red
      }, {
        label: Local.text("chartLegendPaypal"),
        data: tPaypalCost,
        backgroundColor: Graphic.colors.orange
      }, {
        label: Local.text("chartLegendDelivery"),
        data: tDeliveryCost,
        backgroundColor: Graphic.colors.yellow
      }]
    };
    if (myChart == null) {
       Graphic.init(oData);
    }
    else {
      myChart.data = oData;
      myChart.update();
    }
  }
};
let LastModified = {
  init: function () {
    let d = new Date(document.lastModified);
    let year = d.getFullYear();
    let date = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear();
    let hour = (d.getHours() < 10 ? "0":"") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0":"") + d.getMinutes();
    document.getElementById("lastModified").innerHTML = Local.text("lastModified", year, date, hour);
  }
};
function round(pVal) {
  return Math.round(100*(pVal))/100;
}
function getResult(oForm) {
  Graphic.make(oForm.prixDeVente.value, Delivery.currentTabId() == "prixExpedMainPropre");
  return false;
}

Local.init();
Menu.init();
Delivery.init();
LastModified.init();
Object.assign(Graphic.conf, {showDeliveryFreeEmbedded:false});
