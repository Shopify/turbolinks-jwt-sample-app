require 'test_helper'

class SplashPageControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get splash_page_index_url
    assert_response :success
  end

end
