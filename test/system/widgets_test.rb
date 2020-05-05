require "application_system_test_case"

class WidgetsTest < ApplicationSystemTestCase
  setup do
    @widget = widgets(:one)
  end

  test "visiting the index" do
    visit widgets_url
    assert_selector "h1", text: "Widgets"
  end

  test "creating a Widget" do
    visit widgets_url
    click_on "New Widget"

    fill_in "Name", with: @widget.name
    fill_in "Size", with: @widget.size
    click_on "Create Widget"

    assert_text "Widget was successfully created"
    click_on "Back"
  end

  test "updating a Widget" do
    visit widgets_url
    click_on "Edit", match: :first

    fill_in "Name", with: @widget.name
    fill_in "Size", with: @widget.size
    click_on "Update Widget"

    assert_text "Widget was successfully updated"
    click_on "Back"
  end

  test "destroying a Widget" do
    visit widgets_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Widget was successfully destroyed"
  end
end
