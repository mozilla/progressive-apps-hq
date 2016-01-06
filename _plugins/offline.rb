require "open3"

Jekyll::Hooks.register :site, :post_write do |site|
  if oghliner?
    integrate site.dest
    offline site.dest
  else
    puts <<EOS

ERROR: Can't find oghliner!
Install oghliner globally by typing 'npm install -g oghliner'

EOS
  end
end

def oghliner?()
  _, status = Open3.capture2("which", "oghliner")
  return status == 0;
end

def integrate(dest)
  _, status = Open3.capture2("oghliner", "integrate", dest)
end

def offline(dest)
  _, status = Open3.capture2("oghliner", "offline", dest)
end

module Jekyll
  class OfflineManager < Liquid::Tag
    def render(context)
      baseurl = context.registers[:site].config["baseurl"]
      "<script  src=\"#{baseurl}/offline-manager.js\"></script>"
    end
  end
end

Liquid::Template.register_tag('offline_manager',Jekyll::OfflineManager)
