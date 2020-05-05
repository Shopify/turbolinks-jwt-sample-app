class ApplicationController < ActionController::Base
  include ShopifyApp::EmbeddedApp
  layout 'embedded_app'

  def index
  end
end
