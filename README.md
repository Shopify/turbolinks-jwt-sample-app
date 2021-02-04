# App Bridge Authentication

A demo app created using Rails, App Bridge, and Turbolinks for the Shopify tutorial [Authenticate server-side rendered apps with session tokens using App Bridge](https://shopify.dev/tutorials/authenticate-server-side-rendered-apps-with-session-tokens-app-bridge-turbolinks).

## Quick start

To run this app locally, you can clone this repository and do the following.

1. Create a `.env` file to specify this app's `API key` and `API secret key` app credentials that can be found in the Shopify Partners dashboard.

```
SHOPIFY_API_KEY=<The API key app credential specified in the Shopify Partners dashboard>
SHOPIFY_API_SECRET=<The API secret key app credential specified in the Shopify Partners dashboard>
APP_URL=<The app URL specified in the Shopify Partners dashboard>
```

> __Note:__ If you do not have an API key or an API secret key, see the following sections of the [Build a Shopify App with Node and React](https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#get-a-shopify-api-key) guide.
>
>> **Important**: This guide names its API secret key environment variable `SHOPIFY_API_SECRET_KEY` rather than `SHOPIFY_API_SECRET`. The Shopify App gem uses the latter.
>
> 1. [Expose your dev environment](https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#expose-your-dev-environment)
> 2. [Get a Shopify API Key and Shopify API secret key](https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#get-a-shopify-api-key)
> 3. [Add the Shopify API Key and Shopify API secret key](https://shopify.dev/tutorials/build-a-shopify-app-with-node-and-react/embed-your-app-in-shopify#add-the-shopify-api-key)

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

5. Install and open this app on a shop. Requests to authenticated resources, like the `ProductsController` or the `WidgetsController`, should now be secured with an `Authorization: Bearer <session token>` header.

![App dashboard][s1]

_**Above:** A sample multi-paged app with an authenticated home page. It displays links to the protected Products and Widgets resources._

![Authenticated app requests][s2]

_**Above:** Requests made across multiple pages of the app are authenticated using JWTs._

[//]: # "Links"
[s1]: public/screenshot-1.png
[s2]: public/screenshot-2.png