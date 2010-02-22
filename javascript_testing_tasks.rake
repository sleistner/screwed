require File.expand_path(File.dirname(__FILE__) + '/screwed')

def error_message_for_missing_spec_dir
  %Q{Could not find JavaScript test directory.
None of the following directories existed: #{Screwed::JavaScriptSpecDirs.join(", ")}.
Maybe you need to call './script/generate blue_ridge'?
}
end

# Support Test::Unit & Test/Spec style
namespace :test do
  desc "Runs all the JavaScript tests and outputs the results"
  task :javascripts do
    js_spec_dir = Screwed.find_javascript_spec_dir || (raise error_message_for_missing_spec_dir)
    raise "JavaScript test failures" unless Screwed.run_specs_in_dir(js_spec_dir, ENV["TEST"])
  end

  task :javascript => :javascripts
end

# Support RSpec style
namespace :spec do
  task :javascripts => "test:javascripts"
  task :javascript =>  "test:javascripts"
end

namespace :js do
  task :fixtures do
    js_spec_dir = Screwed.find_javascript_spec_dir || (raise error_message_for_missing_spec_dir)
    fixture_dir = "#{js_spec_dir}/fixtures"

    if PLATFORM[/darwin/]
      system("open #{fixture_dir}")
    elsif PLATFORM[/linux/]
      system("firefox #{fixture_dir}")
    else
      puts "You can run your in-browser fixtures from #{fixture_dir}."
    end
  end

end
