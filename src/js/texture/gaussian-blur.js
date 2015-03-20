import stackblur from 'stackblur';
import createImageData from 'image-data';

export function blur( imageData, radius ) {
  const { data, width, height } = imageData;
  return stackblur( data, width, height, radius );
}

export function sharpen( imageData, radius ) {
  const { data } = imageData;

  const gaussianImageData = createImageData();
  const gaussianData = gaussianImageData.data;
  gaussianData.set( data );

  blur( gaussianImageData, radius );

  // Subtract blur.
  for ( let i = 0, il = data.length; i < il; i++ ) {
    data[i] += data[i] - gaussianData[i];
  }

  return imageData;
}
