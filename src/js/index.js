import Game from './game';

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

function onTransitionEnd( el, callback ) {
  if ( el.style.transition !== undefined ) {
    el.addEventListener( 'transitionend', callback );
  } else if ( el.style.webkitTransition !== undefined ) {
    el.addEventListener( 'webkitTransitionEnd', callback );
  }
}

// Returns a function that accepts an element and a callback that is called
// on "transitionend".
function addClass( className ) {
  return ( el, callback ) => {
    el.classList.add( className );
    onTransitionEnd( el, callback );
  };
}

const fadeIn  = addClass( 'fade-in' );
const fadeOut = addClass( 'fade-out');

const fadeOutLong = addClass( 'fade-out--long');

// Initialize.
const game = new Game( $( 'canvas' ) );
fadeOut( $loading, () => hide( $loading ) );

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

document.addEventListener( 'keydown', () => fadeOut( $arrowKeys ));

game.on( 'start', fromProcessing => {
  if ( !fromProcessing ) {
    game.toggle();
  }

  fadeOut( $mainMenuContent, () => {
    if ( firstPlaythrough ) {
      firstPlaythrough = false;
      fadeIn( $arrowKeys );
    }

    fadeIn( $hud );
    fadeOut( $mainMenu );
  });
});

function newGame() {
  game.reset();

  $score.textContent = 0;
  $level.textContent = 1;

  fadeOut( $gameOverContent, () => {
    hide( $gameOverContent );
    fadeOut( $gameOverMenu, () => {
      hide( $gameOverMenu );
      fadeIn( $hud );
      game.toggle();
    });
  });
}

game.on( 'score', score => $score.textContent = score.toLocaleString() );

game.on( 'level', () =>
  $level.textContent = parseInt( $level.textContent ) + 1
);

game.on( 'end', score => {
  playing = false;

  show( $flash );
  hide( $hud );

  setTimeout( () => {
    fadeOutLong( $flash, () => {
      hide( $flash );
      css( $flash, { opacity: 1 } );

      $gameOverScore.innerHTML = score.toLocaleString() +
        '<span id="L">L' + $level.textContent + '</span>';

      const { highScore } = localStorage;

      if( highScore === undefined || score > parseInt( highScore ) ) {
        $gameOverHighScore.textContent = 'NEW RECORD!';
        localStorage.highScore = score;
        localStorage.highLevel = $level.textContent;
      } else {
        $gameOverHighScore.innerHTML = 'PERSONAL BEST: ' +
          parseInt( highScore ).toLocaleString() +
          '<span id="L">L' + localStorage.highLevel + '</span>';
      }

      $nextLevel.textContent = (
        game.getNextScore( parseInt( $level.textContent ) ) + 1000
      ).toLocaleString();

      show( $gameOverMenu );
      fadeIn( $gameOverMenu, () => {
        show( $gameOverContent );
        fadeIn( $gameOverContent );
      });
    });
  }, LONG_DURATION );
});
