'use strict';

import {
  Platform,
  NativeModules
} from 'react-native';

import { MediaStream } from 'react-native-webrtc';

let _getDisplayMedia;

if (Platform.OS  === 'android') {
  _getDisplayMedia = function getDisplayMedia(constraints = {}) {
    if (typeof constraints !== 'object') {
      return Promise.reject(new TypeError('constraints is not a dictionary'));
    }

    if ((typeof constraints.video === 'undefined' || !constraints.video)) {
      return Promise.reject(new TypeError('video is required'));
    }

    // Normalize the given constraints
    if (typeof constraints.video === 'boolean') {
      constraints.video = {    
        height: 720,
        width: 1280
      }
    }

    return new Promise((resolve, reject) => {
        NativeModules.WebRTCModule.getDisplayMedia(constraints, (id, tracks) => {
          let stream = new MediaStream({
            streamId: id,
            streamReactTag: id,
            tracks
          });
          stream._tracks.forEach(track => {
            track.applyConstraints = function () {
              // FIXME: ScreenObtainer.obtainScreenFromGetDisplayMedia.
              return Promise.resolve();
            }.bind(track);
          })
          resolve(stream);
        }, (type, message) => {
          let error;
          switch (type) {
          case 'TypeError':
            error = new TypeError(message);
            break;
          }
          if (!error) {
            error = { message, name: type };
          }
          reject(error);
        });
    });
  }
}

export default _getDisplayMedia;
