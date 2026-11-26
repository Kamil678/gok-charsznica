import { Atkinson_Hyperlegible_Next, Fraunces } from 'next/font/google'

export const bodyFont = Atkinson_Hyperlegible_Next({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-atkinson',
})

export const headingFont = Fraunces({
  subsets: ['latin', 'latin-ext'],
  axes: ['SOFT'],
  display: 'swap',
  variable: '--font-fraunces',
})
