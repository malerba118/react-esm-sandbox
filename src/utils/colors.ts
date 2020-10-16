export type ThemeColors = {
  background: string
  foreground: string
  overlay: string
}

const themeColorsMap: Record<
  string,
  { background: string; foreground: string }
> = {
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2'
  },
  'base16-light': {
    background: '#f5f5f5',
    foreground: '#202020'
  },
  seti: {
    background: '#151718',
    foreground: '#CFD2D1'
  }
}

export const getThemeColors = (theme: string): ThemeColors => {
  const colors = themeColorsMap[theme]
  return {
    ...colors,
    overlay: isDark(colors.background)
      ? 'rgba(255,255,255,.05)'
      : 'rgba(0,0,0,.05)'
  }
}

export const isDark = (color: string) => {
  // Variables for red, green, blue values
  let r, g, b, hsp
  let _color: any = color

  // Check the format of the color, HEX or RGB?
  if (_color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    _color = _color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    )

    r = _color[1]
    g = _color[2]
    b = _color[3]
  } else {
    // If hex --> Convert it to RGB: http://gist.github.com/983661
    _color = +(
      '0x' + _color.slice(1).replace(_color.length < 5 && /./g, '$&$&')
    )

    r = _color >> 16
    g = (_color >> 8) & 255
    b = _color & 255
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return false
  } else {
    return true
  }
}
