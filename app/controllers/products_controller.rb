# frozen_string_literal: true

class ProductsController < AuthenticatedController
  def index
    # @products = ShopifyAPI::Product.find(:all, params: { limit: 10 })
    redirect_to widgets_path(request.params)
  end
end
