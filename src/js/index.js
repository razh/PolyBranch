/*global $, pjs*/

let firstPlaythrough = true;
let playing = false;

$( '#main-menu #start' ).click( () => {
  if( !playing ) {
    jsStartGame( false );
    playing = true;
  }
});

$( '#game-over-menu #retry' ).click( () => {
  if( !playing ) {
    jsNewGame();
    playing = true;
  }
});

$( document ).bind( 'keydown', () => {
  if ( $( '#arrow-keys:visible' ).length ) {
    $( '#arrow-keys' ).fadeOut( 300 );
  }
});

function processingIsReady() {
  $( '#loading' ).fadeOut( 300 );
}

function jsStartGame( fromProcessing ) {
  if( !fromProcessing ){
    pjs.pause();
  }

  $( '#main-menu .content' ).fadeOut( 300, () => {
    if ( firstPlaythrough ) {
      firstPlaythrough = false;
      $( '#arrow-keys' ).fadeIn( 300 );
    }

    $( '#hud' ).fadeIn( 300 );
    $( '#main-menu' ).fadeOut( 300 );
  });
}

function jsNewGame() {
  pjs.newGame();

  $( '#hud #score' ).html( '0' );
  $( '#hud #level span' ).html( '1' );

  $( '#game-over-menu .content' )
    .animate( { opacity: 0 }, 300, () => {
      $( '#game-over-menu .content' ).hide();
      $( '#game-over-menu' )
        .animate( { opacity: 0 }, 300, () => {
          $('#game-over-menu').hide();
          $('#hud').fadeIn( 300 );
          pjs.pause();
        });
    });
}

function jsUpdateScore( score ) {
  $( '#hud #score' ).html( score.toLocaleString() );
}

function jsIncrementLevel() {
  $( '#hud #level span' )
    .html( parseInt( $( '#hud #level span' ).html() ) + 1 );
}

function jsGameOver( score ) {
  playing = false;

  $( '#flash' ).show();

  $( '#hud' ).hide();
  $( '#flash' )
    .delay( 1000 )
    .animate( { opacity: 0 }, 1000, function() {
      $( this ).hide();
      $( this ).css( 'opacity', 1 );

      $( '#game-over-menu #score' )
        .html(
          score.toLocaleString() +
          '<span id="L">L' + $( '#hud #level span' ).html() + '</span>'
        );

      if( localStorage.highScore === undefined ||
          score > parseInt( localStorage.highScore ) ) {
        $( '#game-over-menu #high-score' ).html( 'NEW RECORD!' );
        localStorage.highScore = score;
        localStorage.highLevel = $( '#hud #level span' ).html();
      } else {
        $( '#game-over-menu #high-score' )
          .html( 'PERSONAL BEST: ' +
            parseInt( localStorage.highScore ).toLocaleString() +
            '<span id="L">L' + localStorage.highLevel + '</span>'
          );
      }

      $( '#game-over-menu #next-level span' )
        .html(
          (
            pjs.getNextScore(
              parseInt( $( '#hud #level span' ).html() )
            ) + 1000
          ).toLocaleString()
        );

      $( '#game-over-menu' ).show();
      $( '#game-over-menu' )
        .animate( { opacity: 1 }, 300, () => {
          $( '#game-over-menu .content' ).show();
          $( '#game-over-menu .content' ).animate( { opacity: 1 }, 300 );
        });
    });
}
