// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"2oZg2":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "5c1b77e3b71e74eb";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = "__parcel__error__overlay__";
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf("http") === 0 ? location.hostname : "localhost");
}
function getPort() {
    return HMR_PORT || location.port;
}
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? "wss" : "ws";
    var ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/");
    // Web extension context
    var extCtx = typeof chrome === "undefined" ? typeof browser === "undefined" ? null : browser : chrome;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes("test.js");
    }
    // $FlowFixMe
    ws.onmessage = async function(event /*: {data: string, ...} */ ) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        assetsToDispose = [];
        var data /*: HMRMessage */  = JSON.parse(event.data);
        if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH);
            // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === "css" || asset.type === "js" && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear();
                // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("parcelhmraccept"));
                await hmrApplyUpdates(assets);
                // Dispose all old assets.
                let processedAssets = {} /*: {|[string]: boolean|} */ ;
                for(let i = 0; i < assetsToDispose.length; i++){
                    let id = assetsToDispose[i][1];
                    if (!processedAssets[id]) {
                        hmrDispose(assetsToDispose[i][0], id);
                        processedAssets[id] = true;
                    }
                }
                // Run accept callbacks. This will also re-execute other disposed assets in topological order.
                processedAssets = {};
                for(let i = 0; i < assetsToAccept.length; i++){
                    let id = assetsToAccept[i][1];
                    if (!processedAssets[id]) {
                        hmrAccept(assetsToAccept[i][0], id);
                        processedAssets[id] = true;
                    }
                }
            } else fullReload();
        }
        if (data.type === "error") {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + "\n" + stack + "\n\n" + ansiDiagnostic.hints.join("\n"));
            }
            if (typeof document !== "undefined") {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html);
                // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    ws.onerror = function(e) {
        console.error(e.message);
    };
    ws.onclose = function() {
        console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] ✨ Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, "") : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
        </div>
        ${diagnostic.documentation ? `<div>📝 <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ""}
      </div>
    `;
    }
    errorHTML += "</div>";
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ("reload" in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute("href");
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute("href", // $FlowFixMe
    href.split("?")[0] + "?" + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute("href");
            var hostname = getHostname();
            var servedFromHMRServer = hostname === "localhost" ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(href) : href.indexOf(hostname + ":" + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === "js") {
        if (typeof document !== "undefined") {
            let script = document.createElement("script");
            script.src = asset.url + "?t=" + Date.now();
            if (asset.outputFormat === "esmodule") script.type = "module";
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === "function") {
            // Worker scripts
            if (asset.outputFormat === "esmodule") return import(asset.url + "?t=" + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + "?t=" + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension bugfix for Chromium
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=1255412#c12
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3) {
                        if (typeof ServiceWorkerGlobalScope != "undefined" && global instanceof ServiceWorkerGlobalScope) {
                            extCtx.runtime.reload();
                            return;
                        }
                        asset.url = extCtx.runtime.getURL("/__parcel_hmr_proxy__?url=" + encodeURIComponent(asset.url + "?t=" + Date.now()));
                        return hmrDownload(asset);
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === "css") reloadCSS();
    else if (asset.type === "js") {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) {
            assetsToAlsoAccept.forEach(function(a) {
                hmrDispose(a[0], a[1]);
            });
            // $FlowFixMe[method-unbinding]
            assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
        }
    });
}

},{}],"h7u1C":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
var _process = require("./process");
var _pdf = require("./pdf");
var _io = require("./io");
var _flashSvg = require("url:./flash.svg");
var _flashSvgDefault = parcelHelpers.interopDefault(_flashSvg);
var _flashOffSvg = require("url:./flash-off.svg");
var _flashOffSvgDefault = parcelHelpers.interopDefault(_flashOffSvg);
var _hdSvg = require("url:./hd.svg");
var _hdSvgDefault = parcelHelpers.interopDefault(_hdSvg);
var _sdSvg = require("url:./sd.svg");
var _sdSvgDefault = parcelHelpers.interopDefault(_sdSvg);
var _imageCapture = require("image-capture");
const root = document.getElementById("root");
const modal = document.getElementById("modal");
const captures = document.getElementById("captures");
const preview = document.getElementById("preview");
const previewCrop = document.getElementById("preview-crop");
const previewDoc = document.getElementById("preview-doc");
const bottomWrapper = document.getElementById("bottom-wrapper");
const topWrapper = document.getElementById("top-wrapper");
const selectWrapper = document.getElementById("camera-select-wrapper");
const select = document.getElementById("camera-select");
const qualityWrapper = document.getElementById("quality-wrapper");
const quality = document.getElementById("quality");
const qualityImg = document.getElementById("quality-img");
const githubWrapper = document.getElementById("github-wrapper");
const flashWrapper = document.getElementById("flash-wrapper");
const flash = document.getElementById("flash");
const flashImg = document.getElementById("flash-img");
const pastWrapper = document.getElementById("past-wrapper");
const past = document.getElementById("past");
const uploadWrapper = document.getElementById("upload-wrapper");
const upload = document.getElementById("upload");
const shutter = document.getElementById("shutter");
const doneWrapper = document.getElementById("done-wrapper");
const done = document.getElementById("done");
const modalBottomWrapper = document.getElementById("modal-bottom-wrapper");
const modalCancelWrapper = document.getElementById("modal-cancel-wrapper");
const modalCancel = document.getElementById("modal-cancel");
const modalDoneWrapper = document.getElementById("modal-done-wrapper");
const modalDone = document.getElementById("modal-done");
let defaultMaxRes;
let maxRes = {};
const pages = [];
const log = (text)=>{
    const el = document.createElement("div");
    el.innerText = text;
    root.appendChild(el);
};
const resizeListeners = [];
const onResize = (listener)=>{
    resizeListeners.push(listener);
    return ()=>{
        resizeListeners.splice(resizeListeners.indexOf(listener), 1);
    };
};
const callResizeListeners = ()=>{
    for (const listener of resizeListeners)listener();
};
let rst = -1;
window.addEventListener("resize", ()=>{
    clearTimeout(rst);
    rst = setTimeout(callResizeListeners, 250);
}, {
    passive: true
});
const getMaxRes = (device)=>{
    const constraints = {
        width: 100000,
        height: 100000,
        facingMode: "environment"
    };
    if (device) {
        if (maxRes[device]) return maxRes[device];
        constraints.deviceId = {
            exact: device
        };
    } else if (defaultMaxRes) return defaultMaxRes;
    const prom = navigator.mediaDevices.getUserMedia({
        video: constraints
    }).then((media)=>{
        const settings = media.getVideoTracks()[0].getSettings();
        for (const track of media.getTracks())track.stop();
        const width = Math.max(settings.width, settings.height);
        const height = Math.min(settings.width, settings.height);
        return {
            width,
            height,
            deviceId: settings.deviceId
        };
    });
    if (device) maxRes[device] = prom;
    else defaultMaxRes = prom.then((val)=>{
        maxRes[val.deviceId] = prom;
        return val;
    });
    return prom;
};
const point = (a, scale)=>{
    const elem = document.createElement("div");
    const mwh = Math.min(window.innerWidth, window.innerHeight);
    elem.style.width = mwh * 0.03 + "px";
    elem.style.height = mwh * 0.03 + "px";
    elem.style.borderRadius = mwh * 0.015 + "px";
    elem.style.backgroundColor = "black";
    elem.style.position = "absolute";
    adjustPoint(elem, a, scale);
    return elem;
};
const adjustPoint = (elem, a, scale)=>{
    const mwh = Math.min(window.innerWidth, window.innerHeight);
    elem.style.top = a.y * scale - mwh * 0.015 + "px";
    elem.style.left = a.x * scale - mwh * 0.015 + "px";
};
const line = (a, b, scale)=>{
    const elem = document.createElement("div");
    elem.style.height = "4px";
    elem.style.backgroundColor = "red";
    elem.style.position = "absolute";
    elem.style.transformOrigin = "center left";
    adjustLine(elem, a, b, scale);
    return elem;
};
const adjustLine = (elem, a, b, scale)=>{
    elem.style.width = Math.hypot(a.x - b.x, a.y - b.y) * scale + "px";
    elem.style.top = a.y * scale + "px";
    elem.style.left = a.x * scale + "px";
    elem.style.transform = `rotate(${Math.atan2(b.y - a.y, b.x - a.x)}rad)`;
};
const preprocessPhoto = async (src)=>{
    let img, data;
    if (src instanceof Blob) {
        const image = await (0, _io.toImage)(src);
        img = image;
        data = await (0, _io.getData)(image);
    } else {
        const cnv = document.createElement("canvas");
        cnv.width = src.width;
        cnv.height = src.height;
        cnv.getContext("2d").drawImage(src, 0, 0);
        img = cnv;
        data = await (0, _io.getData)(src, true);
    }
    const quad = await (0, _process.findDocument)(data) || {
        a: {
            x: 0,
            y: data.height
        },
        b: {
            x: 0,
            y: 0
        },
        c: {
            x: data.width,
            y: 0
        },
        d: {
            x: data.width,
            y: data.height
        }
    };
    const clampPoint = (a)=>{
        if (a.x < 0) a.x = 0;
        else if (a.x > data.width) a.x = data.width;
        if (a.y < 0) a.y = 0;
        else if (a.y > data.height) a.y = data.height;
    };
    clampPoint(quad.a);
    clampPoint(quad.b);
    clampPoint(quad.c);
    clampPoint(quad.d);
    return {
        img,
        data,
        quad
    };
};
const processPhotos = async (srcs)=>{
    const results = srcs.map((src)=>src instanceof Blob || src instanceof ImageBitmap ? preprocessPhoto(src) : src);
    const cbs = [];
    let firstDimensions = {
        width: 0,
        height: 0
    };
    let landscape = false;
    for (const result of results){
        const isFirst = result == results[0];
        const isLast = result == results[results.length - 1];
        const { img, data, quad } = await result;
        const imgCrop = document.createElement("div");
        imgCrop.style.display = "flex";
        imgCrop.style.justifyContent = "center";
        imgCrop.style.alignItems = "center";
        imgCrop.style.overflow = "hidden";
        imgCrop.style.scrollSnapAlign = "center";
        const imgDoc = document.createElement("div");
        imgDoc.style.position = "relative";
        imgDoc.appendChild(img);
        imgCrop.appendChild(imgDoc);
        modal.style.display = "flex";
        const aspectRatio = Math.max(data.width, data.height) / Math.min(data.width, data.height);
        let scale = 0, docX = 0, docY = 0, latestDims = false;
        let prevElems = [];
        const getLatestDims = ()=>{
            if (!latestDims) {
                const { left, top } = imgDoc.getBoundingClientRect();
                docX = left;
                docY = top;
                latestDims = true;
            }
        };
        const makePoint = (src, onUpdate)=>{
            const pt = point(src, scale);
            let active = false;
            const onDown = (evt, x, y)=>{
                if (pt.parentElement == imgDoc) {
                    if (evt.target == pt || evt.target == img && Math.hypot(x - src.x * scale, y - src.y * scale) < Math.min(window.innerWidth, window.innerHeight) * 0.2) {
                        evt.stopImmediatePropagation();
                        active = true;
                        onMove(x, y);
                    }
                } else {
                    imgDoc.removeEventListener("mousedown", onMouseDown);
                    imgDoc.removeEventListener("touchstart", onTouchStart);
                    imgDoc.removeEventListener("mousemove", onMouseMove);
                    imgDoc.removeEventListener("touchmove", onTouchMove);
                    imgDoc.removeEventListener("mouseup", onUp);
                    imgDoc.removeEventListener("touchend", onUp);
                }
            };
            const onMove = (x, y)=>{
                src.x = x / scale;
                src.y = y / scale;
                adjustPoint(pt, src, scale);
                onUpdate();
            };
            const onUp = ()=>{
                active = false;
            };
            const onMouseDown = (e)=>{
                getLatestDims();
                onDown(e, e.pageX - docX, e.pageY - docY);
            };
            imgDoc.addEventListener("mousedown", onMouseDown);
            const onTouchStart = (e)=>{
                const touch = e.targetTouches[0];
                getLatestDims();
                onDown(e, touch.pageX - docX, touch.pageY - docY);
            };
            imgDoc.addEventListener("touchstart", onTouchStart);
            const onMouseMove = (e)=>{
                if (active) {
                    e.preventDefault();
                    onMove(e.pageX - docX, e.pageY - docY);
                }
            };
            imgDoc.addEventListener("mousemove", onMouseMove);
            const onTouchMove = (e)=>{
                if (active) {
                    const touch = e.targetTouches[0];
                    e.preventDefault();
                    onMove(touch.pageX - docX, touch.pageY - docY);
                }
            };
            imgDoc.addEventListener("touchmove", onTouchMove);
            imgDoc.addEventListener("mouseup", onUp);
            imgDoc.addEventListener("touchend", onUp);
            return pt;
        };
        const paintLines = ()=>{
            for (const elem of prevElems)imgDoc.removeChild(elem);
            const ab = line(quad.a, quad.b, scale);
            const bc = line(quad.b, quad.c, scale);
            const cd = line(quad.c, quad.d, scale);
            const da = line(quad.d, quad.a, scale);
            prevElems = [
                imgDoc.appendChild(ab),
                imgDoc.appendChild(bc),
                imgDoc.appendChild(cd),
                imgDoc.appendChild(da),
                imgDoc.appendChild(makePoint(quad.a, ()=>{
                    adjustLine(da, quad.d, quad.a, scale);
                    adjustLine(ab, quad.a, quad.b, scale);
                })),
                imgDoc.appendChild(makePoint(quad.b, ()=>{
                    adjustLine(ab, quad.a, quad.b, scale);
                    adjustLine(bc, quad.b, quad.c, scale);
                })),
                imgDoc.appendChild(makePoint(quad.c, ()=>{
                    adjustLine(bc, quad.b, quad.c, scale);
                    adjustLine(cd, quad.c, quad.d, scale);
                })),
                imgDoc.appendChild(makePoint(quad.d, ()=>{
                    adjustLine(cd, quad.c, quad.d, scale);
                    adjustLine(da, quad.d, quad.a, scale);
                }))
            ];
        };
        const updateImageDimensions = ()=>{
            const { width, height } = isFirst ? calcDimensions(aspectRatio, 0.925) : firstDimensions;
            if (isFirst) {
                landscape = isLandscape(aspectRatio);
                firstDimensions = {
                    width,
                    height
                };
                modalCancelWrapper.style.width = modalCancelWrapper.style.height = modalDoneWrapper.style.width = modalDoneWrapper.style.height = (landscape ? window.innerWidth : window.innerHeight) * 0.035 + "px";
                modalCancelWrapper.style.margin = modalDoneWrapper.style.margin = (landscape ? window.innerWidth : window.innerHeight) * 0.02 + "px";
                captures.style.width = modal.style.width = window.innerWidth + "px";
                captures.style.height = modal.style.height = window.innerHeight + "px";
                modal.style.flexDirection = landscape ? "row" : "column";
                captures.style.flexDirection = landscape ? "column" : "row";
                if (landscape) {
                    modalBottomWrapper.style.flexDirection = "column";
                    modalBottomWrapper.style.height = window.innerHeight + "px";
                    modalBottomWrapper.style.width = "";
                } else {
                    modalBottomWrapper.style.flexDirection = "row";
                    modalBottomWrapper.style.height = "";
                    modalBottomWrapper.style.width = window.innerWidth + "px";
                }
            }
            const cssWidth = width + "px";
            const cssHeight = height + "px";
            if (landscape) {
                img.style.width = "";
                img.style.height = cssHeight;
                scale = window.innerHeight / data.height;
            } else {
                img.style.width = cssWidth;
                img.style.height = "";
                scale = window.innerWidth / data.width;
            }
            imgCrop.style.width = imgCrop.style.minWidth = cssWidth;
            imgCrop.style.height = imgCrop.style.minHeight = cssHeight;
            latestDims = false;
            paintLines();
        };
        updateImageDimensions();
        captures.appendChild(imgCrop);
        const offResize = onResize(updateImageDimensions);
        cbs.push((check)=>{
            if (check) {
                pages.push({
                    data,
                    quad,
                    img
                });
                doneWrapper.style.opacity = "";
                if (isLast) {
                    if (img.width > img.height) {
                        img.style.height = pastWrapper.style.height;
                        img.style.width = "";
                    } else {
                        img.style.height = "";
                        img.style.width = pastWrapper.style.width;
                    }
                    while(pastWrapper.lastChild != past)pastWrapper.removeChild(pastWrapper.lastChild);
                    pastWrapper.appendChild(img);
                }
            }
            offResize();
            captures.removeChild(imgCrop);
        });
    }
    return new Promise((resolve)=>{
        const onDone = ()=>finish(true);
        const onCancel = ()=>finish(false);
        modalCancel.addEventListener("click", onCancel);
        modalDone.addEventListener("click", onDone);
        const finish = (check)=>{
            modalDone.removeEventListener("click", onDone);
            modalCancel.removeEventListener("click", onCancel);
            modal.style.display = "none";
            for (const cb of cbs)cb(check);
            resolve(check);
        };
    });
};
const isLandscape = (aspectRatio)=>window.innerWidth > window.innerHeight * aspectRatio;
const calcDimensions = (aspectRatio, maxRatio)=>{
    const landscape = isLandscape(aspectRatio);
    const height = landscape ? window.innerHeight : Math.floor(Math.min(window.innerWidth * aspectRatio, window.innerHeight * maxRatio));
    const width = landscape ? Math.floor(Math.min(window.innerHeight * aspectRatio, window.innerWidth * maxRatio)) : window.innerWidth;
    return {
        width,
        height
    };
};
const sideWrappers = [
    topWrapper,
    bottomWrapper
];
const topElems = [
    flashWrapper,
    qualityWrapper,
    githubWrapper,
    selectWrapper,
    pastWrapper
];
const bottomElems = [
    doneWrapper,
    uploadWrapper
];
const allElems = topElems.concat(bottomElems, shutter);
const startStream = async (device)=>{
    const maxRes = await getMaxRes(device);
    let aspectRatio = maxRes.width / maxRes.height;
    const landscape = isLandscape(aspectRatio);
    const { width, height } = calcDimensions(aspectRatio, 0.84);
    const cssHeight = height + "px";
    const cssWidth = width + "px";
    previewCrop.style.width = previewCrop.style.minWidth = cssWidth;
    previewCrop.style.height = previewCrop.style.minHeight = cssHeight;
    root.style.width = window.innerWidth + "px";
    root.style.height = window.innerHeight + "px";
    for (const sideWrapper of sideWrappers)if (landscape) {
        sideWrapper.style.flexDirection = "column";
        sideWrapper.style.height = window.innerHeight + "px";
        sideWrapper.style.width = "";
    } else {
        sideWrapper.style.flexDirection = "row";
        sideWrapper.style.height = "";
        sideWrapper.style.width = window.innerWidth + "px";
    }
    for (const topElem of topElems)topElem.style.width = topElem.style.height = (landscape ? window.innerWidth : window.innerHeight) * 0.03 + "px";
    for (const bottomElem of bottomElems)bottomElem.style.width = bottomElem.style.height = (landscape ? window.innerWidth : window.innerHeight) * 0.035 + "px";
    for (const elem of allElems)elem.style.margin = (landscape ? window.innerWidth : window.innerHeight) * 0.02 + "px";
    shutter.style.width = shutter.style.height = (landscape ? window.innerWidth : window.innerHeight) * 0.05 + "px";
    const pastBorderSize = (landscape ? window.innerWidth : window.innerHeight) * 0.002 + "px";
    pastWrapper.style.borderRadius = pastBorderSize;
    pastWrapper.style.border = pastBorderSize + " solid white";
    if (landscape) {
        preview.style.height = cssHeight;
        preview.style.width = "";
        root.style.flexDirection = "row";
    } else {
        preview.style.height = "";
        preview.style.width = cssWidth;
        root.style.flexDirection = "column";
    }
    const constraints = {
        width: maxRes.width,
        height: maxRes.height,
        deviceId: {
            exact: maxRes.deviceId
        }
    };
    const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints
    });
    const videoTrack = stream.getVideoTracks()[0];
    const capabilities = videoTrack.getCapabilities();
    flashWrapper.style.display = capabilities.torch ? "" : "none";
    preview.srcObject = stream;
    let newElems = [];
    const clearNewElems = ()=>{
        for (const elem of newElems)previewDoc.removeChild(elem);
        newElems.length = 0;
    };
    const onMetadata = ()=>{
        const scale = landscape ? window.innerHeight / preview.videoHeight : window.innerWidth / preview.videoWidth;
        const docPreview = async ()=>{
            let quad;
            const ts = performance.now();
            if (modal.style.display == "none") quad = await (0, _process.findDocument)(await (0, _io.getData)(await cap.grabFrame()), true);
            clearNewElems();
            if (docPreviewTimeout != -1) {
                if (quad) newElems = [
                    previewDoc.appendChild(line(quad.a, quad.b, scale)),
                    previewDoc.appendChild(line(quad.b, quad.c, scale)),
                    previewDoc.appendChild(line(quad.c, quad.d, scale)),
                    previewDoc.appendChild(line(quad.d, quad.a, scale))
                ];
                docPreviewTimeout = setTimeout(docPreview, Math.max(250 - performance.now() + ts, 0));
            }
        };
        docPreviewTimeout = setTimeout(docPreview, 0);
    };
    preview.addEventListener("loadedmetadata", onMetadata);
    const cap = new ImageCapture(videoTrack);
    let hd = Object.prototype.toString.call(cap) == "[object ImageCapture]";
    qualityWrapper.style.display = hd ? "" : "none";
    qualityImg.src = (0, _hdSvgDefault.default);
    const onQualityClick = ()=>{
        hd = !hd;
        qualityImg.src = hd ? (0, _hdSvgDefault.default) : (0, _sdSvgDefault.default);
    };
    quality.addEventListener("click", onQualityClick);
    let docPreviewTimeout = -1;
    const shutterFlash = ()=>{
        preview.style.opacity = "0";
        setTimeout(()=>preview.style.opacity = "", 50);
    };
    const onShutterClick = async ()=>{
        if (shutter.style.opacity == "") {
            shutter.style.opacity = "0.5";
            shutterFlash();
            try {
                const photo = hd ? await cap.takePhoto() : await cap.grabFrame();
                await processPhotos([
                    photo
                ]);
            } catch (e) {}
            shutter.style.opacity = "";
        }
    };
    shutter.addEventListener("click", onShutterClick);
    let torch = false;
    flashImg.src = (0, _flashOffSvgDefault.default);
    const onFlashClick = async ()=>{
        try {
            torch = !torch;
            await videoTrack.applyConstraints({
                advanced: [
                    {
                        torch
                    }
                ]
            });
            flashImg.src = torch ? (0, _flashSvgDefault.default) : (0, _flashOffSvgDefault.default);
        } catch (e) {}
    };
    flash.addEventListener("click", onFlashClick);
    return {
        deviceId: maxRes.deviceId,
        close () {
            clearTimeout(docPreviewTimeout);
            docPreviewTimeout = -1;
            shutter.removeEventListener("click", onShutterClick);
            flash.removeEventListener("click", onFlashClick);
            quality.removeEventListener("click", onQualityClick);
            preview.removeEventListener("loadedmetadata", onMetadata);
            preview.pause();
            for (const track of stream.getTracks())track.stop();
        }
    };
};
const onLoad = async ()=>{
    let stream = await startStream(localStorage.getItem("defaultDevice"));
    const updateBold = ()=>{
        for (const option of select.options)option.style.fontWeight = "";
        select.selectedOptions[0].style.fontWeight = "bold";
    };
    for (const device of (await navigator.mediaDevices.enumerateDevices()))if (device.kind == "videoinput") {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.label = device.label;
        select.appendChild(option);
    }
    select.value = stream.deviceId;
    updateBold();
    const update = async ()=>{
        updateBold();
        stream.close();
        select.disabled = true;
        localStorage.setItem("defaultDevice", select.value);
        stream = await startStream(select.value);
        select.disabled = false;
    };
    select.onchange = update;
    onResize(update);
    upload.onchange = async ()=>{
        shutter.style.opacity = "0.5";
        await processPhotos([
            ...upload.files
        ]);
        shutter.style.opacity = "";
    };
    done.onclick = async ()=>{
        if (pages.length) {
            doneWrapper.style.opacity = "0.5";
            while(pastWrapper.lastChild != past)pastWrapper.removeChild(pastWrapper.lastChild);
            const pdfBuffer = await (0, _pdf.toPDF)(await Promise.all(pages.map(({ data, quad })=>(0, _process.extractDocument)(data, quad, 1224, true))));
            const pdfBlob = new Blob([
                pdfBuffer
            ], {
                type: "application/pdf"
            });
            window.parent.postMessage({
                type: "pdfGenerated",
                blob: pdfBlob,
                fileName: "out.pdf"
            }, "*");
            window.parent.location.href = "/upload";
            pages.length = 0;
        }
    };
    past.onclick = async ()=>{
        if (pages.length) {
            const currPages = pages.slice();
            pages.length = 0;
            if (!await processPhotos(currPages)) {
                pages.push(...currPages);
                const { img } = currPages[currPages.length - 1];
                if (img.width > img.height) {
                    img.style.height = pastWrapper.style.height;
                    img.style.width = "";
                } else {
                    img.style.height = "";
                    img.style.width = pastWrapper.style.width;
                }
                while(pastWrapper.lastChild != past)pastWrapper.removeChild(pastWrapper.lastChild);
                pastWrapper.appendChild(img);
            }
        }
    };
};
onLoad();

},{"./process":"6LcgS","./io":"dIlHe","url:./flash.svg":"bghYI","url:./flash-off.svg":"f37Sj","url:./hd.svg":"eJqXd","url:./sd.svg":"bhbNc","image-capture":"4nidF","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./pdf":"8Mcz1"}],"6LcgS":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "findDocument", ()=>findDocument);
parcelHelpers.export(exports, "extractDocument", ()=>extractDocument);
parcelHelpers.export(exports, "bitmapToData", ()=>bitmapToData);
const newWorker = ()=>new Worker(require("cd434cd0b2046381"));
const processWorkers = [];
if (navigator.hardwareConcurrency) for(let i = 1; i < navigator.hardwareConcurrency; ++i)processWorkers.push(newWorker());
const getWorker = ()=>processWorkers.pop() || newWorker();
const returnWorker = (worker)=>processWorkers.push(worker);
let messageID = 0;
const message = async (msg, transfer)=>{
    return new Promise((resolve, reject)=>{
        const worker = getWorker();
        let id = messageID++;
        // const ts = performance.now();
        const onMessage = (evt)=>{
            const { id: mid, error, result } = evt.data;
            if (mid == id) {
                if (error) {
                    let err = new Error(error.message);
                    err.stack = error.stack;
                    err.name = error.name;
                    reject(err);
                } else resolve(result);
                // console.log('Processed', msg, 'in', (performance.now() - ts) + 'ms', { result, error });
                returnWorker(worker);
                worker.removeEventListener("message", onMessage);
            }
        };
        worker.addEventListener("message", onMessage);
        worker.postMessage({
            id,
            msg
        }, transfer || []);
    });
};
function findDocument(data, transfer) {
    return message({
        type: "find-document",
        data
    }, transfer ? [
        data.data.buffer
    ] : []);
}
function extractDocument(data, region, targetWidth, transfer) {
    return message({
        type: "extract-document",
        data,
        region,
        targetWidth
    }, transfer ? [
        data.data.buffer
    ] : []);
}
function bitmapToData(bitmap, transfer) {
    return message({
        type: "get-data",
        bitmap
    }, transfer ? [
        bitmap
    ] : []);
}

},{"cd434cd0b2046381":"kVME8","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"kVME8":[function(require,module,exports) {
let workerURL = require("517206a05c4b1184");
let bundleURL = require("87807062925f6275");
let url = bundleURL.getBundleURL("7UhFu") + "process.5536d23c.js" + "?" + Date.now();
module.exports = workerURL(url, bundleURL.getOrigin(url), false);

},{"517206a05c4b1184":"cn2gM","87807062925f6275":"lgJ39"}],"cn2gM":[function(require,module,exports) {
"use strict";
module.exports = function(workerUrl, origin, isESM) {
    if (origin === self.location.origin) // If the worker bundle's url is on the same origin as the document,
    // use the worker bundle's own url.
    return workerUrl;
    else {
        // Otherwise, create a blob URL which loads the worker bundle with `importScripts`.
        var source = isESM ? "import " + JSON.stringify(workerUrl) + ";" : "importScripts(" + JSON.stringify(workerUrl) + ");";
        return URL.createObjectURL(new Blob([
            source
        ], {
            type: "application/javascript"
        }));
    }
};

},{}],"lgJ39":[function(require,module,exports) {
"use strict";
var bundleURL = {};
function getBundleURLCached(id) {
    var value = bundleURL[id];
    if (!value) {
        value = getBundleURL();
        bundleURL[id] = value;
    }
    return value;
}
function getBundleURL() {
    try {
        throw new Error();
    } catch (err) {
        var matches = ("" + err.stack).match(/(https?|file|ftp|(chrome|moz|safari-web)-extension):\/\/[^)\n]+/g);
        if (matches) // The first two stack frames will be this function and getBundleURLCached.
        // Use the 3rd one, which will be a runtime in the original bundle.
        return getBaseURL(matches[2]);
    }
    return "/";
}
function getBaseURL(url) {
    return ("" + url).replace(/^((?:https?|file|ftp|(chrome|moz|safari-web)-extension):\/\/.+)\/[^/]+$/, "$1") + "/";
}
// TODO: Replace uses with `new URL(url).origin` when ie11 is no longer supported.
function getOrigin(url) {
    var matches = ("" + url).match(/(https?|file|ftp|(chrome|moz|safari-web)-extension):\/\/[^/]+/);
    if (!matches) throw new Error("Origin not found");
    return matches[0];
}
exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
exports.getOrigin = getOrigin;

},{}],"gkKU3":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || dest.hasOwnProperty(key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"dIlHe":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "toImage", ()=>toImage);
parcelHelpers.export(exports, "getData", ()=>getData);
parcelHelpers.export(exports, "download", ()=>download);
var _process = require("./process");
const toImage = async (img)=>{
    const elem = document.createElement("img");
    const loaded = new Promise((resolve, reject)=>{
        elem.onload = ()=>{
            resolve();
        };
        elem.onerror = (err)=>{
            reject(err);
        };
    });
    elem.src = URL.createObjectURL(img);
    await loaded;
    URL.revokeObjectURL(elem.src);
    return elem;
};
const sharedCanvas = document.createElement("canvas");
const sharedCtx = sharedCanvas.getContext("2d");
const getData = async (img, transfer)=>{
    if (sharedCanvas["transferControlToOffscreen"]) return (0, _process.bitmapToData)(img instanceof ImageBitmap ? img : await createImageBitmap(img), transfer);
    sharedCanvas.width = img.width, sharedCanvas.height = img.height;
    sharedCtx.drawImage(img, 0, 0);
    return sharedCtx.getImageData(0, 0, img.width, img.height);
};
const download = (file, name)=>{
    const url = URL.createObjectURL(file);
    const el = document.createElement("a");
    el.download = name;
    el.href = url;
    el.click();
    URL.revokeObjectURL(url);
};

},{"./process":"6LcgS","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bghYI":[function(require,module,exports) {
module.exports = require("20cfdbe4c8768f93").getBundleURL("7UhFu") + "flash.e99b23d3.svg" + "?" + Date.now();

},{"20cfdbe4c8768f93":"lgJ39"}],"f37Sj":[function(require,module,exports) {
module.exports = require("815d53d27a2bfa43").getBundleURL("7UhFu") + "flash-off.eff1403e.svg" + "?" + Date.now();

},{"815d53d27a2bfa43":"lgJ39"}],"eJqXd":[function(require,module,exports) {
module.exports = require("d48185e90347c3ab").getBundleURL("7UhFu") + "hd.aa79a210.svg" + "?" + Date.now();

},{"d48185e90347c3ab":"lgJ39"}],"bhbNc":[function(require,module,exports) {
module.exports = require("b349b87c08874d0a").getBundleURL("7UhFu") + "sd.75e7f434.svg" + "?" + Date.now();

},{"b349b87c08874d0a":"lgJ39"}],"4nidF":[function(require,module,exports) {
/**
 * MediaStream ImageCapture polyfill
 *
 * @license
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "ImageCapture", ()=>ImageCapture);
let ImageCapture = window.ImageCapture;
if (typeof ImageCapture === "undefined") ImageCapture = class {
    /**
     * TODO https://www.w3.org/TR/image-capture/#constructors
     *
     * @param {MediaStreamTrack} videoStreamTrack - A MediaStreamTrack of the 'video' kind
     */ constructor(videoStreamTrack){
        if (videoStreamTrack.kind !== "video") throw new DOMException("NotSupportedError");
        this._videoStreamTrack = videoStreamTrack;
        if (!("readyState" in this._videoStreamTrack)) // Polyfill for Firefox
        this._videoStreamTrack.readyState = "live";
        // MediaStream constructor not available until Chrome 55 - https://www.chromestatus.com/feature/5912172546752512
        this._previewStream = new MediaStream([
            videoStreamTrack
        ]);
        this.videoElement = document.createElement("video");
        this.videoElementPlaying = new Promise((resolve)=>{
            this.videoElement.addEventListener("playing", resolve);
        });
        if (HTMLMediaElement) this.videoElement.srcObject = this._previewStream; // Safari 11 doesn't allow use of createObjectURL for MediaStream
        else this.videoElement.src = URL.createObjectURL(this._previewStream);
        this.videoElement.muted = true;
        this.videoElement.setAttribute("playsinline", ""); // Required by Safari on iOS 11. See https://webkit.org/blog/6784
        this.videoElement.play();
        this.canvasElement = document.createElement("canvas");
        // TODO Firefox has https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
        this.canvas2dContext = this.canvasElement.getContext("2d");
    }
    /**
     * https://w3c.github.io/mediacapture-image/index.html#dom-imagecapture-videostreamtrack
     * @return {MediaStreamTrack} The MediaStreamTrack passed into the constructor
     */ get videoStreamTrack() {
        return this._videoStreamTrack;
    }
    /**
     * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-getphotocapabilities
     * @return {Promise<PhotoCapabilities>} Fulfilled promise with
     * [PhotoCapabilities](https://www.w3.org/TR/image-capture/#idl-def-photocapabilities)
     * object on success, rejected promise on failure
     */ getPhotoCapabilities() {
        return new Promise(function executorGPC(resolve, reject) {
            // TODO see https://github.com/w3c/mediacapture-image/issues/97
            const MediaSettingsRange = {
                current: 0,
                min: 0,
                max: 0
            };
            resolve({
                exposureCompensation: MediaSettingsRange,
                exposureMode: "none",
                fillLightMode: "none",
                focusMode: "none",
                imageHeight: MediaSettingsRange,
                imageWidth: MediaSettingsRange,
                iso: MediaSettingsRange,
                redEyeReduction: false,
                whiteBalanceMode: "none",
                zoom: MediaSettingsRange
            });
            reject(new DOMException("OperationError"));
        });
    }
    /**
     * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-setoptions
     * @param {Object} photoSettings - Photo settings dictionary, https://www.w3.org/TR/image-capture/#idl-def-photosettings
     * @return {Promise<void>} Fulfilled promise on success, rejected promise on failure
     */ setOptions(photoSettings = {}) {
        return new Promise(function executorSO(resolve, reject) {
        // TODO
        });
    }
    /**
     * TODO
     * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-takephoto
     * @return {Promise<Blob>} Fulfilled promise with [Blob](https://www.w3.org/TR/FileAPI/#blob)
     * argument on success; rejected promise on failure
     */ takePhoto() {
        const self = this;
        return new Promise(function executorTP(resolve, reject) {
            // `If the readyState of the MediaStreamTrack provided in the constructor is not live,
            // return a promise rejected with a new DOMException whose name is "InvalidStateError".`
            if (self._videoStreamTrack.readyState !== "live") return reject(new DOMException("InvalidStateError"));
            self.videoElementPlaying.then(()=>{
                try {
                    self.canvasElement.width = self.videoElement.videoWidth;
                    self.canvasElement.height = self.videoElement.videoHeight;
                    self.canvas2dContext.drawImage(self.videoElement, 0, 0);
                    self.canvasElement.toBlob(resolve);
                } catch (error) {
                    reject(new DOMException("UnknownError"));
                }
            });
        });
    }
    /**
     * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-grabframe
     * @return {Promise<ImageBitmap>} Fulfilled promise with
     * [ImageBitmap](https://www.w3.org/TR/html51/webappapis.html#webappapis-images)
     * argument on success; rejected promise on failure
     */ grabFrame() {
        const self = this;
        return new Promise(function executorGF(resolve, reject) {
            // `If the readyState of the MediaStreamTrack provided in the constructor is not live,
            // return a promise rejected with a new DOMException whose name is "InvalidStateError".`
            if (self._videoStreamTrack.readyState !== "live") return reject(new DOMException("InvalidStateError"));
            self.videoElementPlaying.then(()=>{
                try {
                    self.canvasElement.width = self.videoElement.videoWidth;
                    self.canvasElement.height = self.videoElement.videoHeight;
                    self.canvas2dContext.drawImage(self.videoElement, 0, 0);
                    // TODO polyfill https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapFactories/createImageBitmap for IE
                    resolve(window.createImageBitmap(self.canvasElement));
                } catch (error) {
                    reject(new DOMException("UnknownError"));
                }
            });
        });
    }
};
window.ImageCapture = ImageCapture;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"8Mcz1":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "toPDF", ()=>toPDF);
const readFile = Blob.prototype.arrayBuffer || function() {
    return new Promise((resolve, reject)=>{
        const fr = new FileReader();
        fr.onload = ()=>{
            resolve(fr.result);
        };
        fr.onerror = ()=>{
            reject(fr.error);
        };
        fr.readAsArrayBuffer(this);
    });
};
const toPDF = async (images)=>{
    const pdfChunks = [];
    let index = 0;
    const offsets = [];
    const write = (chunk)=>{
        pdfChunks.push(chunk);
        index += chunk.length;
    };
    const token = (chunk)=>{
        write(" ");
        write(chunk);
    };
    const concat = (chunks)=>{
        let len = 0;
        for (const chunk of chunks)len += chunk.length;
        const buf = new Uint8Array(len);
        len = 0;
        for (const chunk of chunks){
            if (typeof chunk == "string") for(let i = 0; i < chunk.length; ++i)buf[i + len] = chunk.charCodeAt(i);
            else buf.set(chunk, len);
            len += chunk.length;
        }
        return buf;
    };
    // Convenience functions
    const comment = (content)=>{
        write("%" + content + "\n");
    };
    const number = (value)=>{
        // Note: this doesnt work for very small and very large numbers
        token(value.toString());
    };
    const ascii = (value)=>{
        token("(" + value.replace(/[\n\r\t\f\b\(\)\\]/g, (c)=>"\\00" + c.charCodeAt(0).toString(8)) + ")");
    };
    const bin = (value)=>{
        let data = "<";
        if (typeof value == "string") for(let i = 0; i < value.length; ++i)data += value.charCodeAt(i).toString(16);
        else for(let i = 0; i < value.length; ++i)data += value[i].toString(16);
        token(data + ">");
    };
    const name = (value)=>{
        // Note: only supports ASCII names
        token("/" + value);
    };
    const array = (fn)=>{
        token("[");
        fn();
        token("]");
    };
    const dict = (values)=>{
        token("<<");
        for(const key in values){
            name(key);
            values[key]();
        }
        token(">>");
    };
    const stream = (desc, content)=>{
        if (!desc["Length"]) throw new TypeError("need stream length");
        dict(desc);
        token("stream\n");
        write(content);
        write("endstream");
    };
    const object = (fn)=>{
        write(" ");
        write(offsets.push(index) + " 0 obj");
        fn();
        token("endobj");
        return offsets.length;
    };
    const reference = (id)=>{
        token(id + " 0 R");
    };
    const nullObject = ()=>{
        token("null");
    };
    // v1.4 for compatibility
    comment("PDF-1.4");
    // 4 byte binary comment, as suggested by spec
    comment("\x90\x85\xfa\xe3");
    const pagesRootId = images.length * 3 + 1;
    const pages = await Promise.all(images.map(async (img)=>{
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").putImageData(img, 0, 0);
        const jpeg = await new Promise((resolve)=>canvas.toBlob(resolve, "image/jpeg"));
        const jpegData = new Uint8Array(await readFile.call(jpeg));
        const image = object(()=>{
            stream({
                Type () {
                    name("XObject");
                },
                Subtype () {
                    name("Image");
                },
                Width () {
                    number(img.width);
                },
                Height () {
                    number(img.height);
                },
                ColorSpace () {
                    name("DeviceRGB");
                },
                BitsPerComponent () {
                    number(8);
                },
                Filter () {
                    name("DCTDecode");
                },
                Length () {
                    number(jpegData.length);
                }
            }, jpegData);
        });
        // US Letter width
        const height = 792;
        const width = height * img.width / img.height;
        const contents = object(()=>{
            const result = `${width} 0 0 ${height} 0 0 cm /I Do`;
            stream({
                Length () {
                    number(result.length);
                }
            }, concat([
                result
            ]));
        });
        const page = object(()=>{
            dict({
                Type () {
                    name("Page");
                },
                Parent () {
                    reference(pagesRootId);
                },
                Resources () {
                    dict({
                        XObject () {
                            dict({
                                I () {
                                    reference(image);
                                }
                            });
                        }
                    });
                },
                Contents () {
                    reference(contents);
                },
                MediaBox () {
                    array(()=>{
                        number(0);
                        number(0);
                        number(width);
                        number(height);
                    });
                }
            });
        });
        return page;
    }));
    const pageRoot = object(()=>{
        dict({
            Type () {
                name("Pages");
            },
            Kids () {
                array(()=>{
                    for (const page of pages)reference(page);
                });
            },
            Count () {
                number(pages.length);
            }
        });
    });
    const catalog = object(()=>{
        dict({
            Type () {
                name("Catalog");
            },
            Pages () {
                reference(pageRoot);
            }
        });
    });
    // XREF
    write("\n");
    const xrefOffset = index;
    write("xref\n0 " + (offsets.length + 1) + "\n0000000000 65535 f \n");
    for (const offset of offsets)write(offset.toString().padStart(10, "0") + " 00000 n \n");
    write("trailer");
    dict({
        Size () {
            number(offsets.length + 1);
        },
        Root () {
            reference(catalog);
        }
    });
    write("\nstartxref\n" + xrefOffset + "\n%%EOF");
    return concat(pdfChunks);
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["2oZg2","h7u1C"], "h7u1C", "parcelRequireed96")

//# sourceMappingURL=index.b71e74eb.js.map
