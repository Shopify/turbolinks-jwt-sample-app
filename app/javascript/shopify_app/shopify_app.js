import { getSessionToken } from "@shopify/app-bridge-utils";

document.addEventListener("DOMContentLoaded", async () => {
  const origOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function() {
    this.addEventListener('load', function() {
      const parsedUrl = new URL(this.responseURL);
      const return_to_param = parsedUrl.searchParams.get('return_to');

      if (return_to_param) {
        Turbolinks.visit(return_to_param);
      }
    });
    origOpen.apply(this, arguments);
  };

  var data = document.getElementById("shopify-app-init").dataset;
  var AppBridge = window["app-bridge"];
  var createApp = AppBridge.default;
  window.app = createApp({
    apiKey: data.apiKey,
    shopOrigin: data.shopOrigin,
  });

  var actions = AppBridge.actions;
  var TitleBar = actions.TitleBar;
  TitleBar.create(app, {
    title: data.page,
  });

  // Wait for a session token before trying to load an authenticated page
  await retrieveToken(app);

  // Redirect to the requested page
  Turbolinks.visit(data.loadPath);

  // Keep retrieving a session token periodically
  keepRetrievingToken(app);
});

async function retrieveToken(app) {
  window.sessionToken = await getSessionToken(app);
}

function keepRetrievingToken(app) {
  setInterval(() => {
    retrieveToken(app);
  }, 50000);
}

document.addEventListener("turbolinks:request-start", function (event) {
  var xhr = event.data.xhr;
  xhr.setRequestHeader("Authorization", "Bearer " + window.sessionToken);
});

document.addEventListener("turbolinks:render", function () {
  $("form, a[data-method=delete]").on("ajax:beforeSend", function (event) {
    const xhr = event.detail[0];
    xhr.setRequestHeader("Authorization", "Bearer " + window.sessionToken);
  });
});
