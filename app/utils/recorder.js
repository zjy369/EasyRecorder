import ffRecorder from 'ffmpeg-recorder';
import log from 'electron-log';

import storage from './storage';
import helper from './helper';

import {
  recorderStart,
  recorderStop,
  recorderPause,
  recorderResume
} from '../actions/recorder';
import { configuredStore as store } from '../store/configureStore';

const Recorder = {
  getDevices() {
    return {
      mics: ffRecorder.GetMics(),
      speakers: ffRecorder.GetSpeakers()
    };
  },
  start() {
    const { isRecording } = store.getState().recorder;
    if (isRecording === true) {
      log.error('already recording,can not start again');
      return false;
    }

    const outputFileName = helper.generateVideoFileName(
      storage.getOutputDir(),
      'mp4'
    );

    log.info('start to record to file : ', outputFileName);

    const ret = ffRecorder.Init(
      storage.getQuality(),
      storage.getFps(),
      outputFileName,
      storage.getSpeaker(),
      storage.getSpeaker(),
      storage.getMic(),
      storage.getMic()
    );

    if (ret === 0) {
      ffRecorder.Start();
      store.dispatch(recorderStart(outputFileName));
      log.info('start to record succed');
    } else {
      log.error('start to record failed:', ret);
    }

    return ret === 0;
  },
  stop() {
    const { isRecording } = store.getState().recorder;

    if (isRecording === true) {
      ffRecorder.Stop();
      ffRecorder.Release();
      store.dispatch(recorderStop());
      log.info('stop to record succed.');
    } else {
      log.error('already stopped,can not stop again');
    }

    return true;
  },
  pause() {
    store.dispatch(recorderPause());
  },
  resume() {
    store.dispatch(recorderResume());
  }
};

export default Recorder;
