/* ES Module Shims 0.5.0 */
(function () {
  'use strict';

  const resolvedPromise = Promise.resolve();

  let baseUrl;

  function createBlob (source) {
    return URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
  }

  const hasDocument = typeof document !== 'undefined';

  // support browsers without dynamic import support (eg Firefox 6x)
  let dynamicImport;
  try {
    dynamicImport = (0, eval)('u=>import(u)');
  }
  catch (e) {
    if (hasDocument) {
      self.addEventListener('error', e => importShim.e = e.error);
      dynamicImport = blobUrl => {
        const topLevelBlobUrl = createBlob(
          `import*as m from'${blobUrl}';self.importShim.l=m;self.importShim.e=null`
        );
        const s = document.createElement('script');
        s.type = 'module';
        s.src = topLevelBlobUrl;
        document.head.appendChild(s);
        return new Promise((resolve, reject) => {
          s.addEventListener('load', () => {
            document.head.removeChild(s);
            importShim.e ? reject(importShim.e) : resolve(importShim.l, baseUrl);
          });
        });
      };
    }
  }

  if (hasDocument) {
    const baseEl = document.querySelector('base[href]');
    if (baseEl)
      baseUrl = baseEl.href;
  }

  if (!baseUrl && typeof location !== 'undefined') {
    baseUrl = location.href.split('#')[0].split('?')[0];
    const lastSepIndex = baseUrl.lastIndexOf('/');
    if (lastSepIndex !== -1)
      baseUrl = baseUrl.slice(0, lastSepIndex + 1);
  }

  let esModuleShimsSrc;
  if (hasDocument) {
    esModuleShimsSrc = document.currentScript && document.currentScript.src;
  }

  const backslashRegEx = /\\/g;
  function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
    // strip off any trailing query params or hashes
    parentUrl = parentUrl && parentUrl.split('#')[0].split('?')[0];
    if (relUrl.indexOf('\\') !== -1)
      relUrl = relUrl.replace(backslashRegEx, '/');
    // protocol-relative
    if (relUrl[0] === '/' && relUrl[1] === '/') {
      return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
    }
    // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) ||
        relUrl.length === 1  && (relUrl += '/')) ||
        relUrl[0] === '/') {
      const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
      // Disabled, but these cases will give inconsistent results for deep backtracking
      //if (parentUrl[parentProtocol.length] !== '/')
      //  throw new Error('Cannot resolve');
      // read pathname from parent URL
      // pathname taken to be part after leading "/"
      let pathname;
      if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.slice(parentProtocol.length + 2);
          pathname = pathname.slice(pathname.indexOf('/') + 1);
        }
        else {
          pathname = parentUrl.slice(8);
        }
      }
      else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
      }

      if (relUrl[0] === '/')
        return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;

      // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z'
      const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;

      const output = [];
      let segmentIndex = -1;
      for (let i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== -1) {
          if (segmented[i] === '/') {
            output.push(segmented.slice(segmentIndex, i + 1));
            segmentIndex = -1;
          }
        }

        // new segment - check if it is relative
        else if (segmented[i] === '.') {
          // ../ segment
          if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
            output.pop();
            i += 2;
          }
          // ./ segment
          else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
            i += 1;
          }
          else {
            // the start of a new segment as below
            segmentIndex = i;
          }
        }
        // it is the start of a new segment
        else {
          segmentIndex = i;
        }
      }
      // finish reading out the last segment
      if (segmentIndex !== -1)
        output.push(segmented.slice(segmentIndex));
      return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
    }
  }

  /*
   * Import maps implementation
   *
   * To make lookups fast we pre-resolve the entire import map
   * and then match based on backtracked hash lookups
   *
   */
  function resolveUrl (relUrl, parentUrl) {
    return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (relUrl.indexOf(':') !== -1 ? relUrl : resolveIfNotPlainOrUrl('./' + relUrl, parentUrl));
  }

  function resolveAndComposePackages (packages, outPackages, baseUrl, parentMap) {
    for (let p in packages) {
      const resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
      let target = packages[p];
      if (typeof target !== 'string') 
        continue;
      const mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(target, baseUrl) || target, baseUrl);
      if (mapped) {
        outPackages[resolvedLhs] = mapped;
        continue;
      }
      targetWarning(p, packages[p], 'bare specifier did not resolve');
    }
  }

  function resolveAndComposeImportMap (json, baseUrl, parentMap) {
    const outMap = { imports: Object.assign({}, parentMap.imports), scopes: Object.assign({}, parentMap.scopes), depcache: Object.assign({}, parentMap.depcache) };

    if (json.imports)
      resolveAndComposePackages(json.imports, outMap.imports, baseUrl, parentMap,);

    if (json.scopes)
      for (let s in json.scopes) {
        const resolvedScope = resolveUrl(s, baseUrl);
        resolveAndComposePackages(json.scopes[s], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, parentMap);
      }

    if (json.depcache)
      for (let d in json.depcache) {
        const resolvedDepcache = resolveUrl(d, baseUrl);
        outMap.depcache[resolvedDepcache] = json.depcache[d];
      }

    return outMap;
  }

  function getMatch (path, matchObj) {
    if (matchObj[path])
      return path;
    let sepIndex = path.length;
    do {
      const segment = path.slice(0, sepIndex + 1);
      if (segment in matchObj)
        return segment;
    } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1)
  }

  function applyPackages (id, packages) {
    const pkgName = getMatch(id, packages);
    if (pkgName) {
      const pkg = packages[pkgName];
      if (pkg === null) return;
      if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/')
        targetWarning(pkgName, pkg, "should have a trailing '/'");
      else
        return pkg + id.slice(pkgName.length);
    }
  }

  function targetWarning (match, target, msg) {
    console.warn("Package target " + msg + ", resolving target '" + target + "' for " + match);
  }

  function resolveImportMap (importMap, resolvedOrPlain, parentUrl) {
    let scopeUrl = parentUrl && getMatch(parentUrl, importMap.scopes);
    while (scopeUrl) {
      const packageResolution = applyPackages(resolvedOrPlain, importMap.scopes[scopeUrl]);
      if (packageResolution)
        return packageResolution;
      scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), importMap.scopes);
    }
    return applyPackages(resolvedOrPlain, importMap.imports) || resolvedOrPlain.indexOf(':') !== -1 && resolvedOrPlain;
  }

  /* es-module-lexer 0.3.25 */
  function parse(Q,B="@"){if(!A)return init.then(()=>parse(Q));const C=(A.__heap_base.value||A.__heap_base)+4*Q.length-A.memory.buffer.byteLength;if(C>0&&A.memory.grow(Math.ceil(C/65536)),function(A,Q){const B=A.length;let C=0;for(;C<B;)Q[C]=A.charCodeAt(C++);}(Q,new Uint16Array(A.memory.buffer,A.sa(Q.length),Q.length+1)),!A.parse())throw Object.assign(new Error(`Parse error ${B}:${Q.slice(0,A.e()).split("\n").length}:${A.e()-Q.lastIndexOf("\n",A.e()-1)}`),{idx:A.e()});const I=[],g=[];for(;A.ri();)I.push({s:A.is(),e:A.ie(),ss:A.ss(),se:A.se(),d:A.id()});for(;A.re();)g.push(Q.slice(A.es(),A.ee()));return [I,g,!!A.f()]}let A;const init=WebAssembly.compile((Q="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","function"==typeof atob?Uint8Array.from(atob(Q),A=>A.charCodeAt(0)):Buffer.from(Q,"base64"))).then(WebAssembly.instantiate).then(({exports:Q})=>{A=Q;});var Q;

  let id = 0;
  const registry = {};

  async function loadAll (load, seen) {
    if (load.b || seen[load.u])
      return;
    seen[load.u] = 1;
    await load.L;
    return Promise.all(load.d.map(dep => loadAll(dep, seen)));
  }

  let waitingForImportMapsInterval;
  let firstTopLevelProcess = true;
  async function topLevelLoad (url, source, alias) {
    if (waitingForImportMapsInterval > 0) {
      clearTimeout(waitingForImportMapsInterval);
      waitingForImportMapsInterval = 0;
    }
    if (firstTopLevelProcess) {
      firstTopLevelProcess = false;
      processScripts();
    }
    await importMapPromise;
    await init;
    const load = getOrCreateLoad(url, source, alias);
    const seen = {};
    await loadAll(load, seen);
    lastLoad = undefined;
    resolveDeps(load, seen);
    const module = await dynamicImport(load.b);
    // if the top-level load is a shell, run its update function
    if (load.s)
      (await dynamicImport(load.s)).u$_(module);
    return module;
  }

  async function importShim$1 (id, parentUrl) {
    return topLevelLoad(resolve(id, parentUrl || baseUrl));
  }

  self.importShim = importShim$1;

  const meta = {};

  const edge = navigator.userAgent.match(/Edge\/\d\d\.\d+$/);

  async function importMetaResolve (id, parentUrl = this.url) {
    await importMapPromise;
    console.log({id, parentUrl})

    return resolve(id, `${parentUrl}`);
  }

  Object.defineProperties(importShim$1, {
    m: { value: meta },
    l: { value: undefined, writable: true },
    e: { value: undefined, writable: true }
  });
  importShim$1.fetch = url => fetch(url);
  importShim$1.skip = /^https?:\/\/(cdn\.pika\.dev|dev\.jspm\.io|jspm\.dev)\//;
  importShim$1.load = processScripts;

  let lastLoad;
  function resolveDeps (load, seen) {
    if (load.b || !seen[load.u])
      return;
    seen[load.u] = 0;

    for (const dep of load.d)
      resolveDeps(dep, seen);

    // "execution"
    const source = load.S;
    // edge doesnt execute sibling in order, so we fix this up by ensuring all previous executions are explicit dependencies
    let resolvedSource = edge && lastLoad ? `import '${lastLoad}';` : '';

    const [imports] = load.a;

    if (!imports.length) {
      resolvedSource += source;
    }
    else {
      // once all deps have loaded we can inline the dependency resolution blobs
      // and define this blob
      let lastIndex = 0, depIndex = 0;
      for (const { s: start, e: end, d: dynamicImportIndex } of imports) {
        // dependency source replacements
        if (dynamicImportIndex === -1) {
          const depLoad = load.d[depIndex++];
          let blobUrl = depLoad.b;
          if (!blobUrl) {
            // circular shell creation
            if (!(blobUrl = depLoad.s)) {
              blobUrl = depLoad.s = createBlob(`export function u$_(m){${
                depLoad.a[1].map(
                  name => name === 'default' ? `$_default=m.default` : `${name}=m.${name}`
                ).join(',')
              }}${
                depLoad.a[1].map(name =>
                  name === 'default' ? `let $_default;export{$_default as default}` : `export let ${name}`
                ).join(';')
              }\n//# sourceURL=${depLoad.r}?cycle`);
            }
          }
          // circular shell execution
          else if (depLoad.s) {
            resolvedSource += source.slice(lastIndex, start - 1) + '/*' + source.slice(start - 1, end + 1) + '*/' + source.slice(start - 1, start) + blobUrl + source[end] + `;import*as m$_${depIndex} from'${depLoad.b}';import{u$_ as u$_${depIndex}}from'${depLoad.s}';u$_${depIndex}(m$_${depIndex})`;
            lastIndex = end + 1;
            depLoad.s = undefined;
            continue;
          }
          resolvedSource += source.slice(lastIndex, start - 1) + '/*' + source.slice(start - 1, end + 1) + '*/' + source.slice(start - 1, start) + blobUrl;
          lastIndex = end;
        }
        // import.meta
        else if (dynamicImportIndex === -2) {
          meta[load.r] = { url: load.r, resolve: importMetaResolve };
          resolvedSource += source.slice(lastIndex, start) + 'importShim.m[' + JSON.stringify(load.r) + ']';
          lastIndex = end;
        }
        // dynamic import
        else {
          resolvedSource += source.slice(lastIndex, dynamicImportIndex + 6) + 'Shim(' + source.slice(start, end) + ', ' + JSON.stringify(load.r);
          lastIndex = end;
        }
      }

      resolvedSource += source.slice(lastIndex);
    }

    let sourceMappingResolved = '';
    const sourceMappingIndex = resolvedSource.lastIndexOf('//# sourceMappingURL=');
    if (sourceMappingIndex > -1) {
      const sourceMappingEnd = resolvedSource.indexOf('\n',sourceMappingIndex);
      const sourceMapping = resolvedSource.slice(sourceMappingIndex, sourceMappingEnd > -1 ? sourceMappingEnd : undefined);
      sourceMappingResolved = `\n//# sourceMappingURL=` + resolveUrl(sourceMapping.slice(21), load.r);
    }
    load.b = lastLoad = createBlob(resolvedSource + sourceMappingResolved + '\n//# sourceURL=' + load.r);
    load.S = undefined;
  }

  function getOrCreateLoad (url, source, alias) {
    let load = registry[url];
    if (load)
      return load;

    load = registry[url] = {
      // url
      u: url,
      // response url
      r: undefined,
      // fetchPromise
      f: undefined,
      // source
      S: undefined,
      // linkPromise
      L: undefined,
      // analysis
      a: undefined,
      // deps
      d: undefined,
      // blobUrl
      b: undefined,
      // shellUrl
      s: undefined,
      alias
    };

    const depcache = importMap.depcache[url];
    if (depcache)
      depcache.forEach(depUrl => getOrCreateLoad(resolve(depUrl, url)));

    load.f = (async () => {
      if (!source) {
        const res = await importShim$1.fetch(url);
        if (!res.ok)
          throw new Error(`${res.status} ${res.statusText} ${res.url}`);
        load.r = res.url;
        const contentType = res.headers.get('content-type');
        if (contentType.match(/^(text|application)\/(x-)?javascript(;|$)/))
          source = await res.text();
        else
          throw new Error(`Unknown Content-Type "${contentType}"`);
      }
      try {
        load.a = parse(source, load.u);
      }
      catch (e) {
        console.warn(e);
        load.a = [[], []];
      }
      load.S = source;
      return load.a[0].filter(d => d.d === -1).map(d => source.slice(d.s, d.e));
    })();

    load.L = load.f.then(async deps => {
      load.d = await Promise.all(deps.map(async depId => {
        let url = load.alias || load.r || load.u

        console.log({depId, url})
        const resolved = resolve(depId, url);
        if (importShim$1.skip.test(resolved))
          return { b: resolved };
        const depAlias = resolved.startsWith('data:') ? (new URL(depId, load.alias)).href : resolved
        console.log({alias, resolved})
        const depLoad = getOrCreateLoad(resolved, undefined, depAlias);
        await depLoad.f;
        return depLoad;
      }));
    });

    return load;
  }

  let importMap = { imports: {}, scopes: {}, depcache: {} };
  let importMapPromise = resolvedPromise;

  if (hasDocument) {
    processScripts();
    waitingForImportMapsInterval = setInterval(processScripts, 20);
  }

  function processScripts () {
    if (waitingForImportMapsInterval > 0 && document.readyState !== 'loading') {
      clearTimeout(waitingForImportMapsInterval);
      waitingForImportMapsInterval = 0;
    }
    for (const script of document.querySelectorAll('script[type="module-shim"],script[type="importmap-shim"]')) {
      if (script.ep) // ep marker = script processed
        return;
      if (script.type === 'module-shim') {
        const baseAlias = script.getAttribute('data-alias')
        console.log({baseAlias})
        topLevelLoad(script.src || `${baseUrl}?${id++}`, !script.src && script.innerHTML, baseAlias);
      }
      else {
        importMapPromise = importMapPromise.then(async () =>
          importMap = resolveAndComposeImportMap(script.src ? await (await fetch(script.src)).json() : JSON.parse(script.innerHTML), script.src || baseUrl, importMap)
        );
      }
      script.ep = true;
    }
  }

  function resolve (id, parentUrl) {
    return resolveImportMap(importMap, resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
  }

  function throwUnresolved (id, parentUrl) {
    throw Error("Unable to resolve specifier '" + id + (parentUrl ? "' from " + parentUrl : "'"));
  }

}());