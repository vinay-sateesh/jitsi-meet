// @flow

import React, { Component } from "react";
import { SafeAreaView, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { getConferenceName } from "../../../base/conference";
import { connect } from "../../../base/redux";
import {
    PictureInPictureButton,
    SmallEndCallButton,
} from "../../../mobile/picture-in-picture";
import { isToolboxVisible } from "../../../toolbox";
import DesktopSharingButton from "../../../toolbox/components/native/DesktopSharingButton";

import styles, { NAVBAR_GRADIENT_COLORS } from "./styles";

type Props = {
    /**
     * Name of the meeting we're currently in.
     */
    _meetingName: string,
    _bottomSheetStyles: StyleType,

    /**
     * True if the navigation bar should be visible.
     */
    _visible: boolean,
    _hostName: string,
};

/**
 * Implements a navigation bar component that is rendered on top of the
 * conference screen.
 */
class NavigationBar extends Component<Props> {
    /**
     * Implements {@Component#render}.
     *
     * @inheritdoc
     */
    render() {
        if (!this.props._visible) {
            return null;
        }
        const buttonProps = {
            afterClick: this._onCancel,
            showLabel: true,
        };

        return [
            <LinearGradient
                colors={NAVBAR_GRADIENT_COLORS}
                key={1}
                pointerEvents="none"
                style={styles.gradient}
            >
                <SafeAreaView>
                    <View style={styles.gradientStretchTop} />
                </SafeAreaView>
            </LinearGradient>,
            <View key={2} pointerEvents="box-none" style={styles.navBarWrapper}>
                <PictureInPictureButton styles={styles.navBarButton} />
                <View pointerEvents="box-none" style={styles.roomNameWrapper}>
                    <Text
                        numberOfLines={2}
                        style={{
                            ...styles.roomName,
                            textAlign: "center",
                            marginTop: 8,
                        }}
                    >
                        {"Product"}
                        {"\n"}
                        {this.props._hostName}
                        {"'s "}
                        {"room: "}
                        {this.props._meetingName}
                    </Text>
                </View>
                <SmallEndCallButton
                    styles={{ ...styles.customNavBarButton }}
                    {...buttonProps}
                />
            </View>,
        ];
    }
}

/**
 * Maps part of the Redux store to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {{
 *     _meetingName: string,
 *     _visible: boolean
 * }}
 */
function _mapStateToProps(state) {
    return {
        _hostName: state["features/base/participants"][0].name,
        _meetingName: getConferenceName(state),
        _visible: isToolboxVisible(state),
    };
}

export default connect(_mapStateToProps)(NavigationBar);
