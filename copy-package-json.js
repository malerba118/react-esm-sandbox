const fs = require('fs')

const file = fs.readFileSync('./package.json', 'utf-8')

const packageJson = JSON.parse(file)

packageJson.private = false
packageJson.main = "index.js"
packageJson.module = "index.js"
packageJson.types = "index.d.ts"
delete packageJson.scripts

fs.mkdirSync('dist', { recursive: true })
fs.writeFileSync('dist/package.json', JSON.stringify(packageJson))
