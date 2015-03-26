import { Tone } from 'tone';

function songA() {
  const synth = new Tone.MonoSynth();
  synth.toMaster();

  Tone.Transport.setInterval( time => {
    synth.triggerAttackRelease( 'C4', '8n', time );
  }, '4n' );

  Tone.Transport.start();

  setTimeout( () => Tone.Transport.stop(), 2000 );
}

const songs = {
  songA
};

export default songs;
