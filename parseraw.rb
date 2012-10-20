require 'json'

dictionary = {:words => []}
f = File.open("raw.txt", "r")
f.each_line { 
	|line| 
	entry = {}
  entry[:latin] = line[/^[a-z., ]*/].split(',').map(&:strip)
	entry[:info] = line[/[A-Z\[ ]+?\]/].strip
	entry[:english] = line[/(?<=::).*/].strip
	dictionary[:words] << entry
}
f.close
puts dictionary.to_json

