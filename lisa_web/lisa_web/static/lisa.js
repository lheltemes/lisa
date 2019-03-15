// The table generation function
function tabulate(cl, data, columns, interact) {
  var table = d3.select("." + cl).append("table")
        .attr("class", "table compact hover row-border tab" + cl),
      thead = table.append("thead"),
      tbody = table.append("tbody").attr("class", "tbody");

  // append the header row
  thead.append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(function(column) { return column; });
  // create a row for each object in the data
  var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr")
        .attr({
          data_id: function(d) {
            if (d.hasOwnProperty('coefficient')) {
              return d.coefficient.split('|')[0];
            } else {
              return "row";
            }
          }
        });

  // create a cell in each row for each column
  var cells = rows.selectAll("td")
        .data(function(row) {
          return columns.map(function(column) {
            return {column: column, value: row[column]};
          });
        })
        .enter()
        .append("td")
        .style({
          "vertical-align": "middle"
        })
        .attr({
          data_id: function(d) { return d.value.split(';')[0].split('|')[0]; }
        })
        .html(function(d) {
          if (d.column != 'Transcription Factor') {
            if (interact){
              a = d.value;
              a = a.split(';');
              if (a.length == 2) {
                return a[1];
              } else {
                return d.value;
              } 
            } else {
              if (d.value.indexOf("http") !== -1) {
                aaa = d.value.split(".");
                return '<a href="' + d.value + '">' + aaa[aaa.length-2] + '</a>';
              }

              if (cl == "tf2") {
                if (d.value.split(';').length==2) {
                  return d.value.split(';')[1] + "<img class='img-fluid' style='vertical-align:middle' height='36' width='60' src='http://lisa.cistrome.org/static/" + d.value.split(';')[0] + ".pwm.jpg'>";
                } else {
                  return "";
                }
              } // for motifs 
              else {
                a = d.value.split('|');
                if (a.length == 2) {
                   return a[1];
                } else {
                   return d.value;
               }
              }
           }
          }
          return d.value;
        });

  if (cl != "tfl") {
  
    if (cl != "tf2") {
       $('.tab' + cl).ready(function() {
         $('.tab'+ cl).DataTable({
           retrieve: true,
           // destroy: true,
           paging: true,
           dom: 'Bfrtip',
           buttons: [
               'csv', 'excel', 'pdf'
           ],
           "order": []
         });
       });
    } else {
       $('.tab' + cl).ready(function() {
         $('.tab'+ cl).DataTable({
           "order": [],
           retrieve: true,
           // destroy: true,
           paging: true,
           dom: 'Bfrtip',
           buttons: [
               'csv', 'excel', 'pdf'
           ],
           "columnDefs": [
              { "width": "20%", "targets": 0 }
           ]
         });
       });
    }
  }
  return table;
}

function fetch(row, test_type) {
  if (test_type == 'motif') {
    $('td').click(function(e) {
      $(".annotation").html("");
      $(".annotation").append("<div><img class='img-fluid' style='vertical-align:middle' height='240' width='320' src='http://lisa.cistrome.org/static/" + $(this).attr('data_id') + ".pwm.jpg'></div>");
      $(".annotation").show(500);
    })
    return;
  }

  if (!row) {
    selector = "td";
  } else {
    selector = "tr";
  }

  $("td").click(function(e) {
    var bookId = $(this).attr('data_id'); // this works
    $.getJSON('http://dc2.cistrome.org/api/inspector?id='+bookId, function(d) {
      $("body, html").animate({
        scrollTop: $('.annotation').offset().top - $('.dataTable').offset().top
      }, 600);
      $(".annotation").html("");
      conserv="http://dc2.cistrome.org/api/conserv?id="+bookId;
      color = {true: "green", false: "red", "NA": "gray"};

      if (d.treats[0].species__name == "Homo sapiens") {
        browser_sp = "hg38";
      } else {
        browser_sp = "mm10";
      }
      modelc = $('<div class="card"><div class="card-header"><div class="card-title"><h3><b>Inspector</b></h3></div></div><div class="card-body"><div class="row"><div class="col-sm-9"><div class="row inspector_attrib_row"><div class="col"><b>Title:</b></div><div class="col">' + d.treats[0].name + '</div></div>' + 
                 '<div class="row inspector_attrib_row"><div class="col"><b>GEO:</b></div><div class="col"><p class="tight-line">' + '<a href="https://www.ncbi.nlm.nih.gov/sra?term=' + d.treats[0].unique_id + '">' + d.treats[0].unique_id + '</a></div></div>' + 
                 '<div class="row inspector_attrib_row"><div class="col"><b>Species:</b></div><div class="col"><p>' + d.treats[0].species__name + '</p></div></div>' + 
                 '<div class="row inspector_attrib_row"><div class="col"><b>Citation:</b></div><div class="col"><p>' + d.treats[0].paper__reference + '</p>' +'PMID:' + '<a href="https://www.ncbi.nlm.nih.gov/pubmed/?term=' + d.treats[0].paper__pmid + '">' + d.treats[0].paper__pmid + '</a></div></div>' + 
                 '<div class="row inspector_attrib_row"><div class="col"><b>Species:</b></div><div class="col"><p>' + d.treats[0].species__name + '</p></div></div>' + 
                 '<div class="row inspector_attrib_row"><div class="col"><b>Factor:</b></div><div class="col"><p>' + d.treats[0].factor__name + '</p></div></div>' +
                 '<div class="row inspector_attrib_row"><div class="col"><b>Biological Source:</b></div><div class="col"><p class="tight-line"><b>Cell Line:</b>' + d.treats[0].cell_line__name + '</p>' +  
                 '<p class="tight-line"><b>Cell Type:</b>' + d.treats[0].cell_type__name + '</p>' + 
                 '<p class="tight-line"><b>Tissue:</b>' + d.treats[0].tissue_type__name + '</p>' + 
                 '<p class="tight-line"><b>Disease:</b>' + d.treats[0].disease_state__name + '</p></div></div></div>' + 
                 '<div class="col-sm-3"><div class="row"><div class="col"><b>Quality Control</b></div></div>' + 
                 '<div class="row"><div class="col">' + 
                 '<div class="circle-col"><div class="circle ' + color[d.qc.judge.fastqc] + '"></div></div>' +
                 '<div class="circle-col"><div class="circle ' + color[d.qc.judge.map] + '"></div></div>' +
                 '<div class="circle-col"><div class="circle ' + color[d.qc.judge.pbc] + '"></div></div>' +
                 '<div class="circle-col"><div class="circle ' + color[d.qc.judge.peaks] + '"></div></div>' +
                 '<div class="circle-col"><div class="circle ' + color[d.qc.judge.frip] + '"></div></div>' +
                 '<div class="circle-col"><div class="circle ' + color[d.qc.judge.dhs] + '"></div></div>' +
                 '</div></div>' + 
                 '<div class="row"><div class="col"><b>Visualize</b></div></div>' + 
                 '<div class="row"><div class="col"><div class="btn-group">' + '<a target="_blank" id="genomebrowser-bw" type="button" class="btn btn-default button-list" href="http://epigenomegateway.wustl.edu/browser/?genome='+browser_sp+'&amp;datahub=http://dc2.cistrome.org/api/datahub/'+d.id+'&amp;gftk=refGene,full">WashU Browser</a><a target="_blank" id="genomebrowser-bw" type="button" class="btn btn-default button-list" href="http://dc2.cistrome.org/api/hgtext/' + d.id + '/?db=' + browser_sp + '">UCSC Browser</a></div></div></div>' + 
                 '</div></div>');
      $(".annotation").append( modelc );
      modelc = $('<div class="card"><div class="card-header">Tool</div><div class="card-body"><table class="table">' +
                 '<thead><tr><th>QC</th><th>Value</th></tr></thead>' +
                 '<tbody><tr><td>Mappable Reads</td>' + '<td>' + d.qc.table.map_number[0] + '</td></tr>' + 
                 '<tr><td>Mappable ratio</td><td>' + d.qc.table.map[0] + '</td></tr>' +
                 '<tr><td>PBC</td><td>' + d.qc.table.pbc[0] + '</td></tr>' +
                 '<tr><td>Peak number</td><td>' + d.qc.table.peaks[0] + '</td></tr>' + 
                 '<tr><td>FRiP</td><td>' + d.qc.table.frip[0] + '</td></tr>' + 
                 '<tr><td>Peaks in promoter/exon/intron/intergenic</td><td>' + d.qc.table.meta + '</td><tr>' +
                 '<tr><td>DHS ratio</td><td>' + d.qc.table.dhs + '</td></tr>' +
                 '<tr><td>Converation plot</td><td><img class="img-fluid" height="400" width="400" src="' + conserv + '">' + '</td></tr></tbody>' +
                 '</table></div></div>');
      $(".annotation").append( modelc );
      if (d.motif) {
        m = 'http://dc2.cistrome.org/'+d.motif_url;
        modelc = $('<div class="row"><iframe height="800" width="100%" src="' + m + '"></div>');
        $(".annotation").append( modelc );
      }
      $(".annotation").show(500);
    });
  });
};

function multiple_request(url, index) {
      d3.csv(url, function(error, d) {
        if (error) {
          // this cause multiple dataTable rendering
          // setTimeout(function() {
          //   update_progress(status_url, status_div, div_heatmap_data);
          // }, 2000);
          // use queue instead
          setTimeout(function() {
              multiple_request(url, index);
          }, 3000);
          return null;
        }

        $(".tab-pane.active").ready(function() {
          tabulate(index, d, ["Transcription Factor", "1st Sample p-value", "2nd Sample p-value", "3rd Sample p-value", "4th Sample p-value", "5th Sample p-value"], true, index);
          fetch(false);
          $('.dataTable').on('draw.dt', function() {
            fetch(false);
          });
        });

        if ($('.tab'+index).length == 0) {
          tabulate(index, d, ["Transcription Factor", "1st Sample p-value", "2nd Sample p-value", "3rd Sample p-value", "4th Sample p-value", "5th Sample p-value"], true, index);
          fetch(false);
          $('.dataTable').on('draw.dt', function() {
            fetch(false);
          });
          multiple_request(url, index);
        }
        return true;
      });
      return true;
}

function update_progress(status_url, status_div, div_heatmap_data) {
  // send GET request to status URL
  $.getJSON(status_url, function(data) {
    // update UI
    $(status_div.childNodes[0]).css("width", data['status']);
    $(status_div.childNodes[0]).text(data['status']+ " " + data['state']);
    if (data['state'] == 'finished') {
      $('.progress').hide();
      $(".result").show(1200);
      $("h4").hide();
      $(".tab-pane.active").ready(function() {
        if($(".tab-pane.active").hasClass("tf1")) {
          // $(".tf").html($('<div class="col"><a href="' + data['result'] +'">download lisa beta results</a></div>'));
          initiald = data['result'];
          d3.csv(initiald, function(error, d) {
            if (error) {
              multiple_request(initiald, 'tf1');
            } else {
              $(".tab-pane.active").ready(function() {
                tabulate('tf1', d, ["Transcription Factor", "1st Sample p-value", "2nd Sample p-value", "3rd Sample p-value", "4th Sample p-value", "5th Sample p-value"], true, 'tf1');
                fetch(false);
                $('.dataTable').on('draw.dt', function() {
                  fetch(false);
                });
              });
            }
          });
        } else if ($(".tab-pane.active").hasClass("tf1")) {
          $(".tf1").html($('<div class="col"><a href="' + data['result'] +'">download knockout ranks from ChIP-seq data</a></div>'));
          initiald = data['result'];
          d3.csv(initiald, function(error, d) {
            if (error) {
              console.log("test3 error");
              multiple_request(initiald, 'tf1');
            } else {
              $(".tab-pane.active").ready(function() {
                  tabulate('tf1', d, ["Transcription Factor", "1st Sample p-value", "2nd Sample p-value", "3rd Sample p-value", "4th Sample p-value", "5th Sample p-value"], true, 'tf1');
                  fetch(false);
                  $('.dataTable').on('draw.dt', function() {
                    fetch(false);
                  });
              });
            }
          });
        }
      });

      $('.leftpanel a[href="#tf1"]').click(function(e) {
        console.log("chip-seq ");
        $('.active').removeClass("active");
        $(".annotation").hide();
        $(".annotation").html("");
        $('.active').removeClass("active");

        if ($('.tabtf1').length == 0) {
          // $(".tf").html($('<div class="col"><a href="' + data['result'] +'">download combined lisa ChIP-seq results</a></div>'));
          d3.csv(data['result'], function(error, d) {
            tabulate('tf1', d, ["Transcription Factor", "1st Sample p-value", "2nd Sample p-value", "3rd Sample p-value", "4th Sample p-value", "5th Sample p-value"], true, 'tf1');
            fetch(false);
            $('.dataTable').on('draw.dt', function() {
              fetch(false);
            });
          });
        }
        $(this).tab('show');
      });

      $('.leftpanel a[href="#tf2"]').click(function(e){
        console.log("motifs ");
        $('.active').removeClass("active");
        $(".annotation").hide();
        $(".annotation").html("");
        if ($('.tabtf2').length == 0) {
         // $(".tf2").html($('<div class="col"><a href="' + data['result2'] +'">download combined lisa motif results</a></div>'));
         d3.csv(data['result2'], function(error, d) {
           tabulate('tf2', d, ["Transcription Factor", "1st Sample p-value", "2nd Sample p-value", "3rd Sample p-value", "4th Sample p-value"], false, 'tf2'); // "3rd Sample p-value", "4th Sample p-value", "5th Sample p-value"
           fetch(false, 'motif');
           $('.dataTable').on('draw.dt', function() {
             fetch(false, 'motif');
           });
         });
        }
        $(this).tab('show');
      });
      
    } else {
      setTimeout(function() {
        update_progress(status_url, status_div, div_heatmap_data);
      }, 10000);  // extend to 9000ms for post-process the snakemake results to avoid dataTable issues
    }
  });
}

function start_lisa_task(id, div_heatmap_data) {
  div = $('<div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div><hr>');

  $('.lisa_progress').append(div);

  $.ajax({
    type: 'POST',
    url: id,
    success: function(data, status, request) {
      update_progress(id, div[0], div_heatmap_data);
    },
    error: function() {
      alert('Unexpected error');
    }
  });
  // search interface
  // http://dc2.cistrome.org/api/main_filter_ng?cellinfos=all&completed=false&curated=false&factors=all&keyword=34330&page=1&run=false&species=all
  // http://dc2.cistrome.org/api/main_filter_ng?cellinfos=all&completed=false&curated=false&factors=all&keyword=&page=1&run=false&species=Homo%20sapiens&factors=AR
  // conservation interface
  // http://dc2.cistrome.org/api/conserv?id=2816
  // information interface
  // http://dc2.cistrome.org/api/inspector?id=2816
  // genome browser
  // http://dc2.cistrome.org/api/batchview/h/1792_8448/w/
}
