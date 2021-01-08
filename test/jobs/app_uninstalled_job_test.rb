require 'test_helper'

class AppUninstalledJobTest < ActiveJob::TestCase
  def setup
    @shop = shops(:regular_shop)
  end

  def job
    @job ||= ::AppUninstalledJob.new
  end

  test "AppUninstalledJob marks the shop as uninstalled from the app" do
    job.perform(shop_domain: @shop.shopify_domain)

    assert_raises ActiveRecord::RecordNotFound do
      @shop.reload
    end
  end

  test "AppUninstalledJob does nothing for non-existent shop" do
    Shop.any_instance.expects(:destroy!).never

    job.perform(shop_domain: 'example.myshopify.com')
  end
end
