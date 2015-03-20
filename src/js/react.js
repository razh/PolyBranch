/*global game*/
import React from 'react/addons';

const { ReactCSSTransitionGroup } = React.addons;

class MainMenu extends React.Component {
  render() {
    return (
      <div className='overlay main-menu'>
        <div className='content'>
          <button onClick={this.props.start}>Start</button>
        </div>
      </div>
    );
  }
}

MainMenu.propTypes = {
  start: React.PropTypes.func.isRequired
};


class HUD extends React.Component {
  render() {
    const { score, level } = this.props;

    return (
      <div className='hud'>
        <h1 className='score'>{score.toLocaleString()}</h1>
        <h1 className='level'>
          L<span>{level}</span>
        </h1>
      </div>
    );
  }
}

HUD.propTypes = {
  score: React.PropTypes.number.isRequired,
  level: React.PropTypes.number.isRequired
};


class GameOverMenu extends React.Component {
  render() {
    const {
      score,
      highScore,
      nextLevel,
      retry
    } = this.props;

    return (
      <div className='overlay game-over-menu'>
        <div className='content'>
          <h1 className='score'>{score.toLocaleString()}</h1>
          <h2 className='high-score'>{highScore.toLocaleString()}</h2>

          <h2 className='next-level'>
            Next level at <span>{nextLevel.toLocaleString()}</span>
          </h2>

          <button className='retry' onClick={retry}>
            Try again
          </button>
        </div>
      </div>
    );
  }
}

GameOverMenu.propTypeses = {
  score: React.PropTypes.number.isRequired,
  highScore: React.PropTypes.number.isRequired,
  nextLevel: React.PropTypes.number.isRequired,
  retry: React.PropTypes.func.isRequired
};


export class Overlay extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {
      score: 0,
      level: 1,
      plays: 0,
      highScore: localStorage.highScore || 0,
      highLevel: localStorage.highLevel || 1
    };

    this.start = this.start.bind( this );
    this.retry = this.retry.bind( this );

    this.handleStart = this.handleStart.bind( this );
    this.handleScore = this.handleScore.bind( this );
    this.handleLevel = this.handleLevel.bind( this );
    this.handleEnd   = this.handleEnd.bind( this );

    game.on( 'start', this.handleStart );
    game.on( 'score', this.handleScore );
    game.on( 'level', this.handleLevel );
    game.on( 'end',   this.handleEnd  );
  }

  start() {
    game.toggle();
  }

  retry() {
    game.reset();

    this.setState({
      score: 0,
      level: 1,
      plays: this.state.plays + 1
    }, () => game.toggle() );
  }

  handleStart() {}

  handleScore( score ) { this.setState({ score }); }
  handleLevel( level ) { this.setState({ level }); }

  handleEnd( score ) {
    let {
      level,
      highScore,
      highLevel
    } = this.state;

    if ( score > highScore ) {
      localStorage.highScore = highScore = score;
      localStorage.highLevel = highLevel = level;
    }

    this.setState({
      score,
      highScore,
      level,
      highLevel
    });
  }

  render() {
    const {
      score,
      level,
      highScore
    } = this.state;

    const nextLevel = ( game.getNextScore( level ) + 1000 ).toLocaleString();

    return (
      <div className='overlays'>
        <MainMenu start={this.start} />

        <HUD score={score} level={level} />

        <GameOverMenu
          score={score}
          highScore={highScore}
          nextLevel={nextLevel}
          retry={this.retry} />
      </div>
    );
  }
}
