import $ from 'jquery';

window.jQuery = window.$ = $;
require( 'velocity-animate' );

import Game from './_game';
import createIcon from './icon';

createIcon();

const DURATION      = 300;
const LONG_DURATION = 600;

let firstPlaythrough = true;
let playing = false;

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
const $nextLevel         = $( '#game-over-menu #next-level span' );
const $retry             = $( '#game-over-menu #retry' );

const $hud   = $( '#hud' );
const $score = $( '#hud #score' );
const $level = $( '#hud #level span' );

// Initialize.
const game = new Game( $( '.container' )[0] );

$start.on( 'click', () => {
  if( !playing ) {
    game.emit( 'start', false );
    playing = true;
  }
});

$retry.on( 'click', () => {
  if( !playing ) {
    newGame();
    playing = true;
  }
});

$( document ).on( 'keydown', () => $arrowKeys.fadeOut( DURATION ) );

game.on( 'start', fromProcessing => {
  if ( !fromProcessing ) {
    game.toggle();
  }

  $mainMenuContent.fadeOut( DURATION, () => {
    if ( firstPlaythrough ) {
      firstPlaythrough = false;
      $arrowKeys.fadeIn();
    }

    $hud.fadeIn( DURATION);
    $mainMenu.fadeOut( DURATION );
  });
});

function newGame() {
  game.reset();

  $score.text( 0 );
  $level.text( 1 );

  $gameOverContent.velocity( { opacity: 0 }, DURATION, () => {
    $gameOverContent.hide();
    $gameOverMenu.velocity( { opacity: 0 }, DURATION, () => {
      $gameOverMenu.hide();
      $hud.fadeIn( DURATION );
      game.toggle();
    });
  });
}

game.on( 'score', score => $score.text( score.toLocaleString() ) );
game.on( 'level', () => $level.text( parseInt( $level.text() ) + 1 ) );

game.on( 'end', score => {
  playing = false;

  $hud.hide();
  $flash.show()
    .delay( DURATION )
    .velocity( { opacity: 0 }, DURATION, () => {
      $flash.hide()
        .css( 'opacity', 1 );

      $gameOverScore.html(
        score.toLocaleString() +
        '<span id="L">L' + $level.text() + '</span>'
      );

      const { highScore } = localStorage;

      if( highScore === undefined || score > parseInt( highScore ) ) {
        $gameOverHighScore.text( 'NEW RECORD!' );
        localStorage.highScore = score;
        localStorage.highLevel = $level.text();
      } else {
        $gameOverHighScore.html(
          'PERSONAL BEST: ' +
          parseInt( highScore ).toLocaleString() +
          '<span id="L">L' + localStorage.highLevel + '</span>'
        );
      }

      $nextLevel.text(
        ( game.getNextScore( parseInt( $level.text(), 10 ) ) + 1000 )
          .toLocaleString()
      );

      $gameOverMenu.show()
        .velocity( { opacity: 1 }, DURATION, () => {
          $gameOverContent.show()
            .velocity( { opacity: 1 }, DURATION );
        });
    });
});
