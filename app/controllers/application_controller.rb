class ApplicationController < ActionController::Base
  include ShopifyApp::EmbeddedApp
  include ShopifyApp::RequireKnownShop

  layout 'embedded_app'

  def index
  end
end
