(function($) {
  // Creates an array of tree node objects to display the results of a machine tag search.
  // Nodes are either tag or record nodes. Tag nodes represent different parts of a machine tag (namespace, predicate, value).
  // Each tree node can have the following attributes:
  //  * level (all nodes): Indicates level in a tree. A top level has a value of 0.
  //  * tag (tag node): Indicates a tag fields' value.
  //  * mtag (tag node): A tag's machine tag.
  //  * record_count (tag node): Record count under a tag. Only set for a value tag node.
  //  * record (record node): Reference to record.
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
  }

  // Given a wildcard machine tag and its matching records, displays the results in a tree table. The tree organizes the records by the
  // machine tags that match the wildcard machine tag. The table has three columns:
  //   * machine tags: displays machine tags that match wildcard and are the parent nodes in the tree
  //   * record: displays record info, leaf nodes in a tree
  //   * record tags: displays a record's machine tags
  // If your records don't use the url attribute as the primary attribute, you can customize your output with the formatter option.
  // This function takes the following options:
  //   * recordName: capitalized name to give the records, defaults to Records
  //   * tagTreeId: css id for the div containing the generated table, defaults to tag_tree
  //   * tableId: css id for the generated table, defaults to machine_tag_table
  //   * caption : caption/title for the table
  //   * formatter : hash of columns to functions used to format the respective column,
  //     ** hash keys are machine_tags_column, record_column, record_tags_column
  //     ** record and record_tags columns expect a record object while machine tags column expects the row object
  $.machineTagTree = function(wildcard_machine_tag, records, options) {
    var options = $.extend({recordName: 'Records', tagTreeId: 'tag_tree', tableId: 'machine_tag_table', 
      wildcard_machine_tag: wildcard_machine_tag},$.machineTagTree.defaultOptions, options || {});
    $('#'+options.tagTreeId).html('');
    var rows = $.createMachineTagTree(wildcard_machine_tag, records);
    displayMachineTagTree(rows, options);
  }
  $.machineTagTree.defaultOptions = {};

  //private methods
  function displayMachineTagTree(rows, options) {
    if ($(rows).size() == 0) {
      var table_html = "<div class='caption'>No " + options.recordName.toLowerCase() + " found for '" + options.wildcard_machine_tag+ "'</div>";
      $("#"+options.tagTreeId).append(table_html);
    }
    else {
      setupTreeTable(rows);
      var table_html = createTable(rows, options);
      $("#"+options.tagTreeId).append(table_html);
      $("a.toggle_machine_tags").hideMachineTags();
      $("a.machine_tag_href_search").click(function() { $.machineTagSearch(this.href.match(/#(.*?)$/).pop());});
      $("a#toggle_all_levels").click( function() {
        // var toggle_level = 1 * $('#toggle_level').val();
        var tr_selector = 'tr[level='+$('#toggle_level').val()+']';
        // if (toggle_level <= 1) tr_selector += ',tr[level=2],tr[level=3]';
        // if (toggle_level == 0) tr_selector += ',tr[level=1]';
        $(tr_selector).each( function(){$(this).toggleBranch()} );
        return false;
      });
      $("#"+options.tableId).treeTable({initialState: "expanded", indent:15});
    }
  }

  function createTable(rows, options) {
    var options = $.extend({ recordName: 'Records', tableId: 'machine_tag_table', caption: 'Machine Tag Search Results'}, options || {});
    if (options.wildcard_machine_tag) options.caption = options.recordName+" for wildcard machine tag '"+
      options.wildcard_machine_tag +"'";
    options.formatter = $.extend(  { record_column: recordColumnFormatter, record_tags_column: recordTagsColumnFormatter,
      machine_tags_column: machineTagsColumnFormatter}, options.formatter || {});

    var table = "<table id='"+options.tableId+"'><caption>"+options.caption+"</caption>\
    <thead>\
      <tr>\
        <th class='machine_tags_column'>Machine Tags<br/><a href='javascript:return false' id='toggle_all_levels'>\
        Toggle Level:</a> <input id='toggle_level' type='text' value='2' size='1'></th>\
        <th class='records_column'>"+ options.recordName +"</th>\
        <th class='record_tags_column'>"+singularize(options.recordName)+" Tags / <a href='javascript:void($.toggleHiddenMachineTags())'>Machine Tags</a></th>\
      </tr>\
    </thead><tbody>" +
    $.map(rows, function(e,i) {
      return "<tr id='"+ e.id + "'" + (typeof e.parent_id != 'undefined' ? " class='child-of-"+e.parent_id+"'" : '' ) +
        "level='"+e.level+"'>" +
        "<td class='machine_tags_column'>"+(e.tag ? options.formatter.machine_tags_column.call(this, e) : '')+"</td>"+
        "<td class='records_column'>"+(e.record ? options.formatter.record_column.call(this, e.record) : '')+"</td>" +
        "<td class='record_tags_column'>"+(e.record ? options.formatter.record_tags_column.call(this, e.record) : '')+"</td>" +
        "</tr>";
    }).join(" ") + "</tbody></table>";
    return table;
  }

  function machineTagsColumnFormatter(row) {
    var link_text = truncate(row.tag, 15) + (row.record_count ? " ("+row.record_count+")" : '');
    return "<a class='machine_tag_href_search' href='#" + machineTagQuery(row) + "'>"+ link_text + "</a>";
  }

  function recordColumnFormatter(record) {
    return "<a href='"+record.url+"'>"+truncate(record.title || record.url, 50)+"</a>";
  }

  function recordTagsColumnFormatter(record) {
    return $.map(record.tags, function(f) {
      return "<a class='machine_tag_href_search toggle_machine_tags' href='#"+ f+"'>" + f + "</a>";
    }).join(', ');
  }

  function singularize(string) {
    return string.replace(/s$/,'')
  }

  function truncate(string,length) {
    return (string.length > length)  ? string.slice(0, length - 3) + '...' : string;
  }

  function machineTagQuery(tree_node) {
    var href = null;
    var mtag = tree_node.mtag;
    var base_href = tree_node.mtag.namespace+ $.machineTag.predicate_delimiter;
    switch (tree_node.level) {
      case 0: href = base_href + "*"; break;
      case 1: href = base_href + mtag.predicate + $.machineTag.value_delimiter + "*"; break;
      default: href = base_href+ mtag.predicate + $.machineTag.value_delimiter + mtag.value;
    }
    return href;
  }

  // Adds parents + ids
  function setupTreeTable(array) {
    $(array).each(function(i,e) {
      e.id = "node-"+ i;
    });
    $(array).each(function(i,e) {
      if (parent = $.grep(array.slice(0, i).reverse(), 
        function(f) { return f.level < e.level})[0]) {
          e.parent_id = parent.id;
      }
    });
    $(array).each(function(i,e) {
      if (e.level < 2) {
        var record_count_sum = 0;
        var child_index = i + 1;
        while(array[child_index] && e.level < array[child_index].level) {
          if (array[child_index].record_count) {
            record_count_sum += array[child_index].record_count;
          }
          child_index += 1;
        }
        if (record_count_sum > 0) { e.record_count = record_count_sum; }
      }
    });
    return;
  }
})(jQuery);