import _ from 'lodash';
import songs from './../audio/songs';

export default function audio() {
  _.forOwn( songs, ( song, key ) => {
    const button = document.createElement( 'button' );
    button.textContent = key;
    button.addEventListener( 'click', song );
    document.body.appendChild( button );
    return button;
  });
}
