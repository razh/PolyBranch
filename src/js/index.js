import Game from './game';

const DURATION      = 300;
const LONG_DURATION = 1000;

let firstPlaythrough = true;
let playing = false;

const $ = document.querySelector.bind( document );

const $mainMenu        = $( '#main-menu' );
const $start           = $( '#main-menu #start' );
const $mainMenuContent = $( '#main-menu .content' );

const $flash     = $( '#flash' );
const $loading   = $( '#loading' );
const $arrowKeys = $( '#arrow-keys' );

const $gameOverMenu      = $( '#game-over-menu' );
const $gameOverContent   = $( '#game-over-menu .content' );
const $gameOverScore     = $( '#game-over-menu #score' );
const $gameOverHighScore = $( '#game-over-menu #high-score' );
const $nextLevel         = $( '#game-over-menu #next-level' );
const $retry             = $( '#game-over-menu #retry' );

const $hud   = $( '#hud' );
const $score = $( '#hud #score' );
const $level = $( '#hud #level span' );

function show( el ) {
  el.style.display = '';
  return el;
}

function hide( el ) {
  el.style.display = 'none';
  return el;
}

function css( el, props ) {
  Object.keys( props ).forEach( key => el.style.key = props[ key ] );
  return el;
}

// Initialize.
const game = new Game( $( 'canvas' ) );
$loading.fadeOut( DURATION );

$start.addEventListener( 'click', () => {
  if( !playing ) {
    game.emit( 'start', false );
    playing = true;
  }
});

$retry.addEventListener( 'click', () => {
  if( !playing ) {
    newGame();
    playing = true;
  }
});

document.addEventListener( 'keydown', () => {
  if ( $( '#arrow-keys:visible' ).length ) {
    $arrowKeys.fadeOut( DURATION );
  }
});

game.on( 'start', fromProcessing => {
  if ( !fromProcessing ) {
    game.toggle();
  }

  $mainMenuContent.fadeOut( DURATION, () => {
    if ( firstPlaythrough ) {
      firstPlaythrough = false;
      $arrowKeys.fadeIn( DURATION );
    }

    $hud.fadeIn( DURATION );
    $mainMenu.fadeOut( DURATION );
  });
});

function newGame() {
  game.reset();

  $score.textContent = 0;
  $level.textContent = 1;

  $gameOverContent
    .animate( { opacity: 0 }, DURATION, () => {
      hide( $gameOverContent );
      $gameOverMenu
        .animate( { opacity: 0 }, DURATION, () => {
          hide( $gameOverMenu );
          $hud.fadeIn( DURATION );
          game.toggle();
        });
    });
}

game.on( 'score', score => $score.textContent = score.toLocaleString() );

game.on( 'level', () =>
  $level.textContent( parseInt( $level.textContent ) + 1 )
);

game.on( 'end', score => {
  playing = false;

  show( $flash );
  hide( $hud );

  $flash
    .delay( LONG_DURATION )
    .animate( { opacity: 0 }, LONG_DURATION, () => {
      hide( $flash );
      css( $flash, { 'opacity': 1 } );

      $gameOverScore.innerHTML = score.toLocaleString() +
        '<span id="L">L' + $level.textContent + '</span>';

      if( localStorage.highScore === undefined ||
          score > parseInt( localStorage.highScore ) ) {
        $gameOverHighScore.textContent = 'NEW RECORD!';
        localStorage.highScore = score;
        localStorage.highLevel = $level.textContent;
      } else {
        $gameOverHighScore.innerHTML = 'PERSONAL BEST: ' +
          parseInt( localStorage.highScore ).toLocaleString() +
          '<span id="L">L' + localStorage.highLevel + '</span>';
      }

      $nextLevel.textContent = (
        game.getNextScore( parseInt( $level.textContent ) ) + 1000
      ).toLocaleString();

      show( $gameOverMenu );
      $gameOverMenu
        .animate( { opacity: 1 }, DURATION, () => {
          show( $gameOverContent );
          $gameOverContent.animate( { opacity: 1 }, DURATION );
        });
    });
});
