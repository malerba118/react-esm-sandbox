export const jsonToDataUrl = (data: any) => {
  return `data:application/json;base64,${btoa(JSON.stringify(data))}`
}
