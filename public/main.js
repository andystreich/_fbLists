/**
 * Created by andy on 6/13/2016.
 */

function log( msg ) {
  console.log( msg );
}

function List( id, divElement, menuText ) {

  this.parse = function( htmlDivElement ) {
    var $div = $( htmlDivElement );
    this.arity = $div.find( "li" ).length;
    this.kind = $div.attr( "class" ) || 'unknown';
    this.heading = cleanWhitespace( $div.find( 'h3' ).html() );
    var mt = $div.data( "menuText" );
    this.menuText = mt || this.menuText || this.heading;
    this.uid = [ id, this.kind ].join( '-' );
    var html = cleanWhitespace( $div.html() );
    html = html.replace( '</h3>', '</h3><div class="list-body">' );
    html += '</div>';
    this.htmlText =
        '<div id="' + this.uid + '" class="' + this.kind + ' aList">' + html + '</div>';
  }
  this.id = id;
  this.menuText = menuText;
  this.parse( divElement );
}

function Varieties( divElement ) {
  this.parse = function( listDiv ) {
    var $listDiv = $( listDiv );
    this.id = $listDiv.attr( "id" );
    this.menuText = $listDiv.data( "menuText" );
    var varieties = $listDiv.children();
    for( var i = 0; i < varieties.length; i++ ) {
      this.vars.push( new List( this.id, varieties[ i ], this.menuText ) );
    }
    var buf = [ '<div hidden class="varieties" id="' + this.id + '">', '<ul>' ];
    $.each( this.vars, function( index, list ) {
      buf.push( [ '<li><a href="#', list.uid, '">', list.kind, '</a></li>' ].join( '' ) );
    } );
    buf.push( '</ul>' );
    $.each( this.vars, function( index, list ) {
      buf.push( list.htmlText );
    } );
    buf.push( '</div>' );
    this.htmlText = buf.join( '\n' );
  }

  this.id = '';
  this.menuText = '';
  this.vars = [];
  this.html = '';
  this.parse( divElement );
}

function cleanWhitespace( text ) {
  return text.trim().replace( /[ \t]+/g, ' ' );
}

//================================================================================================================

var lists = [];
var lists2 = [];

// main entry point, page load
$( function() {
  log( "ready! " + new Date() );

  // create list of list objects from HTML rep
  lists2 = $( 'div.list' ).map( function( index, listDiv ) {
    return new Varieties( listDiv );
  } );

  // create json rep of the list of lists
  /*
   var jsonText = JSON.stringify( lists2 );
   jsonText = jsonText.split( '},{' ).join( '},\n{' );
   $( '#jsonSource' ).text( jsonText );
   */

  // clean up the page's HTML
  // remove the HTML rep of the list of lists, we now have the translation to plain old javascript objects
  $( "#list-container" ).remove();

  //initialize the menu items and main content
  var $menu = $( '#lists-jumplist' );
  var $main = $( 'main' );
  $.each( lists2, function( i, listVars ) {
    $menu.append(
        '<li class="menu-item " data-list-id="' + listVars.id + '">' + listVars.menuText + '</li>'
    );
    $main.append( listVars.htmlText );
  } );

  // set up list menu and main veiwing area
  $( '#lists-jumplist li:first' ).addClass( 'selected-menu-item' );
  var $firstVlist = $( 'main > div:first' );
  $firstVlist.addClass( 'selected-list' ).show();
  $firstVlist.tabs();

  // add the click handler for the menu, added to the <ul> with delegation to <li>
  $( '#lists-jumplist' ).on( "click", "li", function( event ) {
    $( 'li.selected-menu-item' ).removeClass( 'selected-menu-item' );
    var $thisMenuItem = $( this );  // the <li> just clicked on
    $thisMenuItem.addClass( 'selected-menu-item' );
    $( 'main div.selected-list' ).hide().removeClass( 'selected-list' );
    // var $targetList = $( '#' + $thisMenuItem.data( "listId" ) );
    // $targetList.addClass( 'selected-list' ).fadeIn(1000).show();
    // $targetList.tabs();
    $( '#' + $thisMenuItem.data( "listId" ) )
        .addClass( 'selected-list' )
        .fadeIn( 1000 )
        .show()
        .tabs();
  } );

  // supports left nav being window height tall and scrolling-y with scroll bar
  function setHeight() {
    windowHeight = $( window ).innerHeight();
    log( 'window height = ', windowHeight );
    // $('div.left-nav').css('max-height', windowHeight);
    $( '#button' ).css( 'max-height', windowHeight );
  };
  setHeight();
  $( window ).resize( function() {
    setHeight();
  } );

  // $('#tabs').tabs();

  log( 'jQuery v' + $.fn.jquery );
  log( "ready!!! " + new Date() );

  // dbInit();
} );

//================================================================================================================

function dbInit() {
  //*****************************************
  // test firebase
  var testDatapath = '_test/last';
  var lastValue = null;
  var testRef =   firebase.database().ref(testDatapath);
  testRef.once('value').then(function(snapshot) {
    lastValue = snapshot.val();
    log( lastValue );
    if( lastValue ) {
      testRef.set( ++lastValue );
    } else {
      testRef.set( 1 );
    }
    $('#right-sidebar').append( '<p><span>'+lastValue+'</span></p>');
  });
}