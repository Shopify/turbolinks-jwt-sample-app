module ShopifyAPI
  class Base < ActiveResource::Base
    self.headers['User-Agent'] << " | ShopifyApp/#{ShopifyApp::VERSION} | Shopify App CLI"
  end
end
