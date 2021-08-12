# frozen_string_literal: true

class ApplicationController < ActionController::Base

  before_action :set_host

  private

  def set_host
    @host = params[:host]
  end
end
