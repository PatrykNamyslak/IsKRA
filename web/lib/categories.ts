export const ROPS_CATEGORIES = [
  'Dla seniorów',
  'Dla dzieci, młodzieży i rodziny',
  'Dla rynku pracy',
  'Dla osób o ograniczonej mobilności',
  'Dla osób z niepełnosprawnością sensoryczną',
  'Dla cudzoziemców',
  'Dla osób z niepełnosprawnością intelektualną',
  'Dla osób w kryzysie bezdomności',
  'Dla zdrowia i medycyny',
] as const

export type RopsCategory = (typeof ROPS_CATEGORIES)[number]

export const ROPS_CATEGORY_OPTIONS = ROPS_CATEGORIES.map((cat) => ({
  label: cat,
  value: cat,
}))
