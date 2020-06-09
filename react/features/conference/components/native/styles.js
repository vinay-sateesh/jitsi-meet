import {
    BoxModel,
    ColorPalette,
    fixAndroidViewClipping,
} from "../../../base/styles";

import { FILMSTRIP_SIZE } from "../../../filmstrip";

export const NAVBAR_GRADIENT_COLORS = ["#00000080", "#00000000"];

// From brand guideline
const BOTTOM_GRADIENT_HEIGHT = 0; //290
const DEFAULT_GRADIENT_SIZE = 80; //140

/**
 * The styles of the feature conference.
 */
export default {
    bottomGradient: {
        bottom: 0,
        flexDirection: "column",
        justifyContent: "flex-end",
        // minHeight: DEFAULT_GRADIENT_SIZE,
        minHeight: 80,
        left: 0,
        position: "absolute",
        right: 0,
    },

    /**
     * {@code Conference} style.
     */
    conference: fixAndroidViewClipping({
        alignSelf: "stretch",
        backgroundColor: ColorPalette.appBackground,
        flex: 1,
    }),

    gradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flex: 1,
    },

    gradientStretchBottom: {
        height: BOTTOM_GRADIENT_HEIGHT,
    },

    gradientStretchTop: {
        height: DEFAULT_GRADIENT_SIZE,
    },

    /**
     * View that contains the indicators.
     */
    indicatorContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        margin: BoxModel.margin,
    },

    /**
     * Indicator container for wide aspect ratio.
     */
    indicatorContainerWide: {
        marginRight: FILMSTRIP_SIZE + BoxModel.margin,
    },

    labelWrapper: {
        flexDirection: "column",
        position: "absolute",
        right: 0,
        top: 0,
    },

    navBarButton: {
        iconStyle: {
            color: ColorPalette.white,
            fontSize: 24,
        },

        underlayColor: "transparent",
    },
    customNavBarButton: {
        iconStyle: { color: "white", fontSize: 0 },
        labelStyle: {
            color: "red",
            flexShrink: 1,
            fontSize: 18,
            marginLeft: 8,
            opacity: 0.9,
        },
        sheet: { backgroundColor: "rgb(255, 255, 255)" },
        style: { alignItems: "center", flexDirection: "row", height: 48 },
        underlayColor: "black",
    },

    navBarContainer: {
        flexDirection: "column",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    navBarSafeView: {
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    navBarWrapper: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        height: 44,
        justifyContent: "space-between",
        paddingHorizontal: 14,
    },

    roomName: {
        color: ColorPalette.white,
        fontSize: 17,
        fontWeight: "400",
    },

    roomNameWrapper: {
        flexDirection: "row",
        justifyContent: "center",
        left: 0,
        paddingHorizontal: 48,
        position: "absolute",
        right: 0,
    },

    /**
     * The style of the {@link View} which expands over the whole
     * {@link Conference} area and splits it between the {@link Filmstrip} and
     * the {@link Toolbox}.
     */
    toolboxAndFilmstripContainer: {
        bottom: 0,
        flexDirection: "column",
        justifyContent: "flex-end",
        left: 0,
        paddingBottom: BoxModel.padding,
        position: "absolute",
        right: 0,
        backgroundColor: "rgba(0,0,0,0.2)",

        // Both on Android and iOS there is the status bar which may be visible.
        // On iPhone X there is the notch. In the two cases BoxModel.margin is
        // not enough.
        top: 0,
        paddingTop: BoxModel.margin * 3,
    },
    chatOverlay: {
        bottom: 0,
        // position: "absolute",

        // flex: 1,
        height: "50%",
        width: "100%",
        left: 0,
        right: 0,
    },
};
