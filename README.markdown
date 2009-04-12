Description
===========
These jQuery plugins provides machine-tag related methods, most importantly a machine
tag search and a machine tag tree. For an introduction to machine tags, [read this](http://tagaholic.me/2009/03/26/what-are-machine-tags.html). To see a live version of the machine tag tree see [my blog's search engine](http://tagaholic.me/blog.html).

Setup
=====
    <script src="jquery.js"></script>
    <script src="jquery.machineTag.js"></script>
    <!-- optionally display results with machineTagTree -->
    <script src="jquery.machineTagTree.js"></script>

Usage
=====
Searches take a wildcard machine tag. A wildcard has three special characters: *, : and =. An asterisk
matches any characters; a colon sits between a namespace and predicate; an equal sign sits between a predicate and a value.
The wildcard syntax should be compatible with [flickr's wildcard search](http://code.flickr.com/blog/2008/07/18/wildcard-machine-tag-urls/).

    // Example machine-tagged items
    var records = [{"url": http://www.civicmediacenter.org/", "tags": ["site:tags=gville", "site:type=organization"] },
    {"url": "http://weblog.rubyonrails.com/", "tags": ["site:type=blog", "site:tags=rails"]}];

    $.machineTagSearch('*=gville', {records: records}) 
    //=> [{"url": http://www.civicmediacenter.org/", "tags": ["site:tags=gville", "site:type=organization"] }]
  
    // If records were in '/bookmarks.json'
    $.machineTagSearch('*=gville', {jsonUrl: '/bookmarks.json'})
    //=> same as previous
    
    // Get machine tags that match wildcard.
    $.machineTagSearchRecordTags('site:type') 
    //=> ['site:type=blog', 'site:type=organization']
  
    // Parse a machine tag.
    var mtag = $.machineTag('site:type=>'blog);
    mtag.namespace //=>'site'
    mtag.predicate //=>'type'
    mtag.value     //=>'blog'

Machine Tag Tree Plugin
=======================
jquery.machineTagTree.js is a jquery plugin that complements jquery.machineTag.js by providing a tree view for machine-tagged items that match a machine tag query. It's main method, $.machineTagTree() depends on the [treeTable jQuery plugin](http://plugins.jquery.com/project/treeTable). The demo comes bundled with a treeTable version that works with this plugin. 

Plugin API's
============
These are brief descriptions of the methods. Read a plugin's source for more documentation.

jquery.machineTag.js provides the following methods:

* $.machineTagSearch(wildcard\_machine\_tag, options): Returns machine-tagged items that match wildcard machine tag.
* $.machineTagSearchRecordTags(wildcard\_machine\_tag, records): Returns tags from machine-tagged items that match the wildcard machine tag.
* $.machineTagSearchLocation(options): Wrapper around machineTagSearch() which assumes wildcard is appended to the end of the url after a '#'
  ie http://example.com/tag\_search#wildcard .
* $.hideMachineTags(): Assuming text of selector elements are machine tags, replaces them with a
  hidden namespace and predicate and visible value. The hidden fields can be toggled visible with
  $.toggleHiddenMachineTags().

jquery.machineTagTree.js provides the following methods:

* $.machineTagTree(wildcard\_machine\_tag, records, options): Given a wildcard machine tag and its matching records, displays the results in a tree table. Designed to be passed as a displayCallback to $.machineTagSearch(). Dependent on the jquery treeTable plugin.
* $.createMachineTagTree(wildcard\_machine\_tag, records): Given a wildcard machine tag and its matching records, gives back an array of nodes to be displayed as a tree.  Designed to be passed as a displayCallback to $.machineTagSearch(). Not dependent on any plugins.


Demo
====
The demo uses both plugins to display a machine tag tree. To try the demo:

1. Be online since it uses google's jquery library.
2. Copy jquery.machineTag.js and jquery.machineTagTree.js to demo/javascripts
3. Open demo/index.html in your browser.

License
=======
See LICENSE.txt for these plugins. The treeTable plugin bundled as a dependency is MIT.