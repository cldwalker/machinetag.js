(function($) {
  $.machineTagSearchLocation = function(options) {
    if (locationMachineTag() != null) {
      $.machineTagSearch(locationMachineTag().pop(), options);
    }
  };

  $.machineTagSearch = function(wildcard_machine_tag, options) {
    var options = $.extend($.machineTagSearch.defaultOptions, options || {});
    if (options.beforeSearch) options.beforeSearch.call(this);
    if (options.records) {
      var matching_records = machineTagSearchBody(wildcard_machine_tag, options.records, options);
    }
    else if (options.jsonUrl) {
      $.getJSON(options.jsonUrl, function(json_records) {
        var matching_records = machineTagSearchBody(wildcard_machine_tag, json_records, options);
      });
    }
    return matching_records;
  };

  function machineTagSearchBody(wildcard_machine_tag, records, options) {
    var matching_records = machineTagSearchRecords(wildcard_machine_tag, records);
    if (options.afterSearch) options.afterSearch.call(this);
    if (options.callback) options.callback.call(this, wildcard_machine_tag, matching_records);
    location.href = location.href.replace(/#(.*?)$/, '') + "#" + wildcard_machine_tag;
    return matching_records;
  };

  $.machineTagSearch.defaultOptions = {};

  $.machineTagSearchRecordTags = function(wildcard_machine_tag, records) {
    var machine_tags = [];
    $.each(records, function(i,e) {
      $.each(e.tags, function(j,f) {
        if (machineTagMatchesWildcard(f, wildcard_machine_tag) && ($.inArray(f, machine_tags) == -1)) {
          machine_tags.push(f);
        }
      });
    });
    machine_tags.sort();
    return machine_tags;
  };

  $.machineTag = function(machine_tag) {
    var fields = machine_tag.split(/[:=]/);
    return {namespace: fields[0], predicate: fields[1], value: fields[2]};
  };

  $.machineTag.predicate_delimiter = ':';
  $.machineTag.value_delimiter = '=';

  $.machineTag.any = function(array, callback) {
    return $($.grep(array, callback)).size() > 0
  };

  $.createMachineTagTree = function(wildcard_machine_tag, records) {
    var machine_tags = $.machineTagSearchRecordTags(wildcard_machine_tag, records);
    var rows = [];
    $.each(machine_tags, function(i,tag) {
      var mtag = $.machineTag(tag);
      var tagged_records = $.grep(records, function(post, j) { return $.inArray(tag, post.tags) != -1});
      var tag_rows = [{tag: mtag.namespace,mtag: mtag, level:0}, {tag: mtag.predicate,mtag: mtag, level:1}, 
        {tag: mtag.value, mtag: mtag,level:2, record_count: $(tagged_records).size()}];
      var tag_rows = $.grep(tag_rows, function(e) { 
        return ! $.machineTag.any(rows, function(f) { return f.tag == e.tag && f.level == e.level && f.mtag.namespace == e.mtag.namespace &&
          (e.level == 2 ? f.mtag.predicate == e.mtag.predicate : true)
        });
      });
      $.each(tagged_records, function(j,e) { tag_rows.push({level: 3, record: e}); });
      $.merge(rows, tag_rows);
    });
    return rows;
  };

  //private methods
  function anyMachineTagsMatchWildcard(machine_tags, wildcard_machine_tag) {
    return $.machineTag.any(machine_tags, function(e) {return machineTagMatchesWildcard(e, wildcard_machine_tag)});  
  };

  function machineTagMatchesWildcard(machine_tag, wildcard_machine_tag) {
   return !! machine_tag.match(wildcard_machine_tag.replace(/\*/g, '.*')) 
  };

  function machineTagSearchRecords(wildcard_machine_tag, records) {
    return $.grep(records, function(e) {
      return anyMachineTagsMatchWildcard(e.tags, wildcard_machine_tag);
    });
  };

  function locationMachineTag() {
    return location.href.match(/#(.*?)$/);
  };
})(jQuery);