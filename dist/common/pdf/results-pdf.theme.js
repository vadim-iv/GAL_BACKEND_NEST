"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FONT_SIZE = exports.STATUS_PILL_HEIGHT = exports.SPACING = exports.PAGE = exports.FONT_FAMILY = exports.LOGO_SVG_PATH = exports.FONT_PATHS = exports.COLORS = void 0;
const path = require("path");
exports.COLORS = {
    green700: '#11200b',
    green600: '#254119',
    green500: '#325721',
    gray700: '#40403f',
    gray600: '#807f7f',
    gray500: '#bfbfbe',
    gray400: '#e6e5e4',
    gray300: '#f3f4f4',
    white: '#fffefd',
    error: '#db3c3c',
    errorPale: '#c98a8a'
};
exports.FONT_PATHS = {
    regular: path.join(__dirname, 'assets/fonts/Onest-Regular.ttf'),
    semiBold: path.join(__dirname, 'assets/fonts/Onest-SemiBold.ttf')
};
exports.LOGO_SVG_PATH = path.join(__dirname, 'assets/logo-gal-green.svg');
exports.FONT_FAMILY = {
    regular: 'Onest',
    semiBold: 'Onest-SemiBold'
};
exports.PAGE = {
    size: 'A4',
    margins: { top: 100, bottom: 60, left: 50, right: 50 }
};
exports.SPACING = {
    cardPadding: 16,
    cardGap: 16,
    cardRadius: 8,
    rowGap: 8
};
exports.STATUS_PILL_HEIGHT = 20;
exports.FONT_SIZE = {
    title: 20,
    subtitle: 12,
    sectionLabel: 11,
    body: 10,
    small: 9,
    statValue: 14,
    statLabel: 8,
    statValueSecondary: 9.5,
    footer: 8
};
//# sourceMappingURL=results-pdf.theme.js.map