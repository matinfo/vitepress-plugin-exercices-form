import exerciseCssInline from './exercise.css?inline'

let stylesInjected = false

export function ensureStylesInjected(): void {
  if (typeof document === 'undefined')
    return
  if (stylesInjected)
    return
  const styleId = 'vitepress-plugin-exercices-form-styles'
  if (document.getElementById(styleId)) {
    stylesInjected = true
    return
  }
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = exerciseCssInline
  document.head.appendChild(style)
  stylesInjected = true
}
