import { getSessionToken } from "@shopify/app-bridge-utils";

const SESSION_TOKEN_REFRESH_INTERVAL = 2000; // Request a new token every 2s

document.addEventListener("DOMContentLoaded", async function () {
  // Initialize the Embedded App
  initializeAppBridge();
  initializeAppTitleBar();

  // Wait for a session token before trying to load an authenticated page
  await retrieveToken(app);

  // Keep retrieving a session token periodically
  keepRetrievingToken(app);

  // Redirect to the requested page when DOM loads
  var isInitialRedirect = true;
  redirectThroughTurbolinks(isInitialRedirect);

  document.addEventListener("turbolinks:load", function (event) {
    redirectThroughTurbolinks();
  });
});

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

// Helper functions

function getShopifyAppData () {
  return document.getElementById("shopify-app-init").dataset;
}

function redirectThroughTurbolinks(isInitialRedirect = false) {
  var data = getShopifyAppData();
  var validLoadPath = data && data.loadPath;
  var shouldRedirect = false;

  switch(isInitialRedirect) {
    case true:
      shouldRedirect = validLoadPath;
      break;
    case false:
      shouldRedirect = validLoadPath && data.loadPath !== '/home'; // Replace with the app's home_path
      break;
  }

  if (shouldRedirect) Turbolinks.visit(data.loadPath);
}

function initializeAppBridge () {
  var data = getShopifyAppData();

  var AppBridge = window["app-bridge"];
  var createApp = AppBridge.default;

  window.app = createApp({
    apiKey: data.apiKey,
    shopOrigin: data.shopOrigin,
  });
}

function initializeAppTitleBar () {
  var data = getShopifyAppData();

  var AppBridge = window["app-bridge"];
  var actions = AppBridge.actions;
  var TitleBar = actions.TitleBar;

  TitleBar.create(app, {
    title: data.page,
  });
}

async function retrieveToken(app) {
  window.sessionToken = await getSessionToken(app);
}

function keepRetrievingToken(app) {
  setInterval(() => {
    retrieveToken(app);
  }, SESSION_TOKEN_REFRESH_INTERVAL);
}
