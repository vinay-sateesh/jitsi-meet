package com.oney.WebRTCModule;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.SystemClock;
import android.util.Log;
import android.util.SparseArray;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;

import org.webrtc.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@ReactModule(name = "WebRTCModule")
public class NewWebRTCModule extends WebRTCModule implements ActivityEventListener {

    private final SparseArray<Callback> mCallbacks;
    private int mRequestCode = 0;
    private final ReactApplicationContext reactContext;

    /**
     * The application/library-specific private members of local
     * {@link MediaStreamTrack}s created by {@code GetDisplayMedia} mapped by
     * track ID.
     */
    private final Map<String, TrackPrivate> tracks = new HashMap<>();

    public NewWebRTCModule(ReactApplicationContext reactContext, Options options) {
        super(reactContext, options);

        mCallbacks = new SparseArray<Callback>();
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(this);
    }

    @ReactMethod
    @Override
    public void mediaStreamAddTrack(String streamId, String trackId) {
        final MediaStream stream = localStreams.get(streamId);
        final TrackPrivate private_ = tracks.get(trackId);
        if (stream == null) {
            Log.d(TAG, "mediaStreamAddTrack() stream is null");
            return;
        }
        if (private_ != null) {
            ThreadUtils.runOnExecutor(new Runnable() {
                @Override
                public void run() {
                    stream.addTrack((VideoTrack) private_.track);
                }
            });
        } else {
            super.mediaStreamAddTrack(streamId, trackId);
        }
    }

    @ReactMethod
    @Override
    public void mediaStreamRemoveTrack(String streamId, String trackId) {
        final MediaStream stream = localStreams.get(streamId);
        final TrackPrivate private_ = tracks.get(trackId);
        if (stream == null) {
            Log.d(TAG, "mediaStreamRemoveTrack() stream is null");
            return;
        }
        if (private_ != null) {
            ThreadUtils.runOnExecutor(new Runnable() {
                @Override
                public void run() {
                    stream.removeTrack((VideoTrack) private_.track);
                }
            });
        } else {
            super.mediaStreamRemoveTrack(streamId, trackId);
        }
    }

    @ReactMethod
    @Override
    public void mediaStreamRelease(final String id) {
        ThreadUtils.runOnExecutor(new Runnable() {
            @Override
            public void run() {
                MediaStream stream = localStreams.get(id);
                if (stream == null) {
                    Log.d(TAG, "mediaStreamRelease() stream is null");
                    return;
                }
                List<VideoTrack> videoTracks = new ArrayList<>(stream.videoTracks);
                for (VideoTrack track : videoTracks) {
                    String trackId = track.id();
                    TrackPrivate private_ = tracks.remove(trackId);
                    if (private_ != null) {
                        track.setEnabled(false);
                        stream.removeTrack(track);
                        private_.dispose();
                    }
                }
                ThreadUtils.runOnExecutor(new Runnable() {
                    @Override
                    public void run() {
                        NewWebRTCModule.super.mediaStreamRelease(id);
                    }
                });
            }
        });
    }

    @ReactMethod
    @Override
    public void mediaStreamTrackRelease(String id) {
        final TrackPrivate private_ = tracks.remove(id);
        if (private_ != null) {
            ThreadUtils.runOnExecutor(new Runnable() {
                @Override
                public void run() {
                    private_.track.setEnabled(false);
                    private_.dispose();
                }
            });
        } else {
            super.mediaStreamTrackRelease(id);
        }
    }

    @ReactMethod
    @Override
    public void mediaStreamTrackSetEnabled(String id, final boolean enabled) {
        final TrackPrivate private_ = tracks.get(id);
        if (private_ != null) {
            ThreadUtils.runOnExecutor(new Runnable() {
                @Override
                public void run() {
                    if (enabled) {
                        try {
                            private_.videoCapturer.startCapture(private_.width, private_.height, private_.fps);
                        } catch (RuntimeException e) {
                            // XXX This can only fail if we initialize the capturer incorrectly,
                            // which we don't. Thus, ignore any failures here since we trust
                            // ourselves.
                        }
                    } else {
                        try {
                            private_.videoCapturer.stopCapture();
                        } catch (InterruptedException e) {
                        }
                    }
                }
            });
        } else {
            super.mediaStreamTrackSetEnabled(id, enabled);
        }
    }

    @ReactMethod
    @Override
    public void peerConnectionInit(ReadableMap configuration, int id) {
        super.peerConnectionInit(configuration, id);
    }

    @ReactMethod
    @Override
    public void getUserMedia(ReadableMap constraints, Callback successCallback, Callback errorCallback) {
        super.getUserMedia(constraints, successCallback, errorCallback);
    }

    @ReactMethod
    @Override
    public void enumerateDevices(Callback callback) {
        super.enumerateDevices(callback);
    }

    @ReactMethod
    @Override
    public void mediaStreamCreate(String id) {
        super.mediaStreamCreate(id);
    }

    @ReactMethod
    @Override
    public void mediaStreamTrackSwitchCamera(String id) {
        super.mediaStreamTrackSwitchCamera(id);
    }

    @ReactMethod
    @Override
    public void peerConnectionSetConfiguration(ReadableMap configuration, int id) {
        super.peerConnectionSetConfiguration(configuration, id);
    }

    @ReactMethod
    @Override
    public void peerConnectionAddStream(String streamId, int id) {
        super.peerConnectionAddStream(streamId, id);
    }

    @ReactMethod
    @Override
    public void peerConnectionRemoveStream(String streamId, int id) {
        super.peerConnectionRemoveStream(streamId, id);
    }

    @ReactMethod
    @Override
    public void peerConnectionCreateOffer(int id, ReadableMap options, Callback callback) {
        super.peerConnectionCreateOffer(id, options, callback);
    }

    @ReactMethod
    @Override
    public void peerConnectionCreateAnswer(int id, ReadableMap options, Callback callback) {
        super.peerConnectionCreateAnswer(id, options, callback);
    }

    @ReactMethod
    @Override
    public void peerConnectionSetLocalDescription(ReadableMap sdpMap, int id, Callback callback) {
        super.peerConnectionSetLocalDescription(sdpMap, id, callback);
    }

    @ReactMethod
    @Override
    public void peerConnectionSetRemoteDescription(ReadableMap sdpMap, int id, Callback callback) {
        super.peerConnectionSetRemoteDescription(sdpMap, id, callback);
    }

    @ReactMethod
    @Override
    public void peerConnectionAddICECandidate(ReadableMap candidateMap, int id, Callback callback) {
        super.peerConnectionAddICECandidate(candidateMap, id, callback);
    }

    @ReactMethod
    @Override
    public void peerConnectionGetStats(String trackId, int id, Callback cb) {
        super.peerConnectionGetStats(trackId, id, cb);
    }

    @ReactMethod
    @Override
    public void peerConnectionClose(int id) {
        super.peerConnectionClose(id);
    }

    @ReactMethod
    @Override
    public void createDataChannel(int peerConnectionId, String label, ReadableMap config) {
        super.createDataChannel(peerConnectionId, label, config);
    }

    @ReactMethod
    @Override
    public void dataChannelClose(int peerConnectionId, int dataChannelId) {
        super.dataChannelClose(peerConnectionId, dataChannelId);
    }

    @ReactMethod
    public void dataChannelSend(int peerConnectionId, int dataChannelId, String data, String type) {
        super.dataChannelSend(peerConnectionId, dataChannelId, data, type);
    }

    @TargetApi(21)
    @ReactMethod
    public void getDisplayMedia(final ReadableMap constraints, final Callback successCallback, final  Callback errorCallback) {
        mCallbacks.put(mRequestCode, new Callback() {

            @Override
            public void invoke(final Object... args) {
                ThreadUtils.runOnExecutor(new Runnable() {
                    @Override
                    public void run() {
                        int resultCode = (int) args[1];
                        if (resultCode != Activity.RESULT_OK) {
                            errorCallback.invoke("DOMException", "AbortError");
                            return;
                        }
                        VideoTrack track = null;
                        if (constraints.hasKey("video")) {
                            track = createVideoTrack(constraints, new ScreenCapturerAndroid((Intent) args[2], new MediaProjection.Callback() {}));
                        }
                        if (track == null) {
                            errorCallback.invoke("DOMException", "AbortError");
                            return;
                        }
                        String streamId = UUID.randomUUID().toString();
                        MediaStream mediaStream
                            = mFactory.createLocalMediaStream(streamId);
                        WritableArray tracks = Arguments.createArray();

                        mediaStream.addTrack(track);
                        WritableMap track_ = Arguments.createMap();
                        String trackId = track.id();
                        track_.putBoolean("enabled", track.enabled());
                        track_.putString("id", trackId);
                        track_.putString("kind", track.kind());
                        track_.putString("label", trackId);
                        track_.putString("readyState", track.state().toString());
                        track_.putBoolean("remote", false);
                        tracks.pushMap(track_);

                        Log.d(TAG, "MediaStream id: " + streamId);
                        localStreams.put(streamId, mediaStream);

                        successCallback.invoke(streamId, tracks);
                    }
                });
            }
        });
        MediaProjectionManager mediaProjectionManager = (MediaProjectionManager) reactContext.getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        reactContext.startActivityForResult(
            mediaProjectionManager.createScreenCaptureIntent(), mRequestCode, null);
        mRequestCode++;
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        mCallbacks.get(requestCode).invoke(activity, resultCode, data);
        mCallbacks.remove(requestCode);
    }

    /**
     * Called when a new intent is passed to the activity
     */
    @Override
    public void onNewIntent(Intent intent) {
    }

    private VideoTrack createVideoTrack(ReadableMap constraints, VideoCapturer videoCapturer) {
        ReadableMap videoConstraintsMap = constraints.getMap("video");

        Log.d(TAG, "getDisplayMedia(video): " + videoConstraintsMap);

        PeerConnectionFactory pcFactory = mFactory;
        EglBase.Context eglContext = EglUtils.getRootEglBaseContext();
        SurfaceTextureHelper surfaceTextureHelper =
            SurfaceTextureHelper.create("CaptureThread-1", eglContext);

        // FIXME: Does param 'isScreencast' make any sense?
        // When in SFU mode, screen video source cannot distrubute frames after a recreation.
        //
        VideoSource videoSource = pcFactory.createVideoSource(false);
        videoCapturer.initialize(surfaceTextureHelper, reactContext, new CapturerObserverProxy(videoSource.getCapturerObserver(), surfaceTextureHelper.getHandler()));

        String id = UUID.randomUUID().toString();
        VideoTrack track = pcFactory.createVideoTrack(id, videoSource);

        track.setEnabled(true);
        int width = videoConstraintsMap.getInt("width"), height = videoConstraintsMap.getInt("height"), fps = 0;

        try {
            videoCapturer.startCapture(width, height, fps);
        } catch (RuntimeException e) {
            // XXX This can only fail if we initialize the capturer incorrectly,
            // which we don't. Thus, ignore any failures here since we trust
            // ourselves.
        }

        tracks.put(id, new TrackPrivate(track, videoSource, videoCapturer, width, height, fps));

        return track;
    }

    /**
     * Application/library-specific private members of local
     * {@code MediaStreamTrack}s created by {@code GetDisplayMedia}.
     */
    private static class TrackPrivate {
        /**
         * The {@code MediaSource} from which {@link #track} was created.
         */
        public final MediaSource mediaSource;

        public final MediaStreamTrack track;

        /**
         * The {@code VideoCapturer} from which {@link #mediaSource} was created
         * if {@link #track} is a {@link VideoTrack}.
         */
        public final VideoCapturer videoCapturer;

        /**
         * video constraints
         */
        public final int width;
        public final int height;
        public final int fps;

        /**
         * Whether this object has been disposed or not.
         */
        private boolean disposed;

        public TrackPrivate(
            MediaStreamTrack track,
            MediaSource mediaSource,
            VideoCapturer videoCapturer,
            int width,
            int height,
            int fps) {
            this.track = track;
            this.mediaSource = mediaSource;
            this.videoCapturer = videoCapturer;
            this.width = width;
            this.height = height;
            this.fps = fps;
            this.disposed = false;
        }

        public void dispose() {
            if (!disposed) {
                try {
                    videoCapturer.stopCapture();
                    videoCapturer.dispose();
                } catch (InterruptedException e) {
                }
                mediaSource.dispose();
                track.dispose();
                disposed = true;
            }
        }
    }

    /**
     * Deliver video frame at a fixed framerate.
     *
     *
     */
    final class CapturerObserverProxy implements CapturerObserver {

        private static final int VIDEO_FPS = 30;

        private CapturerObserver capturerObserver;
        private VideoFrame videoFrame;
        private Handler surfaceTextureHelperHandler;

        private Handler handler;
        private Runnable deliverVideoFrameTask = new Runnable() {

            @Override
            public void run() {
                try {
                    Thread.sleep(1000 / VIDEO_FPS);
                    surfaceTextureHelperHandler.post(new Runnable() {

                        @Override
                        public void run() {
                            if (videoFrame != null) {
                                capturerObserver.onFrameCaptured(new VideoFrame(videoFrame.getBuffer(), videoFrame.getRotation(), TimeUnit.MILLISECONDS.toNanos(SystemClock.elapsedRealtime())));
                            }
                            if (handler != null) {
                                handler.post(deliverVideoFrameTask);
                            }
                        }
                    });
                } catch (InterruptedException e) {
                }
            }
        };

        /**
         *
         * @param capturerObserver Interface for observering a capturer. Passed to {@link VideoCapturer#initialize}. Provided by
         * {@link VideoSource#getCapturerObserver}.
         * @param surfaceTextureHelperHandler
         */
        public CapturerObserverProxy(CapturerObserver capturerObserver, Handler surfaceTextureHelperHandler) {
            this.capturerObserver = capturerObserver;
            this.surfaceTextureHelperHandler = surfaceTextureHelperHandler;
        }

        @Override
        public void onCapturerStarted(boolean b) {
            capturerObserver.onCapturerStarted(b);
            HandlerThread thread = new HandlerThread("CapturerObserverProxy");
            thread.start();
            handler = new Handler(thread.getLooper());
            handler.post(deliverVideoFrameTask);
        }

        @Override
        public void onCapturerStopped() {
            capturerObserver.onCapturerStopped();
            if (handler != null) {
                handler.getLooper().quit();
            }
            handler = null;
        }

        @Override
        public void onFrameCaptured(VideoFrame frame) {
            if (videoFrame != null) {
                videoFrame.release();
            }
            videoFrame = new VideoFrame(frame.getBuffer().toI420(), frame.getRotation(), frame.getTimestampNs());
        }
    }
}
