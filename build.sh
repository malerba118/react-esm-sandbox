microbundle-crl -i src/service-worker.js -o dist/service-worker.js --no-compress --no-pkg-main --format umd
microbundle-crl watch -i src/index.tsx -o dist/index.js --no-compress --format modern,cjs