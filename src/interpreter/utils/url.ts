export const jsonToDataUrl = (data: any) => {
  return `data:application/json;base64,${btoa(JSON.stringify(data))}`
}

export const resolveUrl = (baseUrl: string, segment: string) => {
  return new URL(segment, baseUrl).href
}

export const getFileExtension = (url: string) => {
  const urlSegments = url.split('/')
  const lastUrlSegment = urlSegments[urlSegments.length - 1]
  const fileSegments = lastUrlSegment.split('.')
  if (fileSegments.length > 1) {
    return fileSegments[fileSegments.length - 1]
  }
  return ''
}
