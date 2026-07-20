import * as path from 'path'

// Mirrors the color tokens in GAL/src/app/[locale]/globals.css — keep in sync
// manually if the frontend palette changes, there is no shared source of truth
// between the two repos.
export const COLORS = {
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
	// A muted, desaturated tint of `error` — used for secondary/deemphasized notes
	// (e.g. "(2 deleted members)") that shouldn't compete visually with an actual
	// error state.
	errorPale: '#c98a8a'
} as const

export const FONT_PATHS = {
	regular: path.join(__dirname, 'assets/fonts/Onest-Regular.ttf'),
	semiBold: path.join(__dirname, 'assets/fonts/Onest-SemiBold.ttf')
}

export const LOGO_SVG_PATH = path.join(__dirname, 'assets/logo-gal-green.svg')

export const FONT_FAMILY = {
	regular: 'Onest',
	semiBold: 'Onest-SemiBold'
}

export const PAGE = {
	size: 'A4' as const,
	margins: { top: 100, bottom: 60, left: 50, right: 50 }
}

export const SPACING = {
	cardPadding: 16,
	cardGap: 16,
	cardRadius: 8,
	rowGap: 8
}

export const STATUS_PILL_HEIGHT = 20

export const FONT_SIZE = {
	title: 20,
	subtitle: 12,
	sectionLabel: 11,
	body: 10,
	small: 9,
	statValue: 14,
	statLabel: 8,
	statValueSecondary: 9.5,
	footer: 8
}
