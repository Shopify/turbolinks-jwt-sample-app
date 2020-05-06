document.addEventListener('DOMContentLoaded', async () => {
  var data = document.getElementById('shopify-app-init').dataset;
  var AppBridge = window['app-bridge'];
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

  // Wait for the token before trying to load an authenticated page
  await retrieveToken(app);
  Turbolinks.visit('/home');

  // Keep requesting the token every 50 seconds (I don't think we can wait for the token inline in request-start
  // event listener)
  keepRetrievingToken(app);
});

async function retrieveToken(app) {
  var AppBridge = window['app-bridge'];
  app.dispatch(AppBridge.actions.SessionToken.request());

  window.sessionToken = await new Promise((resolve) => {
    app.subscribe(AppBridge.actions.SessionToken.ActionType.RESPOND, (data) => {
      resolve(data.sessionToken || '');
    });
  });
}

function keepRetrievingToken(app) {
  setInterval(() => { retrieveToken(app) }, 50000);
}

document.addEventListener("turbolinks:request-start", function(event) {
  var xhr = event.data.xhr;
  xhr.setRequestHeader("Authorization", "Bearer " + window.sessionToken);
});

document.addEventListener("turbolinks:render", function() {
  $('form, a[data-method=delete]').on('ajax:beforeSend', function(event) {
    const xhr = event.detail[0];
    xhr.setRequestHeader("Authorization", "Bearer " + window.sessionToken);
  });
});
