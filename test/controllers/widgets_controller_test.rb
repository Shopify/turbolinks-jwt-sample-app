require 'test_helper'

class WidgetsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @widget = widgets(:one)
  end

  test "should get index" do
    get widgets_url
    assert_response :success
  end

  test "should get new" do
    get new_widget_url
    assert_response :success
  end

  test "should create widget" do
    assert_difference('Widget.count') do
      post widgets_url, params: { widget: { name: @widget.name, size: @widget.size } }
    end

    assert_redirected_to widget_url(Widget.last)
  end

  test "should show widget" do
    get widget_url(@widget)
    assert_response :success
  end

  test "should get edit" do
    get edit_widget_url(@widget)
    assert_response :success
  end

  test "should update widget" do
    patch widget_url(@widget), params: { widget: { name: @widget.name, size: @widget.size } }
    assert_redirected_to widget_url(@widget)
  end

  test "should destroy widget" do
    assert_difference('Widget.count', -1) do
      delete widget_url(@widget)
    end

    assert_redirected_to widgets_url
  end
end
