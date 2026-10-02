const photoFiles = import.meta.glob('./insurance_photos/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const normalize = (value: string) => value.normalize('NFKD').replace(/[^a-z0-9]/gi, '').toLowerCase()

export function localPhoto(filename: string) {
  const target = normalize(filename.replace(/\.[^.]+$/, ''))
  const entry = Object.entries(photoFiles).find(([path]) => normalize(path.split('/').pop()!.replace(/\.[^.]+$/, '')) === target)
  if (!entry) throw new Error(`Missing local photo: ${filename}`)
  return entry[1]
}
