// @flow
import {
    participantRoleChanged,
    getParticipantCount,
    isLocalParticipantModerator,
    hostModeratorId,
} from '../../../base/participants';
import { db } from '../../../base/config/firebase'
import React from 'react';

import { showNotification, hideNotification } from '../../../notifications';
import { getLocalParticipant, getParticipantById } from '../../../base/participants'
import { getConferenceName } from '../../../base/conference';
import {
    NativeModules,
    SafeAreaView,
    StatusBar,
    TouchableWithoutFeedback,
    View,
    Keyboard,
    TextInput,
    Text
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ConfirmDialog } from '../../../base/dialog';
import type { Dispatch } from 'redux';
import { appNavigate } from '../../../app';
import { PIP_ENABLED, getFeatureFlag } from '../../../base/flags';
import { Container, LoadingIndicator, TintedView } from '../../../base/react';
import { connect } from '../../../base/redux';
import { isNarrowAspectRatio, makeAspectRatioAware } from '../../../base/responsive-ui';
import { TestConnectionInfo } from '../../../base/testing';
import { ConferenceNotification, isCalendarEnabled } from '../../../calendar-sync';
import { Chat } from '../../../chat';

import { DisplayNameLabel } from '../../../display-name';
import { SharedDocument } from '../../../etherpad';
import { FILMSTRIP_SIZE, Filmstrip, isFilmstripVisible, TileView } from '../../../filmstrip';
import { LargeVideo } from '../../../large-video';
import { BackButtonRegistry } from '../../../mobile/back-button';
import { AddPeopleDialog, CalleeInfoContainer } from '../../../invite';
import { Captions } from '../../../subtitles';
import {
    isToolboxVisible,
    isTopNavigationVisible,
    setToolboxVisible,
    Toolbox,
    toggleTopNavigationVisible,
} from '../../../toolbox';

import { AbstractConference, abstractMapStateToProps } from '../AbstractConference';
import Labels from './Labels';
import NavigationBar from './NavigationBar';
import Topbar from './Topbar';
import styles, { NAVBAR_GRADIENT_COLORS } from './styles';

import type { AbstractProps } from '../AbstractConference';

/**
 * The type of the React {@code Component} props of {@link Conference}.
 */
type Props = AbstractProps & {
    /**
     * Wherther the calendar feature is enabled or not.
     *
     * @private
     */
    _calendarEnabled: boolean,

    /**
     * The indicator which determines that we are still connecting to the
     * conference which includes establishing the XMPP connection and then
     * joining the room. If truthy, then an activity/loading indicator will be
     * rendered.
     *
     * @private
     */
    _connecting: boolean,

    /**
     * Set to {@code true} when the filmstrip is currently visible.
     *
     * @private
     */
    _filmstripVisible: boolean,

    /**
     * The ID of the participant currently on stage (if any)
     */
    _largeVideoParticipantId: string,

    /**
     * Whether Picture-in-Picture is enabled.
     *
     * @private
     */
    _pictureInPictureEnabled: boolean,

    /**
     * The indicator which determines whether the UI is reduced (to accommodate
     * smaller display areas).
     *
     * @private
     */
    _reducedUI: boolean,

    /**
     * The handler which dispatches the (redux) action {@link setToolboxVisible}
     * to show/hide the {@link Toolbox}.
     *
     * @param {boolean} visible - {@code true} to show the {@code Toolbox} or
     * {@code false} to hide it.
     * @private
     * @returns {void}
     */
    _setToolboxVisible: Function,

    /**
     * The indicator which determines whether the Toolbox is visible.
     *
     * @private
     */
    _toolboxVisible: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,
    /**
     * The ID of the  meeting moderator.
     */
    _ModeratorId: string,
    /**
     * The first participant in the meeting
     */
    _firstParticipant: Object,
    _numberOfParticipants: number,
    _changeParticipantRole: Function,
    _isLocalParticipantModerator: boolean,
    /**
     * Set the Host ID for this conference
     */
    _HostModeratorId: Function,
    _roomName: String,
    _localParticipant: Object
};

/**
 * The conference page of the mobile (i.e. React Native) application.
 */
class Conference extends AbstractConference<Props, *> {
    /**
     * Initializes a new Conference instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);
        this.state = {
            // user: auth().currentUser,
            calls: [],
            onCall: [],
            readError: null,
            currentNotificationId: null,
            localRole: this.props._localParticipant.role
        };
        // Bind event handlers so they are only bound once per instance.
        this._onClick = this._onClick.bind(this);
        this._onHardwareBackPress = this._onHardwareBackPress.bind(this);
        this._setToolboxVisible = this._setToolboxVisible.bind(this);
    }
    async handleOnCall(id) {
        console.log(id)
        await db.ref("onCall").push({

            uid: id,

        }, (err) => {

            if (err) {
                console.log(err);
            }
            else {
                console.log('Call Made!')
            }

        });
    }

    /**
     * Implements {@link Component#componentDidMount()}. Invoked immediately
     * after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        try {
            db.ref("calls").on("child_added", snap => {
                console.log(snap)
                let calls = [];

                calls.push({ ...snap.val(), key: snap.key });
                this.setState({ calls });

                const customActionHandler = () => {
                    this.state.onCall.push(snap.val());
                    this.state.currentNotificationId ?
                        this.props.dispatch(hideNotification(this.state.currentNotificationId))
                        : console.log('No notification id set');
                    console.log(this.state.onCall);
                    // this.props.dispatch(participantRoleChanged(snap.val().uid, 'onCall'));
                    this.handleOnCall(snap.val().uid);

                    //Show remote participant view once they are onCall


                };
                /**
                 * Show someone is calling you only if you are
                 * the meeting host of a conference that contains
                 * that participant
                 */
                //FIX - need to add : this.props._localParticipant.role === 'moderator' &&
                if (this.props._roomName === snap.val().roomName) {
                    //Noitify moderator about call for 15 seconds
                    const notification = showNotification({
                        titleKey: `${snap.val().name} is calling you!`,
                        description: <Text>Incoming call</Text>,
                        descriptionKey: snap.val().uid,
                        customActionNameKey: 'Accept Call',
                        customActionHandler,
                        acceptButton: true

                    }, 15000);
                    this.setState({ currentNotificationId: notification.uid });
                    this.props.dispatch(notification);
                }

            });

        } catch (error) {
            this.setState({ readError: error.message });
        }
        this._setToolboxVisible(true);

        // this.props._HostModeratorId(this.props._firstParticipant.id);
        // this.props._ModeratorId = this.props._firstParticipant.id;

        BackButtonRegistry.addListener(this._onHardwareBackPress);
    }

    /**
     * Implements {@link Component#componentWillUnmount()}. Invoked immediately
     * before this component is unmounted and destroyed. Disconnects the
     * conference described by the redux store/state.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        // Tear handling any hardware button presses for back navigation down.
        BackButtonRegistry.removeListener(this._onHardwareBackPress);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Container style={styles.conference}>
                <StatusBar barStyle="light-content" hidden={true} translucent={true} />

                {this._renderContent()}

            </Container>
        );
    }

    _onClick: () => void;

    /**
     * Changes the value of the toolboxVisible state, thus allowing us to switch
     * between Toolbox and Filmstrip and change their visibility.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        // this._setToolboxVisible(!this.props._toolboxVisible);

        this.props.dispatch(toggleTopNavigationVisible());
        Keyboard.dismiss();
    }

    _onHardwareBackPress: () => boolean;

    /**
     * Handles a hardware button press for back navigation. Enters Picture-in-Picture mode
     * (if supported) or leaves the associated {@code Conference} otherwise.
     *
     * @returns {boolean} Exiting the app is undesired, so {@code true} is always returned.
     */
    _onHardwareBackPress() {
        let p;

        if (this.props._pictureInPictureEnabled) {
            const { PictureInPicture } = NativeModules;

            p = PictureInPicture.enterPictureInPicture();
        } else {
            p = Promise.reject(new Error('PiP not enabled'));
        }

        p.catch(() => {
            this.props.dispatch(appNavigate(undefined));
        });

        return true;
    }

    /**
     * Renders the conference notification badge if the feature is enabled.
     *
     * @private
     * @returns {React$Node}
     */
    _renderConferenceNotification() {
        const { _calendarEnabled, _reducedUI } = this.props;

        return _calendarEnabled && !_reducedUI ? <ConferenceNotification /> : undefined;
    }

    /**
     * Renders the content for the Conference container.
     *
     * @private
     * @returns {React$Element}
     */
    _renderContent() {
        const {
            _connecting,
            _filmstripVisible,
            _largeVideoParticipantId,
            _reducedUI,
            _shouldDisplayTileView,
            _toolboxVisible,
        } = this.props;
        const showGradient = _toolboxVisible;
        const applyGradientStretching =
            _filmstripVisible && isNarrowAspectRatio(this) && !_shouldDisplayTileView;

        if (_reducedUI) {
            return this._renderContentForReducedUi();
        }

        return (
            <>

                <AddPeopleDialog />

                <SharedDocument />

                {
                    /*
                     * The LargeVideo is the lowermost stacking layer.
                     */
                    _shouldDisplayTileView ? (
                        <TileView onClick={this._onClick} />
                    ) : (
                            <LargeVideo onClick={this._onClick} />
                        )
                }

                {
                    /*
                     * If there is a ringing call, show the callee's info.
                     */
                    <CalleeInfoContainer />
                }

                {
                    /*
                     * The activity/loading indicator goes above everything, except
                     * the toolbox/toolbars and the dialogs.
                     */
                    _connecting && (
                        <TintedView>
                            <LoadingIndicator />
                        </TintedView>
                    )
                }

                <SafeAreaView pointerEvents="box-none" style={styles.toolboxAndFilmstripContainer}>
                    {showGradient && (
                        <LinearGradient
                            colors={NAVBAR_GRADIENT_COLORS}
                            end={{
                                x: 0.0,
                                y: 0.0,
                            }}
                            pointerEvents="none"
                            start={{
                                x: 0.0,
                                y: 1.0,
                            }}
                            style={[
                                styles.bottomGradient,
                                applyGradientStretching ? styles.gradientStretchBottom : undefined,
                            ]}
                        />
                    )}

                    <Labels />

                    <Captions onPress={this._onClick} />

                    {_shouldDisplayTileView || (
                        <DisplayNameLabel participantId={_largeVideoParticipantId} />
                    )}
                    <View
                        style={{
                            ...styles.chatOverlay,
                            // backgroundColor: "red",
                            // zIndex: 10000,
                        }}
                    >
                        {/*
                        The toolbox is being rendered in the Chat component because keyboard
                        pushing the view up is being manually handled and the chat and toolbox
                        are the only components that need to move up while the video background remains
                        fixed.
                        */}
                        <Chat roomName={this.props._roomName} localParticipant={this.props._localParticipant} isModerator={this.props._isLocalParticipantModerator} />
                        <View
                            style={{
                                justifyContent: 'flex-end',
                            }}
                        ></View>
                    </View>
                    {/*
                     * The Toolbox is in a stacking layer below the Filmstrip.
                     */}

                </SafeAreaView>

                <SafeAreaView pointerEvents="box-none" style={{ ...styles.navBarSafeView }}>
                    <Topbar NumberOfParticipants={this.props._numberOfParticipants} />
                    {this._renderNotificationsContainer()}
                </SafeAreaView>

                <TestConnectionInfo />

                {this._renderConferenceNotification()}
            </>
        );
    }

    /**
     * Renders the content for the Conference container when in "reduced UI" mode.
     *
     * @private
     * @returns {React$Element}
     */
    _renderContentForReducedUi() {
        const { _connecting } = this.props;

        return (
            <>
                <LargeVideo onClick={this._onClick} />

                {_connecting && (
                    <TintedView>
                        <LoadingIndicator />
                    </TintedView>
                )}
            </>
        );
    }

    /**
     * Renders a container for notifications to be displayed by the
     * base/notifications feature.
     *
     * @private
     * @returns {React$Element}
     */
    _renderNotificationsContainer() {
        const notificationsStyle = {};

        // In the landscape mode (wide) there's problem with notifications being
        // shadowed by the filmstrip rendered on the right. This makes the "x"
        // button not clickable. In order to avoid that a margin of the
        // filmstrip's size is added to the right.
        //
        // Pawel: after many attempts I failed to make notifications adjust to
        // their contents width because of column and rows being used in the
        // flex layout. The only option that seemed to limit the notification's
        // size was explicit 'width' value which is not better than the margin
        // added here.
        if (this.props._filmstripVisible && !isNarrowAspectRatio(this)) {
            notificationsStyle.marginRight = FILMSTRIP_SIZE;
        }

        return super.renderNotificationsContainer({
            style: notificationsStyle,
        });
    }

    _setToolboxVisible: (boolean) => void;

    /**
     * Dispatches an action changing the visibility of the {@link Toolbox}.
     *
     * @private
     * @param {boolean} visible - Pass {@code true} to show the
     * {@code Toolbox} or {@code false} to hide it.
     * @returns {void}
     */
    _setToolboxVisible(visible) {
        this.props.dispatch(setToolboxVisible(visible));
    }
}
/**
 * Maps actions to props
 * @param {*} dispatch
 * @param {*} ownProps
 */
function _mapDispatchToProps(dispatch: Dispatch<any>, ownProps: Props) {
    return {
        _changeParticipantRole(id, role) {
            dispatch(participantRoleChanged(id, role));
        },
        _HostModeratorId(id) {
            dispatch(hostModeratorId(id));
        },
    };
}
/**
 * Maps (parts of) the redux state to the associated {@code Conference}'s props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    // console.log(state['features/base/participants']);
    const { connecting, connection } = state['features/base/connection'];
    const { conference, joining, leaving } = state['features/base/conference'];
    const { reducedUI } = state['features/base/responsive-ui'];

    // XXX There is a window of time between the successful establishment of the
    // XMPP connection and the subsequent commencement of joining the MUC during
    // which the app does not appear to be doing anything according to the redux
    // state. In order to not toggle the _connecting props during the window of
    // time in question, define _connecting as follows:
    // - the XMPP connection is connecting, or
    // - the XMPP connection is connected and the conference is joining, or
    // - the XMPP connection is connected and we have no conference yet, nor we
    //   are leaving one.
    const connecting_ = connecting || (connection && (joining || (!conference && !leaving)));
    // let isLocalParticipantModerator = false;
    // // console.log(state['features/base/participants']);
    // // console.log(state['features/base/participants']);
    // state['features/base/participants'].forEach((participant) => {
    //     if (participant.local) {
    //         console.log(participant.name, participant.isHost);
    //         isLocalParticipantModerator = participant.isHost ? true : false;
    //     }
    // });

    return {
        ...abstractMapStateToProps(state),
        _roomName: getConferenceName(state),

        _localParticipant: getLocalParticipant(state),
        /**
         * Is local participant moderator?
         * If yes, render the host/local participant a different view
         */
        _isLocalParticipantModerator: isLocalParticipantModerator,
        /**
         * No. of participants in the conference
         */
        _numberOfParticipants: getParticipantCount(state),

        /**
         * Wherther the calendar feature is enabled or not.
         *
         * @private
         * @type {boolean}
         */
        _calendarEnabled: isCalendarEnabled(state),

        /**
         * The indicator which determines that we are still connecting to the
         * conference which includes establishing the XMPP connection and then
         * joining the room. If truthy, then an activity/loading indicator will
         * be rendered.
         *
         * @private
         * @type {boolean}
         */
        _connecting: Boolean(connecting_),

        /**
         * Is {@code true} when the filmstrip is currently visible.
         */
        _filmstripVisible: isFilmstripVisible(state),

        /**
         * The ID of the participant currently on stage.
         */
        _largeVideoParticipantId: state['features/large-video'].participantId,

        /**
         * Whether Picture-in-Picture is enabled.
         *
         * @private
         * @type {boolean}
         */
        _pictureInPictureEnabled: getFeatureFlag(state, PIP_ENABLED),

        /**
         * The indicator which determines whether the UI is reduced (to
         * accommodate smaller display areas).
         *
         * @private
         * @type {boolean}
         */
        _reducedUI: reducedUI,

        /**
         * The indicator which determines whether the Toolbox is visible.
         *
         * @private
         * @type {boolean}
         */
        _toolboxVisible: isToolboxVisible(state),
        _topNavigationVisible: isTopNavigationVisible(state),
    };
}

export default connect(_mapStateToProps, _mapDispatchToProps)(makeAspectRatioAware(Conference));
