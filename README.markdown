Description
===========
This jQuery plugin provides machine-tag related methods, most importantly a machine
tag search. For an introduction to machine tags, [read this](http://tagaholic.me/2009/03/26/what-are-machine-tags.html).

Setup
=====
    <script src="jquery.js"></script>
    <script src="jquery.machineTag.js"></script>

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

Plugin Methods
==============
* machineTagSearch(wildcard\_machine\_tag, options): Returns machine-tagged items that match wildcard machine tag.
* machineTagSearchRecordTags(wildcard\_machine\_tag, records): Returns tags from machine-tagged items that match the wildcard machine tag.
* machineTagSearchLocation(options): Wrapper around machineTagSearch() which assumes wildcard is appended to the end of the url after a '#'
  ie http://example.com/tag\_search#wildcard .

