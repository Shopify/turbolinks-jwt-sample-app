# frozen_string_literal: true

class AuthenticatedController < ApplicationController
  include ShopifyApp::Authenticated

  before_action :shop_origin

  def shop_origin
    @shop_origin = current_shopify_domain
  end
end
