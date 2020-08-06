# App Bridge Authentication

> __Note:__ This is a public beta feature.

## Contents

* [Use Turbolinks to convert a multi-page app](#use-turbolinks-to-convert-a-multi-page-app)
* [Quick start](#quick-start)
* [Suggested conversion pattern using Turbolinks](#suggested-conversion-pattern-using-turbolinks)
* [Enabling turbolinks on your app](#enabling-turbolinks-on-your-app)
* [Conversion guide](#conversion-guide)
    * [Creating a splash page](#creating-a-splash-page)
    * [Fetching and storing session tokens](#fetching-and-storing-session-tokens)
    * [Requesting authenticated resources](#requesting-authenticated-resources)

## Use Turbolinks to convert a multi-page app

[Turbolinks][2] is a JavaScript library that allows your app to behave as if it were a single-page app.

If you have a multi-page server-side rendered (SSR) app and you want to use session token-based authentication, but you are unsure or not yet ready to convert your app to a single-page app, then you can still use session tokens by converting your app to use Turbolinks.

## Quick start

To run this app locally, you can clone this repository and do the following.

1. Create a `.env` file to specify your `Shopify API Key` and `Shopify API Secret` available from your partners dashboard.

```
SHOPIFY_API_KEY='YOUR API KEY FROM SHOPIFY PARTNERS DASHBOARD'
SHOPIFY_API_SECRET_KEY='YOUR API SECRET KEY FROM SHOPIFY PARTNERS DASHBOARD'
SHOPIFY_DOMAIN='YOUR SHOPIFY DOMAIN - DEFAULT myshopify.com'
```

> __Note:__ If you do not have a Shopify API Key or Shopify API Secret, see the following sections of the [Build a Shopify App with Node and React][7] guide:
> 1. [Expose your dev environment][9]
> 2. [Get a Shopify API Key and Shopify API secret key][10]
> 3. [Add the Shopify API Key and Shopify API secret key][11]

2. Run the following to install the required dependencies.

```console
$ bundle install
$ yarn install
$ rails db:migrate
```

3. Ensure ngrok is running on port `3000`.

```console
$ ngrok http 3000
```

> __Note:__ This port number is arbitrary - you may choose to specify the port number you plan to listen to this app on.

4. Run the following to start the app.

```console
$ rails s
```

5. Open this sample app in Admin. Requests to authenticated resources, like the `ProductsController` or the `WidgetsController` should now be secured with an `Authorization: Bearer <session token>` header.

![App dashboard][s1]

_**Above:** A sample multi-paged app with an authenticated home page. It displays links to the protected Products and Widgets resources._

![Authenticated app requests][s2]

_**Above:** Requests made across multiple pages of the app are authenticated using JWTs._

## Suggested conversion pattern using Turbolinks

To use session tokens with your multi-page app using Turbolinks, we suggest implementing the pattern below.

1. Create an unauthenticated controller that renders a splash page when a user visits your app.
   * This page is intended to communicate to your user that your app is loading.
2. Use this splash page to:
    1. Create an App Bridge instance.
    2. Retrieve and cache a session token within your app client.
    3. Install event listeners to set an `"Authorization": "Bearer <session token>"` request header on the following events:
        1. `turbolinks:request-start`
        2. `turbolinks:render`
3. Install a timed event that continues to retrieve and cache session tokens every 50 seconds or so.
   * This will ensure that your session tokens are always valid.
4. Use Turbolinks to navigate to your app's authenticated home page or resource.

## Enabling Turbolinks on your app

Follow the steps below to enable Turbolinks on your app. The official [Turbolinks GitHub guide][2] is an excellent resource on getting started.

1. Add the `turbolinks` gem to your Gemfile:

```rb
gem 'turbolinks', '~> 5'
```

2. Run `bundle install`.

3. Add the `turbolinks` package to your application. 

```console
$ yarn add turbolinks
```

4. Add the following line to `app/javascript/packs/application.js` if your app uses webpack to manage its manifest files.

```js
require("turbolinks").start()
```

## Conversion guide

This section assumes your app is enabled to use JWT authentication and session tokens. You can create a JWT-enabled app using the [v14 shopify_app][12] gem release by running the following generator.

```console
$ rails generate shopify_app --with-session-token
```

* The `--with-session-token` flag creates an embedded app that is configured to use App Bridge authentication right out of the box.

The sections below describe a step-by-step implementation to the pattern described in [Suggested conversion pattern using Turbolinks](#suggested-conversion-pattern-using-Turbolinks).

### Creating a splash page

Your splash page is used to indicate that your app has begun to fetch a session token. Once your app has this token, your app should navigate the user to the main view containing potentially protected or authenticated resources.

1. Create a `SplashPageController` along with a default index action and view.

```console
$ rails generate controller splash_page index
```

2. Make `splash_page#index` the default root route for your app. Change the following in your `routes.rb` file.

```rb
Rails.application.routes.draw do
  root to: 'splash_page#index'
  ...
end
```

3. Indicate a loading status in your splash page index view. Change `app/views/splash_page/index.html.erb` to match the following.

```html
<p>Loading...</p>
```

4. Make the `SplashPageController` behave as the default embedded app `HomeController`.

* Change `app/controllers/splash_page_controller.rb` to match the following.

```rb
class SplashPageController < ApplicationController
  include ShopifyApp::EmbeddedApp
  include ShopifyApp::RequireKnownShop

  def index
    @shop_origin = current_shopify_domain
  end
end
```

* Protect the default `HomeController` by inheriting `AuthenticatedController`. Change `home_controller.rb` to match the following.

```rb
class HomeController < AuthenticatedController
  def index
  end
end
```

> __Tip:__ You can add `include ShopifyApp::RequiredKnownShop` to `HomeController` if you would like all requests made to this controller to have a valid `shop` query parameter.

### Fetching and storing session tokens

> __Note:__ If your app is an embedded app, one of the first JavaScript files to run on app load is `app/javascript/shopify_app/shopify_app.js`. We can leverage this to fetch and store tokens for the app.

When users visit the app for the first time, they will be presented with the loading splash page. Use this splash page to accomplish the following via JavaScript:
* Create an App Bridge instance
* Fetch a session token and cache it
* Install event listeners on the `turbolinks:request-start` and `turbolinks:render` events to add an `Authorization` request header
* Install event listeners to add an `Authorization` request header on the following events:
    * `turbolinks:request-start`
    * `turbolinks:render`
* Use Turbolinks to navigate to the `HomeController`

1. Add the following `load_path` parameter to `app/views/layouts/embedded_app.html.erb`.

```rb
...
    <%= content_tag(:div, nil, id: 'shopify-app-init', data: {
      api_key: ShopifyApp.configuration.api_key,
      shop_origin: @shop_origin || (@current_shopify_session.domain if @current_shopify_session),
      load_path: params[:return_to] || home_path,
      ...
    } ) %>
...
```

* This parameter is used by Turbolinks to know where to navigate this app to when a session token has been fetched. In this app, we navigate to `home_path` by default.

2. Import the library method `getSessionToken` from `app-bridge-utils` in `app/javascript/shopify_app/shopify_app.js`.

```js
import { getSessionToken } from "@shopify/app-bridge-utils";
```

3. Write a method in `shopify_app.js` that fetches and stores a session token and another to repeat this every 50 seconds.

```js
async function retrieveToken(app) {
  window.sessionToken = await getSessionToken(app);
}

function keepRetrievingToken(app) {
  setInterval(() => {
    retrieveToken(app);
  }, 50000);
}
```

4. In `shopify_app.js`, add event listeners to the `turbolinks:request-start` and `turbolinks:render` events. Set an `"Authorization": "Bearer <session token>"` header during these events.

```js
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
```

5. In the same file, edit the `DOMContentLoaded` event listener to add the following instructions.

```js
document.addEventListener("DOMContentLoaded", async () => {
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
```

* After a session token is retrieved, `Turbolinks.visit(data.loadPath)` visits the `load_path` param defined in `embedded_app.html.erb`.
* Your app continues to retrieve session tokens every 50 seconds or so.


### Requesting authenticated resources

When a user visits your app, they should now briefly see a "Loading..." screen before they're taken to the `HomeController` of your app. This `HomeController` is already an authenticated controller, but for this demo we have created two additional authenticated controllers as well: the `ProductsController` and the `WidgetsController`.

This section shows how the `ProductsController` was created and made navigational within the app.

1. Generate a `ProductsController` using the Rails generator.

```console
$ rails generate controller products index
```

2. Protect the `ProductsController` by inheriting `AuthenticatedController`.

```js
class ProductsController < AuthenticatedController
  def index
    @products = ShopifyAPI::Product.find(:all, params: { limit: 10 })
  end
end
```

3. Create a view for the `ProductsController`. Edit `app/views/products/index.html.erb` to match the following.

```erb
<%= link_to 'Back', home_path(shop: @shop_origin) %>

<h2>Products</h2>

<ul>
  <% @products.each do |product| %>
    <li><%= link_to product.title, "https://#{@current_shopify_session.domain}/admin/products/#{product.id}", target: "_top" %></li>
  <% end %>
</ul>
```

> __Tip:__ To  satisfy a `ShopifyApp::RequireKnownShop` concern, add the following method to the `before_action` filter within `AuthenticatedController`. `shop_origin` ensures your controllers always have a valid `shop` parameter to add as a query parameter between page navigations.
>
> This makes it possible to create "Back" links or navigational breadcrumbs to resources that include the `ShopifyApp::RequiredKnownShop` concern.

```rb
class AuthenticatedController < ApplicationController
  include ShopifyApp::Authenticated

  before_action :shop_origin

  def shop_origin
    @shop_origin = current_shopify_domain
  end
end
```

* `current_shopify_domain` is available through the `LoginProtection` concern.

4. Edit `app/views/home/index.html.erb` to create a link from the `HomeController` to the `ProductsController` view.

```erb
<%= link_to 'Products', products_path %>
```

5. Your app is now able to access the authenticated `ProductsController` from the `HomeController` using session tokens.


[//]: # "Links"
[s1]: public/screenshot-1.png
[s2]: public/screenshot-2.png
[1]: https://drive.google.com/open?id=1KuWZc10Hnp0vCfR8ulYHVlazjA1RfXx9iDHb2d5e6Hk
[2]: https://github.com/turbolinks/turbolinks
[3]: https://github.com/Shopify/next-gen-auth-app-demo#make-your-app-react-graphql-and-shopify_app-ready
[4]: https://www.shopify.in/partners/blog/shopify-admin-authenticate-app 
[5]: https://github.com/Shopify/shopify_app/releases/tag/v13.3.0
[6]: https://www.npmjs.com/package/@shopify/app-bridge/v/1.22.0
[7]: https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#get-a-shopify-api-key
[8]: https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-express#step-2-create-and-configure-your-app-in-the-partner-dashboard
[9]:
https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#expose-your-dev-environment
[10]:
https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#get-a-shopify-api-key
[11]:
https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#add-the-shopify-api-key
[12]: https://github.com/Shopify/shopify_app/releases/tag/v14.0.0
