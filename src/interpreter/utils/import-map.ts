import { Dependencies, ImportMap } from '../types'

export const SkypackImportMap = (dependencies: Dependencies): ImportMap => {
  const importMap: ImportMap = {
    imports: {}
  }
  Object.entries(dependencies).forEach(([packageName, packageVersion]) => {
    importMap.imports[
      packageName
    ] = `https://cdn.skypack.dev/${packageName}@${packageVersion}`
  })
  return importMap
}
