import songs from './../audio/songs';

export default function audio() {
  Object.keys( songs ).map( key => {
    const button = document.createElement( 'button' );
    button.textContent = key;
    button.addEventListener( 'click', songs[ key ] );
    document.body.appendChild( button );
    return button;
  });
}
