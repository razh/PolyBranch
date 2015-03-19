/*global $, pjs*/

let firstPlaythrough = true;
let playing = false;

$( document ).ready( () => {
  $( '#main-menu #start' ).click( () => {
    if( !playing ) {
      jsStartGame( false );
      playing = true;
    }
  });

  $( '#gameover-menu #retry' ).click( () => {
    if( !playing ) {
      jsNewGame();
      playing = true;
    }
  });

  $( document ).bind( 'keydown', () => {
    if ( $( '#arrowkeys:visible' ).length ) {
      $( '#arrowkeys' ).fadeOut( 300 );
    }
  });
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
      $( '#arrowkeys' ).fadeIn( 300 );
    }

    $( '#hud' ).fadeIn( 300 );
    $( '#main-menu' ).fadeOut( 300 );
  });
}

function jsNewGame() {
  pjs.newGame();

  $( '#hud #score' ).html( '0' );
  $( '#hud #level span' ).html( '1' );

  $( '#gameover-menu .content' )
    .animate( { opacity: 0 }, 300, () => {
      $( '#gameover-menu .content' ).hide();
      $( '#gameover-menu' )
        .animate( { opacity: 0 }, 300, () => {
          $('#gameover-menu').hide();
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

      $( '#gameover-menu #score' )
        .html(
          score.toLocaleString() +
          '<span id="L">L' + $( '#hud #level span' ).html() + '</span>'
        );

      if( localStorage.highScore === undefined ||
          score > parseInt( localStorage.highScore ) ) {
        $( '#gameover-menu #highscore' ).html( 'NEW RECORD!' );
        localStorage.highScore = score;
        localStorage.highLevel = $( '#hud #level span' ).html();
      } else {
        $( '#gameover-menu #highscore' )
          .html( 'PERSONAL BEST: ' +
            parseInt( localStorage.highScore ).toLocaleString() +
            '<span id="L">L' + localStorage.highLevel + '</span>'
          );
      }

      $( '#gameover-menu #nextlevel span' )
        .html(
          (
            pjs.getNextScore(
              parseInt( $( '#hud #level span' ).html() )
            ) + 1000
          ).toLocaleString()
        );

      $( '#gameover-menu' ).show();
      $( '#gameover-menu' )
        .animate( { opacity: 1 }, 300, () => {
          $( '#gameover-menu .content' ).show();
          $( '#gameover-menu .content' ).animate( { opacity: 1 }, 300 );
        });
    });
}
