module Screwed
  JavaScriptSpecDirs = [
    "examples/javascripts",
    "spec/javascripts",
    "test/javascript",
    "test",
    "tests",
    "spec",
    "specs"
  ]

  def self.location
    File.dirname(__FILE__)
  end

  def self.rhino_command
    "java -Dscrewed.dir=\"#{location}\" -jar \"#{location}/env-js.jar\" -w -debug"
  end

  def self.test_runner_command
    "#{rhino_command} \"#{location}/test_runner.js\""
  end

  def self.find_javascript_spec_dir
    JavaScriptSpecDirs.find {|d| File.exist?(d) }
  end

  def self.find_specs_under_current_dir
    Dir.glob("**/*_spec.js")
  end

  def self.run_spec(spec_filename)
    system("#{test_runner_command} \"#{spec_filename}\"")
  end

  def self.run_specs_in_dir(spec_dir, spec_name = nil)
    result = nil
    Dir.chdir(spec_dir) { result = run_specs(spec_name) }
    result
  end

  def self.run_specs(spec_name = nil)
    specs = spec_name.nil? ? find_specs_under_current_dir : ["#{spec_name}_spec.js"]
    all_fine = specs.inject(true) { |result, spec| result &= run_spec(spec) }
  end
end
