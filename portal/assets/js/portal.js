APIKEY=localStorage.svc_search_v2_articlesearch_api_key;
API_HOST='api.nytimes.com';
ARTICLESEARCHJSONURL='http://' + API_HOST + '/svc/search/v2/articlesearch.json';
ARTICLESEARCHJSONPURL=ARTICLESEARCHJSONURL + 'p';

lastArticleSearchState='';
lastArticleSearchHash='#/articlesearch';

busy=false;

function putADDMeta(meta, navMetaID){
	console.debug("Meta: ", meta);
	$('#'+navMetaID).empty();
	$('#'+navMetaID).hide();
	if(!meta) return;

	$('#'+navMetaID).append('<li>Hits: ' + meta.hits);
	$('#'+navMetaID).append('<li>Time: ' + meta.time);
	$('#'+navMetaID).append('<li>Offset: ' + meta.offset);
	$('#'+navMetaID).append('<li>Page: ' + ((meta.offset/10)+1) + '/' + Math.ceil(meta.hits/10));
	$('#'+navMetaID).show();
}



function putADDFacet(facets,navFacetID,formID){
	console.debug("Facets: ", facets);
	$('#'+navFacetID).hide();
	$('#'+navFacetID).empty();
	if(!facets) return;
	if(facets){
		var html = "";
		$.each(facets, function(i, v) { 
		  html += "<li><h5>" + i + "</h5><ul>" 
		  $.each(v.terms, function(i2, v2) {
		  	var  _fq=encodeURIComponent( i + ':"' + v2.term +'"');
		  	html += '<li><strong><a href="#" ><span class="addFacetValue" value="'+_fq+'" formID="'+formID+'">' + v2.term + "</span></a></strong>: " + v2.count + "</li>";
		  });
		  html += "</ul></li>";
		});

		$('#'+navFacetID).html(html);
	}
	$('.addFacetValue').click(
		function(ev){
			console.debug("ADD Facet click event:", ev);
			ev.preventDefault();
			var fq = ev.currentTarget.getAttribute('value');
			appendToFQ(formID, decodeURIComponent(fq));
		}
	);

	$('#'+navFacetID).show();
}


function appendToFQ(formID, fq){
	console.log("Appending filter query value:", fq);
	var fqParam=$('#'+formID).children('.fqParam');
	if(fqParam[0].value) fqParam[0].value+=' AND ';
	fqParam[0].value+=fq;
	$('#'+formID).submit();
}

$.fn.spin = function(opts) {
  this.each(function() {
    var $this = $(this),
        data = $this.data();

    if (data.spinner) {
      data.spinner.stop();
      delete data.spinner;
    }
    if (opts !== false) {
      data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
    }
  });
  return this;
};



function articleSearchToHash(args){
	console.debug("articleSearchToHash:", args);
	var hashTokens={};
	for(var i=0;i<args.length; i++){
		var argAndVal=args[i].split('=');
		var arg=argAndVal[0];
		var val=argAndVal[1]
		hashTokens[arg]=val;
	}
	// host/portal/#/api/q/fq/sort/facet_filter/facet_field/type/begindate/enddate/offset
	var newHashString="#/articlesearch";
	newHashString+='/'+('q' in hashTokens ? hashTokens.q : '');
	newHashString+='/'+('fq' in hashTokens ? hashTokens.fq : '');
	newHashString+='/'+('sort' in hashTokens ? hashTokens.sort : '');
	newHashString+='/'+('facet_filter' in hashTokens ? hashTokens.facet_filter : '');
	newHashString+='/'+('facet_field' in hashTokens ? hashTokens.facet_field : '');
	newHashString+='/'+('type' in hashTokens ? hashTokens.type : '');
	newHashString+='/'+('begin_date' in hashTokens ? hashTokens.begin_date : '');
	newHashString+='/'+('end_date' in hashTokens ? hashTokens.end_date : '');
	newHashString+='/'+('page' in hashTokens ? hashTokens.page : '');
	newHashString=newHashString.replace(/(\/\/)+$/gi,'');
	console.debug("New hash string:", newHashString);
	window.location.hash=lastArticleSearchHash=newHashString;
}

function setupFromHash(){

	// host/portal/#/api/q/fq/sort/facet/type/begindate/enddate
	var hash = location.hash.substring(1);
	if(hash){
		if(hash.substring(0,1)=='/') hash=hash.substring(1);
		hash=hash.replace(/\+/g, " ");
	}
	else{
		return;
	}

	hash=hash.split('/');
	for(var h=0;h<hash.length;h++){
		hash[h]=decodeURIComponent(hash[h]);
	}
	console.debug("Hash:",hash);
	var portalID=hash[0];


	if(portalID=='articlesearch'){
		$('ul.nav > li').removeClass('active');
		$('#articlesearch').addClass('active');
		$('div.api-container').hide();
		$('#addArticleSearchContainer').show();
		if(hash.length>1){
			$('#ArticleSearchParamQ').val(hash[1]);
			if(hash.length>2){
				$('#ArticleSearchParamFQ').val(hash[2]);
				if(hash.length>3){
					$('.addArticleSearchSortButton').removeClass('active');
					$('.addArticleSearchSortButton-' + hash[3]).addClass('active');
					$('#ArticleSearchParamSort').val(hash[3]);
					if(hash.length>4){
						if(hash[4]=='true') $('#ArticleSearchParamFacetFilter').attr('checked', true);
			            if(hash.length>5){
			            	var types=hash[5].split(',');
							if(types.length>0){
								$('.addArticleSearchParamFacet').attr('checked', false);
								for (var i=0; i<types.length; i++) {
									$('.addArticleSearchParamFacet-'+types[i]).attr('checked', true);
								}
          					}
							if(hash.length>6){
								var types=hash[6].split(',');
								if(types.length>0){
									$('.addArticleSearchParamType').attr('checked', false);
									for (var i=0; i<types.length; i++) {
										$('.addArticleSearchParamType-'+types[i]).attr('checked', true);
									}
								}
								if(hash.length>7){
            						if(hash[7]){
										var month=hash[7].substring(6,8);
										var day=hash[7].substring(4,6);
										var year=hash[7].substring(0,4);
										$('#addArticleSearchDatePickerBegin').val(month+'-'+day+'-'+year);
										$('#addArticleSearchParamBeginDate').val(hash[7]);
									}
									if(hash.length>8){
										if(hash[8]){
											month=hash[8].substring(6,8);
											day=hash[8].substring(4,6);
											year=hash[8].substring(0,4);
											$('#addArticleSearchDatePickerEnd').val(month+'-'+day+'-'+year);
											$('#addArticleSearchParamEndDate').val(hash[8]);
										}
										if(hash.length>9){
											$('#ArticleSearchParamOffset').val(hash[9]);
										}
									}
								}
							}
						}
					}
				}
			}
		}
		lastArticleSearchState=null;
		if(hash.length>1) $('#addArticleSearchForm').submit();
		return;
	}
}

$(document).ready(function () {

	setupFromHash();

        $('ul.nav > li').click(function (e) {
            e.preventDefault();
            $('ul.nav > li').removeClass('active');
            $(this).addClass('active');
            var id=e.currentTarget.getAttribute('id');

            $('div.api-container').hide();
			if(id=='articlesearch'){
				window.location.hash=lastArticleSearchHash;
            	$('#addArticleSearchContainer').show();
            }
	
        });            
    });



$('#addArticleSearchForm').submit(function() {
  if(busy) return false;
  busy=true;
  $('#addArticleSearchResultsContainer').hide();
  $('#addArticleSearchspinner').spin();
  var args=['api-key='+APIKEY];
  if($('#ArticleSearchParamQ').val())    args.push('q='+ encodeURIComponent($('#ArticleSearchParamQ').val()));
  if($('#ArticleSearchParamFQ').val()){
    if($('#ArticleSearchParamFQ').val().substring(0,5)=='http:') $('#ArticleSearchParamFQ').val('web_url:"' + $('#ArticleSearchParamFQ').val() + '"');
    args.push('fq='+ encodeURIComponent($('#ArticleSearchParamFQ').val()));
  } 
  if($('#ArticleSearchParamSort').val()) args.push('sort='+ encodeURIComponent($('#ArticleSearchParamSort').val()));
  
  if($('#ArticleSearchParamFacetFilter:checked').val())  args.push('facet_filter=true');
  var facetFields=[];
  var facetCheckboxes=$('.addArticleSearchParamFacet');
  for(var f=0;f<facetCheckboxes.length;f++){
  	if($(facetCheckboxes[f]).is(':checked')) facetFields.push($(facetCheckboxes[f]).attr('value'));
  }
  if(facetFields.length>0) args.push('facet_field='+ encodeURIComponent(facetFields.join(',')));

  var types=[];
  if($('#ArticleSearchParamTypeArticle:checked').val())  types.push($('#ArticleSearchParamTypeArticle').val());
  if($('#ArticleSearchParamTypeBlogpost:checked').val()) types.push($('#ArticleSearchParamTypeBlogpost').val());
  if($('#ArticleSearchParamTypeMedia:checked').val())  types.push($('#ArticleSearchParamTypeMedia').val());
  if($('#ArticleSearchParamTypeTopic:checked').val())  types.push($('#ArticleSearchParamTypeTopic').val());
  
  if($('#ArticleSearchParamTypeRecipe:checked').val())  types.push($('#ArticleSearchParamTypeRecipe').val());
  if($('#ArticleSearchParamTypeSectionFront:checked').val())  types.push($('#ArticleSearchParamTypeSectionFront').val());
  if($('#ArticleSearchParamTypeColumn:checked').val())  types.push($('#ArticleSearchParamTypeColumn').val());
  if(types.length>0)  args.push('type='+ encodeURIComponent(types.join(',')));

  if($('#addArticleSearchDatePickerBegin').val() && $('#addArticleSearchParamBeginDate').val()) args.push('begin_date='+ encodeURIComponent($('#addArticleSearchParamBeginDate').val()));
  if($('#addArticleSearchDatePickerEnd').val() && $('#addArticleSearchParamEndDate').val()) args.push('end_date='+ encodeURIComponent($('#addArticleSearchParamEndDate').val()));

  var ArticleSearchState=args.join();
  if(lastArticleSearchState!=ArticleSearchState){
    if(lastArticleSearchState!=null) $('#ArticleSearchParamOffset').val(0);
    lastArticleSearchState=ArticleSearchState;
  }
  if($('#ArticleSearchParamOffset').val()) args.push('page='+ encodeURIComponent($('#ArticleSearchParamOffset').val()));
  
  if($('#addHighlightButton').hasClass('active')) args.push('hl=true');

  var limit=10;//numDocsPerPage
  var apiURL = ARTICLESEARCHJSONURL +"?" + args.join('&');
  console.log("API URL:", apiURL);
  articleSearchToHash(args);
  f=$.ajax({
    type: 'GET',
    // jsonp: true,
    jsonp: false,
    url: ARTICLESEARCHJSONURL,
    cache: true,
    data: args.join('&'),
    // dataType: 'jsonp',
    dataType: 'json',
    // jsonp: 'callback',
    // jsonpCallback: 'svc_search_v2_articlesearch',
    timeout:3000,
  }).done(function(data) { 
    busy=false;
    
    $('#addArticleSearchspinner').spin(false);
    putADDPagination(data['response']['meta']['hits'], data['response']['meta']['offset'], limit, 'addArticleSearchForm', 1);
    putADDArticleSearchResultsPretty(data.response.docs, apiURL);
    $('#addArticleSearchResultsDebug').text(JSON.stringify(data['response'],undefined,2));
    putADDMeta(data['response']['meta'],'addArticleSearchNavMetaList');
    putADDFacet(data['response']['facets'], 'addArticleSearchNavFacetList','addArticleSearchForm');
    $('#addArticleSearchResultsContainer').show();
  }).fail(function ( jqXHR ) { 
    busy=false;
	  try {
	    prettyErr=JSON.stringify($.parseJSON(jqXHR['responseText'])['errors']);
	    $('.pagination').hide();
	    $('#addArticleSearchResultsDebug').empty()
	    putADDMeta(null,addArticleSearchNavMetaList);
	    putADDFacet(null,'addArticleSearchNavFacetList','addArticleSearchForm');
	  }
	  catch (ignore){
	    prettyErr=jqXHR['responseText'];
	  }
	    $('#addArticleSearchResultsMain').text(prettyErr);
	    $('#addArticleSearchspinner').spin(false);
	    $('#addArticleSearchResultsContainer').show();
	    // console.debug(prettyErr);
  }).always(function(jqXHR, textStatus, errorThrown){
	  if(busy){
	  	busy=false;
	  	$('#addArticleSearchspinner').spin(false);
	  }
	  if('success'!=textStatus){
		    $('#addArticleSearchResultsMain').text(textStatus);
		    $('#addArticleSearchspinner').spin(false);
		    $('#addArticleSearchResultsContainer').show();

	  }
  });

  return false;
});


function putADDArticleSearchResultsPretty(data, apiURL){
  console.debug("ADD ArticleSearch Results:",data);

  var docsHTML=''
  for (var i = 0; i < data.length ; i ++) {
    
    if(data[i].web_url){
      var thumbnail=null;
      var thumbwidth=75;
      if(data[i].multimedia){
        for(var m=0; m<data[i].multimedia.length; m++){
          if(data[i].multimedia[m].subtype && data[i].multimedia[m].subtype=="thumbnail"){
            thumbnail=data[i].multimedia[m].url;
            if(thumbnail.substring(0,4)!="http"){
              thumbnail='http://www.nytimes.com/' + thumbnail;  
            }
            if(data[i].multimedia[m].width) thumbwidth=data[i].multimedia[m].width;
            break;
          }
        }
      }
      docsHTML+='<li><table class="table table-hover table-condensed"><tr>';
      if(thumbnail){
        docsHTML+='<td style="border:none" width="'+thumbwidth+'">';
        docsHTML+='<img src="'+thumbnail+'">';
        docsHTML+='</td>';
      }
      docsHTML+='<td style="border:none;text-align:left">';
      var headline = data[i].headline.name;
      if(headline===undefined) headline = data[i].headline.main;
      if(headline===undefined) headline = data[i].web_url;
      docsHTML+='<a href="' + data[i].web_url + '" target="_resultsTarget">' + headline + '</a>';
      docsHTML+='<br>';
      var lp='';
      lp=data[i].snippet;
      docsHTML+=lp;
      if (data[i].document_type!="sectionfront") {
	      pdate=formatPubDate(data[i].pub_date);
	      docsHTML+='<br>';
	      byline='';
	      if (data[i].byline && data[i].byline.original) byline = ' - ' + data[i].byline.original;
	      section='';
	      if (data[i].section_name) section = ' - ' + data[i].section_name;
	      docsHTML+='<span class="help-block small"><strong>' + pdate + '</strong> ' + byline + section + '</span>';
	  }
       docsHTML+='</td></tr></table>';

      docsHTML+='</li>';
    }
    
  }

  $('#addArticleSearchResultsMain').empty();
  $('#addArticleSearchCompiledURL').attr('href',apiURL);
  $('#addArticleSearchResultsMain').html(docsHTML);
}

function formatPubDate(d){
	if(!d) return "";
	console.debug("Format date:",d);
	d=d.replace(/-/g,'');
	var date=new Date(parseInt(d.substring(0,4),10), parseInt(d.substring(4,6),10)-1, parseInt(d.substring(6,8),10));
	return date.toDateString();
}

function putADDPagination(totalHits, offset, numDocsPerPage, formID, gotoMultiplier){
	$('.pagination').hide();
	if(totalHits==0) return;
	$('.addPagination').empty();
	var numPages=Math.ceil(totalHits/numDocsPerPage);
	var thisPage=(offset/numDocsPerPage)+1; //1 indexed.
	var paginationHTML="";

	if(thisPage==1){
		paginationHTML+='<li class="disabled"><span>&laquo;</span></li>';
	}
	else{
		paginationHTML+='<li><a href="#" class="addPaginationGoToVal" formID="'+ formID + '" value="0">&laquo;</a></li>';
	}
	var prevPage=Math.max(1,thisPage-1);
	if(prevPage==thisPage){
		paginationHTML+='<li class="disabled"><span>&lsaquo;</span></li>';
	}
	else{
		paginationHTML+='<li><a href="#" class="addPaginationGoToVal" formID="'+ formID + '" value="'+((prevPage-1)*gotoMultiplier)+'">&lsaquo;</a></li>';
	}
	var topEnd=3;
	for (var i = -2; i < topEnd; i++) {
		var thisButton=thisPage+i;
		if(thisButton>numPages) {
			break;
		}
		if(thisButton<1) {
			topEnd++;
			continue;
		}
		if(thisButton==thisPage){
			paginationHTML+='<li class="active"><span>' + (thisButton) + '</span></li>';
		}
		else{
			paginationHTML+='<li><a href="#" class="addPaginationGoToVal" formID="'+ formID + '" value="'+((thisButton-1)*gotoMultiplier)+'">' + (thisButton) + '</a></li>';
		}
	};
	var nextPage=Math.min(thisPage+1,numPages );
	if(nextPage==thisPage){
		paginationHTML+='<li class="disabled"><span>&rsaquo;</span></li>';
	}
	else{
		paginationHTML+='<li><a href="#" class="addPaginationGoToVal" formID="'+ formID + '" value="'+((nextPage-1)*gotoMultiplier)+'">&rsaquo;</a></li>';
	}
	if(thisPage==numPages){
		paginationHTML+='<li class="disabled"><span>&raquo;</span></li>';
	}
	else{
		paginationHTML+='<li><a href="#" class="addPaginationGoToVal" formID="'+ formID + '" value="'+((numPages-1)*gotoMultiplier)+'">&raquo;</a></li>';
	}



	$('.addPagination').html(paginationHTML);

	//don't forget to bind this click event *after* the html has been created
	$('.addPaginationGoToVal').click(
		function (ev){
			console.debug("Page button clicked:", ev);
			ev.preventDefault();
			var pageParam=$(this)[0].getAttribute('value');
			var formId=$(this)[0].getAttribute('formID');
			var formObject=$('#'+formID);
			formObject.children('.paginationParam').val(pageParam);
			formObject.submit();
		}

	);


	$('.pagination').show();	
}

$('.addDatePicker').bind('keydown focusout', function(e){
    if(e.keyCode == 13 || e.type == 'focusout')
    {
    	var enteredDate=$(this).val();
    	$(this).datepicker('update',enteredDate);
    	var event = jQuery.Event( "changeDate" );
		enteredDate=$(this).val();
    	var date=new Date(enteredDate.substring(6,11), parseInt(enteredDate.substring(0,2))-1, enteredDate.substring(3,5));
		event.date = date;
		
        $(this).datepicker().trigger(event);
    }
});

$('.addDatePicker').datepicker({
    format: 'mm-dd-yyyy',
    startDate: new Date(Date.UTC(1851, 8, 18))
}).on('changeDate', function(ev){
	var month = (ev.date.getUTCMonth()+1);
	if(month<10) month='0'+month;
	var day = (ev.date.getUTCDate());
	if(day<10) day='0'+day;
	var newDate=ev.date.getUTCFullYear() +''+ month +''+ day;
	console.debug("Date changed:",newDate);
	var beginOrEndClass='.addParamBeginDate';
	
	if($(this).hasClass('addDatePickerTo')){
		beginOrEndClass='.addParamEndDate';
	}

	$(this).closest('form').children(beginOrEndClass).val(newDate);
  });

$('.addSortButton').click(
	function(ev){
		var sortVal=$(this)[0].getAttribute('value');
		console.debug("Sort Button clicked:", sortVal);
		if('relevance'==sortVal) sortVal=null;
		$(this).closest('form').children('.sortParam').val(sortVal);
		$(this).closest('form').submit();
	}
);

$('#addHighlightButton').click(
	function(ev){
		$(this).toggleClass('active');
		$(this).closest('form').submit();
	}
);


//prevent checkbox dropdown from disappearing on each click
$('.addParamDropdown').click(
	function(ev){
		ev.stopPropagation();
	}
);

$('.typeahead').each(function(){
    var $this = $(this);
    var suggestService='/svc/suggest/v1/homepage';
    if($this.hasClass('search-byline')) suggestService='/svc/suggest/v1/byline';
    $this.typeahead({
        source: function (query, process) {
            $.get(suggestService, { query: query }, function (data) {
                process(JSON.parse(data)[1]);
            });
        }
        ,updater: function (item) {
        	$this.val(item);
        	$this.closest('form').submit();
            return item;
        }
        ,items: 10
        ,minLength: 2
    });
});

$('#api-key').editable({
                           type:  'text',
                           name:  'api-key',
                           value: localStorage.svc_search_v2_articlesearch_api_key,
                           emptytext: 'Click here to set your API Key!',
                           title: 'Enter your API Key',
                           placement: 'bottom'
                        });

$('#api-key').on('update', function(e, editable){
	localStorage.svc_search_v2_articlesearch_api_key=editable.value;
	APIKEY=localStorage.svc_search_v2_articlesearch_api_key;
	console.log("Updated API key to: ", editable.value);
});
