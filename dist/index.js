// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/dotenv/package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "dotenv",
    version: "16.4.5",
    description: "Loads environment variables from .env file",
    main: "lib/main.js",
    types: "lib/main.d.ts",
    exports: {
      ".": {
        types: "./lib/main.d.ts",
        require: "./lib/main.js",
        default: "./lib/main.js"
      },
      "./config": "./config.js",
      "./config.js": "./config.js",
      "./lib/env-options": "./lib/env-options.js",
      "./lib/env-options.js": "./lib/env-options.js",
      "./lib/cli-options": "./lib/cli-options.js",
      "./lib/cli-options.js": "./lib/cli-options.js",
      "./package.json": "./package.json"
    },
    scripts: {
      "dts-check": "tsc --project tests/types/tsconfig.json",
      lint: "standard",
      "lint-readme": "standard-markdown",
      pretest: "npm run lint && npm run dts-check",
      test: "tap tests/*.js --100 -Rspec",
      "test:coverage": "tap --coverage-report=lcov",
      prerelease: "npm test",
      release: "standard-version"
    },
    repository: {
      type: "git",
      url: "git://github.com/motdotla/dotenv.git"
    },
    funding: "https://dotenvx.com",
    keywords: [
      "dotenv",
      "env",
      ".env",
      "environment",
      "variables",
      "config",
      "settings"
    ],
    readmeFilename: "README.md",
    license: "BSD-2-Clause",
    devDependencies: {
      "@definitelytyped/dtslint": "^0.0.133",
      "@types/node": "^18.11.3",
      decache: "^4.6.1",
      sinon: "^14.0.1",
      standard: "^17.0.0",
      "standard-markdown": "^7.1.0",
      "standard-version": "^9.5.0",
      tap: "^16.3.0",
      tar: "^6.1.11",
      typescript: "^4.8.4"
    },
    engines: {
      node: ">=12"
    },
    browser: {
      fs: false
    }
  };
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS((exports, module) => {
  function parse(src) {
    const obj = {};
    let lines = src.toString();
    lines = lines.replace(/\r\n?/mg, "\n");
    let match;
    while ((match = LINE.exec(lines)) != null) {
      const key = match[1];
      let value = match[2] || "";
      value = value.trim();
      const maybeQuote = value[0];
      value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
      if (maybeQuote === '"') {
        value = value.replace(/\\n/g, "\n");
        value = value.replace(/\\r/g, "\r");
      }
      obj[key] = value;
    }
    return obj;
  }
  function _parseVault(options) {
    const vaultPath = _vaultPath(options);
    const result = DotenvModule.configDotenv({ path: vaultPath });
    if (!result.parsed) {
      const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
      err.code = "MISSING_DATA";
      throw err;
    }
    const keys = _dotenvKey(options).split(",");
    const length = keys.length;
    let decrypted;
    for (let i = 0;i < length; i++) {
      try {
        const key = keys[i].trim();
        const attrs = _instructions(result, key);
        decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
        break;
      } catch (error) {
        if (i + 1 >= length) {
          throw error;
        }
      }
    }
    return DotenvModule.parse(decrypted);
  }
  function _log(message) {
    console.log(`[dotenv@${version}][INFO] ${message}`);
  }
  function _warn(message) {
    console.log(`[dotenv@${version}][WARN] ${message}`);
  }
  function _debug(message) {
    console.log(`[dotenv@${version}][DEBUG] ${message}`);
  }
  function _dotenvKey(options) {
    if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
      return options.DOTENV_KEY;
    }
    if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
      return process.env.DOTENV_KEY;
    }
    return "";
  }
  function _instructions(result, dotenvKey) {
    let uri;
    try {
      uri = new URL(dotenvKey);
    } catch (error) {
      if (error.code === "ERR_INVALID_URL") {
        const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      throw error;
    }
    const key = uri.password;
    if (!key) {
      const err = new Error("INVALID_DOTENV_KEY: Missing key part");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    const environment = uri.searchParams.get("environment");
    if (!environment) {
      const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
    const ciphertext = result.parsed[environmentKey];
    if (!ciphertext) {
      const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
      err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
      throw err;
    }
    return { ciphertext, key };
  }
  function _vaultPath(options) {
    let possibleVaultPath = null;
    if (options && options.path && options.path.length > 0) {
      if (Array.isArray(options.path)) {
        for (const filepath of options.path) {
          if (fs.existsSync(filepath)) {
            possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
          }
        }
      } else {
        possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
      }
    } else {
      possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
    }
    if (fs.existsSync(possibleVaultPath)) {
      return possibleVaultPath;
    }
    return null;
  }
  function _resolveHome(envPath) {
    return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
  }
  function _configVault(options) {
    _log("Loading env from encrypted .env.vault");
    const parsed = DotenvModule._parseVault(options);
    let processEnv = process.env;
    if (options && options.processEnv != null) {
      processEnv = options.processEnv;
    }
    DotenvModule.populate(processEnv, parsed, options);
    return { parsed };
  }
  function configDotenv(options) {
    const dotenvPath = path.resolve(process.cwd(), ".env");
    let encoding = "utf8";
    const debug = Boolean(options && options.debug);
    if (options && options.encoding) {
      encoding = options.encoding;
    } else {
      if (debug) {
        _debug("No encoding is specified. UTF-8 is used by default");
      }
    }
    let optionPaths = [dotenvPath];
    if (options && options.path) {
      if (!Array.isArray(options.path)) {
        optionPaths = [_resolveHome(options.path)];
      } else {
        optionPaths = [];
        for (const filepath of options.path) {
          optionPaths.push(_resolveHome(filepath));
        }
      }
    }
    let lastError;
    const parsedAll = {};
    for (const path2 of optionPaths) {
      try {
        const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
        DotenvModule.populate(parsedAll, parsed, options);
      } catch (e) {
        if (debug) {
          _debug(`Failed to load ${path2} ${e.message}`);
        }
        lastError = e;
      }
    }
    let processEnv = process.env;
    if (options && options.processEnv != null) {
      processEnv = options.processEnv;
    }
    DotenvModule.populate(processEnv, parsedAll, options);
    if (lastError) {
      return { parsed: parsedAll, error: lastError };
    } else {
      return { parsed: parsedAll };
    }
  }
  function config(options) {
    if (_dotenvKey(options).length === 0) {
      return DotenvModule.configDotenv(options);
    }
    const vaultPath = _vaultPath(options);
    if (!vaultPath) {
      _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
      return DotenvModule.configDotenv(options);
    }
    return DotenvModule._configVault(options);
  }
  function decrypt(encrypted, keyStr) {
    const key = Buffer.from(keyStr.slice(-64), "hex");
    let ciphertext = Buffer.from(encrypted, "base64");
    const nonce = ciphertext.subarray(0, 12);
    const authTag = ciphertext.subarray(-16);
    ciphertext = ciphertext.subarray(12, -16);
    try {
      const aesgcm = crypto2.createDecipheriv("aes-256-gcm", key, nonce);
      aesgcm.setAuthTag(authTag);
      return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
    } catch (error) {
      const isRange = error instanceof RangeError;
      const invalidKeyLength = error.message === "Invalid key length";
      const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
      if (isRange || invalidKeyLength) {
        const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      } else if (decryptionFailed) {
        const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
        err.code = "DECRYPTION_FAILED";
        throw err;
      } else {
        throw error;
      }
    }
  }
  function populate(processEnv, parsed, options = {}) {
    const debug = Boolean(options && options.debug);
    const override = Boolean(options && options.override);
    if (typeof parsed !== "object") {
      const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      err.code = "OBJECT_REQUIRED";
      throw err;
    }
    for (const key of Object.keys(parsed)) {
      if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
        if (override === true) {
          processEnv[key] = parsed[key];
        }
        if (debug) {
          if (override === true) {
            _debug(`"${key}" is already defined and WAS overwritten`);
          } else {
            _debug(`"${key}" is already defined and was NOT overwritten`);
          }
        }
      } else {
        processEnv[key] = parsed[key];
      }
    }
  }
  var fs = import.meta.require("fs");
  var path = import.meta.require("path");
  var os = import.meta.require("os");
  var crypto2 = import.meta.require("crypto");
  var packageJson = require_package();
  var version = packageJson.version;
  var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  var DotenvModule = {
    configDotenv,
    _configVault,
    _parseVault,
    config,
    decrypt,
    parse,
    populate
  };
  exports.configDotenv = DotenvModule.configDotenv;
  exports._configVault = DotenvModule._configVault;
  exports._parseVault = DotenvModule._parseVault;
  exports.config = DotenvModule.config;
  exports.decrypt = DotenvModule.decrypt;
  exports.parse = DotenvModule.parse;
  exports.populate = DotenvModule.populate;
  module.exports = DotenvModule;
});

// node_modules/moment/moment.js
var require_moment = __commonJS((exports, module) => {
  //! moment.js
  //! version : 2.30.1
  //! authors : Tim Wood, Iskren Chernev, Moment.js contributors
  //! license : MIT
  //! momentjs.com
  (function(global2, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global2.moment = factory();
  })(exports, function() {
    var hookCallback;
    function hooks() {
      return hookCallback.apply(null, arguments);
    }
    function setHookCallback(callback) {
      hookCallback = callback;
    }
    function isArray(input) {
      return input instanceof Array || Object.prototype.toString.call(input) === "[object Array]";
    }
    function isObject(input) {
      return input != null && Object.prototype.toString.call(input) === "[object Object]";
    }
    function hasOwnProp(a, b) {
      return Object.prototype.hasOwnProperty.call(a, b);
    }
    function isObjectEmpty(obj) {
      if (Object.getOwnPropertyNames) {
        return Object.getOwnPropertyNames(obj).length === 0;
      } else {
        var k;
        for (k in obj) {
          if (hasOwnProp(obj, k)) {
            return false;
          }
        }
        return true;
      }
    }
    function isUndefined(input) {
      return input === undefined;
    }
    function isNumber(input) {
      return typeof input === "number" || Object.prototype.toString.call(input) === "[object Number]";
    }
    function isDate(input) {
      return input instanceof Date || Object.prototype.toString.call(input) === "[object Date]";
    }
    function map(arr, fn) {
      var res = [], i, arrLen = arr.length;
      for (i = 0;i < arrLen; ++i) {
        res.push(fn(arr[i], i));
      }
      return res;
    }
    function extend(a, b) {
      for (var i in b) {
        if (hasOwnProp(b, i)) {
          a[i] = b[i];
        }
      }
      if (hasOwnProp(b, "toString")) {
        a.toString = b.toString;
      }
      if (hasOwnProp(b, "valueOf")) {
        a.valueOf = b.valueOf;
      }
      return a;
    }
    function createUTC(input, format2, locale2, strict) {
      return createLocalOrUTC(input, format2, locale2, strict, true).utc();
    }
    function defaultParsingFlags() {
      return {
        empty: false,
        unusedTokens: [],
        unusedInput: [],
        overflow: -2,
        charsLeftOver: 0,
        nullInput: false,
        invalidEra: null,
        invalidMonth: null,
        invalidFormat: false,
        userInvalidated: false,
        iso: false,
        parsedDateParts: [],
        era: null,
        meridiem: null,
        rfc2822: false,
        weekdayMismatch: false
      };
    }
    function getParsingFlags(m) {
      if (m._pf == null) {
        m._pf = defaultParsingFlags();
      }
      return m._pf;
    }
    var some;
    if (Array.prototype.some) {
      some = Array.prototype.some;
    } else {
      some = function(fun) {
        var t = Object(this), len = t.length >>> 0, i;
        for (i = 0;i < len; i++) {
          if (i in t && fun.call(this, t[i], i, t)) {
            return true;
          }
        }
        return false;
      };
    }
    function isValid(m) {
      var flags = null, parsedParts = false, isNowValid = m._d && !isNaN(m._d.getTime());
      if (isNowValid) {
        flags = getParsingFlags(m);
        parsedParts = some.call(flags.parsedDateParts, function(i) {
          return i != null;
        });
        isNowValid = flags.overflow < 0 && !flags.empty && !flags.invalidEra && !flags.invalidMonth && !flags.invalidWeekday && !flags.weekdayMismatch && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated && (!flags.meridiem || flags.meridiem && parsedParts);
        if (m._strict) {
          isNowValid = isNowValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
        }
      }
      if (Object.isFrozen == null || !Object.isFrozen(m)) {
        m._isValid = isNowValid;
      } else {
        return isNowValid;
      }
      return m._isValid;
    }
    function createInvalid(flags) {
      var m = createUTC(NaN);
      if (flags != null) {
        extend(getParsingFlags(m), flags);
      } else {
        getParsingFlags(m).userInvalidated = true;
      }
      return m;
    }
    var momentProperties = hooks.momentProperties = [], updateInProgress = false;
    function copyConfig(to2, from2) {
      var i, prop, val, momentPropertiesLen = momentProperties.length;
      if (!isUndefined(from2._isAMomentObject)) {
        to2._isAMomentObject = from2._isAMomentObject;
      }
      if (!isUndefined(from2._i)) {
        to2._i = from2._i;
      }
      if (!isUndefined(from2._f)) {
        to2._f = from2._f;
      }
      if (!isUndefined(from2._l)) {
        to2._l = from2._l;
      }
      if (!isUndefined(from2._strict)) {
        to2._strict = from2._strict;
      }
      if (!isUndefined(from2._tzm)) {
        to2._tzm = from2._tzm;
      }
      if (!isUndefined(from2._isUTC)) {
        to2._isUTC = from2._isUTC;
      }
      if (!isUndefined(from2._offset)) {
        to2._offset = from2._offset;
      }
      if (!isUndefined(from2._pf)) {
        to2._pf = getParsingFlags(from2);
      }
      if (!isUndefined(from2._locale)) {
        to2._locale = from2._locale;
      }
      if (momentPropertiesLen > 0) {
        for (i = 0;i < momentPropertiesLen; i++) {
          prop = momentProperties[i];
          val = from2[prop];
          if (!isUndefined(val)) {
            to2[prop] = val;
          }
        }
      }
      return to2;
    }
    function Moment(config) {
      copyConfig(this, config);
      this._d = new Date(config._d != null ? config._d.getTime() : NaN);
      if (!this.isValid()) {
        this._d = new Date(NaN);
      }
      if (updateInProgress === false) {
        updateInProgress = true;
        hooks.updateOffset(this);
        updateInProgress = false;
      }
    }
    function isMoment(obj) {
      return obj instanceof Moment || obj != null && obj._isAMomentObject != null;
    }
    function warn(msg) {
      if (hooks.suppressDeprecationWarnings === false && typeof console !== "undefined" && console.warn) {
        console.warn("Deprecation warning: " + msg);
      }
    }
    function deprecate(msg, fn) {
      var firstTime = true;
      return extend(function() {
        if (hooks.deprecationHandler != null) {
          hooks.deprecationHandler(null, msg);
        }
        if (firstTime) {
          var args = [], arg, i, key, argLen = arguments.length;
          for (i = 0;i < argLen; i++) {
            arg = "";
            if (typeof arguments[i] === "object") {
              arg += "\n[" + i + "] ";
              for (key in arguments[0]) {
                if (hasOwnProp(arguments[0], key)) {
                  arg += key + ": " + arguments[0][key] + ", ";
                }
              }
              arg = arg.slice(0, -2);
            } else {
              arg = arguments[i];
            }
            args.push(arg);
          }
          warn(msg + "\nArguments: " + Array.prototype.slice.call(args).join("") + "\n" + new Error().stack);
          firstTime = false;
        }
        return fn.apply(this, arguments);
      }, fn);
    }
    var deprecations = {};
    function deprecateSimple(name, msg) {
      if (hooks.deprecationHandler != null) {
        hooks.deprecationHandler(name, msg);
      }
      if (!deprecations[name]) {
        warn(msg);
        deprecations[name] = true;
      }
    }
    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;
    function isFunction(input) {
      return typeof Function !== "undefined" && input instanceof Function || Object.prototype.toString.call(input) === "[object Function]";
    }
    function set(config) {
      var prop, i;
      for (i in config) {
        if (hasOwnProp(config, i)) {
          prop = config[i];
          if (isFunction(prop)) {
            this[i] = prop;
          } else {
            this["_" + i] = prop;
          }
        }
      }
      this._config = config;
      this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source);
    }
    function mergeConfigs(parentConfig, childConfig) {
      var res = extend({}, parentConfig), prop;
      for (prop in childConfig) {
        if (hasOwnProp(childConfig, prop)) {
          if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
            res[prop] = {};
            extend(res[prop], parentConfig[prop]);
            extend(res[prop], childConfig[prop]);
          } else if (childConfig[prop] != null) {
            res[prop] = childConfig[prop];
          } else {
            delete res[prop];
          }
        }
      }
      for (prop in parentConfig) {
        if (hasOwnProp(parentConfig, prop) && !hasOwnProp(childConfig, prop) && isObject(parentConfig[prop])) {
          res[prop] = extend({}, res[prop]);
        }
      }
      return res;
    }
    function Locale(config) {
      if (config != null) {
        this.set(config);
      }
    }
    var keys;
    if (Object.keys) {
      keys = Object.keys;
    } else {
      keys = function(obj) {
        var i, res = [];
        for (i in obj) {
          if (hasOwnProp(obj, i)) {
            res.push(i);
          }
        }
        return res;
      };
    }
    var defaultCalendar = {
      sameDay: "[Today at] LT",
      nextDay: "[Tomorrow at] LT",
      nextWeek: "dddd [at] LT",
      lastDay: "[Yesterday at] LT",
      lastWeek: "[Last] dddd [at] LT",
      sameElse: "L"
    };
    function calendar(key, mom, now2) {
      var output = this._calendar[key] || this._calendar["sameElse"];
      return isFunction(output) ? output.call(mom, now2) : output;
    }
    function zeroFill(number, targetLength, forceSign) {
      var absNumber = "" + Math.abs(number), zerosToFill = targetLength - absNumber.length, sign2 = number >= 0;
      return (sign2 ? forceSign ? "+" : "" : "-") + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }
    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, formatFunctions = {}, formatTokenFunctions = {};
    function addFormatToken(token2, padded, ordinal2, callback) {
      var func = callback;
      if (typeof callback === "string") {
        func = function() {
          return this[callback]();
        };
      }
      if (token2) {
        formatTokenFunctions[token2] = func;
      }
      if (padded) {
        formatTokenFunctions[padded[0]] = function() {
          return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
        };
      }
      if (ordinal2) {
        formatTokenFunctions[ordinal2] = function() {
          return this.localeData().ordinal(func.apply(this, arguments), token2);
        };
      }
    }
    function removeFormattingTokens(input) {
      if (input.match(/\[[\s\S]/)) {
        return input.replace(/^\[|\]$/g, "");
      }
      return input.replace(/\\/g, "");
    }
    function makeFormatFunction(format2) {
      var array = format2.match(formattingTokens), i, length;
      for (i = 0, length = array.length;i < length; i++) {
        if (formatTokenFunctions[array[i]]) {
          array[i] = formatTokenFunctions[array[i]];
        } else {
          array[i] = removeFormattingTokens(array[i]);
        }
      }
      return function(mom) {
        var output = "", i2;
        for (i2 = 0;i2 < length; i2++) {
          output += isFunction(array[i2]) ? array[i2].call(mom, format2) : array[i2];
        }
        return output;
      };
    }
    function formatMoment(m, format2) {
      if (!m.isValid()) {
        return m.localeData().invalidDate();
      }
      format2 = expandFormat(format2, m.localeData());
      formatFunctions[format2] = formatFunctions[format2] || makeFormatFunction(format2);
      return formatFunctions[format2](m);
    }
    function expandFormat(format2, locale2) {
      var i = 5;
      function replaceLongDateFormatTokens(input) {
        return locale2.longDateFormat(input) || input;
      }
      localFormattingTokens.lastIndex = 0;
      while (i >= 0 && localFormattingTokens.test(format2)) {
        format2 = format2.replace(localFormattingTokens, replaceLongDateFormatTokens);
        localFormattingTokens.lastIndex = 0;
        i -= 1;
      }
      return format2;
    }
    var defaultLongDateFormat = {
      LTS: "h:mm:ss A",
      LT: "h:mm A",
      L: "MM/DD/YYYY",
      LL: "MMMM D, YYYY",
      LLL: "MMMM D, YYYY h:mm A",
      LLLL: "dddd, MMMM D, YYYY h:mm A"
    };
    function longDateFormat(key) {
      var format2 = this._longDateFormat[key], formatUpper = this._longDateFormat[key.toUpperCase()];
      if (format2 || !formatUpper) {
        return format2;
      }
      this._longDateFormat[key] = formatUpper.match(formattingTokens).map(function(tok) {
        if (tok === "MMMM" || tok === "MM" || tok === "DD" || tok === "dddd") {
          return tok.slice(1);
        }
        return tok;
      }).join("");
      return this._longDateFormat[key];
    }
    var defaultInvalidDate = "Invalid date";
    function invalidDate() {
      return this._invalidDate;
    }
    var defaultOrdinal = "%d", defaultDayOfMonthOrdinalParse = /\d{1,2}/;
    function ordinal(number) {
      return this._ordinal.replace("%d", number);
    }
    var defaultRelativeTime = {
      future: "in %s",
      past: "%s ago",
      s: "a few seconds",
      ss: "%d seconds",
      m: "a minute",
      mm: "%d minutes",
      h: "an hour",
      hh: "%d hours",
      d: "a day",
      dd: "%d days",
      w: "a week",
      ww: "%d weeks",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years"
    };
    function relativeTime(number, withoutSuffix, string, isFuture) {
      var output = this._relativeTime[string];
      return isFunction(output) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    }
    function pastFuture(diff2, output) {
      var format2 = this._relativeTime[diff2 > 0 ? "future" : "past"];
      return isFunction(format2) ? format2(output) : format2.replace(/%s/i, output);
    }
    var aliases = {
      D: "date",
      dates: "date",
      date: "date",
      d: "day",
      days: "day",
      day: "day",
      e: "weekday",
      weekdays: "weekday",
      weekday: "weekday",
      E: "isoWeekday",
      isoweekdays: "isoWeekday",
      isoweekday: "isoWeekday",
      DDD: "dayOfYear",
      dayofyears: "dayOfYear",
      dayofyear: "dayOfYear",
      h: "hour",
      hours: "hour",
      hour: "hour",
      ms: "millisecond",
      milliseconds: "millisecond",
      millisecond: "millisecond",
      m: "minute",
      minutes: "minute",
      minute: "minute",
      M: "month",
      months: "month",
      month: "month",
      Q: "quarter",
      quarters: "quarter",
      quarter: "quarter",
      s: "second",
      seconds: "second",
      second: "second",
      gg: "weekYear",
      weekyears: "weekYear",
      weekyear: "weekYear",
      GG: "isoWeekYear",
      isoweekyears: "isoWeekYear",
      isoweekyear: "isoWeekYear",
      w: "week",
      weeks: "week",
      week: "week",
      W: "isoWeek",
      isoweeks: "isoWeek",
      isoweek: "isoWeek",
      y: "year",
      years: "year",
      year: "year"
    };
    function normalizeUnits(units) {
      return typeof units === "string" ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }
    function normalizeObjectUnits(inputObject) {
      var normalizedInput = {}, normalizedProp, prop;
      for (prop in inputObject) {
        if (hasOwnProp(inputObject, prop)) {
          normalizedProp = normalizeUnits(prop);
          if (normalizedProp) {
            normalizedInput[normalizedProp] = inputObject[prop];
          }
        }
      }
      return normalizedInput;
    }
    var priorities = {
      date: 9,
      day: 11,
      weekday: 11,
      isoWeekday: 11,
      dayOfYear: 4,
      hour: 13,
      millisecond: 16,
      minute: 14,
      month: 8,
      quarter: 7,
      second: 15,
      weekYear: 1,
      isoWeekYear: 1,
      week: 5,
      isoWeek: 5,
      year: 1
    };
    function getPrioritizedUnits(unitsObj) {
      var units = [], u;
      for (u in unitsObj) {
        if (hasOwnProp(unitsObj, u)) {
          units.push({ unit: u, priority: priorities[u] });
        }
      }
      units.sort(function(a, b) {
        return a.priority - b.priority;
      });
      return units;
    }
    var match1 = /\d/, match2 = /\d\d/, match3 = /\d{3}/, match4 = /\d{4}/, match6 = /[+-]?\d{6}/, match1to2 = /\d\d?/, match3to4 = /\d\d\d\d?/, match5to6 = /\d\d\d\d\d\d?/, match1to3 = /\d{1,3}/, match1to4 = /\d{1,4}/, match1to6 = /[+-]?\d{1,6}/, matchUnsigned = /\d+/, matchSigned = /[+-]?\d+/, matchOffset = /Z|[+-]\d\d:?\d\d/gi, matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i, match1to2NoLeadingZero = /^[1-9]\d?/, match1to2HasZero = /^([1-9]\d|\d)/, regexes;
    regexes = {};
    function addRegexToken(token2, regex, strictRegex) {
      regexes[token2] = isFunction(regex) ? regex : function(isStrict, localeData2) {
        return isStrict && strictRegex ? strictRegex : regex;
      };
    }
    function getParseRegexForToken(token2, config) {
      if (!hasOwnProp(regexes, token2)) {
        return new RegExp(unescapeFormat(token2));
      }
      return regexes[token2](config._strict, config._locale);
    }
    function unescapeFormat(s) {
      return regexEscape(s.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
        return p1 || p2 || p3 || p4;
      }));
    }
    function regexEscape(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    function absFloor(number) {
      if (number < 0) {
        return Math.ceil(number) || 0;
      } else {
        return Math.floor(number);
      }
    }
    function toInt(argumentForCoercion) {
      var coercedNumber = +argumentForCoercion, value = 0;
      if (coercedNumber !== 0 && isFinite(coercedNumber)) {
        value = absFloor(coercedNumber);
      }
      return value;
    }
    var tokens = {};
    function addParseToken(token2, callback) {
      var i, func = callback, tokenLen;
      if (typeof token2 === "string") {
        token2 = [token2];
      }
      if (isNumber(callback)) {
        func = function(input, array) {
          array[callback] = toInt(input);
        };
      }
      tokenLen = token2.length;
      for (i = 0;i < tokenLen; i++) {
        tokens[token2[i]] = func;
      }
    }
    function addWeekParseToken(token2, callback) {
      addParseToken(token2, function(input, array, config, token3) {
        config._w = config._w || {};
        callback(input, config._w, config, token3);
      });
    }
    function addTimeToArrayFromToken(token2, input, config) {
      if (input != null && hasOwnProp(tokens, token2)) {
        tokens[token2](input, config._a, config, token2);
      }
    }
    function isLeapYear(year) {
      return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }
    var YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, WEEK = 7, WEEKDAY = 8;
    addFormatToken("Y", 0, 0, function() {
      var y = this.year();
      return y <= 9999 ? zeroFill(y, 4) : "+" + y;
    });
    addFormatToken(0, ["YY", 2], 0, function() {
      return this.year() % 100;
    });
    addFormatToken(0, ["YYYY", 4], 0, "year");
    addFormatToken(0, ["YYYYY", 5], 0, "year");
    addFormatToken(0, ["YYYYYY", 6, true], 0, "year");
    addRegexToken("Y", matchSigned);
    addRegexToken("YY", match1to2, match2);
    addRegexToken("YYYY", match1to4, match4);
    addRegexToken("YYYYY", match1to6, match6);
    addRegexToken("YYYYYY", match1to6, match6);
    addParseToken(["YYYYY", "YYYYYY"], YEAR);
    addParseToken("YYYY", function(input, array) {
      array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken("YY", function(input, array) {
      array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken("Y", function(input, array) {
      array[YEAR] = parseInt(input, 10);
    });
    function daysInYear(year) {
      return isLeapYear(year) ? 366 : 365;
    }
    hooks.parseTwoDigitYear = function(input) {
      return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };
    var getSetYear = makeGetSet("FullYear", true);
    function getIsLeapYear() {
      return isLeapYear(this.year());
    }
    function makeGetSet(unit, keepTime) {
      return function(value) {
        if (value != null) {
          set$1(this, unit, value);
          hooks.updateOffset(this, keepTime);
          return this;
        } else {
          return get(this, unit);
        }
      };
    }
    function get(mom, unit) {
      if (!mom.isValid()) {
        return NaN;
      }
      var { _d: d, _isUTC: isUTC } = mom;
      switch (unit) {
        case "Milliseconds":
          return isUTC ? d.getUTCMilliseconds() : d.getMilliseconds();
        case "Seconds":
          return isUTC ? d.getUTCSeconds() : d.getSeconds();
        case "Minutes":
          return isUTC ? d.getUTCMinutes() : d.getMinutes();
        case "Hours":
          return isUTC ? d.getUTCHours() : d.getHours();
        case "Date":
          return isUTC ? d.getUTCDate() : d.getDate();
        case "Day":
          return isUTC ? d.getUTCDay() : d.getDay();
        case "Month":
          return isUTC ? d.getUTCMonth() : d.getMonth();
        case "FullYear":
          return isUTC ? d.getUTCFullYear() : d.getFullYear();
        default:
          return NaN;
      }
    }
    function set$1(mom, unit, value) {
      var d, isUTC, year, month, date;
      if (!mom.isValid() || isNaN(value)) {
        return;
      }
      d = mom._d;
      isUTC = mom._isUTC;
      switch (unit) {
        case "Milliseconds":
          return void (isUTC ? d.setUTCMilliseconds(value) : d.setMilliseconds(value));
        case "Seconds":
          return void (isUTC ? d.setUTCSeconds(value) : d.setSeconds(value));
        case "Minutes":
          return void (isUTC ? d.setUTCMinutes(value) : d.setMinutes(value));
        case "Hours":
          return void (isUTC ? d.setUTCHours(value) : d.setHours(value));
        case "Date":
          return void (isUTC ? d.setUTCDate(value) : d.setDate(value));
        case "FullYear":
          break;
        default:
          return;
      }
      year = value;
      month = mom.month();
      date = mom.date();
      date = date === 29 && month === 1 && !isLeapYear(year) ? 28 : date;
      isUTC ? d.setUTCFullYear(year, month, date) : d.setFullYear(year, month, date);
    }
    function stringGet(units) {
      units = normalizeUnits(units);
      if (isFunction(this[units])) {
        return this[units]();
      }
      return this;
    }
    function stringSet(units, value) {
      if (typeof units === "object") {
        units = normalizeObjectUnits(units);
        var prioritized = getPrioritizedUnits(units), i, prioritizedLen = prioritized.length;
        for (i = 0;i < prioritizedLen; i++) {
          this[prioritized[i].unit](units[prioritized[i].unit]);
        }
      } else {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
          return this[units](value);
        }
      }
      return this;
    }
    function mod(n, x) {
      return (n % x + x) % x;
    }
    var indexOf;
    if (Array.prototype.indexOf) {
      indexOf = Array.prototype.indexOf;
    } else {
      indexOf = function(o) {
        var i;
        for (i = 0;i < this.length; ++i) {
          if (this[i] === o) {
            return i;
          }
        }
        return -1;
      };
    }
    function daysInMonth(year, month) {
      if (isNaN(year) || isNaN(month)) {
        return NaN;
      }
      var modMonth = mod(month, 12);
      year += (month - modMonth) / 12;
      return modMonth === 1 ? isLeapYear(year) ? 29 : 28 : 31 - modMonth % 7 % 2;
    }
    addFormatToken("M", ["MM", 2], "Mo", function() {
      return this.month() + 1;
    });
    addFormatToken("MMM", 0, 0, function(format2) {
      return this.localeData().monthsShort(this, format2);
    });
    addFormatToken("MMMM", 0, 0, function(format2) {
      return this.localeData().months(this, format2);
    });
    addRegexToken("M", match1to2, match1to2NoLeadingZero);
    addRegexToken("MM", match1to2, match2);
    addRegexToken("MMM", function(isStrict, locale2) {
      return locale2.monthsShortRegex(isStrict);
    });
    addRegexToken("MMMM", function(isStrict, locale2) {
      return locale2.monthsRegex(isStrict);
    });
    addParseToken(["M", "MM"], function(input, array) {
      array[MONTH] = toInt(input) - 1;
    });
    addParseToken(["MMM", "MMMM"], function(input, array, config, token2) {
      var month = config._locale.monthsParse(input, token2, config._strict);
      if (month != null) {
        array[MONTH] = month;
      } else {
        getParsingFlags(config).invalidMonth = input;
      }
    });
    var defaultLocaleMonths = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), defaultLocaleMonthsShort = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/, defaultMonthsShortRegex = matchWord, defaultMonthsRegex = matchWord;
    function localeMonths(m, format2) {
      if (!m) {
        return isArray(this._months) ? this._months : this._months["standalone"];
      }
      return isArray(this._months) ? this._months[m.month()] : this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format2) ? "format" : "standalone"][m.month()];
    }
    function localeMonthsShort(m, format2) {
      if (!m) {
        return isArray(this._monthsShort) ? this._monthsShort : this._monthsShort["standalone"];
      }
      return isArray(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format2) ? "format" : "standalone"][m.month()];
    }
    function handleStrictParse(monthName, format2, strict) {
      var i, ii, mom, llc = monthName.toLocaleLowerCase();
      if (!this._monthsParse) {
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
        for (i = 0;i < 12; ++i) {
          mom = createUTC([2000, i]);
          this._shortMonthsParse[i] = this.monthsShort(mom, "").toLocaleLowerCase();
          this._longMonthsParse[i] = this.months(mom, "").toLocaleLowerCase();
        }
      }
      if (strict) {
        if (format2 === "MMM") {
          ii = indexOf.call(this._shortMonthsParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf.call(this._longMonthsParse, llc);
          return ii !== -1 ? ii : null;
        }
      } else {
        if (format2 === "MMM") {
          ii = indexOf.call(this._shortMonthsParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._longMonthsParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf.call(this._longMonthsParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._shortMonthsParse, llc);
          return ii !== -1 ? ii : null;
        }
      }
    }
    function localeMonthsParse(monthName, format2, strict) {
      var i, mom, regex;
      if (this._monthsParseExact) {
        return handleStrictParse.call(this, monthName, format2, strict);
      }
      if (!this._monthsParse) {
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
      }
      for (i = 0;i < 12; i++) {
        mom = createUTC([2000, i]);
        if (strict && !this._longMonthsParse[i]) {
          this._longMonthsParse[i] = new RegExp("^" + this.months(mom, "").replace(".", "") + "$", "i");
          this._shortMonthsParse[i] = new RegExp("^" + this.monthsShort(mom, "").replace(".", "") + "$", "i");
        }
        if (!strict && !this._monthsParse[i]) {
          regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
          this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i");
        }
        if (strict && format2 === "MMMM" && this._longMonthsParse[i].test(monthName)) {
          return i;
        } else if (strict && format2 === "MMM" && this._shortMonthsParse[i].test(monthName)) {
          return i;
        } else if (!strict && this._monthsParse[i].test(monthName)) {
          return i;
        }
      }
    }
    function setMonth(mom, value) {
      if (!mom.isValid()) {
        return mom;
      }
      if (typeof value === "string") {
        if (/^\d+$/.test(value)) {
          value = toInt(value);
        } else {
          value = mom.localeData().monthsParse(value);
          if (!isNumber(value)) {
            return mom;
          }
        }
      }
      var month = value, date = mom.date();
      date = date < 29 ? date : Math.min(date, daysInMonth(mom.year(), month));
      mom._isUTC ? mom._d.setUTCMonth(month, date) : mom._d.setMonth(month, date);
      return mom;
    }
    function getSetMonth(value) {
      if (value != null) {
        setMonth(this, value);
        hooks.updateOffset(this, true);
        return this;
      } else {
        return get(this, "Month");
      }
    }
    function getDaysInMonth() {
      return daysInMonth(this.year(), this.month());
    }
    function monthsShortRegex(isStrict) {
      if (this._monthsParseExact) {
        if (!hasOwnProp(this, "_monthsRegex")) {
          computeMonthsParse.call(this);
        }
        if (isStrict) {
          return this._monthsShortStrictRegex;
        } else {
          return this._monthsShortRegex;
        }
      } else {
        if (!hasOwnProp(this, "_monthsShortRegex")) {
          this._monthsShortRegex = defaultMonthsShortRegex;
        }
        return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
      }
    }
    function monthsRegex(isStrict) {
      if (this._monthsParseExact) {
        if (!hasOwnProp(this, "_monthsRegex")) {
          computeMonthsParse.call(this);
        }
        if (isStrict) {
          return this._monthsStrictRegex;
        } else {
          return this._monthsRegex;
        }
      } else {
        if (!hasOwnProp(this, "_monthsRegex")) {
          this._monthsRegex = defaultMonthsRegex;
        }
        return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
      }
    }
    function computeMonthsParse() {
      function cmpLenRev(a, b) {
        return b.length - a.length;
      }
      var shortPieces = [], longPieces = [], mixedPieces = [], i, mom, shortP, longP;
      for (i = 0;i < 12; i++) {
        mom = createUTC([2000, i]);
        shortP = regexEscape(this.monthsShort(mom, ""));
        longP = regexEscape(this.months(mom, ""));
        shortPieces.push(shortP);
        longPieces.push(longP);
        mixedPieces.push(longP);
        mixedPieces.push(shortP);
      }
      shortPieces.sort(cmpLenRev);
      longPieces.sort(cmpLenRev);
      mixedPieces.sort(cmpLenRev);
      this._monthsRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
      this._monthsShortRegex = this._monthsRegex;
      this._monthsStrictRegex = new RegExp("^(" + longPieces.join("|") + ")", "i");
      this._monthsShortStrictRegex = new RegExp("^(" + shortPieces.join("|") + ")", "i");
    }
    function createDate(y, m, d, h, M, s, ms) {
      var date;
      if (y < 100 && y >= 0) {
        date = new Date(y + 400, m, d, h, M, s, ms);
        if (isFinite(date.getFullYear())) {
          date.setFullYear(y);
        }
      } else {
        date = new Date(y, m, d, h, M, s, ms);
      }
      return date;
    }
    function createUTCDate(y) {
      var date, args;
      if (y < 100 && y >= 0) {
        args = Array.prototype.slice.call(arguments);
        args[0] = y + 400;
        date = new Date(Date.UTC.apply(null, args));
        if (isFinite(date.getUTCFullYear())) {
          date.setUTCFullYear(y);
        }
      } else {
        date = new Date(Date.UTC.apply(null, arguments));
      }
      return date;
    }
    function firstWeekOffset(year, dow, doy) {
      var fwd = 7 + dow - doy, fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
      return -fwdlw + fwd - 1;
    }
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
      var localWeekday = (7 + weekday - dow) % 7, weekOffset = firstWeekOffset(year, dow, doy), dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset, resYear, resDayOfYear;
      if (dayOfYear <= 0) {
        resYear = year - 1;
        resDayOfYear = daysInYear(resYear) + dayOfYear;
      } else if (dayOfYear > daysInYear(year)) {
        resYear = year + 1;
        resDayOfYear = dayOfYear - daysInYear(year);
      } else {
        resYear = year;
        resDayOfYear = dayOfYear;
      }
      return {
        year: resYear,
        dayOfYear: resDayOfYear
      };
    }
    function weekOfYear(mom, dow, doy) {
      var weekOffset = firstWeekOffset(mom.year(), dow, doy), week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1, resWeek, resYear;
      if (week < 1) {
        resYear = mom.year() - 1;
        resWeek = week + weeksInYear(resYear, dow, doy);
      } else if (week > weeksInYear(mom.year(), dow, doy)) {
        resWeek = week - weeksInYear(mom.year(), dow, doy);
        resYear = mom.year() + 1;
      } else {
        resYear = mom.year();
        resWeek = week;
      }
      return {
        week: resWeek,
        year: resYear
      };
    }
    function weeksInYear(year, dow, doy) {
      var weekOffset = firstWeekOffset(year, dow, doy), weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
      return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }
    addFormatToken("w", ["ww", 2], "wo", "week");
    addFormatToken("W", ["WW", 2], "Wo", "isoWeek");
    addRegexToken("w", match1to2, match1to2NoLeadingZero);
    addRegexToken("ww", match1to2, match2);
    addRegexToken("W", match1to2, match1to2NoLeadingZero);
    addRegexToken("WW", match1to2, match2);
    addWeekParseToken(["w", "ww", "W", "WW"], function(input, week, config, token2) {
      week[token2.substr(0, 1)] = toInt(input);
    });
    function localeWeek(mom) {
      return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }
    var defaultLocaleWeek = {
      dow: 0,
      doy: 6
    };
    function localeFirstDayOfWeek() {
      return this._week.dow;
    }
    function localeFirstDayOfYear() {
      return this._week.doy;
    }
    function getSetWeek(input) {
      var week = this.localeData().week(this);
      return input == null ? week : this.add((input - week) * 7, "d");
    }
    function getSetISOWeek(input) {
      var week = weekOfYear(this, 1, 4).week;
      return input == null ? week : this.add((input - week) * 7, "d");
    }
    addFormatToken("d", 0, "do", "day");
    addFormatToken("dd", 0, 0, function(format2) {
      return this.localeData().weekdaysMin(this, format2);
    });
    addFormatToken("ddd", 0, 0, function(format2) {
      return this.localeData().weekdaysShort(this, format2);
    });
    addFormatToken("dddd", 0, 0, function(format2) {
      return this.localeData().weekdays(this, format2);
    });
    addFormatToken("e", 0, 0, "weekday");
    addFormatToken("E", 0, 0, "isoWeekday");
    addRegexToken("d", match1to2);
    addRegexToken("e", match1to2);
    addRegexToken("E", match1to2);
    addRegexToken("dd", function(isStrict, locale2) {
      return locale2.weekdaysMinRegex(isStrict);
    });
    addRegexToken("ddd", function(isStrict, locale2) {
      return locale2.weekdaysShortRegex(isStrict);
    });
    addRegexToken("dddd", function(isStrict, locale2) {
      return locale2.weekdaysRegex(isStrict);
    });
    addWeekParseToken(["dd", "ddd", "dddd"], function(input, week, config, token2) {
      var weekday = config._locale.weekdaysParse(input, token2, config._strict);
      if (weekday != null) {
        week.d = weekday;
      } else {
        getParsingFlags(config).invalidWeekday = input;
      }
    });
    addWeekParseToken(["d", "e", "E"], function(input, week, config, token2) {
      week[token2] = toInt(input);
    });
    function parseWeekday(input, locale2) {
      if (typeof input !== "string") {
        return input;
      }
      if (!isNaN(input)) {
        return parseInt(input, 10);
      }
      input = locale2.weekdaysParse(input);
      if (typeof input === "number") {
        return input;
      }
      return null;
    }
    function parseIsoWeekday(input, locale2) {
      if (typeof input === "string") {
        return locale2.weekdaysParse(input) % 7 || 7;
      }
      return isNaN(input) ? null : input;
    }
    function shiftWeekdays(ws, n) {
      return ws.slice(n, 7).concat(ws.slice(0, n));
    }
    var defaultLocaleWeekdays = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), defaultLocaleWeekdaysShort = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), defaultLocaleWeekdaysMin = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), defaultWeekdaysRegex = matchWord, defaultWeekdaysShortRegex = matchWord, defaultWeekdaysMinRegex = matchWord;
    function localeWeekdays(m, format2) {
      var weekdays = isArray(this._weekdays) ? this._weekdays : this._weekdays[m && m !== true && this._weekdays.isFormat.test(format2) ? "format" : "standalone"];
      return m === true ? shiftWeekdays(weekdays, this._week.dow) : m ? weekdays[m.day()] : weekdays;
    }
    function localeWeekdaysShort(m) {
      return m === true ? shiftWeekdays(this._weekdaysShort, this._week.dow) : m ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }
    function localeWeekdaysMin(m) {
      return m === true ? shiftWeekdays(this._weekdaysMin, this._week.dow) : m ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }
    function handleStrictParse$1(weekdayName, format2, strict) {
      var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._minWeekdaysParse = [];
        for (i = 0;i < 7; ++i) {
          mom = createUTC([2000, 1]).day(i);
          this._minWeekdaysParse[i] = this.weekdaysMin(mom, "").toLocaleLowerCase();
          this._shortWeekdaysParse[i] = this.weekdaysShort(mom, "").toLocaleLowerCase();
          this._weekdaysParse[i] = this.weekdays(mom, "").toLocaleLowerCase();
        }
      }
      if (strict) {
        if (format2 === "dddd") {
          ii = indexOf.call(this._weekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else if (format2 === "ddd") {
          ii = indexOf.call(this._shortWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf.call(this._minWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        }
      } else {
        if (format2 === "dddd") {
          ii = indexOf.call(this._weekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._shortWeekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._minWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else if (format2 === "ddd") {
          ii = indexOf.call(this._shortWeekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._weekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._minWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf.call(this._minWeekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._weekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf.call(this._shortWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        }
      }
    }
    function localeWeekdaysParse(weekdayName, format2, strict) {
      var i, mom, regex;
      if (this._weekdaysParseExact) {
        return handleStrictParse$1.call(this, weekdayName, format2, strict);
      }
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._minWeekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._fullWeekdaysParse = [];
      }
      for (i = 0;i < 7; i++) {
        mom = createUTC([2000, 1]).day(i);
        if (strict && !this._fullWeekdaysParse[i]) {
          this._fullWeekdaysParse[i] = new RegExp("^" + this.weekdays(mom, "").replace(".", "\\.?") + "$", "i");
          this._shortWeekdaysParse[i] = new RegExp("^" + this.weekdaysShort(mom, "").replace(".", "\\.?") + "$", "i");
          this._minWeekdaysParse[i] = new RegExp("^" + this.weekdaysMin(mom, "").replace(".", "\\.?") + "$", "i");
        }
        if (!this._weekdaysParse[i]) {
          regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
          this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i");
        }
        if (strict && format2 === "dddd" && this._fullWeekdaysParse[i].test(weekdayName)) {
          return i;
        } else if (strict && format2 === "ddd" && this._shortWeekdaysParse[i].test(weekdayName)) {
          return i;
        } else if (strict && format2 === "dd" && this._minWeekdaysParse[i].test(weekdayName)) {
          return i;
        } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
          return i;
        }
      }
    }
    function getSetDayOfWeek(input) {
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      var day = get(this, "Day");
      if (input != null) {
        input = parseWeekday(input, this.localeData());
        return this.add(input - day, "d");
      } else {
        return day;
      }
    }
    function getSetLocaleDayOfWeek(input) {
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
      return input == null ? weekday : this.add(input - weekday, "d");
    }
    function getSetISODayOfWeek(input) {
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      if (input != null) {
        var weekday = parseIsoWeekday(input, this.localeData());
        return this.day(this.day() % 7 ? weekday : weekday - 7);
      } else {
        return this.day() || 7;
      }
    }
    function weekdaysRegex(isStrict) {
      if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, "_weekdaysRegex")) {
          computeWeekdaysParse.call(this);
        }
        if (isStrict) {
          return this._weekdaysStrictRegex;
        } else {
          return this._weekdaysRegex;
        }
      } else {
        if (!hasOwnProp(this, "_weekdaysRegex")) {
          this._weekdaysRegex = defaultWeekdaysRegex;
        }
        return this._weekdaysStrictRegex && isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
      }
    }
    function weekdaysShortRegex(isStrict) {
      if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, "_weekdaysRegex")) {
          computeWeekdaysParse.call(this);
        }
        if (isStrict) {
          return this._weekdaysShortStrictRegex;
        } else {
          return this._weekdaysShortRegex;
        }
      } else {
        if (!hasOwnProp(this, "_weekdaysShortRegex")) {
          this._weekdaysShortRegex = defaultWeekdaysShortRegex;
        }
        return this._weekdaysShortStrictRegex && isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
      }
    }
    function weekdaysMinRegex(isStrict) {
      if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, "_weekdaysRegex")) {
          computeWeekdaysParse.call(this);
        }
        if (isStrict) {
          return this._weekdaysMinStrictRegex;
        } else {
          return this._weekdaysMinRegex;
        }
      } else {
        if (!hasOwnProp(this, "_weekdaysMinRegex")) {
          this._weekdaysMinRegex = defaultWeekdaysMinRegex;
        }
        return this._weekdaysMinStrictRegex && isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
      }
    }
    function computeWeekdaysParse() {
      function cmpLenRev(a, b) {
        return b.length - a.length;
      }
      var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [], i, mom, minp, shortp, longp;
      for (i = 0;i < 7; i++) {
        mom = createUTC([2000, 1]).day(i);
        minp = regexEscape(this.weekdaysMin(mom, ""));
        shortp = regexEscape(this.weekdaysShort(mom, ""));
        longp = regexEscape(this.weekdays(mom, ""));
        minPieces.push(minp);
        shortPieces.push(shortp);
        longPieces.push(longp);
        mixedPieces.push(minp);
        mixedPieces.push(shortp);
        mixedPieces.push(longp);
      }
      minPieces.sort(cmpLenRev);
      shortPieces.sort(cmpLenRev);
      longPieces.sort(cmpLenRev);
      mixedPieces.sort(cmpLenRev);
      this._weekdaysRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
      this._weekdaysShortRegex = this._weekdaysRegex;
      this._weekdaysMinRegex = this._weekdaysRegex;
      this._weekdaysStrictRegex = new RegExp("^(" + longPieces.join("|") + ")", "i");
      this._weekdaysShortStrictRegex = new RegExp("^(" + shortPieces.join("|") + ")", "i");
      this._weekdaysMinStrictRegex = new RegExp("^(" + minPieces.join("|") + ")", "i");
    }
    function hFormat() {
      return this.hours() % 12 || 12;
    }
    function kFormat() {
      return this.hours() || 24;
    }
    addFormatToken("H", ["HH", 2], 0, "hour");
    addFormatToken("h", ["hh", 2], 0, hFormat);
    addFormatToken("k", ["kk", 2], 0, kFormat);
    addFormatToken("hmm", 0, 0, function() {
      return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });
    addFormatToken("hmmss", 0, 0, function() {
      return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });
    addFormatToken("Hmm", 0, 0, function() {
      return "" + this.hours() + zeroFill(this.minutes(), 2);
    });
    addFormatToken("Hmmss", 0, 0, function() {
      return "" + this.hours() + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });
    function meridiem(token2, lowercase) {
      addFormatToken(token2, 0, 0, function() {
        return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
      });
    }
    meridiem("a", true);
    meridiem("A", false);
    function matchMeridiem(isStrict, locale2) {
      return locale2._meridiemParse;
    }
    addRegexToken("a", matchMeridiem);
    addRegexToken("A", matchMeridiem);
    addRegexToken("H", match1to2, match1to2HasZero);
    addRegexToken("h", match1to2, match1to2NoLeadingZero);
    addRegexToken("k", match1to2, match1to2NoLeadingZero);
    addRegexToken("HH", match1to2, match2);
    addRegexToken("hh", match1to2, match2);
    addRegexToken("kk", match1to2, match2);
    addRegexToken("hmm", match3to4);
    addRegexToken("hmmss", match5to6);
    addRegexToken("Hmm", match3to4);
    addRegexToken("Hmmss", match5to6);
    addParseToken(["H", "HH"], HOUR);
    addParseToken(["k", "kk"], function(input, array, config) {
      var kInput = toInt(input);
      array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(["a", "A"], function(input, array, config) {
      config._isPm = config._locale.isPM(input);
      config._meridiem = input;
    });
    addParseToken(["h", "hh"], function(input, array, config) {
      array[HOUR] = toInt(input);
      getParsingFlags(config).bigHour = true;
    });
    addParseToken("hmm", function(input, array, config) {
      var pos = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos));
      array[MINUTE] = toInt(input.substr(pos));
      getParsingFlags(config).bigHour = true;
    });
    addParseToken("hmmss", function(input, array, config) {
      var pos1 = input.length - 4, pos2 = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos1));
      array[MINUTE] = toInt(input.substr(pos1, 2));
      array[SECOND] = toInt(input.substr(pos2));
      getParsingFlags(config).bigHour = true;
    });
    addParseToken("Hmm", function(input, array, config) {
      var pos = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos));
      array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken("Hmmss", function(input, array, config) {
      var pos1 = input.length - 4, pos2 = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos1));
      array[MINUTE] = toInt(input.substr(pos1, 2));
      array[SECOND] = toInt(input.substr(pos2));
    });
    function localeIsPM(input) {
      return (input + "").toLowerCase().charAt(0) === "p";
    }
    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i, getSetHour = makeGetSet("Hours", true);
    function localeMeridiem(hours2, minutes2, isLower) {
      if (hours2 > 11) {
        return isLower ? "pm" : "PM";
      } else {
        return isLower ? "am" : "AM";
      }
    }
    var baseConfig = {
      calendar: defaultCalendar,
      longDateFormat: defaultLongDateFormat,
      invalidDate: defaultInvalidDate,
      ordinal: defaultOrdinal,
      dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
      relativeTime: defaultRelativeTime,
      months: defaultLocaleMonths,
      monthsShort: defaultLocaleMonthsShort,
      week: defaultLocaleWeek,
      weekdays: defaultLocaleWeekdays,
      weekdaysMin: defaultLocaleWeekdaysMin,
      weekdaysShort: defaultLocaleWeekdaysShort,
      meridiemParse: defaultLocaleMeridiemParse
    };
    var locales = {}, localeFamilies = {}, globalLocale;
    function commonPrefix(arr1, arr2) {
      var i, minl = Math.min(arr1.length, arr2.length);
      for (i = 0;i < minl; i += 1) {
        if (arr1[i] !== arr2[i]) {
          return i;
        }
      }
      return minl;
    }
    function normalizeLocale(key) {
      return key ? key.toLowerCase().replace("_", "-") : key;
    }
    function chooseLocale(names) {
      var i = 0, j, next, locale2, split;
      while (i < names.length) {
        split = normalizeLocale(names[i]).split("-");
        j = split.length;
        next = normalizeLocale(names[i + 1]);
        next = next ? next.split("-") : null;
        while (j > 0) {
          locale2 = loadLocale(split.slice(0, j).join("-"));
          if (locale2) {
            return locale2;
          }
          if (next && next.length >= j && commonPrefix(split, next) >= j - 1) {
            break;
          }
          j--;
        }
        i++;
      }
      return globalLocale;
    }
    function isLocaleNameSane(name) {
      return !!(name && name.match("^[^/\\\\]*$"));
    }
    function loadLocale(name) {
      var oldLocale = null, aliasedRequire;
      if (locales[name] === undefined && typeof module !== "undefined" && module && module.exports && isLocaleNameSane(name)) {
        try {
          oldLocale = globalLocale._abbr;
          aliasedRequire = import.meta.require;
          aliasedRequire("./locale/" + name);
          getSetGlobalLocale(oldLocale);
        } catch (e) {
          locales[name] = null;
        }
      }
      return locales[name];
    }
    function getSetGlobalLocale(key, values) {
      var data;
      if (key) {
        if (isUndefined(values)) {
          data = getLocale(key);
        } else {
          data = defineLocale(key, values);
        }
        if (data) {
          globalLocale = data;
        } else {
          if (typeof console !== "undefined" && console.warn) {
            console.warn("Locale " + key + " not found. Did you forget to load it?");
          }
        }
      }
      return globalLocale._abbr;
    }
    function defineLocale(name, config) {
      if (config !== null) {
        var locale2, parentConfig = baseConfig;
        config.abbr = name;
        if (locales[name] != null) {
          deprecateSimple("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change " + "an existing locale. moment.defineLocale(localeName, " + "config) should only be used for creating a new locale " + "See http://momentjs.com/guides/#/warnings/define-locale/ for more info.");
          parentConfig = locales[name]._config;
        } else if (config.parentLocale != null) {
          if (locales[config.parentLocale] != null) {
            parentConfig = locales[config.parentLocale]._config;
          } else {
            locale2 = loadLocale(config.parentLocale);
            if (locale2 != null) {
              parentConfig = locale2._config;
            } else {
              if (!localeFamilies[config.parentLocale]) {
                localeFamilies[config.parentLocale] = [];
              }
              localeFamilies[config.parentLocale].push({
                name,
                config
              });
              return null;
            }
          }
        }
        locales[name] = new Locale(mergeConfigs(parentConfig, config));
        if (localeFamilies[name]) {
          localeFamilies[name].forEach(function(x) {
            defineLocale(x.name, x.config);
          });
        }
        getSetGlobalLocale(name);
        return locales[name];
      } else {
        delete locales[name];
        return null;
      }
    }
    function updateLocale(name, config) {
      if (config != null) {
        var locale2, tmpLocale, parentConfig = baseConfig;
        if (locales[name] != null && locales[name].parentLocale != null) {
          locales[name].set(mergeConfigs(locales[name]._config, config));
        } else {
          tmpLocale = loadLocale(name);
          if (tmpLocale != null) {
            parentConfig = tmpLocale._config;
          }
          config = mergeConfigs(parentConfig, config);
          if (tmpLocale == null) {
            config.abbr = name;
          }
          locale2 = new Locale(config);
          locale2.parentLocale = locales[name];
          locales[name] = locale2;
        }
        getSetGlobalLocale(name);
      } else {
        if (locales[name] != null) {
          if (locales[name].parentLocale != null) {
            locales[name] = locales[name].parentLocale;
            if (name === getSetGlobalLocale()) {
              getSetGlobalLocale(name);
            }
          } else if (locales[name] != null) {
            delete locales[name];
          }
        }
      }
      return locales[name];
    }
    function getLocale(key) {
      var locale2;
      if (key && key._locale && key._locale._abbr) {
        key = key._locale._abbr;
      }
      if (!key) {
        return globalLocale;
      }
      if (!isArray(key)) {
        locale2 = loadLocale(key);
        if (locale2) {
          return locale2;
        }
        key = [key];
      }
      return chooseLocale(key);
    }
    function listLocales() {
      return keys(locales);
    }
    function checkOverflow(m) {
      var overflow, a = m._a;
      if (a && getParsingFlags(m).overflow === -2) {
        overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;
        if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
          overflow = DATE;
        }
        if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
          overflow = WEEK;
        }
        if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
          overflow = WEEKDAY;
        }
        getParsingFlags(m).overflow = overflow;
      }
      return m;
    }
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, tzRegex = /Z|[+-]\d\d(?::?\d\d)?/, isoDates = [
      ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
      ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
      ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
      ["GGGG-[W]WW", /\d{4}-W\d\d/, false],
      ["YYYY-DDD", /\d{4}-\d{3}/],
      ["YYYY-MM", /\d{4}-\d\d/, false],
      ["YYYYYYMMDD", /[+-]\d{10}/],
      ["YYYYMMDD", /\d{8}/],
      ["GGGG[W]WWE", /\d{4}W\d{3}/],
      ["GGGG[W]WW", /\d{4}W\d{2}/, false],
      ["YYYYDDD", /\d{7}/],
      ["YYYYMM", /\d{6}/, false],
      ["YYYY", /\d{4}/, false]
    ], isoTimes = [
      ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
      ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
      ["HH:mm:ss", /\d\d:\d\d:\d\d/],
      ["HH:mm", /\d\d:\d\d/],
      ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
      ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
      ["HHmmss", /\d\d\d\d\d\d/],
      ["HHmm", /\d\d\d\d/],
      ["HH", /\d\d/]
    ], aspNetJsonRegex = /^\/?Date\((-?\d+)/i, rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/, obsOffsets = {
      UT: 0,
      GMT: 0,
      EDT: -4 * 60,
      EST: -5 * 60,
      CDT: -5 * 60,
      CST: -6 * 60,
      MDT: -6 * 60,
      MST: -7 * 60,
      PDT: -7 * 60,
      PST: -8 * 60
    };
    function configFromISO(config) {
      var i, l, string = config._i, match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string), allowTime, dateFormat, timeFormat, tzFormat, isoDatesLen = isoDates.length, isoTimesLen = isoTimes.length;
      if (match) {
        getParsingFlags(config).iso = true;
        for (i = 0, l = isoDatesLen;i < l; i++) {
          if (isoDates[i][1].exec(match[1])) {
            dateFormat = isoDates[i][0];
            allowTime = isoDates[i][2] !== false;
            break;
          }
        }
        if (dateFormat == null) {
          config._isValid = false;
          return;
        }
        if (match[3]) {
          for (i = 0, l = isoTimesLen;i < l; i++) {
            if (isoTimes[i][1].exec(match[3])) {
              timeFormat = (match[2] || " ") + isoTimes[i][0];
              break;
            }
          }
          if (timeFormat == null) {
            config._isValid = false;
            return;
          }
        }
        if (!allowTime && timeFormat != null) {
          config._isValid = false;
          return;
        }
        if (match[4]) {
          if (tzRegex.exec(match[4])) {
            tzFormat = "Z";
          } else {
            config._isValid = false;
            return;
          }
        }
        config._f = dateFormat + (timeFormat || "") + (tzFormat || "");
        configFromStringAndFormat(config);
      } else {
        config._isValid = false;
      }
    }
    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
      var result = [
        untruncateYear(yearStr),
        defaultLocaleMonthsShort.indexOf(monthStr),
        parseInt(dayStr, 10),
        parseInt(hourStr, 10),
        parseInt(minuteStr, 10)
      ];
      if (secondStr) {
        result.push(parseInt(secondStr, 10));
      }
      return result;
    }
    function untruncateYear(yearStr) {
      var year = parseInt(yearStr, 10);
      if (year <= 49) {
        return 2000 + year;
      } else if (year <= 999) {
        return 1900 + year;
      }
      return year;
    }
    function preprocessRFC2822(s) {
      return s.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "");
    }
    function checkWeekday(weekdayStr, parsedInput, config) {
      if (weekdayStr) {
        var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr), weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
        if (weekdayProvided !== weekdayActual) {
          getParsingFlags(config).weekdayMismatch = true;
          config._isValid = false;
          return false;
        }
      }
      return true;
    }
    function calculateOffset(obsOffset, militaryOffset, numOffset) {
      if (obsOffset) {
        return obsOffsets[obsOffset];
      } else if (militaryOffset) {
        return 0;
      } else {
        var hm = parseInt(numOffset, 10), m = hm % 100, h = (hm - m) / 100;
        return h * 60 + m;
      }
    }
    function configFromRFC2822(config) {
      var match = rfc2822.exec(preprocessRFC2822(config._i)), parsedArray;
      if (match) {
        parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
        if (!checkWeekday(match[1], parsedArray, config)) {
          return;
        }
        config._a = parsedArray;
        config._tzm = calculateOffset(match[8], match[9], match[10]);
        config._d = createUTCDate.apply(null, config._a);
        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        getParsingFlags(config).rfc2822 = true;
      } else {
        config._isValid = false;
      }
    }
    function configFromString(config) {
      var matched = aspNetJsonRegex.exec(config._i);
      if (matched !== null) {
        config._d = new Date(+matched[1]);
        return;
      }
      configFromISO(config);
      if (config._isValid === false) {
        delete config._isValid;
      } else {
        return;
      }
      configFromRFC2822(config);
      if (config._isValid === false) {
        delete config._isValid;
      } else {
        return;
      }
      if (config._strict) {
        config._isValid = false;
      } else {
        hooks.createFromInputFallback(config);
      }
    }
    hooks.createFromInputFallback = deprecate("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), " + "which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are " + "discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function(config) {
      config._d = new Date(config._i + (config._useUTC ? " UTC" : ""));
    });
    function defaults(a, b, c) {
      if (a != null) {
        return a;
      }
      if (b != null) {
        return b;
      }
      return c;
    }
    function currentDateArray(config) {
      var nowValue = new Date(hooks.now());
      if (config._useUTC) {
        return [
          nowValue.getUTCFullYear(),
          nowValue.getUTCMonth(),
          nowValue.getUTCDate()
        ];
      }
      return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }
    function configFromArray(config) {
      var i, date, input = [], currentDate, expectedWeekday, yearToUse;
      if (config._d) {
        return;
      }
      currentDate = currentDateArray(config);
      if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
        dayOfYearFromWeekInfo(config);
      }
      if (config._dayOfYear != null) {
        yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
        if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
          getParsingFlags(config)._overflowDayOfYear = true;
        }
        date = createUTCDate(yearToUse, 0, config._dayOfYear);
        config._a[MONTH] = date.getUTCMonth();
        config._a[DATE] = date.getUTCDate();
      }
      for (i = 0;i < 3 && config._a[i] == null; ++i) {
        config._a[i] = input[i] = currentDate[i];
      }
      for (;i < 7; i++) {
        config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
      }
      if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
        config._nextDay = true;
        config._a[HOUR] = 0;
      }
      config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
      expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();
      if (config._tzm != null) {
        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
      }
      if (config._nextDay) {
        config._a[HOUR] = 24;
      }
      if (config._w && typeof config._w.d !== "undefined" && config._w.d !== expectedWeekday) {
        getParsingFlags(config).weekdayMismatch = true;
      }
    }
    function dayOfYearFromWeekInfo(config) {
      var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;
      w = config._w;
      if (w.GG != null || w.W != null || w.E != null) {
        dow = 1;
        doy = 4;
        weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
        week = defaults(w.W, 1);
        weekday = defaults(w.E, 1);
        if (weekday < 1 || weekday > 7) {
          weekdayOverflow = true;
        }
      } else {
        dow = config._locale._week.dow;
        doy = config._locale._week.doy;
        curWeek = weekOfYear(createLocal(), dow, doy);
        weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);
        week = defaults(w.w, curWeek.week);
        if (w.d != null) {
          weekday = w.d;
          if (weekday < 0 || weekday > 6) {
            weekdayOverflow = true;
          }
        } else if (w.e != null) {
          weekday = w.e + dow;
          if (w.e < 0 || w.e > 6) {
            weekdayOverflow = true;
          }
        } else {
          weekday = dow;
        }
      }
      if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
        getParsingFlags(config)._overflowWeeks = true;
      } else if (weekdayOverflow != null) {
        getParsingFlags(config)._overflowWeekday = true;
      } else {
        temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
      }
    }
    hooks.ISO_8601 = function() {
    };
    hooks.RFC_2822 = function() {
    };
    function configFromStringAndFormat(config) {
      if (config._f === hooks.ISO_8601) {
        configFromISO(config);
        return;
      }
      if (config._f === hooks.RFC_2822) {
        configFromRFC2822(config);
        return;
      }
      config._a = [];
      getParsingFlags(config).empty = true;
      var string = "" + config._i, i, parsedInput, tokens2, token2, skipped, stringLength = string.length, totalParsedInputLength = 0, era, tokenLen;
      tokens2 = expandFormat(config._f, config._locale).match(formattingTokens) || [];
      tokenLen = tokens2.length;
      for (i = 0;i < tokenLen; i++) {
        token2 = tokens2[i];
        parsedInput = (string.match(getParseRegexForToken(token2, config)) || [])[0];
        if (parsedInput) {
          skipped = string.substr(0, string.indexOf(parsedInput));
          if (skipped.length > 0) {
            getParsingFlags(config).unusedInput.push(skipped);
          }
          string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
          totalParsedInputLength += parsedInput.length;
        }
        if (formatTokenFunctions[token2]) {
          if (parsedInput) {
            getParsingFlags(config).empty = false;
          } else {
            getParsingFlags(config).unusedTokens.push(token2);
          }
          addTimeToArrayFromToken(token2, parsedInput, config);
        } else if (config._strict && !parsedInput) {
          getParsingFlags(config).unusedTokens.push(token2);
        }
      }
      getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
      if (string.length > 0) {
        getParsingFlags(config).unusedInput.push(string);
      }
      if (config._a[HOUR] <= 12 && getParsingFlags(config).bigHour === true && config._a[HOUR] > 0) {
        getParsingFlags(config).bigHour = undefined;
      }
      getParsingFlags(config).parsedDateParts = config._a.slice(0);
      getParsingFlags(config).meridiem = config._meridiem;
      config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
      era = getParsingFlags(config).era;
      if (era !== null) {
        config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
      }
      configFromArray(config);
      checkOverflow(config);
    }
    function meridiemFixWrap(locale2, hour, meridiem2) {
      var isPm;
      if (meridiem2 == null) {
        return hour;
      }
      if (locale2.meridiemHour != null) {
        return locale2.meridiemHour(hour, meridiem2);
      } else if (locale2.isPM != null) {
        isPm = locale2.isPM(meridiem2);
        if (isPm && hour < 12) {
          hour += 12;
        }
        if (!isPm && hour === 12) {
          hour = 0;
        }
        return hour;
      } else {
        return hour;
      }
    }
    function configFromStringAndArray(config) {
      var tempConfig, bestMoment, scoreToBeat, i, currentScore, validFormatFound, bestFormatIsValid = false, configfLen = config._f.length;
      if (configfLen === 0) {
        getParsingFlags(config).invalidFormat = true;
        config._d = new Date(NaN);
        return;
      }
      for (i = 0;i < configfLen; i++) {
        currentScore = 0;
        validFormatFound = false;
        tempConfig = copyConfig({}, config);
        if (config._useUTC != null) {
          tempConfig._useUTC = config._useUTC;
        }
        tempConfig._f = config._f[i];
        configFromStringAndFormat(tempConfig);
        if (isValid(tempConfig)) {
          validFormatFound = true;
        }
        currentScore += getParsingFlags(tempConfig).charsLeftOver;
        currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
        getParsingFlags(tempConfig).score = currentScore;
        if (!bestFormatIsValid) {
          if (scoreToBeat == null || currentScore < scoreToBeat || validFormatFound) {
            scoreToBeat = currentScore;
            bestMoment = tempConfig;
            if (validFormatFound) {
              bestFormatIsValid = true;
            }
          }
        } else {
          if (currentScore < scoreToBeat) {
            scoreToBeat = currentScore;
            bestMoment = tempConfig;
          }
        }
      }
      extend(config, bestMoment || tempConfig);
    }
    function configFromObject(config) {
      if (config._d) {
        return;
      }
      var i = normalizeObjectUnits(config._i), dayOrDate = i.day === undefined ? i.date : i.day;
      config._a = map([i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond], function(obj) {
        return obj && parseInt(obj, 10);
      });
      configFromArray(config);
    }
    function createFromConfig(config) {
      var res = new Moment(checkOverflow(prepareConfig(config)));
      if (res._nextDay) {
        res.add(1, "d");
        res._nextDay = undefined;
      }
      return res;
    }
    function prepareConfig(config) {
      var { _i: input, _f: format2 } = config;
      config._locale = config._locale || getLocale(config._l);
      if (input === null || format2 === undefined && input === "") {
        return createInvalid({ nullInput: true });
      }
      if (typeof input === "string") {
        config._i = input = config._locale.preparse(input);
      }
      if (isMoment(input)) {
        return new Moment(checkOverflow(input));
      } else if (isDate(input)) {
        config._d = input;
      } else if (isArray(format2)) {
        configFromStringAndArray(config);
      } else if (format2) {
        configFromStringAndFormat(config);
      } else {
        configFromInput(config);
      }
      if (!isValid(config)) {
        config._d = null;
      }
      return config;
    }
    function configFromInput(config) {
      var input = config._i;
      if (isUndefined(input)) {
        config._d = new Date(hooks.now());
      } else if (isDate(input)) {
        config._d = new Date(input.valueOf());
      } else if (typeof input === "string") {
        configFromString(config);
      } else if (isArray(input)) {
        config._a = map(input.slice(0), function(obj) {
          return parseInt(obj, 10);
        });
        configFromArray(config);
      } else if (isObject(input)) {
        configFromObject(config);
      } else if (isNumber(input)) {
        config._d = new Date(input);
      } else {
        hooks.createFromInputFallback(config);
      }
    }
    function createLocalOrUTC(input, format2, locale2, strict, isUTC) {
      var c = {};
      if (format2 === true || format2 === false) {
        strict = format2;
        format2 = undefined;
      }
      if (locale2 === true || locale2 === false) {
        strict = locale2;
        locale2 = undefined;
      }
      if (isObject(input) && isObjectEmpty(input) || isArray(input) && input.length === 0) {
        input = undefined;
      }
      c._isAMomentObject = true;
      c._useUTC = c._isUTC = isUTC;
      c._l = locale2;
      c._i = input;
      c._f = format2;
      c._strict = strict;
      return createFromConfig(c);
    }
    function createLocal(input, format2, locale2, strict) {
      return createLocalOrUTC(input, format2, locale2, strict, false);
    }
    var prototypeMin = deprecate("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
      var other = createLocal.apply(null, arguments);
      if (this.isValid() && other.isValid()) {
        return other < this ? this : other;
      } else {
        return createInvalid();
      }
    }), prototypeMax = deprecate("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
      var other = createLocal.apply(null, arguments);
      if (this.isValid() && other.isValid()) {
        return other > this ? this : other;
      } else {
        return createInvalid();
      }
    });
    function pickBy(fn, moments) {
      var res, i;
      if (moments.length === 1 && isArray(moments[0])) {
        moments = moments[0];
      }
      if (!moments.length) {
        return createLocal();
      }
      res = moments[0];
      for (i = 1;i < moments.length; ++i) {
        if (!moments[i].isValid() || moments[i][fn](res)) {
          res = moments[i];
        }
      }
      return res;
    }
    function min() {
      var args = [].slice.call(arguments, 0);
      return pickBy("isBefore", args);
    }
    function max() {
      var args = [].slice.call(arguments, 0);
      return pickBy("isAfter", args);
    }
    var now = function() {
      return Date.now ? Date.now() : +new Date;
    };
    var ordering = [
      "year",
      "quarter",
      "month",
      "week",
      "day",
      "hour",
      "minute",
      "second",
      "millisecond"
    ];
    function isDurationValid(m) {
      var key, unitHasDecimal = false, i, orderLen = ordering.length;
      for (key in m) {
        if (hasOwnProp(m, key) && !(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
          return false;
        }
      }
      for (i = 0;i < orderLen; ++i) {
        if (m[ordering[i]]) {
          if (unitHasDecimal) {
            return false;
          }
          if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
            unitHasDecimal = true;
          }
        }
      }
      return true;
    }
    function isValid$1() {
      return this._isValid;
    }
    function createInvalid$1() {
      return createDuration(NaN);
    }
    function Duration(duration) {
      var normalizedInput = normalizeObjectUnits(duration), years2 = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months2 = normalizedInput.month || 0, weeks2 = normalizedInput.week || normalizedInput.isoWeek || 0, days2 = normalizedInput.day || 0, hours2 = normalizedInput.hour || 0, minutes2 = normalizedInput.minute || 0, seconds2 = normalizedInput.second || 0, milliseconds2 = normalizedInput.millisecond || 0;
      this._isValid = isDurationValid(normalizedInput);
      this._milliseconds = +milliseconds2 + seconds2 * 1000 + minutes2 * 60000 + hours2 * 1000 * 60 * 60;
      this._days = +days2 + weeks2 * 7;
      this._months = +months2 + quarters * 3 + years2 * 12;
      this._data = {};
      this._locale = getLocale();
      this._bubble();
    }
    function isDuration(obj) {
      return obj instanceof Duration;
    }
    function absRound(number) {
      if (number < 0) {
        return Math.round(-1 * number) * -1;
      } else {
        return Math.round(number);
      }
    }
    function compareArrays(array1, array2, dontConvert) {
      var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
      for (i = 0;i < len; i++) {
        if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
          diffs++;
        }
      }
      return diffs + lengthDiff;
    }
    function offset(token2, separator) {
      addFormatToken(token2, 0, 0, function() {
        var offset2 = this.utcOffset(), sign2 = "+";
        if (offset2 < 0) {
          offset2 = -offset2;
          sign2 = "-";
        }
        return sign2 + zeroFill(~~(offset2 / 60), 2) + separator + zeroFill(~~offset2 % 60, 2);
      });
    }
    offset("Z", ":");
    offset("ZZ", "");
    addRegexToken("Z", matchShortOffset);
    addRegexToken("ZZ", matchShortOffset);
    addParseToken(["Z", "ZZ"], function(input, array, config) {
      config._useUTC = true;
      config._tzm = offsetFromString(matchShortOffset, input);
    });
    var chunkOffset = /([\+\-]|\d\d)/gi;
    function offsetFromString(matcher, string) {
      var matches = (string || "").match(matcher), chunk, parts, minutes2;
      if (matches === null) {
        return null;
      }
      chunk = matches[matches.length - 1] || [];
      parts = (chunk + "").match(chunkOffset) || ["-", 0, 0];
      minutes2 = +(parts[1] * 60) + toInt(parts[2]);
      return minutes2 === 0 ? 0 : parts[0] === "+" ? minutes2 : -minutes2;
    }
    function cloneWithOffset(input, model) {
      var res, diff2;
      if (model._isUTC) {
        res = model.clone();
        diff2 = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
        res._d.setTime(res._d.valueOf() + diff2);
        hooks.updateOffset(res, false);
        return res;
      } else {
        return createLocal(input).local();
      }
    }
    function getDateOffset(m) {
      return -Math.round(m._d.getTimezoneOffset());
    }
    hooks.updateOffset = function() {
    };
    function getSetOffset(input, keepLocalTime, keepMinutes) {
      var offset2 = this._offset || 0, localAdjust;
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      if (input != null) {
        if (typeof input === "string") {
          input = offsetFromString(matchShortOffset, input);
          if (input === null) {
            return this;
          }
        } else if (Math.abs(input) < 16 && !keepMinutes) {
          input = input * 60;
        }
        if (!this._isUTC && keepLocalTime) {
          localAdjust = getDateOffset(this);
        }
        this._offset = input;
        this._isUTC = true;
        if (localAdjust != null) {
          this.add(localAdjust, "m");
        }
        if (offset2 !== input) {
          if (!keepLocalTime || this._changeInProgress) {
            addSubtract(this, createDuration(input - offset2, "m"), 1, false);
          } else if (!this._changeInProgress) {
            this._changeInProgress = true;
            hooks.updateOffset(this, true);
            this._changeInProgress = null;
          }
        }
        return this;
      } else {
        return this._isUTC ? offset2 : getDateOffset(this);
      }
    }
    function getSetZone(input, keepLocalTime) {
      if (input != null) {
        if (typeof input !== "string") {
          input = -input;
        }
        this.utcOffset(input, keepLocalTime);
        return this;
      } else {
        return -this.utcOffset();
      }
    }
    function setOffsetToUTC(keepLocalTime) {
      return this.utcOffset(0, keepLocalTime);
    }
    function setOffsetToLocal(keepLocalTime) {
      if (this._isUTC) {
        this.utcOffset(0, keepLocalTime);
        this._isUTC = false;
        if (keepLocalTime) {
          this.subtract(getDateOffset(this), "m");
        }
      }
      return this;
    }
    function setOffsetToParsedOffset() {
      if (this._tzm != null) {
        this.utcOffset(this._tzm, false, true);
      } else if (typeof this._i === "string") {
        var tZone = offsetFromString(matchOffset, this._i);
        if (tZone != null) {
          this.utcOffset(tZone);
        } else {
          this.utcOffset(0, true);
        }
      }
      return this;
    }
    function hasAlignedHourOffset(input) {
      if (!this.isValid()) {
        return false;
      }
      input = input ? createLocal(input).utcOffset() : 0;
      return (this.utcOffset() - input) % 60 === 0;
    }
    function isDaylightSavingTime() {
      return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
    }
    function isDaylightSavingTimeShifted() {
      if (!isUndefined(this._isDSTShifted)) {
        return this._isDSTShifted;
      }
      var c = {}, other;
      copyConfig(c, this);
      c = prepareConfig(c);
      if (c._a) {
        other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
        this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
      } else {
        this._isDSTShifted = false;
      }
      return this._isDSTShifted;
    }
    function isLocal() {
      return this.isValid() ? !this._isUTC : false;
    }
    function isUtcOffset() {
      return this.isValid() ? this._isUTC : false;
    }
    function isUtc() {
      return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }
    var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/, isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
    function createDuration(input, key) {
      var duration = input, match = null, sign2, ret, diffRes;
      if (isDuration(input)) {
        duration = {
          ms: input._milliseconds,
          d: input._days,
          M: input._months
        };
      } else if (isNumber(input) || !isNaN(+input)) {
        duration = {};
        if (key) {
          duration[key] = +input;
        } else {
          duration.milliseconds = +input;
        }
      } else if (match = aspNetRegex.exec(input)) {
        sign2 = match[1] === "-" ? -1 : 1;
        duration = {
          y: 0,
          d: toInt(match[DATE]) * sign2,
          h: toInt(match[HOUR]) * sign2,
          m: toInt(match[MINUTE]) * sign2,
          s: toInt(match[SECOND]) * sign2,
          ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign2
        };
      } else if (match = isoRegex.exec(input)) {
        sign2 = match[1] === "-" ? -1 : 1;
        duration = {
          y: parseIso(match[2], sign2),
          M: parseIso(match[3], sign2),
          w: parseIso(match[4], sign2),
          d: parseIso(match[5], sign2),
          h: parseIso(match[6], sign2),
          m: parseIso(match[7], sign2),
          s: parseIso(match[8], sign2)
        };
      } else if (duration == null) {
        duration = {};
      } else if (typeof duration === "object" && (("from" in duration) || ("to" in duration))) {
        diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));
        duration = {};
        duration.ms = diffRes.milliseconds;
        duration.M = diffRes.months;
      }
      ret = new Duration(duration);
      if (isDuration(input) && hasOwnProp(input, "_locale")) {
        ret._locale = input._locale;
      }
      if (isDuration(input) && hasOwnProp(input, "_isValid")) {
        ret._isValid = input._isValid;
      }
      return ret;
    }
    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;
    function parseIso(inp, sign2) {
      var res = inp && parseFloat(inp.replace(",", "."));
      return (isNaN(res) ? 0 : res) * sign2;
    }
    function positiveMomentsDifference(base, other) {
      var res = {};
      res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
      if (base.clone().add(res.months, "M").isAfter(other)) {
        --res.months;
      }
      res.milliseconds = +other - +base.clone().add(res.months, "M");
      return res;
    }
    function momentsDifference(base, other) {
      var res;
      if (!(base.isValid() && other.isValid())) {
        return { milliseconds: 0, months: 0 };
      }
      other = cloneWithOffset(other, base);
      if (base.isBefore(other)) {
        res = positiveMomentsDifference(base, other);
      } else {
        res = positiveMomentsDifference(other, base);
        res.milliseconds = -res.milliseconds;
        res.months = -res.months;
      }
      return res;
    }
    function createAdder(direction, name) {
      return function(val, period) {
        var dur, tmp;
        if (period !== null && !isNaN(+period)) {
          deprecateSimple(name, "moment()." + name + "(period, number) is deprecated. Please use moment()." + name + "(number, period). " + "See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.");
          tmp = val;
          val = period;
          period = tmp;
        }
        dur = createDuration(val, period);
        addSubtract(this, dur, direction);
        return this;
      };
    }
    function addSubtract(mom, duration, isAdding, updateOffset) {
      var milliseconds2 = duration._milliseconds, days2 = absRound(duration._days), months2 = absRound(duration._months);
      if (!mom.isValid()) {
        return;
      }
      updateOffset = updateOffset == null ? true : updateOffset;
      if (months2) {
        setMonth(mom, get(mom, "Month") + months2 * isAdding);
      }
      if (days2) {
        set$1(mom, "Date", get(mom, "Date") + days2 * isAdding);
      }
      if (milliseconds2) {
        mom._d.setTime(mom._d.valueOf() + milliseconds2 * isAdding);
      }
      if (updateOffset) {
        hooks.updateOffset(mom, days2 || months2);
      }
    }
    var add = createAdder(1, "add"), subtract = createAdder(-1, "subtract");
    function isString(input) {
      return typeof input === "string" || input instanceof String;
    }
    function isMomentInput(input) {
      return isMoment(input) || isDate(input) || isString(input) || isNumber(input) || isNumberOrStringArray(input) || isMomentInputObject(input) || input === null || input === undefined;
    }
    function isMomentInputObject(input) {
      var objectTest = isObject(input) && !isObjectEmpty(input), propertyTest = false, properties = [
        "years",
        "year",
        "y",
        "months",
        "month",
        "M",
        "days",
        "day",
        "d",
        "dates",
        "date",
        "D",
        "hours",
        "hour",
        "h",
        "minutes",
        "minute",
        "m",
        "seconds",
        "second",
        "s",
        "milliseconds",
        "millisecond",
        "ms"
      ], i, property, propertyLen = properties.length;
      for (i = 0;i < propertyLen; i += 1) {
        property = properties[i];
        propertyTest = propertyTest || hasOwnProp(input, property);
      }
      return objectTest && propertyTest;
    }
    function isNumberOrStringArray(input) {
      var arrayTest = isArray(input), dataTypeTest = false;
      if (arrayTest) {
        dataTypeTest = input.filter(function(item) {
          return !isNumber(item) && isString(input);
        }).length === 0;
      }
      return arrayTest && dataTypeTest;
    }
    function isCalendarSpec(input) {
      var objectTest = isObject(input) && !isObjectEmpty(input), propertyTest = false, properties = [
        "sameDay",
        "nextDay",
        "lastDay",
        "nextWeek",
        "lastWeek",
        "sameElse"
      ], i, property;
      for (i = 0;i < properties.length; i += 1) {
        property = properties[i];
        propertyTest = propertyTest || hasOwnProp(input, property);
      }
      return objectTest && propertyTest;
    }
    function getCalendarFormat(myMoment, now2) {
      var diff2 = myMoment.diff(now2, "days", true);
      return diff2 < -6 ? "sameElse" : diff2 < -1 ? "lastWeek" : diff2 < 0 ? "lastDay" : diff2 < 1 ? "sameDay" : diff2 < 2 ? "nextDay" : diff2 < 7 ? "nextWeek" : "sameElse";
    }
    function calendar$1(time, formats) {
      if (arguments.length === 1) {
        if (!arguments[0]) {
          time = undefined;
          formats = undefined;
        } else if (isMomentInput(arguments[0])) {
          time = arguments[0];
          formats = undefined;
        } else if (isCalendarSpec(arguments[0])) {
          formats = arguments[0];
          time = undefined;
        }
      }
      var now2 = time || createLocal(), sod = cloneWithOffset(now2, this).startOf("day"), format2 = hooks.calendarFormat(this, sod) || "sameElse", output = formats && (isFunction(formats[format2]) ? formats[format2].call(this, now2) : formats[format2]);
      return this.format(output || this.localeData().calendar(format2, this, createLocal(now2)));
    }
    function clone() {
      return new Moment(this);
    }
    function isAfter(input, units) {
      var localInput = isMoment(input) ? input : createLocal(input);
      if (!(this.isValid() && localInput.isValid())) {
        return false;
      }
      units = normalizeUnits(units) || "millisecond";
      if (units === "millisecond") {
        return this.valueOf() > localInput.valueOf();
      } else {
        return localInput.valueOf() < this.clone().startOf(units).valueOf();
      }
    }
    function isBefore(input, units) {
      var localInput = isMoment(input) ? input : createLocal(input);
      if (!(this.isValid() && localInput.isValid())) {
        return false;
      }
      units = normalizeUnits(units) || "millisecond";
      if (units === "millisecond") {
        return this.valueOf() < localInput.valueOf();
      } else {
        return this.clone().endOf(units).valueOf() < localInput.valueOf();
      }
    }
    function isBetween(from2, to2, units, inclusivity) {
      var localFrom = isMoment(from2) ? from2 : createLocal(from2), localTo = isMoment(to2) ? to2 : createLocal(to2);
      if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
        return false;
      }
      inclusivity = inclusivity || "()";
      return (inclusivity[0] === "(" ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) && (inclusivity[1] === ")" ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
    }
    function isSame(input, units) {
      var localInput = isMoment(input) ? input : createLocal(input), inputMs;
      if (!(this.isValid() && localInput.isValid())) {
        return false;
      }
      units = normalizeUnits(units) || "millisecond";
      if (units === "millisecond") {
        return this.valueOf() === localInput.valueOf();
      } else {
        inputMs = localInput.valueOf();
        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
      }
    }
    function isSameOrAfter(input, units) {
      return this.isSame(input, units) || this.isAfter(input, units);
    }
    function isSameOrBefore(input, units) {
      return this.isSame(input, units) || this.isBefore(input, units);
    }
    function diff(input, units, asFloat) {
      var that, zoneDelta, output;
      if (!this.isValid()) {
        return NaN;
      }
      that = cloneWithOffset(input, this);
      if (!that.isValid()) {
        return NaN;
      }
      zoneDelta = (that.utcOffset() - this.utcOffset()) * 60000;
      units = normalizeUnits(units);
      switch (units) {
        case "year":
          output = monthDiff(this, that) / 12;
          break;
        case "month":
          output = monthDiff(this, that);
          break;
        case "quarter":
          output = monthDiff(this, that) / 3;
          break;
        case "second":
          output = (this - that) / 1000;
          break;
        case "minute":
          output = (this - that) / 60000;
          break;
        case "hour":
          output = (this - that) / 3600000;
          break;
        case "day":
          output = (this - that - zoneDelta) / 86400000;
          break;
        case "week":
          output = (this - that - zoneDelta) / 604800000;
          break;
        default:
          output = this - that;
      }
      return asFloat ? output : absFloor(output);
    }
    function monthDiff(a, b) {
      if (a.date() < b.date()) {
        return -monthDiff(b, a);
      }
      var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()), anchor = a.clone().add(wholeMonthDiff, "months"), anchor2, adjust;
      if (b - anchor < 0) {
        anchor2 = a.clone().add(wholeMonthDiff - 1, "months");
        adjust = (b - anchor) / (anchor - anchor2);
      } else {
        anchor2 = a.clone().add(wholeMonthDiff + 1, "months");
        adjust = (b - anchor) / (anchor2 - anchor);
      }
      return -(wholeMonthDiff + adjust) || 0;
    }
    hooks.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
    hooks.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
    function toString() {
      return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
    }
    function toISOString(keepOffset) {
      if (!this.isValid()) {
        return null;
      }
      var utc = keepOffset !== true, m = utc ? this.clone().utc() : this;
      if (m.year() < 0 || m.year() > 9999) {
        return formatMoment(m, utc ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ");
      }
      if (isFunction(Date.prototype.toISOString)) {
        if (utc) {
          return this.toDate().toISOString();
        } else {
          return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace("Z", formatMoment(m, "Z"));
        }
      }
      return formatMoment(m, utc ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ");
    }
    function inspect() {
      if (!this.isValid()) {
        return "moment.invalid(/* " + this._i + " */)";
      }
      var func = "moment", zone = "", prefix, year, datetime, suffix;
      if (!this.isLocal()) {
        func = this.utcOffset() === 0 ? "moment.utc" : "moment.parseZone";
        zone = "Z";
      }
      prefix = "[" + func + '("]';
      year = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY";
      datetime = "-MM-DD[T]HH:mm:ss.SSS";
      suffix = zone + '[")]';
      return this.format(prefix + year + datetime + suffix);
    }
    function format(inputString) {
      if (!inputString) {
        inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
      }
      var output = formatMoment(this, inputString);
      return this.localeData().postformat(output);
    }
    function from(time, withoutSuffix) {
      if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
        return createDuration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
      } else {
        return this.localeData().invalidDate();
      }
    }
    function fromNow(withoutSuffix) {
      return this.from(createLocal(), withoutSuffix);
    }
    function to(time, withoutSuffix) {
      if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
        return createDuration({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
      } else {
        return this.localeData().invalidDate();
      }
    }
    function toNow(withoutSuffix) {
      return this.to(createLocal(), withoutSuffix);
    }
    function locale(key) {
      var newLocaleData;
      if (key === undefined) {
        return this._locale._abbr;
      } else {
        newLocaleData = getLocale(key);
        if (newLocaleData != null) {
          this._locale = newLocaleData;
        }
        return this;
      }
    }
    var lang = deprecate("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function(key) {
      if (key === undefined) {
        return this.localeData();
      } else {
        return this.locale(key);
      }
    });
    function localeData() {
      return this._locale;
    }
    var MS_PER_SECOND = 1000, MS_PER_MINUTE = 60 * MS_PER_SECOND, MS_PER_HOUR = 60 * MS_PER_MINUTE, MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;
    function mod$1(dividend, divisor) {
      return (dividend % divisor + divisor) % divisor;
    }
    function localStartOfDate(y, m, d) {
      if (y < 100 && y >= 0) {
        return new Date(y + 400, m, d) - MS_PER_400_YEARS;
      } else {
        return new Date(y, m, d).valueOf();
      }
    }
    function utcStartOfDate(y, m, d) {
      if (y < 100 && y >= 0) {
        return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
      } else {
        return Date.UTC(y, m, d);
      }
    }
    function startOf(units) {
      var time, startOfDate;
      units = normalizeUnits(units);
      if (units === undefined || units === "millisecond" || !this.isValid()) {
        return this;
      }
      startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;
      switch (units) {
        case "year":
          time = startOfDate(this.year(), 0, 1);
          break;
        case "quarter":
          time = startOfDate(this.year(), this.month() - this.month() % 3, 1);
          break;
        case "month":
          time = startOfDate(this.year(), this.month(), 1);
          break;
        case "week":
          time = startOfDate(this.year(), this.month(), this.date() - this.weekday());
          break;
        case "isoWeek":
          time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
          break;
        case "day":
        case "date":
          time = startOfDate(this.year(), this.month(), this.date());
          break;
        case "hour":
          time = this._d.valueOf();
          time -= mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR);
          break;
        case "minute":
          time = this._d.valueOf();
          time -= mod$1(time, MS_PER_MINUTE);
          break;
        case "second":
          time = this._d.valueOf();
          time -= mod$1(time, MS_PER_SECOND);
          break;
      }
      this._d.setTime(time);
      hooks.updateOffset(this, true);
      return this;
    }
    function endOf(units) {
      var time, startOfDate;
      units = normalizeUnits(units);
      if (units === undefined || units === "millisecond" || !this.isValid()) {
        return this;
      }
      startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;
      switch (units) {
        case "year":
          time = startOfDate(this.year() + 1, 0, 1) - 1;
          break;
        case "quarter":
          time = startOfDate(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
          break;
        case "month":
          time = startOfDate(this.year(), this.month() + 1, 1) - 1;
          break;
        case "week":
          time = startOfDate(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
          break;
        case "isoWeek":
          time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
          break;
        case "day":
        case "date":
          time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
          break;
        case "hour":
          time = this._d.valueOf();
          time += MS_PER_HOUR - mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR) - 1;
          break;
        case "minute":
          time = this._d.valueOf();
          time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
          break;
        case "second":
          time = this._d.valueOf();
          time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
          break;
      }
      this._d.setTime(time);
      hooks.updateOffset(this, true);
      return this;
    }
    function valueOf() {
      return this._d.valueOf() - (this._offset || 0) * 60000;
    }
    function unix() {
      return Math.floor(this.valueOf() / 1000);
    }
    function toDate() {
      return new Date(this.valueOf());
    }
    function toArray() {
      var m = this;
      return [
        m.year(),
        m.month(),
        m.date(),
        m.hour(),
        m.minute(),
        m.second(),
        m.millisecond()
      ];
    }
    function toObject() {
      var m = this;
      return {
        years: m.year(),
        months: m.month(),
        date: m.date(),
        hours: m.hours(),
        minutes: m.minutes(),
        seconds: m.seconds(),
        milliseconds: m.milliseconds()
      };
    }
    function toJSON() {
      return this.isValid() ? this.toISOString() : null;
    }
    function isValid$2() {
      return isValid(this);
    }
    function parsingFlags() {
      return extend({}, getParsingFlags(this));
    }
    function invalidAt() {
      return getParsingFlags(this).overflow;
    }
    function creationData() {
      return {
        input: this._i,
        format: this._f,
        locale: this._locale,
        isUTC: this._isUTC,
        strict: this._strict
      };
    }
    addFormatToken("N", 0, 0, "eraAbbr");
    addFormatToken("NN", 0, 0, "eraAbbr");
    addFormatToken("NNN", 0, 0, "eraAbbr");
    addFormatToken("NNNN", 0, 0, "eraName");
    addFormatToken("NNNNN", 0, 0, "eraNarrow");
    addFormatToken("y", ["y", 1], "yo", "eraYear");
    addFormatToken("y", ["yy", 2], 0, "eraYear");
    addFormatToken("y", ["yyy", 3], 0, "eraYear");
    addFormatToken("y", ["yyyy", 4], 0, "eraYear");
    addRegexToken("N", matchEraAbbr);
    addRegexToken("NN", matchEraAbbr);
    addRegexToken("NNN", matchEraAbbr);
    addRegexToken("NNNN", matchEraName);
    addRegexToken("NNNNN", matchEraNarrow);
    addParseToken(["N", "NN", "NNN", "NNNN", "NNNNN"], function(input, array, config, token2) {
      var era = config._locale.erasParse(input, token2, config._strict);
      if (era) {
        getParsingFlags(config).era = era;
      } else {
        getParsingFlags(config).invalidEra = input;
      }
    });
    addRegexToken("y", matchUnsigned);
    addRegexToken("yy", matchUnsigned);
    addRegexToken("yyy", matchUnsigned);
    addRegexToken("yyyy", matchUnsigned);
    addRegexToken("yo", matchEraYearOrdinal);
    addParseToken(["y", "yy", "yyy", "yyyy"], YEAR);
    addParseToken(["yo"], function(input, array, config, token2) {
      var match;
      if (config._locale._eraYearOrdinalRegex) {
        match = input.match(config._locale._eraYearOrdinalRegex);
      }
      if (config._locale.eraYearOrdinalParse) {
        array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
      } else {
        array[YEAR] = parseInt(input, 10);
      }
    });
    function localeEras(m, format2) {
      var i, l, date, eras = this._eras || getLocale("en")._eras;
      for (i = 0, l = eras.length;i < l; ++i) {
        switch (typeof eras[i].since) {
          case "string":
            date = hooks(eras[i].since).startOf("day");
            eras[i].since = date.valueOf();
            break;
        }
        switch (typeof eras[i].until) {
          case "undefined":
            eras[i].until = Infinity;
            break;
          case "string":
            date = hooks(eras[i].until).startOf("day").valueOf();
            eras[i].until = date.valueOf();
            break;
        }
      }
      return eras;
    }
    function localeErasParse(eraName, format2, strict) {
      var i, l, eras = this.eras(), name, abbr, narrow;
      eraName = eraName.toUpperCase();
      for (i = 0, l = eras.length;i < l; ++i) {
        name = eras[i].name.toUpperCase();
        abbr = eras[i].abbr.toUpperCase();
        narrow = eras[i].narrow.toUpperCase();
        if (strict) {
          switch (format2) {
            case "N":
            case "NN":
            case "NNN":
              if (abbr === eraName) {
                return eras[i];
              }
              break;
            case "NNNN":
              if (name === eraName) {
                return eras[i];
              }
              break;
            case "NNNNN":
              if (narrow === eraName) {
                return eras[i];
              }
              break;
          }
        } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
          return eras[i];
        }
      }
    }
    function localeErasConvertYear(era, year) {
      var dir = era.since <= era.until ? 1 : -1;
      if (year === undefined) {
        return hooks(era.since).year();
      } else {
        return hooks(era.since).year() + (year - era.offset) * dir;
      }
    }
    function getEraName() {
      var i, l, val, eras = this.localeData().eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        val = this.clone().startOf("day").valueOf();
        if (eras[i].since <= val && val <= eras[i].until) {
          return eras[i].name;
        }
        if (eras[i].until <= val && val <= eras[i].since) {
          return eras[i].name;
        }
      }
      return "";
    }
    function getEraNarrow() {
      var i, l, val, eras = this.localeData().eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        val = this.clone().startOf("day").valueOf();
        if (eras[i].since <= val && val <= eras[i].until) {
          return eras[i].narrow;
        }
        if (eras[i].until <= val && val <= eras[i].since) {
          return eras[i].narrow;
        }
      }
      return "";
    }
    function getEraAbbr() {
      var i, l, val, eras = this.localeData().eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        val = this.clone().startOf("day").valueOf();
        if (eras[i].since <= val && val <= eras[i].until) {
          return eras[i].abbr;
        }
        if (eras[i].until <= val && val <= eras[i].since) {
          return eras[i].abbr;
        }
      }
      return "";
    }
    function getEraYear() {
      var i, l, dir, val, eras = this.localeData().eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        dir = eras[i].since <= eras[i].until ? 1 : -1;
        val = this.clone().startOf("day").valueOf();
        if (eras[i].since <= val && val <= eras[i].until || eras[i].until <= val && val <= eras[i].since) {
          return (this.year() - hooks(eras[i].since).year()) * dir + eras[i].offset;
        }
      }
      return this.year();
    }
    function erasNameRegex(isStrict) {
      if (!hasOwnProp(this, "_erasNameRegex")) {
        computeErasParse.call(this);
      }
      return isStrict ? this._erasNameRegex : this._erasRegex;
    }
    function erasAbbrRegex(isStrict) {
      if (!hasOwnProp(this, "_erasAbbrRegex")) {
        computeErasParse.call(this);
      }
      return isStrict ? this._erasAbbrRegex : this._erasRegex;
    }
    function erasNarrowRegex(isStrict) {
      if (!hasOwnProp(this, "_erasNarrowRegex")) {
        computeErasParse.call(this);
      }
      return isStrict ? this._erasNarrowRegex : this._erasRegex;
    }
    function matchEraAbbr(isStrict, locale2) {
      return locale2.erasAbbrRegex(isStrict);
    }
    function matchEraName(isStrict, locale2) {
      return locale2.erasNameRegex(isStrict);
    }
    function matchEraNarrow(isStrict, locale2) {
      return locale2.erasNarrowRegex(isStrict);
    }
    function matchEraYearOrdinal(isStrict, locale2) {
      return locale2._eraYearOrdinalRegex || matchUnsigned;
    }
    function computeErasParse() {
      var abbrPieces = [], namePieces = [], narrowPieces = [], mixedPieces = [], i, l, erasName, erasAbbr, erasNarrow, eras = this.eras();
      for (i = 0, l = eras.length;i < l; ++i) {
        erasName = regexEscape(eras[i].name);
        erasAbbr = regexEscape(eras[i].abbr);
        erasNarrow = regexEscape(eras[i].narrow);
        namePieces.push(erasName);
        abbrPieces.push(erasAbbr);
        narrowPieces.push(erasNarrow);
        mixedPieces.push(erasName);
        mixedPieces.push(erasAbbr);
        mixedPieces.push(erasNarrow);
      }
      this._erasRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
      this._erasNameRegex = new RegExp("^(" + namePieces.join("|") + ")", "i");
      this._erasAbbrRegex = new RegExp("^(" + abbrPieces.join("|") + ")", "i");
      this._erasNarrowRegex = new RegExp("^(" + narrowPieces.join("|") + ")", "i");
    }
    addFormatToken(0, ["gg", 2], 0, function() {
      return this.weekYear() % 100;
    });
    addFormatToken(0, ["GG", 2], 0, function() {
      return this.isoWeekYear() % 100;
    });
    function addWeekYearFormatToken(token2, getter) {
      addFormatToken(0, [token2, token2.length], 0, getter);
    }
    addWeekYearFormatToken("gggg", "weekYear");
    addWeekYearFormatToken("ggggg", "weekYear");
    addWeekYearFormatToken("GGGG", "isoWeekYear");
    addWeekYearFormatToken("GGGGG", "isoWeekYear");
    addRegexToken("G", matchSigned);
    addRegexToken("g", matchSigned);
    addRegexToken("GG", match1to2, match2);
    addRegexToken("gg", match1to2, match2);
    addRegexToken("GGGG", match1to4, match4);
    addRegexToken("gggg", match1to4, match4);
    addRegexToken("GGGGG", match1to6, match6);
    addRegexToken("ggggg", match1to6, match6);
    addWeekParseToken(["gggg", "ggggg", "GGGG", "GGGGG"], function(input, week, config, token2) {
      week[token2.substr(0, 2)] = toInt(input);
    });
    addWeekParseToken(["gg", "GG"], function(input, week, config, token2) {
      week[token2] = hooks.parseTwoDigitYear(input);
    });
    function getSetWeekYear(input) {
      return getSetWeekYearHelper.call(this, input, this.week(), this.weekday() + this.localeData()._week.dow, this.localeData()._week.dow, this.localeData()._week.doy);
    }
    function getSetISOWeekYear(input) {
      return getSetWeekYearHelper.call(this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }
    function getISOWeeksInYear() {
      return weeksInYear(this.year(), 1, 4);
    }
    function getISOWeeksInISOWeekYear() {
      return weeksInYear(this.isoWeekYear(), 1, 4);
    }
    function getWeeksInYear() {
      var weekInfo = this.localeData()._week;
      return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }
    function getWeeksInWeekYear() {
      var weekInfo = this.localeData()._week;
      return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
    }
    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
      var weeksTarget;
      if (input == null) {
        return weekOfYear(this, dow, doy).year;
      } else {
        weeksTarget = weeksInYear(input, dow, doy);
        if (week > weeksTarget) {
          week = weeksTarget;
        }
        return setWeekAll.call(this, input, week, weekday, dow, doy);
      }
    }
    function setWeekAll(weekYear, week, weekday, dow, doy) {
      var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy), date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
      this.year(date.getUTCFullYear());
      this.month(date.getUTCMonth());
      this.date(date.getUTCDate());
      return this;
    }
    addFormatToken("Q", 0, "Qo", "quarter");
    addRegexToken("Q", match1);
    addParseToken("Q", function(input, array) {
      array[MONTH] = (toInt(input) - 1) * 3;
    });
    function getSetQuarter(input) {
      return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }
    addFormatToken("D", ["DD", 2], "Do", "date");
    addRegexToken("D", match1to2, match1to2NoLeadingZero);
    addRegexToken("DD", match1to2, match2);
    addRegexToken("Do", function(isStrict, locale2) {
      return isStrict ? locale2._dayOfMonthOrdinalParse || locale2._ordinalParse : locale2._dayOfMonthOrdinalParseLenient;
    });
    addParseToken(["D", "DD"], DATE);
    addParseToken("Do", function(input, array) {
      array[DATE] = toInt(input.match(match1to2)[0]);
    });
    var getSetDayOfMonth = makeGetSet("Date", true);
    addFormatToken("DDD", ["DDDD", 3], "DDDo", "dayOfYear");
    addRegexToken("DDD", match1to3);
    addRegexToken("DDDD", match3);
    addParseToken(["DDD", "DDDD"], function(input, array, config) {
      config._dayOfYear = toInt(input);
    });
    function getSetDayOfYear(input) {
      var dayOfYear = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 86400000) + 1;
      return input == null ? dayOfYear : this.add(input - dayOfYear, "d");
    }
    addFormatToken("m", ["mm", 2], 0, "minute");
    addRegexToken("m", match1to2, match1to2HasZero);
    addRegexToken("mm", match1to2, match2);
    addParseToken(["m", "mm"], MINUTE);
    var getSetMinute = makeGetSet("Minutes", false);
    addFormatToken("s", ["ss", 2], 0, "second");
    addRegexToken("s", match1to2, match1to2HasZero);
    addRegexToken("ss", match1to2, match2);
    addParseToken(["s", "ss"], SECOND);
    var getSetSecond = makeGetSet("Seconds", false);
    addFormatToken("S", 0, 0, function() {
      return ~~(this.millisecond() / 100);
    });
    addFormatToken(0, ["SS", 2], 0, function() {
      return ~~(this.millisecond() / 10);
    });
    addFormatToken(0, ["SSS", 3], 0, "millisecond");
    addFormatToken(0, ["SSSS", 4], 0, function() {
      return this.millisecond() * 10;
    });
    addFormatToken(0, ["SSSSS", 5], 0, function() {
      return this.millisecond() * 100;
    });
    addFormatToken(0, ["SSSSSS", 6], 0, function() {
      return this.millisecond() * 1000;
    });
    addFormatToken(0, ["SSSSSSS", 7], 0, function() {
      return this.millisecond() * 1e4;
    });
    addFormatToken(0, ["SSSSSSSS", 8], 0, function() {
      return this.millisecond() * 1e5;
    });
    addFormatToken(0, ["SSSSSSSSS", 9], 0, function() {
      return this.millisecond() * 1e6;
    });
    addRegexToken("S", match1to3, match1);
    addRegexToken("SS", match1to3, match2);
    addRegexToken("SSS", match1to3, match3);
    var token, getSetMillisecond;
    for (token = "SSSS";token.length <= 9; token += "S") {
      addRegexToken(token, matchUnsigned);
    }
    function parseMs(input, array) {
      array[MILLISECOND] = toInt(("0." + input) * 1000);
    }
    for (token = "S";token.length <= 9; token += "S") {
      addParseToken(token, parseMs);
    }
    getSetMillisecond = makeGetSet("Milliseconds", false);
    addFormatToken("z", 0, 0, "zoneAbbr");
    addFormatToken("zz", 0, 0, "zoneName");
    function getZoneAbbr() {
      return this._isUTC ? "UTC" : "";
    }
    function getZoneName() {
      return this._isUTC ? "Coordinated Universal Time" : "";
    }
    var proto = Moment.prototype;
    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    if (typeof Symbol !== "undefined" && Symbol.for != null) {
      proto[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return "Moment<" + this.format() + ">";
      };
    }
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.eraName = getEraName;
    proto.eraNarrow = getEraNarrow;
    proto.eraAbbr = getEraAbbr;
    proto.eraYear = getEraYear;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.weeksInWeekYear = getWeeksInWeekYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate("dates accessor is deprecated. Use date instead.", getSetDayOfMonth);
    proto.months = deprecate("months accessor is deprecated. Use month instead", getSetMonth);
    proto.years = deprecate("years accessor is deprecated. Use year instead", getSetYear);
    proto.zone = deprecate("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", getSetZone);
    proto.isDSTShifted = deprecate("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", isDaylightSavingTimeShifted);
    function createUnix(input) {
      return createLocal(input * 1000);
    }
    function createInZone() {
      return createLocal.apply(null, arguments).parseZone();
    }
    function preParsePostFormat(string) {
      return string;
    }
    var proto$1 = Locale.prototype;
    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;
    proto$1.eras = localeEras;
    proto$1.erasParse = localeErasParse;
    proto$1.erasConvertYear = localeErasConvertYear;
    proto$1.erasAbbrRegex = erasAbbrRegex;
    proto$1.erasNameRegex = erasNameRegex;
    proto$1.erasNarrowRegex = erasNarrowRegex;
    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;
    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;
    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;
    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;
    function get$1(format2, index, field, setter) {
      var locale2 = getLocale(), utc = createUTC().set(setter, index);
      return locale2[field](utc, format2);
    }
    function listMonthsImpl(format2, index, field) {
      if (isNumber(format2)) {
        index = format2;
        format2 = undefined;
      }
      format2 = format2 || "";
      if (index != null) {
        return get$1(format2, index, field, "month");
      }
      var i, out = [];
      for (i = 0;i < 12; i++) {
        out[i] = get$1(format2, i, field, "month");
      }
      return out;
    }
    function listWeekdaysImpl(localeSorted, format2, index, field) {
      if (typeof localeSorted === "boolean") {
        if (isNumber(format2)) {
          index = format2;
          format2 = undefined;
        }
        format2 = format2 || "";
      } else {
        format2 = localeSorted;
        index = format2;
        localeSorted = false;
        if (isNumber(format2)) {
          index = format2;
          format2 = undefined;
        }
        format2 = format2 || "";
      }
      var locale2 = getLocale(), shift = localeSorted ? locale2._week.dow : 0, i, out = [];
      if (index != null) {
        return get$1(format2, (index + shift) % 7, field, "day");
      }
      for (i = 0;i < 7; i++) {
        out[i] = get$1(format2, (i + shift) % 7, field, "day");
      }
      return out;
    }
    function listMonths(format2, index) {
      return listMonthsImpl(format2, index, "months");
    }
    function listMonthsShort(format2, index) {
      return listMonthsImpl(format2, index, "monthsShort");
    }
    function listWeekdays(localeSorted, format2, index) {
      return listWeekdaysImpl(localeSorted, format2, index, "weekdays");
    }
    function listWeekdaysShort(localeSorted, format2, index) {
      return listWeekdaysImpl(localeSorted, format2, index, "weekdaysShort");
    }
    function listWeekdaysMin(localeSorted, format2, index) {
      return listWeekdaysImpl(localeSorted, format2, index, "weekdaysMin");
    }
    getSetGlobalLocale("en", {
      eras: [
        {
          since: "0001-01-01",
          until: Infinity,
          offset: 1,
          name: "Anno Domini",
          narrow: "AD",
          abbr: "AD"
        },
        {
          since: "0000-12-31",
          until: -Infinity,
          offset: 1,
          name: "Before Christ",
          narrow: "BC",
          abbr: "BC"
        }
      ],
      dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
      ordinal: function(number) {
        var b = number % 10, output = toInt(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
        return number + output;
      }
    });
    hooks.lang = deprecate("moment.lang is deprecated. Use moment.locale instead.", getSetGlobalLocale);
    hooks.langData = deprecate("moment.langData is deprecated. Use moment.localeData instead.", getLocale);
    var mathAbs = Math.abs;
    function abs() {
      var data = this._data;
      this._milliseconds = mathAbs(this._milliseconds);
      this._days = mathAbs(this._days);
      this._months = mathAbs(this._months);
      data.milliseconds = mathAbs(data.milliseconds);
      data.seconds = mathAbs(data.seconds);
      data.minutes = mathAbs(data.minutes);
      data.hours = mathAbs(data.hours);
      data.months = mathAbs(data.months);
      data.years = mathAbs(data.years);
      return this;
    }
    function addSubtract$1(duration, input, value, direction) {
      var other = createDuration(input, value);
      duration._milliseconds += direction * other._milliseconds;
      duration._days += direction * other._days;
      duration._months += direction * other._months;
      return duration._bubble();
    }
    function add$1(input, value) {
      return addSubtract$1(this, input, value, 1);
    }
    function subtract$1(input, value) {
      return addSubtract$1(this, input, value, -1);
    }
    function absCeil(number) {
      if (number < 0) {
        return Math.floor(number);
      } else {
        return Math.ceil(number);
      }
    }
    function bubble() {
      var milliseconds2 = this._milliseconds, days2 = this._days, months2 = this._months, data = this._data, seconds2, minutes2, hours2, years2, monthsFromDays;
      if (!(milliseconds2 >= 0 && days2 >= 0 && months2 >= 0 || milliseconds2 <= 0 && days2 <= 0 && months2 <= 0)) {
        milliseconds2 += absCeil(monthsToDays(months2) + days2) * 86400000;
        days2 = 0;
        months2 = 0;
      }
      data.milliseconds = milliseconds2 % 1000;
      seconds2 = absFloor(milliseconds2 / 1000);
      data.seconds = seconds2 % 60;
      minutes2 = absFloor(seconds2 / 60);
      data.minutes = minutes2 % 60;
      hours2 = absFloor(minutes2 / 60);
      data.hours = hours2 % 24;
      days2 += absFloor(hours2 / 24);
      monthsFromDays = absFloor(daysToMonths(days2));
      months2 += monthsFromDays;
      days2 -= absCeil(monthsToDays(monthsFromDays));
      years2 = absFloor(months2 / 12);
      months2 %= 12;
      data.days = days2;
      data.months = months2;
      data.years = years2;
      return this;
    }
    function daysToMonths(days2) {
      return days2 * 4800 / 146097;
    }
    function monthsToDays(months2) {
      return months2 * 146097 / 4800;
    }
    function as(units) {
      if (!this.isValid()) {
        return NaN;
      }
      var days2, months2, milliseconds2 = this._milliseconds;
      units = normalizeUnits(units);
      if (units === "month" || units === "quarter" || units === "year") {
        days2 = this._days + milliseconds2 / 86400000;
        months2 = this._months + daysToMonths(days2);
        switch (units) {
          case "month":
            return months2;
          case "quarter":
            return months2 / 3;
          case "year":
            return months2 / 12;
        }
      } else {
        days2 = this._days + Math.round(monthsToDays(this._months));
        switch (units) {
          case "week":
            return days2 / 7 + milliseconds2 / 604800000;
          case "day":
            return days2 + milliseconds2 / 86400000;
          case "hour":
            return days2 * 24 + milliseconds2 / 3600000;
          case "minute":
            return days2 * 1440 + milliseconds2 / 60000;
          case "second":
            return days2 * 86400 + milliseconds2 / 1000;
          case "millisecond":
            return Math.floor(days2 * 86400000) + milliseconds2;
          default:
            throw new Error("Unknown unit " + units);
        }
      }
    }
    function makeAs(alias) {
      return function() {
        return this.as(alias);
      };
    }
    var asMilliseconds = makeAs("ms"), asSeconds = makeAs("s"), asMinutes = makeAs("m"), asHours = makeAs("h"), asDays = makeAs("d"), asWeeks = makeAs("w"), asMonths = makeAs("M"), asQuarters = makeAs("Q"), asYears = makeAs("y"), valueOf$1 = asMilliseconds;
    function clone$1() {
      return createDuration(this);
    }
    function get$2(units) {
      units = normalizeUnits(units);
      return this.isValid() ? this[units + "s"]() : NaN;
    }
    function makeGetter(name) {
      return function() {
        return this.isValid() ? this._data[name] : NaN;
      };
    }
    var milliseconds = makeGetter("milliseconds"), seconds = makeGetter("seconds"), minutes = makeGetter("minutes"), hours = makeGetter("hours"), days = makeGetter("days"), months = makeGetter("months"), years = makeGetter("years");
    function weeks() {
      return absFloor(this.days() / 7);
    }
    var round = Math.round, thresholds = {
      ss: 44,
      s: 45,
      m: 45,
      h: 22,
      d: 26,
      w: null,
      M: 11
    };
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale2) {
      return locale2.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }
    function relativeTime$1(posNegDuration, withoutSuffix, thresholds2, locale2) {
      var duration = createDuration(posNegDuration).abs(), seconds2 = round(duration.as("s")), minutes2 = round(duration.as("m")), hours2 = round(duration.as("h")), days2 = round(duration.as("d")), months2 = round(duration.as("M")), weeks2 = round(duration.as("w")), years2 = round(duration.as("y")), a = seconds2 <= thresholds2.ss && ["s", seconds2] || seconds2 < thresholds2.s && ["ss", seconds2] || minutes2 <= 1 && ["m"] || minutes2 < thresholds2.m && ["mm", minutes2] || hours2 <= 1 && ["h"] || hours2 < thresholds2.h && ["hh", hours2] || days2 <= 1 && ["d"] || days2 < thresholds2.d && ["dd", days2];
      if (thresholds2.w != null) {
        a = a || weeks2 <= 1 && ["w"] || weeks2 < thresholds2.w && ["ww", weeks2];
      }
      a = a || months2 <= 1 && ["M"] || months2 < thresholds2.M && ["MM", months2] || years2 <= 1 && ["y"] || ["yy", years2];
      a[2] = withoutSuffix;
      a[3] = +posNegDuration > 0;
      a[4] = locale2;
      return substituteTimeAgo.apply(null, a);
    }
    function getSetRelativeTimeRounding(roundingFunction) {
      if (roundingFunction === undefined) {
        return round;
      }
      if (typeof roundingFunction === "function") {
        round = roundingFunction;
        return true;
      }
      return false;
    }
    function getSetRelativeTimeThreshold(threshold, limit) {
      if (thresholds[threshold] === undefined) {
        return false;
      }
      if (limit === undefined) {
        return thresholds[threshold];
      }
      thresholds[threshold] = limit;
      if (threshold === "s") {
        thresholds.ss = limit - 1;
      }
      return true;
    }
    function humanize(argWithSuffix, argThresholds) {
      if (!this.isValid()) {
        return this.localeData().invalidDate();
      }
      var withSuffix = false, th = thresholds, locale2, output;
      if (typeof argWithSuffix === "object") {
        argThresholds = argWithSuffix;
        argWithSuffix = false;
      }
      if (typeof argWithSuffix === "boolean") {
        withSuffix = argWithSuffix;
      }
      if (typeof argThresholds === "object") {
        th = Object.assign({}, thresholds, argThresholds);
        if (argThresholds.s != null && argThresholds.ss == null) {
          th.ss = argThresholds.s - 1;
        }
      }
      locale2 = this.localeData();
      output = relativeTime$1(this, !withSuffix, th, locale2);
      if (withSuffix) {
        output = locale2.pastFuture(+this, output);
      }
      return locale2.postformat(output);
    }
    var abs$1 = Math.abs;
    function sign(x) {
      return (x > 0) - (x < 0) || +x;
    }
    function toISOString$1() {
      if (!this.isValid()) {
        return this.localeData().invalidDate();
      }
      var seconds2 = abs$1(this._milliseconds) / 1000, days2 = abs$1(this._days), months2 = abs$1(this._months), minutes2, hours2, years2, s, total = this.asSeconds(), totalSign, ymSign, daysSign, hmsSign;
      if (!total) {
        return "P0D";
      }
      minutes2 = absFloor(seconds2 / 60);
      hours2 = absFloor(minutes2 / 60);
      seconds2 %= 60;
      minutes2 %= 60;
      years2 = absFloor(months2 / 12);
      months2 %= 12;
      s = seconds2 ? seconds2.toFixed(3).replace(/\.?0+$/, "") : "";
      totalSign = total < 0 ? "-" : "";
      ymSign = sign(this._months) !== sign(total) ? "-" : "";
      daysSign = sign(this._days) !== sign(total) ? "-" : "";
      hmsSign = sign(this._milliseconds) !== sign(total) ? "-" : "";
      return totalSign + "P" + (years2 ? ymSign + years2 + "Y" : "") + (months2 ? ymSign + months2 + "M" : "") + (days2 ? daysSign + days2 + "D" : "") + (hours2 || minutes2 || seconds2 ? "T" : "") + (hours2 ? hmsSign + hours2 + "H" : "") + (minutes2 ? hmsSign + minutes2 + "M" : "") + (seconds2 ? hmsSign + s + "S" : "");
    }
    var proto$2 = Duration.prototype;
    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asQuarters = asQuarters;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.clone = clone$1;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;
    proto$2.toIsoString = deprecate("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", toISOString$1);
    proto$2.lang = lang;
    addFormatToken("X", 0, 0, "unix");
    addFormatToken("x", 0, 0, "valueOf");
    addRegexToken("x", matchSigned);
    addRegexToken("X", matchTimestamp);
    addParseToken("X", function(input, array, config) {
      config._d = new Date(parseFloat(input) * 1000);
    });
    addParseToken("x", function(input, array, config) {
      config._d = new Date(toInt(input));
    });
    //! moment.js
    hooks.version = "2.30.1";
    setHookCallback(createLocal);
    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;
    hooks.HTML5_FMT = {
      DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
      DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
      DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
      DATE: "YYYY-MM-DD",
      TIME: "HH:mm",
      TIME_SECONDS: "HH:mm:ss",
      TIME_MS: "HH:mm:ss.SSS",
      WEEK: "GGGG-[W]WW",
      MONTH: "YYYY-MM"
    };
    return hooks;
  });
});

// node_modules/logform/format.js
var require_format = __commonJS((exports, module) => {
  class InvalidFormatError extends Error {
    constructor(formatFn) {
      super(`Format functions must be synchronous taking a two arguments: (info, opts)
Found: ${formatFn.toString().split("\n")[0]}\n`);
      Error.captureStackTrace(this, InvalidFormatError);
    }
  }
  module.exports = (formatFn) => {
    if (formatFn.length > 2) {
      throw new InvalidFormatError(formatFn);
    }
    function Format(options = {}) {
      this.options = options;
    }
    Format.prototype.transform = formatFn;
    function createFormatWrap(opts) {
      return new Format(opts);
    }
    createFormatWrap.Format = Format;
    return createFormatWrap;
  };
});

// node_modules/@colors/colors/lib/styles.js
var require_styles = __commonJS((exports, module) => {
  var styles = {};
  module["exports"] = styles;
  var codes = {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    grey: [90, 39],
    brightRed: [91, 39],
    brightGreen: [92, 39],
    brightYellow: [93, 39],
    brightBlue: [94, 39],
    brightMagenta: [95, 39],
    brightCyan: [96, 39],
    brightWhite: [97, 39],
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],
    bgBrightRed: [101, 49],
    bgBrightGreen: [102, 49],
    bgBrightYellow: [103, 49],
    bgBrightBlue: [104, 49],
    bgBrightMagenta: [105, 49],
    bgBrightCyan: [106, 49],
    bgBrightWhite: [107, 49],
    blackBG: [40, 49],
    redBG: [41, 49],
    greenBG: [42, 49],
    yellowBG: [43, 49],
    blueBG: [44, 49],
    magentaBG: [45, 49],
    cyanBG: [46, 49],
    whiteBG: [47, 49]
  };
  Object.keys(codes).forEach(function(key) {
    var val = codes[key];
    var style = styles[key] = [];
    style.open = "\x1B[" + val[0] + "m";
    style.close = "\x1B[" + val[1] + "m";
  });
});

// node_modules/@colors/colors/lib/system/has-flag.js
var require_has_flag = __commonJS((exports, module) => {
  module.exports = function(flag, argv) {
    argv = argv || process.argv || [];
    var terminatorPos = argv.indexOf("--");
    var prefix = /^-{1,2}/.test(flag) ? "" : "--";
    var pos = argv.indexOf(prefix + flag);
    return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
  };
});

// node_modules/@colors/colors/lib/system/supports-colors.js
var require_supports_colors = __commonJS((exports, module) => {
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(stream) {
    if (forceColor === false) {
      return 0;
    }
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
    if (stream && !stream.isTTY && forceColor !== true) {
      return 0;
    }
    var min = forceColor ? 1 : 0;
    if (process.platform === "win32") {
      var osRelease = os.release().split(".");
      if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some(function(sign) {
        return sign in env;
      }) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if ("TERM_PROGRAM" in env) {
      var version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Hyper":
          return 3;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    if (env.TERM === "dumb") {
      return min;
    }
    return min;
  }
  function getSupportLevel(stream) {
    var level = supportsColor(stream);
    return translateLevel(level);
  }
  var os = import.meta.require("os");
  var hasFlag = require_has_flag();
  var env = process.env;
  var forceColor = undefined;
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false")) {
    forceColor = false;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    forceColor = true;
  }
  if ("FORCE_COLOR" in env) {
    forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
  }
  module.exports = {
    supportsColor: getSupportLevel,
    stdout: getSupportLevel(process.stdout),
    stderr: getSupportLevel(process.stderr)
  };
});

// node_modules/@colors/colors/lib/custom/trap.js
var require_trap = __commonJS((exports, module) => {
  module["exports"] = function runTheTrap(text, options) {
    var result = "";
    text = text || "Run the trap, drop the bass";
    text = text.split("");
    var trap = {
      a: ["@", "\u0104", "\u023A", "\u0245", "\u0394", "\u039B", "\u0414"],
      b: ["\xDF", "\u0181", "\u0243", "\u026E", "\u03B2", "\u0E3F"],
      c: ["\xA9", "\u023B", "\u03FE"],
      d: ["\xD0", "\u018A", "\u0500", "\u0501", "\u0502", "\u0503"],
      e: [
        "\xCB",
        "\u0115",
        "\u018E",
        "\u0258",
        "\u03A3",
        "\u03BE",
        "\u04BC",
        "\u0A6C"
      ],
      f: ["\u04FA"],
      g: ["\u0262"],
      h: ["\u0126", "\u0195", "\u04A2", "\u04BA", "\u04C7", "\u050A"],
      i: ["\u0F0F"],
      j: ["\u0134"],
      k: ["\u0138", "\u04A0", "\u04C3", "\u051E"],
      l: ["\u0139"],
      m: ["\u028D", "\u04CD", "\u04CE", "\u0520", "\u0521", "\u0D69"],
      n: ["\xD1", "\u014B", "\u019D", "\u0376", "\u03A0", "\u048A"],
      o: [
        "\xD8",
        "\xF5",
        "\xF8",
        "\u01FE",
        "\u0298",
        "\u047A",
        "\u05DD",
        "\u06DD",
        "\u0E4F"
      ],
      p: ["\u01F7", "\u048E"],
      q: ["\u09CD"],
      r: ["\xAE", "\u01A6", "\u0210", "\u024C", "\u0280", "\u042F"],
      s: ["\xA7", "\u03DE", "\u03DF", "\u03E8"],
      t: ["\u0141", "\u0166", "\u0373"],
      u: ["\u01B1", "\u054D"],
      v: ["\u05D8"],
      w: ["\u0428", "\u0460", "\u047C", "\u0D70"],
      x: ["\u04B2", "\u04FE", "\u04FC", "\u04FD"],
      y: ["\xA5", "\u04B0", "\u04CB"],
      z: ["\u01B5", "\u0240"]
    };
    text.forEach(function(c) {
      c = c.toLowerCase();
      var chars = trap[c] || [" "];
      var rand = Math.floor(Math.random() * chars.length);
      if (typeof trap[c] !== "undefined") {
        result += trap[c][rand];
      } else {
        result += c;
      }
    });
    return result;
  };
});

// node_modules/@colors/colors/lib/custom/zalgo.js
var require_zalgo = __commonJS((exports, module) => {
  module["exports"] = function zalgo(text, options) {
    text = text || "   he is here   ";
    var soul = {
      up: [
        "\u030D",
        "\u030E",
        "\u0304",
        "\u0305",
        "\u033F",
        "\u0311",
        "\u0306",
        "\u0310",
        "\u0352",
        "\u0357",
        "\u0351",
        "\u0307",
        "\u0308",
        "\u030A",
        "\u0342",
        "\u0313",
        "\u0308",
        "\u034A",
        "\u034B",
        "\u034C",
        "\u0303",
        "\u0302",
        "\u030C",
        "\u0350",
        "\u0300",
        "\u0301",
        "\u030B",
        "\u030F",
        "\u0312",
        "\u0313",
        "\u0314",
        "\u033D",
        "\u0309",
        "\u0363",
        "\u0364",
        "\u0365",
        "\u0366",
        "\u0367",
        "\u0368",
        "\u0369",
        "\u036A",
        "\u036B",
        "\u036C",
        "\u036D",
        "\u036E",
        "\u036F",
        "\u033E",
        "\u035B",
        "\u0346",
        "\u031A"
      ],
      down: [
        "\u0316",
        "\u0317",
        "\u0318",
        "\u0319",
        "\u031C",
        "\u031D",
        "\u031E",
        "\u031F",
        "\u0320",
        "\u0324",
        "\u0325",
        "\u0326",
        "\u0329",
        "\u032A",
        "\u032B",
        "\u032C",
        "\u032D",
        "\u032E",
        "\u032F",
        "\u0330",
        "\u0331",
        "\u0332",
        "\u0333",
        "\u0339",
        "\u033A",
        "\u033B",
        "\u033C",
        "\u0345",
        "\u0347",
        "\u0348",
        "\u0349",
        "\u034D",
        "\u034E",
        "\u0353",
        "\u0354",
        "\u0355",
        "\u0356",
        "\u0359",
        "\u035A",
        "\u0323"
      ],
      mid: [
        "\u0315",
        "\u031B",
        "\u0300",
        "\u0301",
        "\u0358",
        "\u0321",
        "\u0322",
        "\u0327",
        "\u0328",
        "\u0334",
        "\u0335",
        "\u0336",
        "\u035C",
        "\u035D",
        "\u035E",
        "\u035F",
        "\u0360",
        "\u0362",
        "\u0338",
        "\u0337",
        "\u0361",
        " \u0489"
      ]
    };
    var all = [].concat(soul.up, soul.down, soul.mid);
    function randomNumber(range) {
      var r = Math.floor(Math.random() * range);
      return r;
    }
    function isChar(character) {
      var bool = false;
      all.filter(function(i) {
        bool = i === character;
      });
      return bool;
    }
    function heComes(text2, options2) {
      var result = "";
      var counts;
      var l;
      options2 = options2 || {};
      options2["up"] = typeof options2["up"] !== "undefined" ? options2["up"] : true;
      options2["mid"] = typeof options2["mid"] !== "undefined" ? options2["mid"] : true;
      options2["down"] = typeof options2["down"] !== "undefined" ? options2["down"] : true;
      options2["size"] = typeof options2["size"] !== "undefined" ? options2["size"] : "maxi";
      text2 = text2.split("");
      for (l in text2) {
        if (isChar(l)) {
          continue;
        }
        result = result + text2[l];
        counts = { up: 0, down: 0, mid: 0 };
        switch (options2.size) {
          case "mini":
            counts.up = randomNumber(8);
            counts.mid = randomNumber(2);
            counts.down = randomNumber(8);
            break;
          case "maxi":
            counts.up = randomNumber(16) + 3;
            counts.mid = randomNumber(4) + 1;
            counts.down = randomNumber(64) + 3;
            break;
          default:
            counts.up = randomNumber(8) + 1;
            counts.mid = randomNumber(6) / 2;
            counts.down = randomNumber(8) + 1;
            break;
        }
        var arr = ["up", "mid", "down"];
        for (var d in arr) {
          var index = arr[d];
          for (var i = 0;i <= counts[index]; i++) {
            if (options2[index]) {
              result = result + soul[index][randomNumber(soul[index].length)];
            }
          }
        }
      }
      return result;
    }
    return heComes(text, options);
  };
});

// node_modules/@colors/colors/lib/maps/america.js
var require_america = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    return function(letter, i, exploded) {
      if (letter === " ")
        return letter;
      switch (i % 3) {
        case 0:
          return colors.red(letter);
        case 1:
          return colors.white(letter);
        case 2:
          return colors.blue(letter);
      }
    };
  };
});

// node_modules/@colors/colors/lib/maps/zebra.js
var require_zebra = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    return function(letter, i, exploded) {
      return i % 2 === 0 ? letter : colors.inverse(letter);
    };
  };
});

// node_modules/@colors/colors/lib/maps/rainbow.js
var require_rainbow = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    var rainbowColors = ["red", "yellow", "green", "blue", "magenta"];
    return function(letter, i, exploded) {
      if (letter === " ") {
        return letter;
      } else {
        return colors[rainbowColors[i++ % rainbowColors.length]](letter);
      }
    };
  };
});

// node_modules/@colors/colors/lib/maps/random.js
var require_random = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    var available = [
      "underline",
      "inverse",
      "grey",
      "yellow",
      "red",
      "green",
      "blue",
      "white",
      "cyan",
      "magenta",
      "brightYellow",
      "brightRed",
      "brightGreen",
      "brightBlue",
      "brightWhite",
      "brightCyan",
      "brightMagenta"
    ];
    return function(letter, i, exploded) {
      return letter === " " ? letter : colors[available[Math.round(Math.random() * (available.length - 2))]](letter);
    };
  };
});

// node_modules/@colors/colors/lib/colors.js
var require_colors = __commonJS((exports, module) => {
  function build(_styles) {
    var builder = function builder() {
      return applyStyle.apply(builder, arguments);
    };
    builder._styles = _styles;
    builder.__proto__ = proto;
    return builder;
  }
  function applyStyle() {
    var args = Array.prototype.slice.call(arguments);
    var str = args.map(function(arg) {
      if (arg != null && arg.constructor === String) {
        return arg;
      } else {
        return util.inspect(arg);
      }
    }).join(" ");
    if (!colors.enabled || !str) {
      return str;
    }
    var newLinesPresent = str.indexOf("\n") != -1;
    var nestedStyles = this._styles;
    var i = nestedStyles.length;
    while (i--) {
      var code = ansiStyles[nestedStyles[i]];
      str = code.open + str.replace(code.closeRe, code.open) + code.close;
      if (newLinesPresent) {
        str = str.replace(newLineRegex, function(match) {
          return code.close + match + code.open;
        });
      }
    }
    return str;
  }
  function init() {
    var ret = {};
    Object.keys(styles).forEach(function(name) {
      ret[name] = {
        get: function() {
          return build([name]);
        }
      };
    });
    return ret;
  }
  var colors = {};
  module["exports"] = colors;
  colors.themes = {};
  var util = import.meta.require("util");
  var ansiStyles = colors.styles = require_styles();
  var defineProps = Object.defineProperties;
  var newLineRegex = new RegExp(/[\r\n]+/g);
  colors.supportsColor = require_supports_colors().supportsColor;
  if (typeof colors.enabled === "undefined") {
    colors.enabled = colors.supportsColor() !== false;
  }
  colors.enable = function() {
    colors.enabled = true;
  };
  colors.disable = function() {
    colors.enabled = false;
  };
  colors.stripColors = colors.strip = function(str) {
    return ("" + str).replace(/\x1B\[\d+m/g, "");
  };
  var stylize = colors.stylize = function stylize(str, style) {
    if (!colors.enabled) {
      return str + "";
    }
    var styleMap = ansiStyles[style];
    if (!styleMap && style in colors) {
      return colors[style](str);
    }
    return styleMap.open + str + styleMap.close;
  };
  var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
  var escapeStringRegexp = function(str) {
    if (typeof str !== "string") {
      throw new TypeError("Expected a string");
    }
    return str.replace(matchOperatorsRe, "\\$&");
  };
  var styles = function() {
    var ret = {};
    ansiStyles.grey = ansiStyles.gray;
    Object.keys(ansiStyles).forEach(function(key) {
      ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), "g");
      ret[key] = {
        get: function() {
          return build(this._styles.concat(key));
        }
      };
    });
    return ret;
  }();
  var proto = defineProps(function colors() {
  }, styles);
  colors.setTheme = function(theme) {
    if (typeof theme === "string") {
      console.log("colors.setTheme now only accepts an object, not a string.  " + "If you are trying to set a theme from a file, it is now your (the " + "caller\'s) responsibility to require the file.  The old syntax " + "looked like colors.setTheme(__dirname + " + "\'/../themes/generic-logging.js\'); The new syntax looks like " + "colors.setTheme(require(__dirname + " + "\'/../themes/generic-logging.js\'));");
      return;
    }
    for (var style in theme) {
      (function(style2) {
        colors[style2] = function(str) {
          if (typeof theme[style2] === "object") {
            var out = str;
            for (var i in theme[style2]) {
              out = colors[theme[style2][i]](out);
            }
            return out;
          }
          return colors[theme[style2]](str);
        };
      })(style);
    }
  };
  var sequencer = function sequencer(map2, str) {
    var exploded = str.split("");
    exploded = exploded.map(map2);
    return exploded.join("");
  };
  colors.trap = require_trap();
  colors.zalgo = require_zalgo();
  colors.maps = {};
  colors.maps.america = require_america()(colors);
  colors.maps.zebra = require_zebra()(colors);
  colors.maps.rainbow = require_rainbow()(colors);
  colors.maps.random = require_random()(colors);
  for (map in colors.maps) {
    (function(map2) {
      colors[map2] = function(str) {
        return sequencer(colors.maps[map2], str);
      };
    })(map);
  }
  var map;
  defineProps(colors, init());
});

// node_modules/@colors/colors/safe.js
var require_safe = __commonJS((exports, module) => {
  var colors = require_colors();
  module["exports"] = colors;
});

// node_modules/triple-beam/config/cli.js
var require_cli = __commonJS((exports) => {
  exports.levels = {
    error: 0,
    warn: 1,
    help: 2,
    data: 3,
    info: 4,
    debug: 5,
    prompt: 6,
    verbose: 7,
    input: 8,
    silly: 9
  };
  exports.colors = {
    error: "red",
    warn: "yellow",
    help: "cyan",
    data: "grey",
    info: "green",
    debug: "blue",
    prompt: "grey",
    verbose: "cyan",
    input: "grey",
    silly: "magenta"
  };
});

// node_modules/triple-beam/config/npm.js
var require_npm = __commonJS((exports) => {
  exports.levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  };
  exports.colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "green",
    verbose: "cyan",
    debug: "blue",
    silly: "magenta"
  };
});

// node_modules/triple-beam/config/syslog.js
var require_syslog = __commonJS((exports) => {
  exports.levels = {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7
  };
  exports.colors = {
    emerg: "red",
    alert: "yellow",
    crit: "red",
    error: "red",
    warning: "red",
    notice: "yellow",
    info: "green",
    debug: "blue"
  };
});

// node_modules/triple-beam/config/index.js
var require_config = __commonJS((exports) => {
  Object.defineProperty(exports, "cli", {
    value: require_cli()
  });
  Object.defineProperty(exports, "npm", {
    value: require_npm()
  });
  Object.defineProperty(exports, "syslog", {
    value: require_syslog()
  });
});

// node_modules/triple-beam/index.js
var require_triple_beam = __commonJS((exports) => {
  Object.defineProperty(exports, "LEVEL", {
    value: Symbol.for("level")
  });
  Object.defineProperty(exports, "MESSAGE", {
    value: Symbol.for("message")
  });
  Object.defineProperty(exports, "SPLAT", {
    value: Symbol.for("splat")
  });
  Object.defineProperty(exports, "configs", {
    value: require_config()
  });
});

// node_modules/logform/colorize.js
var require_colorize = __commonJS((exports, module) => {
  var colors = require_safe();
  var { LEVEL, MESSAGE } = require_triple_beam();
  colors.enabled = true;
  var hasSpace = /\s+/;

  class Colorizer {
    constructor(opts = {}) {
      if (opts.colors) {
        this.addColors(opts.colors);
      }
      this.options = opts;
    }
    static addColors(clrs) {
      const nextColors = Object.keys(clrs).reduce((acc, level) => {
        acc[level] = hasSpace.test(clrs[level]) ? clrs[level].split(hasSpace) : clrs[level];
        return acc;
      }, {});
      Colorizer.allColors = Object.assign({}, Colorizer.allColors || {}, nextColors);
      return Colorizer.allColors;
    }
    addColors(clrs) {
      return Colorizer.addColors(clrs);
    }
    colorize(lookup, level, message) {
      if (typeof message === "undefined") {
        message = level;
      }
      if (!Array.isArray(Colorizer.allColors[lookup])) {
        return colors[Colorizer.allColors[lookup]](message);
      }
      for (let i = 0, len = Colorizer.allColors[lookup].length;i < len; i++) {
        message = colors[Colorizer.allColors[lookup][i]](message);
      }
      return message;
    }
    transform(info, opts) {
      if (opts.all && typeof info[MESSAGE] === "string") {
        info[MESSAGE] = this.colorize(info[LEVEL], info.level, info[MESSAGE]);
      }
      if (opts.level || opts.all || !opts.message) {
        info.level = this.colorize(info[LEVEL], info.level);
      }
      if (opts.all || opts.message) {
        info.message = this.colorize(info[LEVEL], info.level, info.message);
      }
      return info;
    }
  }
  module.exports = (opts) => new Colorizer(opts);
  module.exports.Colorizer = module.exports.Format = Colorizer;
});

// node_modules/logform/levels.js
var require_levels = __commonJS((exports, module) => {
  var { Colorizer } = require_colorize();
  module.exports = (config) => {
    Colorizer.addColors(config.colors || config);
    return config;
  };
});

// node_modules/logform/align.js
var require_align = __commonJS((exports, module) => {
  var format = require_format();
  module.exports = format((info) => {
    info.message = `\t${info.message}`;
    return info;
  });
});

// node_modules/logform/errors.js
var require_errors = __commonJS((exports, module) => {
  var format = require_format();
  var { LEVEL, MESSAGE } = require_triple_beam();
  module.exports = format((einfo, { stack, cause }) => {
    if (einfo instanceof Error) {
      const info = Object.assign({}, einfo, {
        level: einfo.level,
        [LEVEL]: einfo[LEVEL] || einfo.level,
        message: einfo.message,
        [MESSAGE]: einfo[MESSAGE] || einfo.message
      });
      if (stack)
        info.stack = einfo.stack;
      if (cause)
        info.cause = einfo.cause;
      return info;
    }
    if (!(einfo.message instanceof Error))
      return einfo;
    const err = einfo.message;
    Object.assign(einfo, err);
    einfo.message = err.message;
    einfo[MESSAGE] = err.message;
    if (stack)
      einfo.stack = err.stack;
    if (cause)
      einfo.cause = err.cause;
    return einfo;
  });
});

// node_modules/logform/pad-levels.js
var require_pad_levels = __commonJS((exports, module) => {
  var { configs, LEVEL, MESSAGE } = require_triple_beam();

  class Padder {
    constructor(opts = { levels: configs.npm.levels }) {
      this.paddings = Padder.paddingForLevels(opts.levels, opts.filler);
      this.options = opts;
    }
    static getLongestLevel(levels) {
      const lvls = Object.keys(levels).map((level) => level.length);
      return Math.max(...lvls);
    }
    static paddingForLevel(level, filler, maxLength) {
      const targetLen = maxLength + 1 - level.length;
      const rep = Math.floor(targetLen / filler.length);
      const padding = `${filler}${filler.repeat(rep)}`;
      return padding.slice(0, targetLen);
    }
    static paddingForLevels(levels, filler = " ") {
      const maxLength = Padder.getLongestLevel(levels);
      return Object.keys(levels).reduce((acc, level) => {
        acc[level] = Padder.paddingForLevel(level, filler, maxLength);
        return acc;
      }, {});
    }
    transform(info, opts) {
      info.message = `${this.paddings[info[LEVEL]]}${info.message}`;
      if (info[MESSAGE]) {
        info[MESSAGE] = `${this.paddings[info[LEVEL]]}${info[MESSAGE]}`;
      }
      return info;
    }
  }
  module.exports = (opts) => new Padder(opts);
  module.exports.Padder = module.exports.Format = Padder;
});

// node_modules/logform/cli.js
var require_cli2 = __commonJS((exports, module) => {
  var { Colorizer } = require_colorize();
  var { Padder } = require_pad_levels();
  var { configs, MESSAGE } = require_triple_beam();

  class CliFormat {
    constructor(opts = {}) {
      if (!opts.levels) {
        opts.levels = configs.cli.levels;
      }
      this.colorizer = new Colorizer(opts);
      this.padder = new Padder(opts);
      this.options = opts;
    }
    transform(info, opts) {
      this.colorizer.transform(this.padder.transform(info, opts), opts);
      info[MESSAGE] = `${info.level}:${info.message}`;
      return info;
    }
  }
  module.exports = (opts) => new CliFormat(opts);
  module.exports.Format = CliFormat;
});

// node_modules/logform/combine.js
var require_combine = __commonJS((exports, module) => {
  function cascade(formats) {
    if (!formats.every(isValidFormat)) {
      return;
    }
    return (info) => {
      let obj = info;
      for (let i = 0;i < formats.length; i++) {
        obj = formats[i].transform(obj, formats[i].options);
        if (!obj) {
          return false;
        }
      }
      return obj;
    };
  }
  function isValidFormat(fmt) {
    if (typeof fmt.transform !== "function") {
      throw new Error([
        "No transform function found on format. Did you create a format instance?",
        "const myFormat = format(formatFn);",
        "const instance = myFormat();"
      ].join("\n"));
    }
    return true;
  }
  var format = require_format();
  module.exports = (...formats) => {
    const combinedFormat = format(cascade(formats));
    const instance = combinedFormat();
    instance.Format = combinedFormat.Format;
    return instance;
  };
  module.exports.cascade = cascade;
});

// node_modules/safe-stable-stringify/index.js
var require_safe_stable_stringify = __commonJS((exports, module) => {
  function strEscape(str) {
    if (str.length < 5000 && !strEscapeSequencesRegExp.test(str)) {
      return `"${str}"`;
    }
    return JSON.stringify(str);
  }
  function sort(array, comparator) {
    if (array.length > 200 || comparator) {
      return array.sort(comparator);
    }
    for (let i = 1;i < array.length; i++) {
      const currentValue = array[i];
      let position = i;
      while (position !== 0 && array[position - 1] > currentValue) {
        array[position] = array[position - 1];
        position--;
      }
      array[position] = currentValue;
    }
    return array;
  }
  function isTypedArrayWithEntries(value) {
    return typedArrayPrototypeGetSymbolToStringTag.call(value) !== undefined && value.length !== 0;
  }
  function stringifyTypedArray(array, separator, maximumBreadth) {
    if (array.length < maximumBreadth) {
      maximumBreadth = array.length;
    }
    const whitespace = separator === "," ? "" : " ";
    let res = `"0":${whitespace}${array[0]}`;
    for (let i = 1;i < maximumBreadth; i++) {
      res += `${separator}"${i}":${whitespace}${array[i]}`;
    }
    return res;
  }
  function getCircularValueOption(options) {
    if (hasOwnProperty.call(options, "circularValue")) {
      const circularValue = options.circularValue;
      if (typeof circularValue === "string") {
        return `"${circularValue}"`;
      }
      if (circularValue == null) {
        return circularValue;
      }
      if (circularValue === Error || circularValue === TypeError) {
        return {
          toString() {
            throw new TypeError("Converting circular structure to JSON");
          }
        };
      }
      throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined');
    }
    return '"[Circular]"';
  }
  function getDeterministicOption(options) {
    let value;
    if (hasOwnProperty.call(options, "deterministic")) {
      value = options.deterministic;
      if (typeof value !== "boolean" && typeof value !== "function") {
        throw new TypeError('The "deterministic" argument must be of type boolean or comparator function');
      }
    }
    return value === undefined ? true : value;
  }
  function getBooleanOption(options, key) {
    let value;
    if (hasOwnProperty.call(options, key)) {
      value = options[key];
      if (typeof value !== "boolean") {
        throw new TypeError(`The "${key}" argument must be of type boolean`);
      }
    }
    return value === undefined ? true : value;
  }
  function getPositiveIntegerOption(options, key) {
    let value;
    if (hasOwnProperty.call(options, key)) {
      value = options[key];
      if (typeof value !== "number") {
        throw new TypeError(`The "${key}" argument must be of type number`);
      }
      if (!Number.isInteger(value)) {
        throw new TypeError(`The "${key}" argument must be an integer`);
      }
      if (value < 1) {
        throw new RangeError(`The "${key}" argument must be >= 1`);
      }
    }
    return value === undefined ? Infinity : value;
  }
  function getItemCount(number) {
    if (number === 1) {
      return "1 item";
    }
    return `${number} items`;
  }
  function getUniqueReplacerSet(replacerArray) {
    const replacerSet = new Set;
    for (const value of replacerArray) {
      if (typeof value === "string" || typeof value === "number") {
        replacerSet.add(String(value));
      }
    }
    return replacerSet;
  }
  function getStrictOption(options) {
    if (hasOwnProperty.call(options, "strict")) {
      const value = options.strict;
      if (typeof value !== "boolean") {
        throw new TypeError('The "strict" argument must be of type boolean');
      }
      if (value) {
        return (value2) => {
          let message = `Object can not safely be stringified. Received type ${typeof value2}`;
          if (typeof value2 !== "function")
            message += ` (${value2.toString()})`;
          throw new Error(message);
        };
      }
    }
  }
  function configure(options) {
    options = { ...options };
    const fail = getStrictOption(options);
    if (fail) {
      if (options.bigint === undefined) {
        options.bigint = false;
      }
      if (!("circularValue" in options)) {
        options.circularValue = Error;
      }
    }
    const circularValue = getCircularValueOption(options);
    const bigint = getBooleanOption(options, "bigint");
    const deterministic = getDeterministicOption(options);
    const comparator = typeof deterministic === "function" ? deterministic : undefined;
    const maximumDepth = getPositiveIntegerOption(options, "maximumDepth");
    const maximumBreadth = getPositiveIntegerOption(options, "maximumBreadth");
    function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
      let value = parent[key];
      if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }
      value = replacer.call(parent, key, value);
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          let res = "";
          let join = ",";
          const originalIndentation = indentation;
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            if (spacer !== "") {
              indentation += spacer;
              res += `\n${indentation}`;
              join = `,\n${indentation}`;
            }
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += join;
            }
            const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            if (spacer !== "") {
              res += `\n${originalIndentation}`;
            }
            stack.pop();
            return `[${res}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          let whitespace = "";
          let separator = "";
          if (spacer !== "") {
            indentation += spacer;
            join = `,\n${indentation}`;
            whitespace = " ";
          }
          const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (deterministic && !isTypedArrayWithEntries(value)) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifyFnReplacer(key2, value, stack, replacer, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
              separator = join;
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
            separator = join;
          }
          if (spacer !== "" && separator.length > 1) {
            res = `\n${indentation}${res}\n${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
      if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          const originalIndentation = indentation;
          let res = "";
          let join = ",";
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            if (spacer !== "") {
              indentation += spacer;
              res += `\n${indentation}`;
              join = `,\n${indentation}`;
            }
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += join;
            }
            const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            if (spacer !== "") {
              res += `\n${originalIndentation}`;
            }
            stack.pop();
            return `[${res}]`;
          }
          stack.push(value);
          let whitespace = "";
          if (spacer !== "") {
            indentation += spacer;
            join = `,\n${indentation}`;
            whitespace = " ";
          }
          let separator = "";
          for (const key2 of replacer) {
            const tmp = stringifyArrayReplacer(key2, value[key2], stack, replacer, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
              separator = join;
            }
          }
          if (spacer !== "" && separator.length > 1) {
            res = `\n${indentation}${res}\n${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifyIndent(key, value, stack, spacer, indentation) {
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (typeof value.toJSON === "function") {
            value = value.toJSON(key);
            if (typeof value !== "object") {
              return stringifyIndent(key, value, stack, spacer, indentation);
            }
            if (value === null) {
              return "null";
            }
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          const originalIndentation = indentation;
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            indentation += spacer;
            let res2 = `\n${indentation}`;
            const join2 = `,\n${indentation}`;
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyIndent(String(i), value[i], stack, spacer, indentation);
              res2 += tmp2 !== undefined ? tmp2 : "null";
              res2 += join2;
            }
            const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
            res2 += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res2 += `${join2}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            res2 += `\n${originalIndentation}`;
            stack.pop();
            return `[${res2}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          indentation += spacer;
          const join = `,\n${indentation}`;
          let res = "";
          let separator = "";
          let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (isTypedArrayWithEntries(value)) {
            res += stringifyTypedArray(value, join, maximumBreadth);
            keys = keys.slice(value.length);
            maximumPropertiesToStringify -= value.length;
            separator = join;
          }
          if (deterministic) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifyIndent(key2, value[key2], stack, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}: ${tmp}`;
              separator = join;
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
            separator = join;
          }
          if (separator !== "") {
            res = `\n${indentation}${res}\n${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifySimple(key, value, stack) {
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (typeof value.toJSON === "function") {
            value = value.toJSON(key);
            if (typeof value !== "object") {
              return stringifySimple(key, value, stack);
            }
            if (value === null) {
              return "null";
            }
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          let res = "";
          const hasLength = value.length !== undefined;
          if (hasLength && Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifySimple(String(i), value[i], stack);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += ",";
            }
            const tmp = stringifySimple(String(i), value[i], stack);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `,"... ${getItemCount(removedKeys)} not stringified"`;
            }
            stack.pop();
            return `[${res}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          let separator = "";
          let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (hasLength && isTypedArrayWithEntries(value)) {
            res += stringifyTypedArray(value, ",", maximumBreadth);
            keys = keys.slice(value.length);
            maximumPropertiesToStringify -= value.length;
            separator = ",";
          }
          if (deterministic) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifySimple(key2, value[key2], stack);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${tmp}`;
              separator = ",";
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringify2(value, replacer, space) {
      if (arguments.length > 1) {
        let spacer = "";
        if (typeof space === "number") {
          spacer = " ".repeat(Math.min(space, 10));
        } else if (typeof space === "string") {
          spacer = space.slice(0, 10);
        }
        if (replacer != null) {
          if (typeof replacer === "function") {
            return stringifyFnReplacer("", { "": value }, [], replacer, spacer, "");
          }
          if (Array.isArray(replacer)) {
            return stringifyArrayReplacer("", value, [], getUniqueReplacerSet(replacer), spacer, "");
          }
        }
        if (spacer.length !== 0) {
          return stringifyIndent("", value, [], spacer, "");
        }
      }
      return stringifySimple("", value, []);
    }
    return stringify2;
  }
  var { hasOwnProperty } = Object.prototype;
  var stringify = configure();
  stringify.configure = configure;
  stringify.stringify = stringify;
  stringify.default = stringify;
  exports.stringify = stringify;
  exports.configure = configure;
  module.exports = stringify;
  var strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;
  var typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(new Int8Array)), Symbol.toStringTag).get;
});

// node_modules/logform/json.js
var require_json = __commonJS((exports, module) => {
  function replacer(key, value) {
    if (typeof value === "bigint")
      return value.toString();
    return value;
  }
  var format = require_format();
  var { MESSAGE } = require_triple_beam();
  var stringify = require_safe_stable_stringify();
  module.exports = format((info, opts) => {
    const jsonStringify = stringify.configure(opts);
    info[MESSAGE] = jsonStringify(info, opts.replacer || replacer, opts.space);
    return info;
  });
});

// node_modules/logform/label.js
var require_label = __commonJS((exports, module) => {
  var format = require_format();
  module.exports = format((info, opts) => {
    if (opts.message) {
      info.message = `[${opts.label}] ${info.message}`;
      return info;
    }
    info.label = opts.label;
    return info;
  });
});

// node_modules/logform/logstash.js
var require_logstash = __commonJS((exports, module) => {
  var format = require_format();
  var { MESSAGE } = require_triple_beam();
  var jsonStringify = require_safe_stable_stringify();
  module.exports = format((info) => {
    const logstash = {};
    if (info.message) {
      logstash["@message"] = info.message;
      delete info.message;
    }
    if (info.timestamp) {
      logstash["@timestamp"] = info.timestamp;
      delete info.timestamp;
    }
    logstash["@fields"] = info;
    info[MESSAGE] = jsonStringify(logstash);
    return info;
  });
});

// node_modules/logform/metadata.js
var require_metadata = __commonJS((exports, module) => {
  function fillExcept(info, fillExceptKeys, metadataKey) {
    const savedKeys = fillExceptKeys.reduce((acc, key) => {
      acc[key] = info[key];
      delete info[key];
      return acc;
    }, {});
    const metadata = Object.keys(info).reduce((acc, key) => {
      acc[key] = info[key];
      delete info[key];
      return acc;
    }, {});
    Object.assign(info, savedKeys, {
      [metadataKey]: metadata
    });
    return info;
  }
  function fillWith(info, fillWithKeys, metadataKey) {
    info[metadataKey] = fillWithKeys.reduce((acc, key) => {
      acc[key] = info[key];
      delete info[key];
      return acc;
    }, {});
    return info;
  }
  var format = require_format();
  module.exports = format((info, opts = {}) => {
    let metadataKey = "metadata";
    if (opts.key) {
      metadataKey = opts.key;
    }
    let fillExceptKeys = [];
    if (!opts.fillExcept && !opts.fillWith) {
      fillExceptKeys.push("level");
      fillExceptKeys.push("message");
    }
    if (opts.fillExcept) {
      fillExceptKeys = opts.fillExcept;
    }
    if (fillExceptKeys.length > 0) {
      return fillExcept(info, fillExceptKeys, metadataKey);
    }
    if (opts.fillWith) {
      return fillWith(info, opts.fillWith, metadataKey);
    }
    return info;
  });
});

// node_modules/ms/index.js
var require_ms = __commonJS((exports, module) => {
  function parse2(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return;
    }
  }
  function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  }
  function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, "second");
    }
    return ms + " ms";
  }
  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  }
  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse2(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
});

// node_modules/logform/ms.js
var require_ms2 = __commonJS((exports, module) => {
  var format = require_format();
  var ms = require_ms();
  module.exports = format((info) => {
    const curr = +new Date;
    exports.diff = curr - (exports.prevTime || curr);
    exports.prevTime = curr;
    info.ms = `+${ms(exports.diff)}`;
    return info;
  });
});

// node_modules/logform/pretty-print.js
var require_pretty_print = __commonJS((exports, module) => {
  var inspect = import.meta.require("util").inspect;
  var format = require_format();
  var { LEVEL, MESSAGE, SPLAT } = require_triple_beam();
  module.exports = format((info, opts = {}) => {
    const stripped = Object.assign({}, info);
    delete stripped[LEVEL];
    delete stripped[MESSAGE];
    delete stripped[SPLAT];
    info[MESSAGE] = inspect(stripped, false, opts.depth || null, opts.colorize);
    return info;
  });
});

// node_modules/logform/printf.js
var require_printf = __commonJS((exports, module) => {
  var { MESSAGE } = require_triple_beam();

  class Printf {
    constructor(templateFn) {
      this.template = templateFn;
    }
    transform(info) {
      info[MESSAGE] = this.template(info);
      return info;
    }
  }
  module.exports = (opts) => new Printf(opts);
  module.exports.Printf = module.exports.Format = Printf;
});

// node_modules/logform/simple.js
var require_simple = __commonJS((exports, module) => {
  var format = require_format();
  var { MESSAGE } = require_triple_beam();
  var jsonStringify = require_safe_stable_stringify();
  module.exports = format((info) => {
    const stringifiedRest = jsonStringify(Object.assign({}, info, {
      level: undefined,
      message: undefined,
      splat: undefined
    }));
    const padding = info.padding && info.padding[info.level] || "";
    if (stringifiedRest !== "{}") {
      info[MESSAGE] = `${info.level}:${padding} ${info.message} ${stringifiedRest}`;
    } else {
      info[MESSAGE] = `${info.level}:${padding} ${info.message}`;
    }
    return info;
  });
});

// node_modules/logform/splat.js
var require_splat = __commonJS((exports, module) => {
  var util = import.meta.require("util");
  var { SPLAT } = require_triple_beam();
  var formatRegExp = /%[scdjifoO%]/g;
  var escapedPercent = /%%/g;

  class Splatter {
    constructor(opts) {
      this.options = opts;
    }
    _splat(info, tokens) {
      const msg = info.message;
      const splat = info[SPLAT] || info.splat || [];
      const percents = msg.match(escapedPercent);
      const escapes = percents && percents.length || 0;
      const expectedSplat = tokens.length - escapes;
      const extraSplat = expectedSplat - splat.length;
      const metas = extraSplat < 0 ? splat.splice(extraSplat, -1 * extraSplat) : [];
      const metalen = metas.length;
      if (metalen) {
        for (let i = 0;i < metalen; i++) {
          Object.assign(info, metas[i]);
        }
      }
      info.message = util.format(msg, ...splat);
      return info;
    }
    transform(info) {
      const msg = info.message;
      const splat = info[SPLAT] || info.splat;
      if (!splat || !splat.length) {
        return info;
      }
      const tokens = msg && msg.match && msg.match(formatRegExp);
      if (!tokens && (splat || splat.length)) {
        const metas = splat.length > 1 ? splat.splice(0) : splat;
        const metalen = metas.length;
        if (metalen) {
          for (let i = 0;i < metalen; i++) {
            Object.assign(info, metas[i]);
          }
        }
        return info;
      }
      if (tokens) {
        return this._splat(info, tokens);
      }
      return info;
    }
  }
  module.exports = (opts) => new Splatter(opts);
});

// node_modules/fecha/lib/fecha.umd.js
var require_fecha_umd = __commonJS((exports, module) => {
  (function(global2, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : factory(global2.fecha = {});
  })(exports, function(exports2) {
    var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
    var twoDigitsOptional = "\\d\\d?";
    var twoDigits = "\\d\\d";
    var threeDigits = "\\d{3}";
    var fourDigits = "\\d{4}";
    var word = "[^\\s]+";
    var literal = /\[([^]*?)\]/gm;
    function shorten(arr, sLen) {
      var newArr = [];
      for (var i = 0, len = arr.length;i < len; i++) {
        newArr.push(arr[i].substr(0, sLen));
      }
      return newArr;
    }
    var monthUpdate = function(arrName) {
      return function(v, i18n) {
        var lowerCaseArr = i18n[arrName].map(function(v2) {
          return v2.toLowerCase();
        });
        var index = lowerCaseArr.indexOf(v.toLowerCase());
        if (index > -1) {
          return index;
        }
        return null;
      };
    };
    function assign(origObj) {
      var args = [];
      for (var _i = 1;_i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }
      for (var _a = 0, args_1 = args;_a < args_1.length; _a++) {
        var obj = args_1[_a];
        for (var key in obj) {
          origObj[key] = obj[key];
        }
      }
      return origObj;
    }
    var dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    var monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    var monthNamesShort = shorten(monthNames, 3);
    var dayNamesShort = shorten(dayNames, 3);
    var defaultI18n = {
      dayNamesShort,
      dayNames,
      monthNamesShort,
      monthNames,
      amPm: ["am", "pm"],
      DoFn: function(dayOfMonth) {
        return dayOfMonth + ["th", "st", "nd", "rd"][dayOfMonth % 10 > 3 ? 0 : (dayOfMonth - dayOfMonth % 10 !== 10 ? 1 : 0) * dayOfMonth % 10];
      }
    };
    var globalI18n = assign({}, defaultI18n);
    var setGlobalDateI18n = function(i18n) {
      return globalI18n = assign(globalI18n, i18n);
    };
    var regexEscape = function(str) {
      return str.replace(/[|\\{()[^$+*?.-]/g, "\\$&");
    };
    var pad = function(val, len) {
      if (len === undefined) {
        len = 2;
      }
      val = String(val);
      while (val.length < len) {
        val = "0" + val;
      }
      return val;
    };
    var formatFlags = {
      D: function(dateObj) {
        return String(dateObj.getDate());
      },
      DD: function(dateObj) {
        return pad(dateObj.getDate());
      },
      Do: function(dateObj, i18n) {
        return i18n.DoFn(dateObj.getDate());
      },
      d: function(dateObj) {
        return String(dateObj.getDay());
      },
      dd: function(dateObj) {
        return pad(dateObj.getDay());
      },
      ddd: function(dateObj, i18n) {
        return i18n.dayNamesShort[dateObj.getDay()];
      },
      dddd: function(dateObj, i18n) {
        return i18n.dayNames[dateObj.getDay()];
      },
      M: function(dateObj) {
        return String(dateObj.getMonth() + 1);
      },
      MM: function(dateObj) {
        return pad(dateObj.getMonth() + 1);
      },
      MMM: function(dateObj, i18n) {
        return i18n.monthNamesShort[dateObj.getMonth()];
      },
      MMMM: function(dateObj, i18n) {
        return i18n.monthNames[dateObj.getMonth()];
      },
      YY: function(dateObj) {
        return pad(String(dateObj.getFullYear()), 4).substr(2);
      },
      YYYY: function(dateObj) {
        return pad(dateObj.getFullYear(), 4);
      },
      h: function(dateObj) {
        return String(dateObj.getHours() % 12 || 12);
      },
      hh: function(dateObj) {
        return pad(dateObj.getHours() % 12 || 12);
      },
      H: function(dateObj) {
        return String(dateObj.getHours());
      },
      HH: function(dateObj) {
        return pad(dateObj.getHours());
      },
      m: function(dateObj) {
        return String(dateObj.getMinutes());
      },
      mm: function(dateObj) {
        return pad(dateObj.getMinutes());
      },
      s: function(dateObj) {
        return String(dateObj.getSeconds());
      },
      ss: function(dateObj) {
        return pad(dateObj.getSeconds());
      },
      S: function(dateObj) {
        return String(Math.round(dateObj.getMilliseconds() / 100));
      },
      SS: function(dateObj) {
        return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
      },
      SSS: function(dateObj) {
        return pad(dateObj.getMilliseconds(), 3);
      },
      a: function(dateObj, i18n) {
        return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
      },
      A: function(dateObj, i18n) {
        return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
      },
      ZZ: function(dateObj) {
        var offset = dateObj.getTimezoneOffset();
        return (offset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(offset) / 60) * 100 + Math.abs(offset) % 60, 4);
      },
      Z: function(dateObj) {
        var offset = dateObj.getTimezoneOffset();
        return (offset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(offset) / 60), 2) + ":" + pad(Math.abs(offset) % 60, 2);
      }
    };
    var monthParse = function(v) {
      return +v - 1;
    };
    var emptyDigits = [null, twoDigitsOptional];
    var emptyWord = [null, word];
    var amPm = [
      "isPm",
      word,
      function(v, i18n) {
        var val = v.toLowerCase();
        if (val === i18n.amPm[0]) {
          return 0;
        } else if (val === i18n.amPm[1]) {
          return 1;
        }
        return null;
      }
    ];
    var timezoneOffset = [
      "timezoneOffset",
      "[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",
      function(v) {
        var parts = (v + "").match(/([+-]|\d\d)/gi);
        if (parts) {
          var minutes = +parts[1] * 60 + parseInt(parts[2], 10);
          return parts[0] === "+" ? minutes : -minutes;
        }
        return 0;
      }
    ];
    var parseFlags = {
      D: ["day", twoDigitsOptional],
      DD: ["day", twoDigits],
      Do: ["day", twoDigitsOptional + word, function(v) {
        return parseInt(v, 10);
      }],
      M: ["month", twoDigitsOptional, monthParse],
      MM: ["month", twoDigits, monthParse],
      YY: [
        "year",
        twoDigits,
        function(v) {
          var now = new Date;
          var cent = +("" + now.getFullYear()).substr(0, 2);
          return +("" + (+v > 68 ? cent - 1 : cent) + v);
        }
      ],
      h: ["hour", twoDigitsOptional, undefined, "isPm"],
      hh: ["hour", twoDigits, undefined, "isPm"],
      H: ["hour", twoDigitsOptional],
      HH: ["hour", twoDigits],
      m: ["minute", twoDigitsOptional],
      mm: ["minute", twoDigits],
      s: ["second", twoDigitsOptional],
      ss: ["second", twoDigits],
      YYYY: ["year", fourDigits],
      S: ["millisecond", "\\d", function(v) {
        return +v * 100;
      }],
      SS: ["millisecond", twoDigits, function(v) {
        return +v * 10;
      }],
      SSS: ["millisecond", threeDigits],
      d: emptyDigits,
      dd: emptyDigits,
      ddd: emptyWord,
      dddd: emptyWord,
      MMM: ["month", word, monthUpdate("monthNamesShort")],
      MMMM: ["month", word, monthUpdate("monthNames")],
      a: amPm,
      A: amPm,
      ZZ: timezoneOffset,
      Z: timezoneOffset
    };
    var globalMasks = {
      default: "ddd MMM DD YYYY HH:mm:ss",
      shortDate: "M/D/YY",
      mediumDate: "MMM D, YYYY",
      longDate: "MMMM D, YYYY",
      fullDate: "dddd, MMMM D, YYYY",
      isoDate: "YYYY-MM-DD",
      isoDateTime: "YYYY-MM-DDTHH:mm:ssZ",
      shortTime: "HH:mm",
      mediumTime: "HH:mm:ss",
      longTime: "HH:mm:ss.SSS"
    };
    var setGlobalDateMasks = function(masks) {
      return assign(globalMasks, masks);
    };
    var format = function(dateObj, mask, i18n) {
      if (mask === undefined) {
        mask = globalMasks["default"];
      }
      if (i18n === undefined) {
        i18n = {};
      }
      if (typeof dateObj === "number") {
        dateObj = new Date(dateObj);
      }
      if (Object.prototype.toString.call(dateObj) !== "[object Date]" || isNaN(dateObj.getTime())) {
        throw new Error("Invalid Date pass to format");
      }
      mask = globalMasks[mask] || mask;
      var literals = [];
      mask = mask.replace(literal, function($0, $1) {
        literals.push($1);
        return "@@@";
      });
      var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
      mask = mask.replace(token, function($0) {
        return formatFlags[$0](dateObj, combinedI18nSettings);
      });
      return mask.replace(/@@@/g, function() {
        return literals.shift();
      });
    };
    function parse2(dateStr, format2, i18n) {
      if (i18n === undefined) {
        i18n = {};
      }
      if (typeof format2 !== "string") {
        throw new Error("Invalid format in fecha parse");
      }
      format2 = globalMasks[format2] || format2;
      if (dateStr.length > 1000) {
        return null;
      }
      var today = new Date;
      var dateInfo = {
        year: today.getFullYear(),
        month: 0,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        isPm: null,
        timezoneOffset: null
      };
      var parseInfo = [];
      var literals = [];
      var newFormat = format2.replace(literal, function($0, $1) {
        literals.push(regexEscape($1));
        return "@@@";
      });
      var specifiedFields = {};
      var requiredFields = {};
      newFormat = regexEscape(newFormat).replace(token, function($0) {
        var info = parseFlags[$0];
        var field2 = info[0], regex = info[1], requiredField = info[3];
        if (specifiedFields[field2]) {
          throw new Error("Invalid format. " + field2 + " specified twice in format");
        }
        specifiedFields[field2] = true;
        if (requiredField) {
          requiredFields[requiredField] = true;
        }
        parseInfo.push(info);
        return "(" + regex + ")";
      });
      Object.keys(requiredFields).forEach(function(field2) {
        if (!specifiedFields[field2]) {
          throw new Error("Invalid format. " + field2 + " is required in specified format");
        }
      });
      newFormat = newFormat.replace(/@@@/g, function() {
        return literals.shift();
      });
      var matches = dateStr.match(new RegExp(newFormat, "i"));
      if (!matches) {
        return null;
      }
      var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
      for (var i = 1;i < matches.length; i++) {
        var _a = parseInfo[i - 1], field = _a[0], parser = _a[2];
        var value = parser ? parser(matches[i], combinedI18nSettings) : +matches[i];
        if (value == null) {
          return null;
        }
        dateInfo[field] = value;
      }
      if (dateInfo.isPm === 1 && dateInfo.hour != null && +dateInfo.hour !== 12) {
        dateInfo.hour = +dateInfo.hour + 12;
      } else if (dateInfo.isPm === 0 && +dateInfo.hour === 12) {
        dateInfo.hour = 0;
      }
      var dateTZ;
      if (dateInfo.timezoneOffset == null) {
        dateTZ = new Date(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute, dateInfo.second, dateInfo.millisecond);
        var validateFields = [
          ["month", "getMonth"],
          ["day", "getDate"],
          ["hour", "getHours"],
          ["minute", "getMinutes"],
          ["second", "getSeconds"]
        ];
        for (var i = 0, len = validateFields.length;i < len; i++) {
          if (specifiedFields[validateFields[i][0]] && dateInfo[validateFields[i][0]] !== dateTZ[validateFields[i][1]]()) {
            return null;
          }
        }
      } else {
        dateTZ = new Date(Date.UTC(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute - dateInfo.timezoneOffset, dateInfo.second, dateInfo.millisecond));
        if (dateInfo.month > 11 || dateInfo.month < 0 || dateInfo.day > 31 || dateInfo.day < 1 || dateInfo.hour > 23 || dateInfo.hour < 0 || dateInfo.minute > 59 || dateInfo.minute < 0 || dateInfo.second > 59 || dateInfo.second < 0) {
          return null;
        }
      }
      return dateTZ;
    }
    var fecha = {
      format,
      parse: parse2,
      defaultI18n,
      setGlobalDateI18n,
      setGlobalDateMasks
    };
    exports2.assign = assign;
    exports2.default = fecha;
    exports2.format = format;
    exports2.parse = parse2;
    exports2.defaultI18n = defaultI18n;
    exports2.setGlobalDateI18n = setGlobalDateI18n;
    exports2.setGlobalDateMasks = setGlobalDateMasks;
    Object.defineProperty(exports2, "__esModule", { value: true });
  });
});

// node_modules/logform/timestamp.js
var require_timestamp = __commonJS((exports, module) => {
  var fecha = require_fecha_umd();
  var format = require_format();
  module.exports = format((info, opts = {}) => {
    if (opts.format) {
      info.timestamp = typeof opts.format === "function" ? opts.format() : fecha.format(new Date, opts.format);
    }
    if (!info.timestamp) {
      info.timestamp = new Date().toISOString();
    }
    if (opts.alias) {
      info[opts.alias] = info.timestamp;
    }
    return info;
  });
});

// node_modules/logform/uncolorize.js
var require_uncolorize = __commonJS((exports, module) => {
  var colors = require_safe();
  var format = require_format();
  var { MESSAGE } = require_triple_beam();
  module.exports = format((info, opts) => {
    if (opts.level !== false) {
      info.level = colors.strip(info.level);
    }
    if (opts.message !== false) {
      info.message = colors.strip(String(info.message));
    }
    if (opts.raw !== false && info[MESSAGE]) {
      info[MESSAGE] = colors.strip(String(info[MESSAGE]));
    }
    return info;
  });
});

// node_modules/logform/index.js
var require_logform = __commonJS((exports) => {
  function exposeFormat(name, requireFormat) {
    Object.defineProperty(format, name, {
      get() {
        return requireFormat();
      },
      configurable: true
    });
  }
  var format = exports.format = require_format();
  exports.levels = require_levels();
  exposeFormat("align", function() {
    return require_align();
  });
  exposeFormat("errors", function() {
    return require_errors();
  });
  exposeFormat("cli", function() {
    return require_cli2();
  });
  exposeFormat("combine", function() {
    return require_combine();
  });
  exposeFormat("colorize", function() {
    return require_colorize();
  });
  exposeFormat("json", function() {
    return require_json();
  });
  exposeFormat("label", function() {
    return require_label();
  });
  exposeFormat("logstash", function() {
    return require_logstash();
  });
  exposeFormat("metadata", function() {
    return require_metadata();
  });
  exposeFormat("ms", function() {
    return require_ms2();
  });
  exposeFormat("padLevels", function() {
    return require_pad_levels();
  });
  exposeFormat("prettyPrint", function() {
    return require_pretty_print();
  });
  exposeFormat("printf", function() {
    return require_printf();
  });
  exposeFormat("simple", function() {
    return require_simple();
  });
  exposeFormat("splat", function() {
    return require_splat();
  });
  exposeFormat("timestamp", function() {
    return require_timestamp();
  });
  exposeFormat("uncolorize", function() {
    return require_uncolorize();
  });
});

// node_modules/winston/lib/winston/common.js
var require_common = __commonJS((exports) => {
  var { format } = import.meta.require("util");
  exports.warn = {
    deprecated(prop) {
      return () => {
        throw new Error(format("{ %s } was removed in winston@3.0.0.", prop));
      };
    },
    useFormat(prop) {
      return () => {
        throw new Error([
          format("{ %s } was removed in winston@3.0.0.", prop),
          "Use a custom winston.format = winston.format(function) instead."
        ].join("\n"));
      };
    },
    forFunctions(obj, type, props) {
      props.forEach((prop) => {
        obj[prop] = exports.warn[type](prop);
      });
    },
    forProperties(obj, type, props) {
      props.forEach((prop) => {
        const notice = exports.warn[type](prop);
        Object.defineProperty(obj, prop, {
          get: notice,
          set: notice
        });
      });
    }
  };
});

// node_modules/winston/package.json
var require_package2 = __commonJS((exports, module) => {
  module.exports = {
    name: "winston",
    description: "A logger for just about everything.",
    version: "3.17.0",
    author: "Charlie Robbins <charlie.robbins@gmail.com>",
    maintainers: [
      "David Hyde <dabh@alumni.stanford.edu>"
    ],
    repository: {
      type: "git",
      url: "https://github.com/winstonjs/winston.git"
    },
    keywords: [
      "winston",
      "logger",
      "logging",
      "logs",
      "sysadmin",
      "bunyan",
      "pino",
      "loglevel",
      "tools",
      "json",
      "stream"
    ],
    dependencies: {
      "@dabh/diagnostics": "^2.0.2",
      "@colors/colors": "^1.6.0",
      async: "^3.2.3",
      "is-stream": "^2.0.0",
      logform: "^2.7.0",
      "one-time": "^1.0.0",
      "readable-stream": "^3.4.0",
      "safe-stable-stringify": "^2.3.1",
      "stack-trace": "0.0.x",
      "triple-beam": "^1.3.0",
      "winston-transport": "^4.9.0"
    },
    devDependencies: {
      "@babel/cli": "^7.23.9",
      "@babel/core": "^7.24.0",
      "@babel/preset-env": "^7.24.0",
      "@dabh/eslint-config-populist": "^4.4.0",
      "@types/node": "^20.11.24",
      "abstract-winston-transport": "^0.5.1",
      assume: "^2.2.0",
      "cross-spawn-async": "^2.2.5",
      eslint: "^8.57.0",
      hock: "^1.4.1",
      mocha: "^10.3.0",
      nyc: "^17.1.0",
      rimraf: "5.0.1",
      split2: "^4.1.0",
      "std-mocks": "^2.0.0",
      through2: "^4.0.2",
      "winston-compat": "^0.1.5"
    },
    main: "./lib/winston.js",
    browser: "./dist/winston",
    types: "./index.d.ts",
    scripts: {
      lint: "eslint lib/*.js lib/winston/*.js lib/winston/**/*.js --resolve-plugins-relative-to ./node_modules/@dabh/eslint-config-populist",
      test: "rimraf test/fixtures/logs/* && mocha",
      "test:coverage": "nyc npm run test:unit",
      "test:unit": "mocha test/unit",
      "test:integration": "mocha test/integration",
      build: "rimraf dist && babel lib -d dist",
      prepublishOnly: "npm run build"
    },
    engines: {
      node: ">= 12.0.0"
    },
    license: "MIT"
  };
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS((exports, module) => {
  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer2(arg, encodingOrOffset, length);
  }
  /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
  var buffer = import.meta.require("buffer");
  var Buffer2 = buffer.Buffer;
  if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
    module.exports = buffer;
  } else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
  }
  SafeBuffer.prototype = Object.create(Buffer2.prototype);
  copyProps(Buffer2, SafeBuffer);
  SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      throw new TypeError("Argument must not be a number");
    }
    return Buffer2(arg, encodingOrOffset, length);
  };
  SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    var buf = Buffer2(size);
    if (fill !== undefined) {
      if (typeof encoding === "string") {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };
  SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return Buffer2(size);
  };
  SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return buffer.SlowBuffer(size);
  };
});

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS((exports) => {
  function _normalizeEncoding(enc) {
    if (!enc)
      return "utf8";
    var retried;
    while (true) {
      switch (enc) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return enc;
        default:
          if (retried)
            return;
          enc = ("" + enc).toLowerCase();
          retried = true;
      }
    }
  }
  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
      throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
  }
  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;
      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer2.allocUnsafe(nb);
  }
  function utf8CheckByte(byte) {
    if (byte <= 127)
      return 0;
    else if (byte >> 5 === 6)
      return 2;
    else if (byte >> 4 === 14)
      return 3;
    else if (byte >> 3 === 30)
      return 4;
    return byte >> 6 === 2 ? -1 : -2;
  }
  function utf8CheckIncomplete(self2, buf, i) {
    var j = buf.length - 1;
    if (j < i)
      return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self2.lastNeed = nb - 1;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self2.lastNeed = nb - 2;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2)
          nb = 0;
        else
          self2.lastNeed = nb - 3;
      }
      return nb;
    }
    return 0;
  }
  function utf8CheckExtraBytes(self2, buf, p) {
    if ((buf[0] & 192) !== 128) {
      self2.lastNeed = 0;
      return "\uFFFD";
    }
    if (self2.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 192) !== 128) {
        self2.lastNeed = 1;
        return "\uFFFD";
      }
      if (self2.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 192) !== 128) {
          self2.lastNeed = 2;
          return "\uFFFD";
        }
      }
    }
  }
  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf, p);
    if (r !== undefined)
      return r;
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }
  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed)
      return buf.toString("utf8", i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString("utf8", i, end);
  }
  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + "\uFFFD";
    return r;
  }
  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString("utf16le", i);
      if (r) {
        var c = r.charCodeAt(r.length - 1);
        if (c >= 55296 && c <= 56319) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }
      return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i, buf.length - 1);
  }
  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString("utf16le", 0, end);
    }
    return r;
  }
  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0)
      return buf.toString("base64", i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i, buf.length - n);
  }
  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
  }
  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }
  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
  }
  var Buffer2 = require_safe_buffer().Buffer;
  var isEncoding = Buffer2.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch (encoding && encoding.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };
  exports.StringDecoder = StringDecoder;
  StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0)
      return "";
    var r;
    var i;
    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === undefined)
        return "";
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }
    if (i < buf.length)
      return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || "";
  };
  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;
  StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };
});

// node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list = __commonJS((exports, module) => {
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1;i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0;i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null)
      return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object")
        return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function copyBuffer(src, target, offset) {
    Buffer2.prototype.copy.call(src, target, offset);
  }
  var _require = import.meta.require("buffer");
  var Buffer2 = _require.Buffer;
  var _require2 = import.meta.require("util");
  var inspect = _require2.inspect;
  var custom = inspect && inspect.custom || "inspect";
  module.exports = /* @__PURE__ */ function() {
    function BufferList() {
      _classCallCheck(this, BufferList);
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
    _createClass(BufferList, [{
      key: "push",
      value: function push(v) {
        var entry = {
          data: v,
          next: null
        };
        if (this.length > 0)
          this.tail.next = entry;
        else
          this.head = entry;
        this.tail = entry;
        ++this.length;
      }
    }, {
      key: "unshift",
      value: function unshift(v) {
        var entry = {
          data: v,
          next: this.head
        };
        if (this.length === 0)
          this.tail = entry;
        this.head = entry;
        ++this.length;
      }
    }, {
      key: "shift",
      value: function shift() {
        if (this.length === 0)
          return;
        var ret = this.head.data;
        if (this.length === 1)
          this.head = this.tail = null;
        else
          this.head = this.head.next;
        --this.length;
        return ret;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.head = this.tail = null;
        this.length = 0;
      }
    }, {
      key: "join",
      value: function join(s) {
        if (this.length === 0)
          return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next)
          ret += s + p.data;
        return ret;
      }
    }, {
      key: "concat",
      value: function concat(n) {
        if (this.length === 0)
          return Buffer2.alloc(0);
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      }
    }, {
      key: "consume",
      value: function consume(n, hasStrings) {
        var ret;
        if (n < this.head.data.length) {
          ret = this.head.data.slice(0, n);
          this.head.data = this.head.data.slice(n);
        } else if (n === this.head.data.length) {
          ret = this.shift();
        } else {
          ret = hasStrings ? this._getString(n) : this._getBuffer(n);
        }
        return ret;
      }
    }, {
      key: "first",
      value: function first() {
        return this.head.data;
      }
    }, {
      key: "_getString",
      value: function _getString(n) {
        var p = this.head;
        var c = 1;
        var ret = p.data;
        n -= ret.length;
        while (p = p.next) {
          var str = p.data;
          var nb = n > str.length ? str.length : n;
          if (nb === str.length)
            ret += str;
          else
            ret += str.slice(0, n);
          n -= nb;
          if (n === 0) {
            if (nb === str.length) {
              ++c;
              if (p.next)
                this.head = p.next;
              else
                this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = str.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
    }, {
      key: "_getBuffer",
      value: function _getBuffer(n) {
        var ret = Buffer2.allocUnsafe(n);
        var p = this.head;
        var c = 1;
        p.data.copy(ret);
        n -= p.data.length;
        while (p = p.next) {
          var buf = p.data;
          var nb = n > buf.length ? buf.length : n;
          buf.copy(ret, ret.length - n, 0, nb);
          n -= nb;
          if (n === 0) {
            if (nb === buf.length) {
              ++c;
              if (p.next)
                this.head = p.next;
              else
                this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = buf.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
    }, {
      key: custom,
      value: function value(_, options) {
        return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
          depth: 0,
          customInspect: false
        }));
      }
    }]);
    return BufferList;
  }();
});

// node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS((exports, module) => {
  function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
      if (cb) {
        cb(err);
      } else if (err) {
        if (!this._writableState) {
          process.nextTick(emitErrorNT, this, err);
        } else if (!this._writableState.errorEmitted) {
          this._writableState.errorEmitted = true;
          process.nextTick(emitErrorNT, this, err);
        }
      }
      return this;
    }
    if (this._readableState) {
      this._readableState.destroyed = true;
    }
    if (this._writableState) {
      this._writableState.destroyed = true;
    }
    this._destroy(err || null, function(err2) {
      if (!cb && err2) {
        if (!_this._writableState) {
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else if (!_this._writableState.errorEmitted) {
          _this._writableState.errorEmitted = true;
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else {
          process.nextTick(emitCloseNT, _this);
        }
      } else if (cb) {
        process.nextTick(emitCloseNT, _this);
        cb(err2);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    });
    return this;
  }
  function emitErrorAndCloseNT(self2, err) {
    emitErrorNT(self2, err);
    emitCloseNT(self2);
  }
  function emitCloseNT(self2) {
    if (self2._writableState && !self2._writableState.emitClose)
      return;
    if (self2._readableState && !self2._readableState.emitClose)
      return;
    self2.emit("close");
  }
  function undestroy() {
    if (this._readableState) {
      this._readableState.destroyed = false;
      this._readableState.reading = false;
      this._readableState.ended = false;
      this._readableState.endEmitted = false;
    }
    if (this._writableState) {
      this._writableState.destroyed = false;
      this._writableState.ended = false;
      this._writableState.ending = false;
      this._writableState.finalCalled = false;
      this._writableState.prefinished = false;
      this._writableState.finished = false;
      this._writableState.errorEmitted = false;
    }
  }
  function emitErrorNT(self2, err) {
    self2.emit("error", err);
  }
  function errorOrDestroy(stream, err) {
    var rState = stream._readableState;
    var wState = stream._writableState;
    if (rState && rState.autoDestroy || wState && wState.autoDestroy)
      stream.destroy(err);
    else
      stream.emit("error", err);
  }
  module.exports = {
    destroy,
    undestroy,
    errorOrDestroy
  };
});

// node_modules/readable-stream/errors.js
var require_errors2 = __commonJS((exports, module) => {
  function createErrorType(code, message, Base) {
    if (!Base) {
      Base = Error;
    }
    function getMessage(arg1, arg2, arg3) {
      if (typeof message === "string") {
        return message;
      } else {
        return message(arg1, arg2, arg3);
      }
    }

    class NodeError extends Base {
      constructor(arg1, arg2, arg3) {
        super(getMessage(arg1, arg2, arg3));
      }
    }
    NodeError.prototype.name = Base.name;
    NodeError.prototype.code = code;
    codes[code] = NodeError;
  }
  function oneOf(expected, thing) {
    if (Array.isArray(expected)) {
      const len = expected.length;
      expected = expected.map((i) => String(i));
      if (len > 2) {
        return `one of ${thing} ${expected.slice(0, len - 1).join(", ")}, or ` + expected[len - 1];
      } else if (len === 2) {
        return `one of ${thing} ${expected[0]} or ${expected[1]}`;
      } else {
        return `of ${thing} ${expected[0]}`;
      }
    } else {
      return `of ${thing} ${String(expected)}`;
    }
  }
  function startsWith(str, search, pos) {
    return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  }
  function endsWith(str, search, this_len) {
    if (this_len === undefined || this_len > str.length) {
      this_len = str.length;
    }
    return str.substring(this_len - search.length, this_len) === search;
  }
  function includes(str, search, start) {
    if (typeof start !== "number") {
      start = 0;
    }
    if (start + search.length > str.length) {
      return false;
    } else {
      return str.indexOf(search, start) !== -1;
    }
  }
  var codes = {};
  createErrorType("ERR_INVALID_OPT_VALUE", function(name, value) {
    return 'The value "' + value + '" is invalid for option "' + name + '"';
  }, TypeError);
  createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
    let determiner;
    if (typeof expected === "string" && startsWith(expected, "not ")) {
      determiner = "must not be";
      expected = expected.replace(/^not /, "");
    } else {
      determiner = "must be";
    }
    let msg;
    if (endsWith(name, " argument")) {
      msg = `The ${name} ${determiner} ${oneOf(expected, "type")}`;
    } else {
      const type = includes(name, ".") ? "property" : "argument";
      msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, "type")}`;
    }
    msg += `. Received type ${typeof actual}`;
    return msg;
  }, TypeError);
  createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
  createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name) {
    return "The " + name + " method is not implemented";
  });
  createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
  createErrorType("ERR_STREAM_DESTROYED", function(name) {
    return "Cannot call " + name + " after a stream was destroyed";
  });
  createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
  createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
  createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
  createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
  createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
    return "Unknown encoding: " + arg;
  }, TypeError);
  createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
  exports.codes = codes;
});

// node_modules/readable-stream/lib/internal/streams/state.js
var require_state = __commonJS((exports, module) => {
  function highWaterMarkFrom(options, isDuplex, duplexKey) {
    return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
  }
  function getHighWaterMark(state, options, duplexKey, isDuplex) {
    var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
    if (hwm != null) {
      if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
        var name = isDuplex ? duplexKey : "highWaterMark";
        throw new ERR_INVALID_OPT_VALUE(name, hwm);
      }
      return Math.floor(hwm);
    }
    return state.objectMode ? 16 : 16 * 1024;
  }
  var ERR_INVALID_OPT_VALUE = require_errors2().codes.ERR_INVALID_OPT_VALUE;
  module.exports = {
    getHighWaterMark
  };
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS((exports, module) => {
  if (typeof Object.create === "function") {
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor;
        ctor.prototype.constructor = ctor;
      }
    };
  }
});

// node_modules/inherits/inherits.js
var require_inherits = __commonJS((exports, module) => {
  try {
    util = import.meta.require("util");
    if (typeof util.inherits !== "function")
      throw "";
    module.exports = util.inherits;
  } catch (e) {
    module.exports = require_inherits_browser();
  }
  var util;
});

// node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream = __commonJS((exports, module) => {
  function once(callback) {
    var called = false;
    return function() {
      if (called)
        return;
      called = true;
      for (var _len = arguments.length, args = new Array(_len), _key = 0;_key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      callback.apply(this, args);
    };
  }
  function noop() {
  }
  function isRequest(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  }
  function eos(stream, opts, callback) {
    if (typeof opts === "function")
      return eos(stream, null, opts);
    if (!opts)
      opts = {};
    callback = once(callback || noop);
    var readable = opts.readable || opts.readable !== false && stream.readable;
    var writable = opts.writable || opts.writable !== false && stream.writable;
    var onlegacyfinish = function onlegacyfinish() {
      if (!stream.writable)
        onfinish();
    };
    var writableEnded = stream._writableState && stream._writableState.finished;
    var onfinish = function onfinish() {
      writable = false;
      writableEnded = true;
      if (!readable)
        callback.call(stream);
    };
    var readableEnded = stream._readableState && stream._readableState.endEmitted;
    var onend = function onend() {
      readable = false;
      readableEnded = true;
      if (!writable)
        callback.call(stream);
    };
    var onerror = function onerror(err) {
      callback.call(stream, err);
    };
    var onclose = function onclose() {
      var err;
      if (readable && !readableEnded) {
        if (!stream._readableState || !stream._readableState.ended)
          err = new ERR_STREAM_PREMATURE_CLOSE;
        return callback.call(stream, err);
      }
      if (writable && !writableEnded) {
        if (!stream._writableState || !stream._writableState.ended)
          err = new ERR_STREAM_PREMATURE_CLOSE;
        return callback.call(stream, err);
      }
    };
    var onrequest = function onrequest() {
      stream.req.on("finish", onfinish);
    };
    if (isRequest(stream)) {
      stream.on("complete", onfinish);
      stream.on("abort", onclose);
      if (stream.req)
        onrequest();
      else
        stream.on("request", onrequest);
    } else if (writable && !stream._writableState) {
      stream.on("end", onlegacyfinish);
      stream.on("close", onlegacyfinish);
    }
    stream.on("end", onend);
    stream.on("finish", onfinish);
    if (opts.error !== false)
      stream.on("error", onerror);
    stream.on("close", onclose);
    return function() {
      stream.removeListener("complete", onfinish);
      stream.removeListener("abort", onclose);
      stream.removeListener("request", onrequest);
      if (stream.req)
        stream.req.removeListener("finish", onfinish);
      stream.removeListener("end", onlegacyfinish);
      stream.removeListener("close", onlegacyfinish);
      stream.removeListener("finish", onfinish);
      stream.removeListener("end", onend);
      stream.removeListener("error", onerror);
      stream.removeListener("close", onclose);
    };
  }
  var ERR_STREAM_PREMATURE_CLOSE = require_errors2().codes.ERR_STREAM_PREMATURE_CLOSE;
  module.exports = eos;
});

// node_modules/readable-stream/lib/internal/streams/async_iterator.js
var require_async_iterator = __commonJS((exports, module) => {
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null)
      return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object")
        return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function createIterResult(value, done) {
    return {
      value,
      done
    };
  }
  function readAndResolve(iter) {
    var resolve = iter[kLastResolve];
    if (resolve !== null) {
      var data = iter[kStream].read();
      if (data !== null) {
        iter[kLastPromise] = null;
        iter[kLastResolve] = null;
        iter[kLastReject] = null;
        resolve(createIterResult(data, false));
      }
    }
  }
  function onReadable(iter) {
    process.nextTick(readAndResolve, iter);
  }
  function wrapForNext(lastPromise, iter) {
    return function(resolve, reject) {
      lastPromise.then(function() {
        if (iter[kEnded]) {
          resolve(createIterResult(undefined, true));
          return;
        }
        iter[kHandlePromise](resolve, reject);
      }, reject);
    };
  }
  var _Object$setPrototypeO;
  var finished = require_end_of_stream();
  var kLastResolve = Symbol("lastResolve");
  var kLastReject = Symbol("lastReject");
  var kError = Symbol("error");
  var kEnded = Symbol("ended");
  var kLastPromise = Symbol("lastPromise");
  var kHandlePromise = Symbol("handlePromise");
  var kStream = Symbol("stream");
  var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
  });
  var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
    get stream() {
      return this[kStream];
    },
    next: function next() {
      var _this = this;
      var error = this[kError];
      if (error !== null) {
        return Promise.reject(error);
      }
      if (this[kEnded]) {
        return Promise.resolve(createIterResult(undefined, true));
      }
      if (this[kStream].destroyed) {
        return new Promise(function(resolve, reject) {
          process.nextTick(function() {
            if (_this[kError]) {
              reject(_this[kError]);
            } else {
              resolve(createIterResult(undefined, true));
            }
          });
        });
      }
      var lastPromise = this[kLastPromise];
      var promise;
      if (lastPromise) {
        promise = new Promise(wrapForNext(lastPromise, this));
      } else {
        var data = this[kStream].read();
        if (data !== null) {
          return Promise.resolve(createIterResult(data, false));
        }
        promise = new Promise(this[kHandlePromise]);
      }
      this[kLastPromise] = promise;
      return promise;
    }
  }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
    return this;
  }), _defineProperty(_Object$setPrototypeO, "return", function _return() {
    var _this2 = this;
    return new Promise(function(resolve, reject) {
      _this2[kStream].destroy(null, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(createIterResult(undefined, true));
      });
    });
  }), _Object$setPrototypeO), AsyncIteratorPrototype);
  var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
    var _Object$create;
    var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
      value: stream,
      writable: true
    }), _defineProperty(_Object$create, kLastResolve, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kLastReject, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kError, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kEnded, {
      value: stream._readableState.endEmitted,
      writable: true
    }), _defineProperty(_Object$create, kHandlePromise, {
      value: function value(resolve, reject) {
        var data = iterator[kStream].read();
        if (data) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          resolve(createIterResult(data, false));
        } else {
          iterator[kLastResolve] = resolve;
          iterator[kLastReject] = reject;
        }
      },
      writable: true
    }), _Object$create));
    iterator[kLastPromise] = null;
    finished(stream, function(err) {
      if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        var reject = iterator[kLastReject];
        if (reject !== null) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          reject(err);
        }
        iterator[kError] = err;
        return;
      }
      var resolve = iterator[kLastResolve];
      if (resolve !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(undefined, true));
      }
      iterator[kEnded] = true;
    });
    stream.on("readable", onReadable.bind(null, iterator));
    return iterator;
  };
  module.exports = createReadableStreamAsyncIterator;
});

// node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS((exports, module) => {
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function() {
      var self2 = this, args = arguments;
      return new Promise(function(resolve, reject) {
        var gen = fn.apply(self2, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1;i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null)
      return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object")
        return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function from(Readable, iterable, opts) {
    var iterator;
    if (iterable && typeof iterable.next === "function") {
      iterator = iterable;
    } else if (iterable && iterable[Symbol.asyncIterator])
      iterator = iterable[Symbol.asyncIterator]();
    else if (iterable && iterable[Symbol.iterator])
      iterator = iterable[Symbol.iterator]();
    else
      throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
    var readable = new Readable(_objectSpread({
      objectMode: true
    }, opts));
    var reading = false;
    readable._read = function() {
      if (!reading) {
        reading = true;
        next();
      }
    };
    function next() {
      return _next2.apply(this, arguments);
    }
    function _next2() {
      _next2 = _asyncToGenerator(function* () {
        try {
          var _yield$iterator$next = yield iterator.next(), value = _yield$iterator$next.value, done = _yield$iterator$next.done;
          if (done) {
            readable.push(null);
          } else if (readable.push(yield value)) {
            next();
          } else {
            reading = false;
          }
        } catch (err) {
          readable.destroy(err);
        }
      });
      return _next2.apply(this, arguments);
    }
    return readable;
  }
  var ERR_INVALID_ARG_TYPE = require_errors2().codes.ERR_INVALID_ARG_TYPE;
  module.exports = from;
});

// node_modules/readable-stream/lib/_stream_readable.js
var require__stream_readable = __commonJS((exports, module) => {
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function")
      return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event])
      emitter.on(event, fn);
    else if (Array.isArray(emitter._events[event]))
      emitter._events[event].unshift(fn);
    else
      emitter._events[event] = [fn, emitter._events[event]];
  }
  function ReadableState(options, stream, isDuplex) {
    Duplex = Duplex || require__stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean")
      isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.readableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex);
    this.buffer = new BufferList;
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.paused = true;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder)
        StringDecoder = require_string_decoder().StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    Duplex = Duplex || require__stream_duplex();
    if (!(this instanceof Readable))
      return new Readable(options);
    var isDuplex = this instanceof Duplex;
    this._readableState = new ReadableState(options, this, isDuplex);
    this.readable = true;
    if (options) {
      if (typeof options.read === "function")
        this._read = options.read;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
    }
    Stream.call(this);
  }
  function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
    debug("readableAddChunk", chunk);
    var state = stream._readableState;
    if (chunk === null) {
      state.reading = false;
      onEofChunk(stream, state);
    } else {
      var er;
      if (!skipChunkCheck)
        er = chunkInvalid(state, chunk);
      if (er) {
        errorOrDestroy(stream, er);
      } else if (state.objectMode || chunk && chunk.length > 0) {
        if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (addToFront) {
          if (state.endEmitted)
            errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT);
          else
            addChunk(stream, state, chunk, true);
        } else if (state.ended) {
          errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF);
        } else if (state.destroyed) {
          return false;
        } else {
          state.reading = false;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0)
              addChunk(stream, state, chunk, false);
            else
              maybeReadMore(stream, state);
          } else {
            addChunk(stream, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.reading = false;
        maybeReadMore(stream, state);
      }
    }
    return !state.ended && (state.length < state.highWaterMark || state.length === 0);
  }
  function addChunk(stream, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync) {
      state.awaitDrain = 0;
      stream.emit("data", chunk);
    } else {
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront)
        state.buffer.unshift(chunk);
      else
        state.buffer.push(chunk);
      if (state.needReadable)
        emitReadable(stream);
    }
    maybeReadMore(stream, state);
  }
  function chunkInvalid(state, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== undefined && !state.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
    }
    return er;
  }
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended)
      return 0;
    if (state.objectMode)
      return 1;
    if (n !== n) {
      if (state.flowing && state.length)
        return state.buffer.head.data.length;
      else
        return state.length;
    }
    if (n > state.highWaterMark)
      state.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state.length)
      return n;
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    }
    return state.length;
  }
  function onEofChunk(stream, state) {
    debug("onEofChunk");
    if (state.ended)
      return;
    if (state.decoder) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    if (state.sync) {
      emitReadable(stream);
    } else {
      state.needReadable = false;
      if (!state.emittedReadable) {
        state.emittedReadable = true;
        emitReadable_(stream);
      }
    }
  }
  function emitReadable(stream) {
    var state = stream._readableState;
    debug("emitReadable", state.needReadable, state.emittedReadable);
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug("emitReadable", state.flowing);
      state.emittedReadable = true;
      process.nextTick(emitReadable_, stream);
    }
  }
  function emitReadable_(stream) {
    var state = stream._readableState;
    debug("emitReadable_", state.destroyed, state.length, state.ended);
    if (!state.destroyed && (state.length || state.ended)) {
      stream.emit("readable");
      state.emittedReadable = false;
    }
    state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
    flow(stream);
  }
  function maybeReadMore(stream, state) {
    if (!state.readingMore) {
      state.readingMore = true;
      process.nextTick(maybeReadMore_, stream, state);
    }
  }
  function maybeReadMore_(stream, state) {
    while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
      var len = state.length;
      debug("maybeReadMore read 0");
      stream.read(0);
      if (len === state.length)
        break;
    }
    state.readingMore = false;
  }
  function pipeOnDrain(src) {
    return function pipeOnDrainFunctionResult() {
      var state = src._readableState;
      debug("pipeOnDrain", state.awaitDrain);
      if (state.awaitDrain)
        state.awaitDrain--;
      if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
        state.flowing = true;
        flow(src);
      }
    };
  }
  function updateReadableListening(self2) {
    var state = self2._readableState;
    state.readableListening = self2.listenerCount("readable") > 0;
    if (state.resumeScheduled && !state.paused) {
      state.flowing = true;
    } else if (self2.listenerCount("data") > 0) {
      self2.resume();
    }
  }
  function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
  }
  function resume(stream, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      process.nextTick(resume_, stream, state);
    }
  }
  function resume_(stream, state) {
    debug("resume", state.reading);
    if (!state.reading) {
      stream.read(0);
    }
    state.resumeScheduled = false;
    stream.emit("resume");
    flow(stream);
    if (state.flowing && !state.reading)
      stream.read(0);
  }
  function flow(stream) {
    var state = stream._readableState;
    debug("flow", state.flowing);
    while (state.flowing && stream.read() !== null)
      ;
  }
  function fromList(n, state) {
    if (state.length === 0)
      return null;
    var ret;
    if (state.objectMode)
      ret = state.buffer.shift();
    else if (!n || n >= state.length) {
      if (state.decoder)
        ret = state.buffer.join("");
      else if (state.buffer.length === 1)
        ret = state.buffer.first();
      else
        ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      ret = state.buffer.consume(n, state.decoder);
    }
    return ret;
  }
  function endReadable(stream) {
    var state = stream._readableState;
    debug("endReadable", state.endEmitted);
    if (!state.endEmitted) {
      state.ended = true;
      process.nextTick(endReadableNT, state, stream);
    }
  }
  function endReadableNT(state, stream) {
    debug("endReadableNT", state.endEmitted, state.length);
    if (!state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream.readable = false;
      stream.emit("end");
      if (state.autoDestroy) {
        var wState = stream._writableState;
        if (!wState || wState.autoDestroy && wState.finished) {
          stream.destroy();
        }
      }
    }
  }
  function indexOf(xs, x) {
    for (var i = 0, l = xs.length;i < l; i++) {
      if (xs[i] === x)
        return i;
    }
    return -1;
  }
  module.exports = Readable;
  var Duplex;
  Readable.ReadableState = ReadableState;
  var EE = import.meta.require("events").EventEmitter;
  var EElistenerCount = function EElistenerCount(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream = import.meta.require("stream");
  var Buffer2 = import.meta.require("buffer").Buffer;
  var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  var debugUtil = import.meta.require("util");
  var debug;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
  } else {
    debug = function debug() {
    };
  }
  var BufferList = require_buffer_list();
  var destroyImpl = require_destroy();
  var _require = require_state();
  var getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = require_errors2().codes;
  var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
  var ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF;
  var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
  var ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
  var StringDecoder;
  var createReadableStreamAsyncIterator;
  var from;
  require_inherits()(Readable, Stream);
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
  Object.defineProperty(Readable.prototype, "destroyed", {
    enumerable: false,
    get: function get() {
      if (this._readableState === undefined) {
        return false;
      }
      return this._readableState.destroyed;
    },
    set: function set(value) {
      if (!this._readableState) {
        return;
      }
      this._readableState.destroyed = value;
    }
  });
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    cb(err);
  };
  Readable.prototype.push = function(chunk, encoding) {
    var state = this._readableState;
    var skipChunkCheck;
    if (!state.objectMode) {
      if (typeof chunk === "string") {
        encoding = encoding || state.defaultEncoding;
        if (encoding !== state.encoding) {
          chunk = Buffer2.from(chunk, encoding);
          encoding = "";
        }
        skipChunkCheck = true;
      }
    } else {
      skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
  };
  Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
  };
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder)
      StringDecoder = require_string_decoder().StringDecoder;
    var decoder = new StringDecoder(enc);
    this._readableState.decoder = decoder;
    this._readableState.encoding = this._readableState.decoder.encoding;
    var p = this._readableState.buffer.head;
    var content = "";
    while (p !== null) {
      content += decoder.write(p.data);
      p = p.next;
    }
    this._readableState.buffer.clear();
    if (content !== "")
      this._readableState.buffer.push(content);
    this._readableState.length = content.length;
    return this;
  };
  var MAX_HWM = 1073741824;
  Readable.prototype.read = function(n) {
    debug("read", n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;
    if (n !== 0)
      state.emittedReadable = false;
    if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
      debug("read: emitReadable", state.length, state.ended);
      if (state.length === 0 && state.ended)
        endReadable(this);
      else
        emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
      if (state.length === 0)
        endReadable(this);
      return null;
    }
    var doRead = state.needReadable;
    debug("need readable", doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state.ended || state.reading) {
      doRead = false;
      debug("reading or ended", doRead);
    } else if (doRead) {
      debug("do read");
      state.reading = true;
      state.sync = true;
      if (state.length === 0)
        state.needReadable = true;
      this._read(state.highWaterMark);
      state.sync = false;
      if (!state.reading)
        n = howMuchToRead(nOrig, state);
    }
    var ret;
    if (n > 0)
      ret = fromList(n, state);
    else
      ret = null;
    if (ret === null) {
      state.needReadable = state.length <= state.highWaterMark;
      n = 0;
    } else {
      state.length -= n;
      state.awaitDrain = 0;
    }
    if (state.length === 0) {
      if (!state.ended)
        state.needReadable = true;
      if (nOrig !== n && state.ended)
        endReadable(this);
    }
    if (ret !== null)
      this.emit("data", ret);
    return ret;
  };
  Readable.prototype._read = function(n) {
    errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state = this._readableState;
    switch (state.pipesCount) {
      case 0:
        state.pipes = dest;
        break;
      case 1:
        state.pipes = [state.pipes, dest];
        break;
      default:
        state.pipes.push(dest);
        break;
    }
    state.pipesCount += 1;
    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : unpipe;
    if (state.endEmitted)
      process.nextTick(endFn);
    else
      src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable, unpipeInfo) {
      debug("onunpipe");
      if (readable === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      dest.removeListener("drain", ondrain);
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
        ondrain();
    }
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      var ret = dest.write(chunk);
      debug("dest.write", ret);
      if (ret === false) {
        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
          debug("false write response, pause", state.awaitDrain);
          state.awaitDrain++;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (EElistenerCount(dest, "error") === 0)
        errorOrDestroy(dest, er);
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  Readable.prototype.unpipe = function(dest) {
    var state = this._readableState;
    var unpipeInfo = {
      hasUnpiped: false
    };
    if (state.pipesCount === 0)
      return this;
    if (state.pipesCount === 1) {
      if (dest && dest !== state.pipes)
        return this;
      if (!dest)
        dest = state.pipes;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      if (dest)
        dest.emit("unpipe", this, unpipeInfo);
      return this;
    }
    if (!dest) {
      var dests = state.pipes;
      var len = state.pipesCount;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      for (var i = 0;i < len; i++)
        dests[i].emit("unpipe", this, {
          hasUnpiped: false
        });
      return this;
    }
    var index = indexOf(state.pipes, dest);
    if (index === -1)
      return this;
    state.pipes.splice(index, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1)
      state.pipes = state.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    var state = this._readableState;
    if (ev === "data") {
      state.readableListening = this.listenerCount("readable") > 0;
      if (state.flowing !== false)
        this.resume();
    } else if (ev === "readable") {
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.flowing = false;
        state.emittedReadable = false;
        debug("on readable", state.length, state.reading);
        if (state.length) {
          emitReadable(this);
        } else if (!state.reading) {
          process.nextTick(nReadingNextTick, this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  Readable.prototype.removeListener = function(ev, fn) {
    var res = Stream.prototype.removeListener.call(this, ev, fn);
    if (ev === "readable") {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  Readable.prototype.removeAllListeners = function(ev) {
    var res = Stream.prototype.removeAllListeners.apply(this, arguments);
    if (ev === "readable" || ev === undefined) {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  Readable.prototype.resume = function() {
    var state = this._readableState;
    if (!state.flowing) {
      debug("resume");
      state.flowing = !state.readableListening;
      resume(this, state);
    }
    state.paused = false;
    return this;
  };
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (this._readableState.flowing !== false) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    this._readableState.paused = true;
    return this;
  };
  Readable.prototype.wrap = function(stream) {
    var _this = this;
    var state = this._readableState;
    var paused = false;
    stream.on("end", function() {
      debug("wrapped end");
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length)
          _this.push(chunk);
      }
      _this.push(null);
    });
    stream.on("data", function(chunk) {
      debug("wrapped data");
      if (state.decoder)
        chunk = state.decoder.write(chunk);
      if (state.objectMode && (chunk === null || chunk === undefined))
        return;
      else if (!state.objectMode && (!chunk || !chunk.length))
        return;
      var ret = _this.push(chunk);
      if (!ret) {
        paused = true;
        stream.pause();
      }
    });
    for (var i in stream) {
      if (this[i] === undefined && typeof stream[i] === "function") {
        this[i] = function methodWrap(method) {
          return function methodWrapReturnFunction() {
            return stream[method].apply(stream, arguments);
          };
        }(i);
      }
    }
    for (var n = 0;n < kProxyEvents.length; n++) {
      stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function(n2) {
      debug("wrapped _read", n2);
      if (paused) {
        paused = false;
        stream.resume();
      }
    };
    return this;
  };
  if (typeof Symbol === "function") {
    Readable.prototype[Symbol.asyncIterator] = function() {
      if (createReadableStreamAsyncIterator === undefined) {
        createReadableStreamAsyncIterator = require_async_iterator();
      }
      return createReadableStreamAsyncIterator(this);
    };
  }
  Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    enumerable: false,
    get: function get() {
      return this._readableState.highWaterMark;
    }
  });
  Object.defineProperty(Readable.prototype, "readableBuffer", {
    enumerable: false,
    get: function get() {
      return this._readableState && this._readableState.buffer;
    }
  });
  Object.defineProperty(Readable.prototype, "readableFlowing", {
    enumerable: false,
    get: function get() {
      return this._readableState.flowing;
    },
    set: function set(state) {
      if (this._readableState) {
        this._readableState.flowing = state;
      }
    }
  });
  Readable._fromList = fromList;
  Object.defineProperty(Readable.prototype, "readableLength", {
    enumerable: false,
    get: function get() {
      return this._readableState.length;
    }
  });
  if (typeof Symbol === "function") {
    Readable.from = function(iterable, opts) {
      if (from === undefined) {
        from = require_from();
      }
      return from(Readable, iterable, opts);
    };
  }
});

// node_modules/readable-stream/lib/_stream_duplex.js
var require__stream_duplex = __commonJS((exports, module) => {
  function Duplex(options) {
    if (!(this instanceof Duplex))
      return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    this.allowHalfOpen = true;
    if (options) {
      if (options.readable === false)
        this.readable = false;
      if (options.writable === false)
        this.writable = false;
      if (options.allowHalfOpen === false) {
        this.allowHalfOpen = false;
        this.once("end", onend);
      }
    }
  }
  function onend() {
    if (this._writableState.ended)
      return;
    process.nextTick(onEndNT, this);
  }
  function onEndNT(self2) {
    self2.end();
  }
  var objectKeys = Object.keys || function(obj) {
    var keys2 = [];
    for (var key in obj)
      keys2.push(key);
    return keys2;
  };
  module.exports = Duplex;
  var Readable = require__stream_readable();
  var Writable = require__stream_writable();
  require_inherits()(Duplex, Readable);
  {
    keys = objectKeys(Writable.prototype);
    for (v = 0;v < keys.length; v++) {
      method = keys[v];
      if (!Duplex.prototype[method])
        Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  var keys;
  var method;
  var v;
  Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  Object.defineProperty(Duplex.prototype, "writableBuffer", {
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  Object.defineProperty(Duplex.prototype, "writableLength", {
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  Object.defineProperty(Duplex.prototype, "destroyed", {
    enumerable: false,
    get: function get() {
      if (this._readableState === undefined || this._writableState === undefined) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function set(value) {
      if (this._readableState === undefined || this._writableState === undefined) {
        return;
      }
      this._readableState.destroyed = value;
      this._writableState.destroyed = value;
    }
  });
});

// node_modules/util-deprecate/node.js
var require_node = __commonJS((exports, module) => {
  module.exports = import.meta.require("util").deprecate;
});

// node_modules/readable-stream/lib/_stream_writable.js
var require__stream_writable = __commonJS((exports, module) => {
  function CorkedRequest(state) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
      onCorkedFinish(_this, state);
    };
  }
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  function nop() {
  }
  function WritableState(options, stream, isDuplex) {
    Duplex = Duplex || require__stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean")
      isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.writableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
  }
  function Writable(options) {
    Duplex = Duplex || require__stream_duplex();
    var isDuplex = this instanceof Duplex;
    if (!isDuplex && !realHasInstance.call(Writable, this))
      return new Writable(options);
    this._writableState = new WritableState(options, this, isDuplex);
    this.writable = true;
    if (options) {
      if (typeof options.write === "function")
        this._write = options.write;
      if (typeof options.writev === "function")
        this._writev = options.writev;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
      if (typeof options.final === "function")
        this._final = options.final;
    }
    Stream.call(this);
  }
  function writeAfterEnd(stream, cb) {
    var er = new ERR_STREAM_WRITE_AFTER_END;
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
  }
  function validChunk(stream, state, chunk, cb) {
    var er;
    if (chunk === null) {
      er = new ERR_STREAM_NULL_VALUES;
    } else if (typeof chunk !== "string" && !state.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk);
    }
    if (er) {
      errorOrDestroy(stream, er);
      process.nextTick(cb, er);
      return false;
    }
    return true;
  }
  function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
      chunk = Buffer2.from(chunk, encoding);
    }
    return chunk;
  }
  function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
      var newChunk = decodeChunk(state, chunk, encoding);
      if (chunk !== newChunk) {
        isBuf = true;
        encoding = "buffer";
        chunk = newChunk;
      }
    }
    var len = state.objectMode ? 1 : chunk.length;
    state.length += len;
    var ret = state.length < state.highWaterMark;
    if (!ret)
      state.needDrain = true;
    if (state.writing || state.corked) {
      var last = state.lastBufferedRequest;
      state.lastBufferedRequest = {
        chunk,
        encoding,
        isBuf,
        callback: cb,
        next: null
      };
      if (last) {
        last.next = state.lastBufferedRequest;
      } else {
        state.bufferedRequest = state.lastBufferedRequest;
      }
      state.bufferedRequestCount += 1;
    } else {
      doWrite(stream, state, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (state.destroyed)
      state.onwrite(new ERR_STREAM_DESTROYED("write"));
    else if (writev)
      stream._writev(chunk, state.onwrite);
    else
      stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream, state, sync, er, cb) {
    --state.pendingcb;
    if (sync) {
      process.nextTick(cb, er);
      process.nextTick(finishMaybe, stream, state);
      stream._writableState.errorEmitted = true;
      errorOrDestroy(stream, er);
    } else {
      cb(er);
      stream._writableState.errorEmitted = true;
      errorOrDestroy(stream, er);
      finishMaybe(stream, state);
    }
  }
  function onwriteStateUpdate(state) {
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
  }
  function onwrite(stream, er) {
    var state = stream._writableState;
    var sync = state.sync;
    var cb = state.writecb;
    if (typeof cb !== "function")
      throw new ERR_MULTIPLE_CALLBACK;
    onwriteStateUpdate(state);
    if (er)
      onwriteError(stream, state, sync, er, cb);
    else {
      var finished = needFinish(state) || stream.destroyed;
      if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
        clearBuffer(stream, state);
      }
      if (sync) {
        process.nextTick(afterWrite, stream, state, finished, cb);
      } else {
        afterWrite(stream, state, finished, cb);
      }
    }
  }
  function afterWrite(stream, state, finished, cb) {
    if (!finished)
      onwriteDrain(stream, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream, state);
  }
  function onwriteDrain(stream, state) {
    if (state.length === 0 && state.needDrain) {
      state.needDrain = false;
      stream.emit("drain");
    }
  }
  function clearBuffer(stream, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;
    if (stream._writev && entry && entry.next) {
      var l = state.bufferedRequestCount;
      var buffer = new Array(l);
      var holder = state.corkedRequestsFree;
      holder.entry = entry;
      var count = 0;
      var allBuffers = true;
      while (entry) {
        buffer[count] = entry;
        if (!entry.isBuf)
          allBuffers = false;
        entry = entry.next;
        count += 1;
      }
      buffer.allBuffers = allBuffers;
      doWrite(stream, state, true, state.length, buffer, "", holder.finish);
      state.pendingcb++;
      state.lastBufferedRequest = null;
      if (holder.next) {
        state.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state.corkedRequestsFree = new CorkedRequest(state);
      }
      state.bufferedRequestCount = 0;
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state.objectMode ? 1 : chunk.length;
        doWrite(stream, state, false, len, chunk, encoding, cb);
        entry = entry.next;
        state.bufferedRequestCount--;
        if (state.writing) {
          break;
        }
      }
      if (entry === null)
        state.lastBufferedRequest = null;
    }
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
  }
  function needFinish(state) {
    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
  }
  function callFinal(stream, state) {
    stream._final(function(err) {
      state.pendingcb--;
      if (err) {
        errorOrDestroy(stream, err);
      }
      state.prefinished = true;
      stream.emit("prefinish");
      finishMaybe(stream, state);
    });
  }
  function prefinish(stream, state) {
    if (!state.prefinished && !state.finalCalled) {
      if (typeof stream._final === "function" && !state.destroyed) {
        state.pendingcb++;
        state.finalCalled = true;
        process.nextTick(callFinal, stream, state);
      } else {
        state.prefinished = true;
        stream.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream, state) {
    var need = needFinish(state);
    if (need) {
      prefinish(stream, state);
      if (state.pendingcb === 0) {
        state.finished = true;
        stream.emit("finish");
        if (state.autoDestroy) {
          var rState = stream._readableState;
          if (!rState || rState.autoDestroy && rState.endEmitted) {
            stream.destroy();
          }
        }
      }
    }
    return need;
  }
  function endWritable(stream, state, cb) {
    state.ending = true;
    finishMaybe(stream, state);
    if (cb) {
      if (state.finished)
        process.nextTick(cb);
      else
        stream.once("finish", cb);
    }
    state.ended = true;
    stream.writable = false;
  }
  function onCorkedFinish(corkReq, state, err) {
    var entry = corkReq.entry;
    corkReq.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    state.corkedRequestsFree.next = corkReq;
  }
  module.exports = Writable;
  var Duplex;
  Writable.WritableState = WritableState;
  var internalUtil = {
    deprecate: require_node()
  };
  var Stream = import.meta.require("stream");
  var Buffer2 = import.meta.require("buffer").Buffer;
  var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  var destroyImpl = require_destroy();
  var _require = require_state();
  var getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = require_errors2().codes;
  var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
  var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
  var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
  var ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE;
  var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
  var ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES;
  var ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END;
  var ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  require_inherits()(Writable, Stream);
  WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, "buffer", {
        get: internalUtil.deprecate(function writableStateBufferGetter() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer " + "instead.", "DEP0003")
      });
    } catch (_) {
    }
  })();
  var realHasInstance;
  if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
      value: function value(object) {
        if (realHasInstance.call(this, object))
          return true;
        if (this !== Writable)
          return false;
        return object && object._writableState instanceof WritableState;
      }
    });
  } else {
    realHasInstance = function realHasInstance(object) {
      return object instanceof this;
    };
  }
  Writable.prototype.pipe = function() {
    errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE);
  };
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state = this._writableState;
    var ret = false;
    var isBuf = !state.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer2.isBuffer(chunk)) {
      chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (isBuf)
      encoding = "buffer";
    else if (!encoding)
      encoding = state.defaultEncoding;
    if (typeof cb !== "function")
      cb = nop;
    if (state.ending)
      writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state, chunk, cb)) {
      state.pendingcb++;
      ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    this._writableState.corked++;
  };
  Writable.prototype.uncork = function() {
    var state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest)
        clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string")
      encoding = encoding.toLowerCase();
    if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1))
      throw new ERR_UNKNOWN_ENCODING(encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableBuffer", {
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== undefined)
      this.write(chunk, encoding);
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (!state.ending)
      endWritable(this, state, cb);
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableLength", {
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  Object.defineProperty(Writable.prototype, "destroyed", {
    enumerable: false,
    get: function get() {
      if (this._writableState === undefined) {
        return false;
      }
      return this._writableState.destroyed;
    },
    set: function set(value) {
      if (!this._writableState) {
        return;
      }
      this._writableState.destroyed = value;
    }
  });
  Writable.prototype.destroy = destroyImpl.destroy;
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    cb(err);
  };
});

// node_modules/winston-transport/modern.js
var require_modern = __commonJS((exports, module) => {
  var util = import.meta.require("util");
  var Writable = require__stream_writable();
  var { LEVEL } = require_triple_beam();
  var TransportStream = module.exports = function TransportStream(options = {}) {
    Writable.call(this, { objectMode: true, highWaterMark: options.highWaterMark });
    this.format = options.format;
    this.level = options.level;
    this.handleExceptions = options.handleExceptions;
    this.handleRejections = options.handleRejections;
    this.silent = options.silent;
    if (options.log)
      this.log = options.log;
    if (options.logv)
      this.logv = options.logv;
    if (options.close)
      this.close = options.close;
    this.once("pipe", (logger) => {
      this.levels = logger.levels;
      this.parent = logger;
    });
    this.once("unpipe", (src) => {
      if (src === this.parent) {
        this.parent = null;
        if (this.close) {
          this.close();
        }
      }
    });
  };
  util.inherits(TransportStream, Writable);
  TransportStream.prototype._write = function _write(info, enc, callback) {
    if (this.silent || info.exception === true && !this.handleExceptions) {
      return callback(null);
    }
    const level = this.level || this.parent && this.parent.level;
    if (!level || this.levels[level] >= this.levels[info[LEVEL]]) {
      if (info && !this.format) {
        return this.log(info, callback);
      }
      let errState;
      let transformed;
      try {
        transformed = this.format.transform(Object.assign({}, info), this.format.options);
      } catch (err) {
        errState = err;
      }
      if (errState || !transformed) {
        callback();
        if (errState)
          throw errState;
        return;
      }
      return this.log(transformed, callback);
    }
    this._writableState.sync = false;
    return callback(null);
  };
  TransportStream.prototype._writev = function _writev(chunks, callback) {
    if (this.logv) {
      const infos = chunks.filter(this._accept, this);
      if (!infos.length) {
        return callback(null);
      }
      return this.logv(infos, callback);
    }
    for (let i = 0;i < chunks.length; i++) {
      if (!this._accept(chunks[i]))
        continue;
      if (chunks[i].chunk && !this.format) {
        this.log(chunks[i].chunk, chunks[i].callback);
        continue;
      }
      let errState;
      let transformed;
      try {
        transformed = this.format.transform(Object.assign({}, chunks[i].chunk), this.format.options);
      } catch (err) {
        errState = err;
      }
      if (errState || !transformed) {
        chunks[i].callback();
        if (errState) {
          callback(null);
          throw errState;
        }
      } else {
        this.log(transformed, chunks[i].callback);
      }
    }
    return callback(null);
  };
  TransportStream.prototype._accept = function _accept(write) {
    const info = write.chunk;
    if (this.silent) {
      return false;
    }
    const level = this.level || this.parent && this.parent.level;
    if (info.exception === true || !level || this.levels[level] >= this.levels[info[LEVEL]]) {
      if (this.handleExceptions || info.exception !== true) {
        return true;
      }
    }
    return false;
  };
  TransportStream.prototype._nop = function _nop() {
    return;
  };
});

// node_modules/winston-transport/legacy.js
var require_legacy = __commonJS((exports, module) => {
  var util = import.meta.require("util");
  var { LEVEL } = require_triple_beam();
  var TransportStream = require_modern();
  var LegacyTransportStream = module.exports = function LegacyTransportStream(options = {}) {
    TransportStream.call(this, options);
    if (!options.transport || typeof options.transport.log !== "function") {
      throw new Error("Invalid transport, must be an object with a log method.");
    }
    this.transport = options.transport;
    this.level = this.level || options.transport.level;
    this.handleExceptions = this.handleExceptions || options.transport.handleExceptions;
    this._deprecated();
    function transportError(err) {
      this.emit("error", err, this.transport);
    }
    if (!this.transport.__winstonError) {
      this.transport.__winstonError = transportError.bind(this);
      this.transport.on("error", this.transport.__winstonError);
    }
  };
  util.inherits(LegacyTransportStream, TransportStream);
  LegacyTransportStream.prototype._write = function _write(info, enc, callback) {
    if (this.silent || info.exception === true && !this.handleExceptions) {
      return callback(null);
    }
    if (!this.level || this.levels[this.level] >= this.levels[info[LEVEL]]) {
      this.transport.log(info[LEVEL], info.message, info, this._nop);
    }
    callback(null);
  };
  LegacyTransportStream.prototype._writev = function _writev(chunks, callback) {
    for (let i = 0;i < chunks.length; i++) {
      if (this._accept(chunks[i])) {
        this.transport.log(chunks[i].chunk[LEVEL], chunks[i].chunk.message, chunks[i].chunk, this._nop);
        chunks[i].callback();
      }
    }
    return callback(null);
  };
  LegacyTransportStream.prototype._deprecated = function _deprecated() {
    console.error([
      `${this.transport.name} is a legacy winston transport. Consider upgrading: `,
      "- Upgrade docs: https://github.com/winstonjs/winston/blob/master/UPGRADE-3.0.md"
    ].join("\n"));
  };
  LegacyTransportStream.prototype.close = function close() {
    if (this.transport.close) {
      this.transport.close();
    }
    if (this.transport.__winstonError) {
      this.transport.removeListener("error", this.transport.__winstonError);
      this.transport.__winstonError = null;
    }
  };
});

// node_modules/winston-transport/index.js
var require_winston_transport = __commonJS((exports, module) => {
  module.exports = require_modern();
  module.exports.LegacyTransportStream = require_legacy();
});

// node_modules/winston/lib/winston/transports/console.js
var require_console = __commonJS((exports, module) => {
  var os = import.meta.require("os");
  var { LEVEL, MESSAGE } = require_triple_beam();
  var TransportStream = require_winston_transport();
  module.exports = class Console extends TransportStream {
    constructor(options = {}) {
      super(options);
      this.name = options.name || "console";
      this.stderrLevels = this._stringArrayToSet(options.stderrLevels);
      this.consoleWarnLevels = this._stringArrayToSet(options.consoleWarnLevels);
      this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
      this.forceConsole = options.forceConsole || false;
      this._consoleLog = console.log.bind(console);
      this._consoleWarn = console.warn.bind(console);
      this._consoleError = console.error.bind(console);
      this.setMaxListeners(30);
    }
    log(info, callback) {
      setImmediate(() => this.emit("logged", info));
      if (this.stderrLevels[info[LEVEL]]) {
        if (console._stderr && !this.forceConsole) {
          console._stderr.write(`${info[MESSAGE]}${this.eol}`);
        } else {
          this._consoleError(info[MESSAGE]);
        }
        if (callback) {
          callback();
        }
        return;
      } else if (this.consoleWarnLevels[info[LEVEL]]) {
        if (console._stderr && !this.forceConsole) {
          console._stderr.write(`${info[MESSAGE]}${this.eol}`);
        } else {
          this._consoleWarn(info[MESSAGE]);
        }
        if (callback) {
          callback();
        }
        return;
      }
      if (console._stdout && !this.forceConsole) {
        console._stdout.write(`${info[MESSAGE]}${this.eol}`);
      } else {
        this._consoleLog(info[MESSAGE]);
      }
      if (callback) {
        callback();
      }
    }
    _stringArrayToSet(strArray, errMsg) {
      if (!strArray)
        return {};
      errMsg = errMsg || "Cannot make set from type other than Array of string elements";
      if (!Array.isArray(strArray)) {
        throw new Error(errMsg);
      }
      return strArray.reduce((set, el) => {
        if (typeof el !== "string") {
          throw new Error(errMsg);
        }
        set[el] = true;
        return set;
      }, {});
    }
  };
});

// node_modules/async/internal/isArrayLike.js
var require_isArrayLike = __commonJS((exports, module) => {
  function isArrayLike(value) {
    return value && typeof value.length === "number" && value.length >= 0 && value.length % 1 === 0;
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isArrayLike;
  module.exports = exports.default;
});

// node_modules/async/internal/initialParams.js
var require_initialParams = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = function(fn) {
    return function(...args) {
      var callback = args.pop();
      return fn.call(this, args, callback);
    };
  };
  module.exports = exports.default;
});

// node_modules/async/internal/setImmediate.js
var require_setImmediate = __commonJS((exports) => {
  function fallback(fn) {
    setTimeout(fn, 0);
  }
  function wrap(defer) {
    return (fn, ...args) => defer(() => fn(...args));
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.fallback = fallback;
  exports.wrap = wrap;
  var hasQueueMicrotask = exports.hasQueueMicrotask = typeof queueMicrotask === "function" && queueMicrotask;
  var hasSetImmediate = exports.hasSetImmediate = typeof setImmediate === "function" && setImmediate;
  var hasNextTick = exports.hasNextTick = typeof process === "object" && typeof process.nextTick === "function";
  var _defer;
  if (hasQueueMicrotask) {
    _defer = queueMicrotask;
  } else if (hasSetImmediate) {
    _defer = setImmediate;
  } else if (hasNextTick) {
    _defer = process.nextTick;
  } else {
    _defer = fallback;
  }
  exports.default = wrap(_defer);
});

// node_modules/async/asyncify.js
var require_asyncify = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function asyncify(func) {
    if ((0, _wrapAsync.isAsync)(func)) {
      return function(...args) {
        const callback = args.pop();
        const promise = func.apply(this, args);
        return handlePromise(promise, callback);
      };
    }
    return (0, _initialParams2.default)(function(args, callback) {
      var result;
      try {
        result = func.apply(this, args);
      } catch (e) {
        return callback(e);
      }
      if (result && typeof result.then === "function") {
        return handlePromise(result, callback);
      } else {
        callback(null, result);
      }
    });
  }
  function handlePromise(promise, callback) {
    return promise.then((value) => {
      invokeCallback(callback, null, value);
    }, (err) => {
      invokeCallback(callback, err && (err instanceof Error || err.message) ? err : new Error(err));
    });
  }
  function invokeCallback(callback, error, value) {
    try {
      callback(error, value);
    } catch (err) {
      (0, _setImmediate2.default)((e) => {
        throw e;
      }, err);
    }
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = asyncify;
  var _initialParams = require_initialParams();
  var _initialParams2 = _interopRequireDefault(_initialParams);
  var _setImmediate = require_setImmediate();
  var _setImmediate2 = _interopRequireDefault(_setImmediate);
  var _wrapAsync = require_wrapAsync();
  module.exports = exports.default;
});

// node_modules/async/internal/wrapAsync.js
var require_wrapAsync = __commonJS((exports) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function isAsync(fn) {
    return fn[Symbol.toStringTag] === "AsyncFunction";
  }
  function isAsyncGenerator(fn) {
    return fn[Symbol.toStringTag] === "AsyncGenerator";
  }
  function isAsyncIterable(obj) {
    return typeof obj[Symbol.asyncIterator] === "function";
  }
  function wrapAsync(asyncFn) {
    if (typeof asyncFn !== "function")
      throw new Error("expected a function");
    return isAsync(asyncFn) ? (0, _asyncify2.default)(asyncFn) : asyncFn;
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isAsyncIterable = exports.isAsyncGenerator = exports.isAsync = undefined;
  var _asyncify = require_asyncify();
  var _asyncify2 = _interopRequireDefault(_asyncify);
  exports.default = wrapAsync;
  exports.isAsync = isAsync;
  exports.isAsyncGenerator = isAsyncGenerator;
  exports.isAsyncIterable = isAsyncIterable;
});

// node_modules/async/internal/awaitify.js
var require_awaitify = __commonJS((exports, module) => {
  function awaitify(asyncFn, arity) {
    if (!arity)
      arity = asyncFn.length;
    if (!arity)
      throw new Error("arity is undefined");
    function awaitable(...args) {
      if (typeof args[arity - 1] === "function") {
        return asyncFn.apply(this, args);
      }
      return new Promise((resolve, reject) => {
        args[arity - 1] = (err, ...cbArgs) => {
          if (err)
            return reject(err);
          resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
        };
        asyncFn.apply(this, args);
      });
    }
    return awaitable;
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = awaitify;
  module.exports = exports.default;
});

// node_modules/async/internal/parallel.js
var require_parallel = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _isArrayLike = require_isArrayLike();
  var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
  var _wrapAsync = require_wrapAsync();
  var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)((eachfn, tasks, callback) => {
    var results = (0, _isArrayLike2.default)(tasks) ? [] : {};
    eachfn(tasks, (task, key, taskCb) => {
      (0, _wrapAsync2.default)(task)((err, ...result) => {
        if (result.length < 2) {
          [result] = result;
        }
        results[key] = result;
        taskCb(err);
      });
    }, (err) => callback(err, results));
  }, 3);
  module.exports = exports.default;
});

// node_modules/async/internal/once.js
var require_once = __commonJS((exports, module) => {
  function once(fn) {
    function wrapper(...args) {
      if (fn === null)
        return;
      var callFn = fn;
      fn = null;
      callFn.apply(this, args);
    }
    Object.assign(wrapper, fn);
    return wrapper;
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = once;
  module.exports = exports.default;
});

// node_modules/async/internal/getIterator.js
var require_getIterator = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = function(coll) {
    return coll[Symbol.iterator] && coll[Symbol.iterator]();
  };
  module.exports = exports.default;
});

// node_modules/async/internal/iterator.js
var require_iterator = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
      return ++i < len ? { value: coll[i], key: i } : null;
    };
  }
  function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
      var item = iterator.next();
      if (item.done)
        return null;
      i++;
      return { value: item.value, key: i };
    };
  }
  function createObjectIterator(obj) {
    var okeys = obj ? Object.keys(obj) : [];
    var i = -1;
    var len = okeys.length;
    return function next() {
      var key = okeys[++i];
      if (key === "__proto__") {
        return next();
      }
      return i < len ? { value: obj[key], key } : null;
    };
  }
  function createIterator(coll) {
    if ((0, _isArrayLike2.default)(coll)) {
      return createArrayIterator(coll);
    }
    var iterator = (0, _getIterator2.default)(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = createIterator;
  var _isArrayLike = require_isArrayLike();
  var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
  var _getIterator = require_getIterator();
  var _getIterator2 = _interopRequireDefault(_getIterator);
  module.exports = exports.default;
});

// node_modules/async/internal/onlyOnce.js
var require_onlyOnce = __commonJS((exports, module) => {
  function onlyOnce(fn) {
    return function(...args) {
      if (fn === null)
        throw new Error("Callback was already called.");
      var callFn = fn;
      fn = null;
      callFn.apply(this, args);
    };
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = onlyOnce;
  module.exports = exports.default;
});

// node_modules/async/internal/breakLoop.js
var require_breakLoop = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var breakLoop = {};
  exports.default = breakLoop;
  module.exports = exports.default;
});

// node_modules/async/internal/asyncEachOfLimit.js
var require_asyncEachOfLimit = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function asyncEachOfLimit(generator, limit, iteratee, callback) {
    let done = false;
    let canceled = false;
    let awaiting = false;
    let running = 0;
    let idx = 0;
    function replenish() {
      if (running >= limit || awaiting || done)
        return;
      awaiting = true;
      generator.next().then(({ value, done: iterDone }) => {
        if (canceled || done)
          return;
        awaiting = false;
        if (iterDone) {
          done = true;
          if (running <= 0) {
            callback(null);
          }
          return;
        }
        running++;
        iteratee(value, idx, iterateeCallback);
        idx++;
        replenish();
      }).catch(handleError);
    }
    function iterateeCallback(err, result) {
      running -= 1;
      if (canceled)
        return;
      if (err)
        return handleError(err);
      if (err === false) {
        done = true;
        canceled = true;
        return;
      }
      if (result === _breakLoop2.default || done && running <= 0) {
        done = true;
        return callback(null);
      }
      replenish();
    }
    function handleError(err) {
      if (canceled)
        return;
      awaiting = false;
      done = true;
      callback(err);
    }
    replenish();
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = asyncEachOfLimit;
  var _breakLoop = require_breakLoop();
  var _breakLoop2 = _interopRequireDefault(_breakLoop);
  module.exports = exports.default;
});

// node_modules/async/internal/eachOfLimit.js
var require_eachOfLimit = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _once = require_once();
  var _once2 = _interopRequireDefault(_once);
  var _iterator = require_iterator();
  var _iterator2 = _interopRequireDefault(_iterator);
  var _onlyOnce = require_onlyOnce();
  var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
  var _wrapAsync = require_wrapAsync();
  var _asyncEachOfLimit = require_asyncEachOfLimit();
  var _asyncEachOfLimit2 = _interopRequireDefault(_asyncEachOfLimit);
  var _breakLoop = require_breakLoop();
  var _breakLoop2 = _interopRequireDefault(_breakLoop);
  exports.default = (limit) => {
    return (obj, iteratee, callback) => {
      callback = (0, _once2.default)(callback);
      if (limit <= 0) {
        throw new RangeError("concurrency limit cannot be less than 1");
      }
      if (!obj) {
        return callback(null);
      }
      if ((0, _wrapAsync.isAsyncGenerator)(obj)) {
        return (0, _asyncEachOfLimit2.default)(obj, limit, iteratee, callback);
      }
      if ((0, _wrapAsync.isAsyncIterable)(obj)) {
        return (0, _asyncEachOfLimit2.default)(obj[Symbol.asyncIterator](), limit, iteratee, callback);
      }
      var nextElem = (0, _iterator2.default)(obj);
      var done = false;
      var canceled = false;
      var running = 0;
      var looping = false;
      function iterateeCallback(err, value) {
        if (canceled)
          return;
        running -= 1;
        if (err) {
          done = true;
          callback(err);
        } else if (err === false) {
          done = true;
          canceled = true;
        } else if (value === _breakLoop2.default || done && running <= 0) {
          done = true;
          return callback(null);
        } else if (!looping) {
          replenish();
        }
      }
      function replenish() {
        looping = true;
        while (running < limit && !done) {
          var elem = nextElem();
          if (elem === null) {
            done = true;
            if (running <= 0) {
              callback(null);
            }
            return;
          }
          running += 1;
          iteratee(elem.value, elem.key, (0, _onlyOnce2.default)(iterateeCallback));
        }
        looping = false;
      }
      replenish();
    };
  };
  module.exports = exports.default;
});

// node_modules/async/eachOfLimit.js
var require_eachOfLimit2 = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function eachOfLimit(coll, limit, iteratee, callback) {
    return (0, _eachOfLimit3.default)(limit)(coll, (0, _wrapAsync2.default)(iteratee), callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _eachOfLimit2 = require_eachOfLimit();
  var _eachOfLimit3 = _interopRequireDefault(_eachOfLimit2);
  var _wrapAsync = require_wrapAsync();
  var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)(eachOfLimit, 4);
  module.exports = exports.default;
});

// node_modules/async/eachOfSeries.js
var require_eachOfSeries = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function eachOfSeries(coll, iteratee, callback) {
    return (0, _eachOfLimit2.default)(coll, 1, iteratee, callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _eachOfLimit = require_eachOfLimit2();
  var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)(eachOfSeries, 3);
  module.exports = exports.default;
});

// node_modules/async/series.js
var require_series = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function series(tasks, callback) {
    return (0, _parallel3.default)(_eachOfSeries2.default, tasks, callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = series;
  var _parallel2 = require_parallel();
  var _parallel3 = _interopRequireDefault(_parallel2);
  var _eachOfSeries = require_eachOfSeries();
  var _eachOfSeries2 = _interopRequireDefault(_eachOfSeries);
  module.exports = exports.default;
});

// node_modules/readable-stream/lib/_stream_transform.js
var require__stream_transform = __commonJS((exports, module) => {
  function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (cb === null) {
      return this.emit("error", new ERR_MULTIPLE_CALLBACK);
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null)
      this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      this._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform))
      return new Transform(options);
    Duplex.call(this, options);
    this._transformState = {
      afterTransform: afterTransform.bind(this),
      needTransform: false,
      transforming: false,
      writecb: null,
      writechunk: null,
      writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
      if (typeof options.transform === "function")
        this._transform = options.transform;
      if (typeof options.flush === "function")
        this._flush = options.flush;
    }
    this.on("prefinish", prefinish);
  }
  function prefinish() {
    var _this = this;
    if (typeof this._flush === "function" && !this._readableState.destroyed) {
      this._flush(function(er, data) {
        done(_this, er, data);
      });
    } else {
      done(this, null, null);
    }
  }
  function done(stream, er, data) {
    if (er)
      return stream.emit("error", er);
    if (data != null)
      stream.push(data);
    if (stream._writableState.length)
      throw new ERR_TRANSFORM_WITH_LENGTH_0;
    if (stream._transformState.transforming)
      throw new ERR_TRANSFORM_ALREADY_TRANSFORMING;
    return stream.push(null);
  }
  module.exports = Transform;
  var _require$codes = require_errors2().codes;
  var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
  var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
  var ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING;
  var ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
  var Duplex = require__stream_duplex();
  require_inherits()(Transform, Duplex);
  Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };
  Transform.prototype._transform = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
  };
  Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
        this._read(rs.highWaterMark);
    }
  };
  Transform.prototype._read = function(n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      ts.needTransform = true;
    }
  };
  Transform.prototype._destroy = function(err, cb) {
    Duplex.prototype._destroy.call(this, err, function(err2) {
      cb(err2);
    });
  };
});

// node_modules/readable-stream/lib/_stream_passthrough.js
var require__stream_passthrough = __commonJS((exports, module) => {
  function PassThrough(options) {
    if (!(this instanceof PassThrough))
      return new PassThrough(options);
    Transform.call(this, options);
  }
  module.exports = PassThrough;
  var Transform = require__stream_transform();
  require_inherits()(PassThrough, Transform);
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
});

// node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS((exports, module) => {
  function once(callback) {
    var called = false;
    return function() {
      if (called)
        return;
      called = true;
      callback.apply(undefined, arguments);
    };
  }
  function noop(err) {
    if (err)
      throw err;
  }
  function isRequest(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  }
  function destroyer(stream, reading, writing, callback) {
    callback = once(callback);
    var closed = false;
    stream.on("close", function() {
      closed = true;
    });
    if (eos === undefined)
      eos = require_end_of_stream();
    eos(stream, {
      readable: reading,
      writable: writing
    }, function(err) {
      if (err)
        return callback(err);
      closed = true;
      callback();
    });
    var destroyed = false;
    return function(err) {
      if (closed)
        return;
      if (destroyed)
        return;
      destroyed = true;
      if (isRequest(stream))
        return stream.abort();
      if (typeof stream.destroy === "function")
        return stream.destroy();
      callback(err || new ERR_STREAM_DESTROYED("pipe"));
    };
  }
  function call(fn) {
    fn();
  }
  function pipe(from, to) {
    return from.pipe(to);
  }
  function popCallback(streams) {
    if (!streams.length)
      return noop;
    if (typeof streams[streams.length - 1] !== "function")
      return noop;
    return streams.pop();
  }
  function pipeline() {
    for (var _len = arguments.length, streams = new Array(_len), _key = 0;_key < _len; _key++) {
      streams[_key] = arguments[_key];
    }
    var callback = popCallback(streams);
    if (Array.isArray(streams[0]))
      streams = streams[0];
    if (streams.length < 2) {
      throw new ERR_MISSING_ARGS("streams");
    }
    var error;
    var destroys = streams.map(function(stream, i) {
      var reading = i < streams.length - 1;
      var writing = i > 0;
      return destroyer(stream, reading, writing, function(err) {
        if (!error)
          error = err;
        if (err)
          destroys.forEach(call);
        if (reading)
          return;
        destroys.forEach(call);
        callback(error);
      });
    });
    return streams.reduce(pipe);
  }
  var eos;
  var _require$codes = require_errors2().codes;
  var ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
  var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
  module.exports = pipeline;
});

// node_modules/readable-stream/readable.js
var require_readable = __commonJS((exports, module) => {
  var Stream = import.meta.require("stream");
  if (process.env.READABLE_STREAM === "disable" && Stream) {
    module.exports = Stream.Readable;
    Object.assign(module.exports, Stream);
    module.exports.Stream = Stream;
  } else {
    exports = module.exports = require__stream_readable();
    exports.Stream = Stream || exports;
    exports.Readable = exports;
    exports.Writable = require__stream_writable();
    exports.Duplex = require__stream_duplex();
    exports.Transform = require__stream_transform();
    exports.PassThrough = require__stream_passthrough();
    exports.finished = require_end_of_stream();
    exports.pipeline = require_pipeline();
  }
});

// node_modules/@dabh/diagnostics/diagnostics.js
var require_diagnostics = __commonJS((exports, module) => {
  function use(adapter) {
    if (~adapters.indexOf(adapter))
      return false;
    adapters.push(adapter);
    return true;
  }
  function set(custom) {
    logger = custom;
  }
  function enabled(namespace) {
    var async = [];
    for (var i = 0;i < adapters.length; i++) {
      if (adapters[i].async) {
        async.push(adapters[i]);
        continue;
      }
      if (adapters[i](namespace))
        return true;
    }
    if (!async.length)
      return false;
    return new Promise(function pinky(resolve) {
      Promise.all(async.map(function prebind(fn) {
        return fn(namespace);
      })).then(function resolved(values) {
        resolve(values.some(Boolean));
      });
    });
  }
  function modify(fn) {
    if (~modifiers.indexOf(fn))
      return false;
    modifiers.push(fn);
    return true;
  }
  function write() {
    logger.apply(logger, arguments);
  }
  function process2(message) {
    for (var i = 0;i < modifiers.length; i++) {
      message = modifiers[i].apply(modifiers[i], arguments);
    }
    return message;
  }
  function introduce(fn, options) {
    var has = Object.prototype.hasOwnProperty;
    for (var key in options) {
      if (has.call(options, key)) {
        fn[key] = options[key];
      }
    }
    return fn;
  }
  function nope(options) {
    options.enabled = false;
    options.modify = modify;
    options.set = set;
    options.use = use;
    return introduce(function diagnopes() {
      return false;
    }, options);
  }
  function yep(options) {
    function diagnostics() {
      var args = Array.prototype.slice.call(arguments, 0);
      write.call(write, options, process2(args, options));
      return true;
    }
    options.enabled = true;
    options.modify = modify;
    options.set = set;
    options.use = use;
    return introduce(diagnostics, options);
  }
  var adapters = [];
  var modifiers = [];
  var logger = function devnull() {
  };
  module.exports = function create(diagnostics) {
    diagnostics.introduce = introduce;
    diagnostics.enabled = enabled;
    diagnostics.process = process2;
    diagnostics.modify = modify;
    diagnostics.write = write;
    diagnostics.nope = nope;
    diagnostics.yep = yep;
    diagnostics.set = set;
    diagnostics.use = use;
    return diagnostics;
  };
});

// node_modules/color-string/node_modules/color-name/index.js
var require_color_name = __commonJS((exports, module) => {
  module.exports = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };
});

// node_modules/is-arrayish/index.js
var require_is_arrayish = __commonJS((exports, module) => {
  module.exports = function isArrayish(obj) {
    if (!obj || typeof obj === "string") {
      return false;
    }
    return obj instanceof Array || Array.isArray(obj) || obj.length >= 0 && (obj.splice instanceof Function || Object.getOwnPropertyDescriptor(obj, obj.length - 1) && obj.constructor.name !== "String");
  };
});

// node_modules/simple-swizzle/index.js
var require_simple_swizzle = __commonJS((exports, module) => {
  var isArrayish = require_is_arrayish();
  var concat = Array.prototype.concat;
  var slice = Array.prototype.slice;
  var swizzle = module.exports = function swizzle(args) {
    var results = [];
    for (var i = 0, len = args.length;i < len; i++) {
      var arg = args[i];
      if (isArrayish(arg)) {
        results = concat.call(results, slice.call(arg));
      } else {
        results.push(arg);
      }
    }
    return results;
  };
  swizzle.wrap = function(fn) {
    return function() {
      return fn(swizzle(arguments));
    };
  };
});

// node_modules/color-string/index.js
var require_color_string = __commonJS((exports, module) => {
  function clamp(num, min, max) {
    return Math.min(Math.max(min, num), max);
  }
  function hexDouble(num) {
    var str = Math.round(num).toString(16).toUpperCase();
    return str.length < 2 ? "0" + str : str;
  }
  var colorNames = require_color_name();
  var swizzle = require_simple_swizzle();
  var hasOwnProperty = Object.hasOwnProperty;
  var reverseNames = Object.create(null);
  for (name in colorNames) {
    if (hasOwnProperty.call(colorNames, name)) {
      reverseNames[colorNames[name]] = name;
    }
  }
  var name;
  var cs = module.exports = {
    to: {},
    get: {}
  };
  cs.get = function(string) {
    var prefix = string.substring(0, 3).toLowerCase();
    var val;
    var model;
    switch (prefix) {
      case "hsl":
        val = cs.get.hsl(string);
        model = "hsl";
        break;
      case "hwb":
        val = cs.get.hwb(string);
        model = "hwb";
        break;
      default:
        val = cs.get.rgb(string);
        model = "rgb";
        break;
    }
    if (!val) {
      return null;
    }
    return { model, value: val };
  };
  cs.get.rgb = function(string) {
    if (!string) {
      return null;
    }
    var abbr = /^#([a-f0-9]{3,4})$/i;
    var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
    var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
    var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
    var keyword = /^(\w+)$/;
    var rgb = [0, 0, 0, 1];
    var match;
    var i;
    var hexAlpha;
    if (match = string.match(hex)) {
      hexAlpha = match[2];
      match = match[1];
      for (i = 0;i < 3; i++) {
        var i2 = i * 2;
        rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
      }
      if (hexAlpha) {
        rgb[3] = parseInt(hexAlpha, 16) / 255;
      }
    } else if (match = string.match(abbr)) {
      match = match[1];
      hexAlpha = match[3];
      for (i = 0;i < 3; i++) {
        rgb[i] = parseInt(match[i] + match[i], 16);
      }
      if (hexAlpha) {
        rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
      }
    } else if (match = string.match(rgba)) {
      for (i = 0;i < 3; i++) {
        rgb[i] = parseInt(match[i + 1], 0);
      }
      if (match[4]) {
        if (match[5]) {
          rgb[3] = parseFloat(match[4]) * 0.01;
        } else {
          rgb[3] = parseFloat(match[4]);
        }
      }
    } else if (match = string.match(per)) {
      for (i = 0;i < 3; i++) {
        rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
      if (match[4]) {
        if (match[5]) {
          rgb[3] = parseFloat(match[4]) * 0.01;
        } else {
          rgb[3] = parseFloat(match[4]);
        }
      }
    } else if (match = string.match(keyword)) {
      if (match[1] === "transparent") {
        return [0, 0, 0, 0];
      }
      if (!hasOwnProperty.call(colorNames, match[1])) {
        return null;
      }
      rgb = colorNames[match[1]];
      rgb[3] = 1;
      return rgb;
    } else {
      return null;
    }
    for (i = 0;i < 3; i++) {
      rgb[i] = clamp(rgb[i], 0, 255);
    }
    rgb[3] = clamp(rgb[3], 0, 1);
    return rgb;
  };
  cs.get.hsl = function(string) {
    if (!string) {
      return null;
    }
    var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
    var match = string.match(hsl);
    if (match) {
      var alpha = parseFloat(match[4]);
      var h = (parseFloat(match[1]) % 360 + 360) % 360;
      var s = clamp(parseFloat(match[2]), 0, 100);
      var l = clamp(parseFloat(match[3]), 0, 100);
      var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, s, l, a];
    }
    return null;
  };
  cs.get.hwb = function(string) {
    if (!string) {
      return null;
    }
    var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
    var match = string.match(hwb);
    if (match) {
      var alpha = parseFloat(match[4]);
      var h = (parseFloat(match[1]) % 360 + 360) % 360;
      var w = clamp(parseFloat(match[2]), 0, 100);
      var b = clamp(parseFloat(match[3]), 0, 100);
      var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, w, b, a];
    }
    return null;
  };
  cs.to.hex = function() {
    var rgba = swizzle(arguments);
    return "#" + hexDouble(rgba[0]) + hexDouble(rgba[1]) + hexDouble(rgba[2]) + (rgba[3] < 1 ? hexDouble(Math.round(rgba[3] * 255)) : "");
  };
  cs.to.rgb = function() {
    var rgba = swizzle(arguments);
    return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ")" : "rgba(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ", " + rgba[3] + ")";
  };
  cs.to.rgb.percent = function() {
    var rgba = swizzle(arguments);
    var r = Math.round(rgba[0] / 255 * 100);
    var g = Math.round(rgba[1] / 255 * 100);
    var b = Math.round(rgba[2] / 255 * 100);
    return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + r + "%, " + g + "%, " + b + "%)" : "rgba(" + r + "%, " + g + "%, " + b + "%, " + rgba[3] + ")";
  };
  cs.to.hsl = function() {
    var hsla = swizzle(arguments);
    return hsla.length < 4 || hsla[3] === 1 ? "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)" : "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, " + hsla[3] + ")";
  };
  cs.to.hwb = function() {
    var hwba = swizzle(arguments);
    var a = "";
    if (hwba.length >= 4 && hwba[3] !== 1) {
      a = ", " + hwba[3];
    }
    return "hwb(" + hwba[0] + ", " + hwba[1] + "%, " + hwba[2] + "%" + a + ")";
  };
  cs.to.keyword = function(rgb) {
    return reverseNames[rgb.slice(0, 3)];
  };
});

// node_modules/color-name/index.js
var require_color_name2 = __commonJS((exports, module) => {
  module.exports = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };
});

// node_modules/color-convert/conversions.js
var require_conversions = __commonJS((exports, module) => {
  function comparativeDistance(x, y) {
    return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2);
  }
  var cssKeywords = require_color_name2();
  var reverseKeywords = {};
  for (key in cssKeywords) {
    if (cssKeywords.hasOwnProperty(key)) {
      reverseKeywords[cssKeywords[key]] = key;
    }
  }
  var key;
  var convert = module.exports = {
    rgb: { channels: 3, labels: "rgb" },
    hsl: { channels: 3, labels: "hsl" },
    hsv: { channels: 3, labels: "hsv" },
    hwb: { channels: 3, labels: "hwb" },
    cmyk: { channels: 4, labels: "cmyk" },
    xyz: { channels: 3, labels: "xyz" },
    lab: { channels: 3, labels: "lab" },
    lch: { channels: 3, labels: "lch" },
    hex: { channels: 1, labels: ["hex"] },
    keyword: { channels: 1, labels: ["keyword"] },
    ansi16: { channels: 1, labels: ["ansi16"] },
    ansi256: { channels: 1, labels: ["ansi256"] },
    hcg: { channels: 3, labels: ["h", "c", "g"] },
    apple: { channels: 3, labels: ["r16", "g16", "b16"] },
    gray: { channels: 1, labels: ["gray"] }
  };
  for (model in convert) {
    if (convert.hasOwnProperty(model)) {
      if (!("channels" in convert[model])) {
        throw new Error("missing channels property: " + model);
      }
      if (!("labels" in convert[model])) {
        throw new Error("missing channel labels property: " + model);
      }
      if (convert[model].labels.length !== convert[model].channels) {
        throw new Error("channel and label counts mismatch: " + model);
      }
      channels = convert[model].channels;
      labels = convert[model].labels;
      delete convert[model].channels;
      delete convert[model].labels;
      Object.defineProperty(convert[model], "channels", { value: channels });
      Object.defineProperty(convert[model], "labels", { value: labels });
    }
  }
  var channels;
  var labels;
  var model;
  convert.rgb.hsl = function(rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h;
    var s;
    var l;
    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }
    h = Math.min(h * 60, 360);
    if (h < 0) {
      h += 360;
    }
    l = (min + max) / 2;
    if (max === min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }
    return [h, s * 100, l * 100];
  };
  convert.rgb.hsv = function(rgb) {
    var rdif;
    var gdif;
    var bdif;
    var h;
    var s;
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var v = Math.max(r, g, b);
    var diff = v - Math.min(r, g, b);
    var diffc = function(c) {
      return (v - c) / 6 / diff + 1 / 2;
    };
    if (diff === 0) {
      h = s = 0;
    } else {
      s = diff / v;
      rdif = diffc(r);
      gdif = diffc(g);
      bdif = diffc(b);
      if (r === v) {
        h = bdif - gdif;
      } else if (g === v) {
        h = 1 / 3 + rdif - bdif;
      } else if (b === v) {
        h = 2 / 3 + gdif - rdif;
      }
      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }
    return [
      h * 360,
      s * 100,
      v * 100
    ];
  };
  convert.rgb.hwb = function(rgb) {
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    var h = convert.rgb.hsl(rgb)[0];
    var w = 1 / 255 * Math.min(r, Math.min(g, b));
    b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
    return [h, w * 100, b * 100];
  };
  convert.rgb.cmyk = function(rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var c;
    var m;
    var y;
    var k;
    k = Math.min(1 - r, 1 - g, 1 - b);
    c = (1 - r - k) / (1 - k) || 0;
    m = (1 - g - k) / (1 - k) || 0;
    y = (1 - b - k) / (1 - k) || 0;
    return [c * 100, m * 100, y * 100, k * 100];
  };
  convert.rgb.keyword = function(rgb) {
    var reversed = reverseKeywords[rgb];
    if (reversed) {
      return reversed;
    }
    var currentClosestDistance = Infinity;
    var currentClosestKeyword;
    for (var keyword in cssKeywords) {
      if (cssKeywords.hasOwnProperty(keyword)) {
        var value = cssKeywords[keyword];
        var distance = comparativeDistance(rgb, value);
        if (distance < currentClosestDistance) {
          currentClosestDistance = distance;
          currentClosestKeyword = keyword;
        }
      }
    }
    return currentClosestKeyword;
  };
  convert.keyword.rgb = function(keyword) {
    return cssKeywords[keyword];
  };
  convert.rgb.xyz = function(rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    var z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x * 100, y * 100, z * 100];
  };
  convert.rgb.lab = function(rgb) {
    var xyz = convert.rgb.xyz(rgb);
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var l;
    var a;
    var b;
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);
    return [l, a, b];
  };
  convert.hsl.rgb = function(hsl) {
    var h = hsl[0] / 360;
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var t1;
    var t2;
    var t3;
    var rgb;
    var val;
    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }
    t1 = 2 * l - t2;
    rgb = [0, 0, 0];
    for (var i = 0;i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);
      if (t3 < 0) {
        t3++;
      }
      if (t3 > 1) {
        t3--;
      }
      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }
      rgb[i] = val * 255;
    }
    return rgb;
  };
  convert.hsl.hsv = function(hsl) {
    var h = hsl[0];
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var smin = s;
    var lmin = Math.max(l, 0.01);
    var sv;
    var v;
    l *= 2;
    s *= l <= 1 ? l : 2 - l;
    smin *= lmin <= 1 ? lmin : 2 - lmin;
    v = (l + s) / 2;
    sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
    return [h, sv * 100, v * 100];
  };
  convert.hsv.rgb = function(hsv) {
    var h = hsv[0] / 60;
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var hi = Math.floor(h) % 6;
    var f = h - Math.floor(h);
    var p = 255 * v * (1 - s);
    var q = 255 * v * (1 - s * f);
    var t = 255 * v * (1 - s * (1 - f));
    v *= 255;
    switch (hi) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  };
  convert.hsv.hsl = function(hsv) {
    var h = hsv[0];
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var vmin = Math.max(v, 0.01);
    var lmin;
    var sl;
    var l;
    l = (2 - s) * v;
    lmin = (2 - s) * vmin;
    sl = s * vmin;
    sl /= lmin <= 1 ? lmin : 2 - lmin;
    sl = sl || 0;
    l /= 2;
    return [h, sl * 100, l * 100];
  };
  convert.hwb.rgb = function(hwb) {
    var h = hwb[0] / 360;
    var wh = hwb[1] / 100;
    var bl = hwb[2] / 100;
    var ratio = wh + bl;
    var i;
    var v;
    var f;
    var n;
    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }
    i = Math.floor(6 * h);
    v = 1 - bl;
    f = 6 * h - i;
    if ((i & 1) !== 0) {
      f = 1 - f;
    }
    n = wh + f * (v - wh);
    var r;
    var g;
    var b;
    switch (i) {
      default:
      case 6:
      case 0:
        r = v;
        g = n;
        b = wh;
        break;
      case 1:
        r = n;
        g = v;
        b = wh;
        break;
      case 2:
        r = wh;
        g = v;
        b = n;
        break;
      case 3:
        r = wh;
        g = n;
        b = v;
        break;
      case 4:
        r = n;
        g = wh;
        b = v;
        break;
      case 5:
        r = v;
        g = wh;
        b = n;
        break;
    }
    return [r * 255, g * 255, b * 255];
  };
  convert.cmyk.rgb = function(cmyk) {
    var c = cmyk[0] / 100;
    var m = cmyk[1] / 100;
    var y = cmyk[2] / 100;
    var k = cmyk[3] / 100;
    var r;
    var g;
    var b;
    r = 1 - Math.min(1, c * (1 - k) + k);
    g = 1 - Math.min(1, m * (1 - k) + k);
    b = 1 - Math.min(1, y * (1 - k) + k);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.rgb = function(xyz) {
    var x = xyz[0] / 100;
    var y = xyz[1] / 100;
    var z = xyz[2] / 100;
    var r;
    var g;
    var b;
    r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    b = x * 0.0557 + y * -0.204 + z * 1.057;
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : r * 12.92;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : g * 12.92;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : b * 12.92;
    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.lab = function(xyz) {
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var l;
    var a;
    var b;
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);
    return [l, a, b];
  };
  convert.lab.xyz = function(lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];
    var x;
    var y;
    var z;
    y = (l + 16) / 116;
    x = a / 500 + y;
    z = y - b / 200;
    var y2 = Math.pow(y, 3);
    var x2 = Math.pow(x, 3);
    var z2 = Math.pow(z, 3);
    y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
    x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
    z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;
    x *= 95.047;
    y *= 100;
    z *= 108.883;
    return [x, y, z];
  };
  convert.lab.lch = function(lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];
    var hr;
    var h;
    var c;
    hr = Math.atan2(b, a);
    h = hr * 360 / 2 / Math.PI;
    if (h < 0) {
      h += 360;
    }
    c = Math.sqrt(a * a + b * b);
    return [l, c, h];
  };
  convert.lch.lab = function(lch) {
    var l = lch[0];
    var c = lch[1];
    var h = lch[2];
    var a;
    var b;
    var hr;
    hr = h / 360 * 2 * Math.PI;
    a = c * Math.cos(hr);
    b = c * Math.sin(hr);
    return [l, a, b];
  };
  convert.rgb.ansi16 = function(args) {
    var r = args[0];
    var g = args[1];
    var b = args[2];
    var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2];
    value = Math.round(value / 50);
    if (value === 0) {
      return 30;
    }
    var ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
    if (value === 2) {
      ansi += 60;
    }
    return ansi;
  };
  convert.hsv.ansi16 = function(args) {
    return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
  };
  convert.rgb.ansi256 = function(args) {
    var r = args[0];
    var g = args[1];
    var b = args[2];
    if (r === g && g === b) {
      if (r < 8) {
        return 16;
      }
      if (r > 248) {
        return 231;
      }
      return Math.round((r - 8) / 247 * 24) + 232;
    }
    var ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
    return ansi;
  };
  convert.ansi16.rgb = function(args) {
    var color = args % 10;
    if (color === 0 || color === 7) {
      if (args > 50) {
        color += 3.5;
      }
      color = color / 10.5 * 255;
      return [color, color, color];
    }
    var mult = (~~(args > 50) + 1) * 0.5;
    var r = (color & 1) * mult * 255;
    var g = (color >> 1 & 1) * mult * 255;
    var b = (color >> 2 & 1) * mult * 255;
    return [r, g, b];
  };
  convert.ansi256.rgb = function(args) {
    if (args >= 232) {
      var c = (args - 232) * 10 + 8;
      return [c, c, c];
    }
    args -= 16;
    var rem;
    var r = Math.floor(args / 36) / 5 * 255;
    var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
    var b = rem % 6 / 5 * 255;
    return [r, g, b];
  };
  convert.rgb.hex = function(args) {
    var integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
    var string = integer.toString(16).toUpperCase();
    return "000000".substring(string.length) + string;
  };
  convert.hex.rgb = function(args) {
    var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!match) {
      return [0, 0, 0];
    }
    var colorString = match[0];
    if (match[0].length === 3) {
      colorString = colorString.split("").map(function(char) {
        return char + char;
      }).join("");
    }
    var integer = parseInt(colorString, 16);
    var r = integer >> 16 & 255;
    var g = integer >> 8 & 255;
    var b = integer & 255;
    return [r, g, b];
  };
  convert.rgb.hcg = function(rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var max = Math.max(Math.max(r, g), b);
    var min = Math.min(Math.min(r, g), b);
    var chroma = max - min;
    var grayscale;
    var hue;
    if (chroma < 1) {
      grayscale = min / (1 - chroma);
    } else {
      grayscale = 0;
    }
    if (chroma <= 0) {
      hue = 0;
    } else if (max === r) {
      hue = (g - b) / chroma % 6;
    } else if (max === g) {
      hue = 2 + (b - r) / chroma;
    } else {
      hue = 4 + (r - g) / chroma + 4;
    }
    hue /= 6;
    hue %= 1;
    return [hue * 360, chroma * 100, grayscale * 100];
  };
  convert.hsl.hcg = function(hsl) {
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var c = 1;
    var f = 0;
    if (l < 0.5) {
      c = 2 * s * l;
    } else {
      c = 2 * s * (1 - l);
    }
    if (c < 1) {
      f = (l - 0.5 * c) / (1 - c);
    }
    return [hsl[0], c * 100, f * 100];
  };
  convert.hsv.hcg = function(hsv) {
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var c = s * v;
    var f = 0;
    if (c < 1) {
      f = (v - c) / (1 - c);
    }
    return [hsv[0], c * 100, f * 100];
  };
  convert.hcg.rgb = function(hcg) {
    var h = hcg[0] / 360;
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    if (c === 0) {
      return [g * 255, g * 255, g * 255];
    }
    var pure = [0, 0, 0];
    var hi = h % 1 * 6;
    var v = hi % 1;
    var w = 1 - v;
    var mg = 0;
    switch (Math.floor(hi)) {
      case 0:
        pure[0] = 1;
        pure[1] = v;
        pure[2] = 0;
        break;
      case 1:
        pure[0] = w;
        pure[1] = 1;
        pure[2] = 0;
        break;
      case 2:
        pure[0] = 0;
        pure[1] = 1;
        pure[2] = v;
        break;
      case 3:
        pure[0] = 0;
        pure[1] = w;
        pure[2] = 1;
        break;
      case 4:
        pure[0] = v;
        pure[1] = 0;
        pure[2] = 1;
        break;
      default:
        pure[0] = 1;
        pure[1] = 0;
        pure[2] = w;
    }
    mg = (1 - c) * g;
    return [
      (c * pure[0] + mg) * 255,
      (c * pure[1] + mg) * 255,
      (c * pure[2] + mg) * 255
    ];
  };
  convert.hcg.hsv = function(hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var v = c + g * (1 - c);
    var f = 0;
    if (v > 0) {
      f = c / v;
    }
    return [hcg[0], f * 100, v * 100];
  };
  convert.hcg.hsl = function(hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var l = g * (1 - c) + 0.5 * c;
    var s = 0;
    if (l > 0 && l < 0.5) {
      s = c / (2 * l);
    } else if (l >= 0.5 && l < 1) {
      s = c / (2 * (1 - l));
    }
    return [hcg[0], s * 100, l * 100];
  };
  convert.hcg.hwb = function(hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var v = c + g * (1 - c);
    return [hcg[0], (v - c) * 100, (1 - v) * 100];
  };
  convert.hwb.hcg = function(hwb) {
    var w = hwb[1] / 100;
    var b = hwb[2] / 100;
    var v = 1 - b;
    var c = v - w;
    var g = 0;
    if (c < 1) {
      g = (v - c) / (1 - c);
    }
    return [hwb[0], c * 100, g * 100];
  };
  convert.apple.rgb = function(apple) {
    return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
  };
  convert.rgb.apple = function(rgb) {
    return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
  };
  convert.gray.rgb = function(args) {
    return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  };
  convert.gray.hsl = convert.gray.hsv = function(args) {
    return [0, 0, args[0]];
  };
  convert.gray.hwb = function(gray) {
    return [0, 100, gray[0]];
  };
  convert.gray.cmyk = function(gray) {
    return [0, 0, 0, gray[0]];
  };
  convert.gray.lab = function(gray) {
    return [gray[0], 0, 0];
  };
  convert.gray.hex = function(gray) {
    var val = Math.round(gray[0] / 100 * 255) & 255;
    var integer = (val << 16) + (val << 8) + val;
    var string = integer.toString(16).toUpperCase();
    return "000000".substring(string.length) + string;
  };
  convert.rgb.gray = function(rgb) {
    var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return [val / 255 * 100];
  };
});

// node_modules/color-convert/route.js
var require_route = __commonJS((exports, module) => {
  function buildGraph() {
    var graph = {};
    var models = Object.keys(conversions);
    for (var len = models.length, i = 0;i < len; i++) {
      graph[models[i]] = {
        distance: -1,
        parent: null
      };
    }
    return graph;
  }
  function deriveBFS(fromModel) {
    var graph = buildGraph();
    var queue = [fromModel];
    graph[fromModel].distance = 0;
    while (queue.length) {
      var current = queue.pop();
      var adjacents = Object.keys(conversions[current]);
      for (var len = adjacents.length, i = 0;i < len; i++) {
        var adjacent = adjacents[i];
        var node = graph[adjacent];
        if (node.distance === -1) {
          node.distance = graph[current].distance + 1;
          node.parent = current;
          queue.unshift(adjacent);
        }
      }
    }
    return graph;
  }
  function link(from, to) {
    return function(args) {
      return to(from(args));
    };
  }
  function wrapConversion(toModel, graph) {
    var path = [graph[toModel].parent, toModel];
    var fn = conversions[graph[toModel].parent][toModel];
    var cur = graph[toModel].parent;
    while (graph[cur].parent) {
      path.unshift(graph[cur].parent);
      fn = link(conversions[graph[cur].parent][cur], fn);
      cur = graph[cur].parent;
    }
    fn.conversion = path;
    return fn;
  }
  var conversions = require_conversions();
  module.exports = function(fromModel) {
    var graph = deriveBFS(fromModel);
    var conversion = {};
    var models = Object.keys(graph);
    for (var len = models.length, i = 0;i < len; i++) {
      var toModel = models[i];
      var node = graph[toModel];
      if (node.parent === null) {
        continue;
      }
      conversion[toModel] = wrapConversion(toModel, graph);
    }
    return conversion;
  };
});

// node_modules/color-convert/index.js
var require_color_convert = __commonJS((exports, module) => {
  function wrapRaw(fn) {
    var wrappedFn = function(args) {
      if (args === undefined || args === null) {
        return args;
      }
      if (arguments.length > 1) {
        args = Array.prototype.slice.call(arguments);
      }
      return fn(args);
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  function wrapRounded(fn) {
    var wrappedFn = function(args) {
      if (args === undefined || args === null) {
        return args;
      }
      if (arguments.length > 1) {
        args = Array.prototype.slice.call(arguments);
      }
      var result = fn(args);
      if (typeof result === "object") {
        for (var len = result.length, i = 0;i < len; i++) {
          result[i] = Math.round(result[i]);
        }
      }
      return result;
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  var conversions = require_conversions();
  var route = require_route();
  var convert = {};
  var models = Object.keys(conversions);
  models.forEach(function(fromModel) {
    convert[fromModel] = {};
    Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
    Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
    var routes = route(fromModel);
    var routeModels = Object.keys(routes);
    routeModels.forEach(function(toModel) {
      var fn = routes[toModel];
      convert[fromModel][toModel] = wrapRounded(fn);
      convert[fromModel][toModel].raw = wrapRaw(fn);
    });
  });
  module.exports = convert;
});

// node_modules/color/index.js
var require_color = __commonJS((exports, module) => {
  function Color(obj, model) {
    if (!(this instanceof Color)) {
      return new Color(obj, model);
    }
    if (model && model in skippedModels) {
      model = null;
    }
    if (model && !(model in convert)) {
      throw new Error("Unknown model: " + model);
    }
    var i;
    var channels;
    if (obj == null) {
      this.model = "rgb";
      this.color = [0, 0, 0];
      this.valpha = 1;
    } else if (obj instanceof Color) {
      this.model = obj.model;
      this.color = obj.color.slice();
      this.valpha = obj.valpha;
    } else if (typeof obj === "string") {
      var result = colorString.get(obj);
      if (result === null) {
        throw new Error("Unable to parse color from string: " + obj);
      }
      this.model = result.model;
      channels = convert[this.model].channels;
      this.color = result.value.slice(0, channels);
      this.valpha = typeof result.value[channels] === "number" ? result.value[channels] : 1;
    } else if (obj.length) {
      this.model = model || "rgb";
      channels = convert[this.model].channels;
      var newArr = _slice.call(obj, 0, channels);
      this.color = zeroArray(newArr, channels);
      this.valpha = typeof obj[channels] === "number" ? obj[channels] : 1;
    } else if (typeof obj === "number") {
      obj &= 16777215;
      this.model = "rgb";
      this.color = [
        obj >> 16 & 255,
        obj >> 8 & 255,
        obj & 255
      ];
      this.valpha = 1;
    } else {
      this.valpha = 1;
      var keys = Object.keys(obj);
      if ("alpha" in obj) {
        keys.splice(keys.indexOf("alpha"), 1);
        this.valpha = typeof obj.alpha === "number" ? obj.alpha : 0;
      }
      var hashedKeys = keys.sort().join("");
      if (!(hashedKeys in hashedModelKeys)) {
        throw new Error("Unable to parse color from object: " + JSON.stringify(obj));
      }
      this.model = hashedModelKeys[hashedKeys];
      var labels = convert[this.model].labels;
      var color = [];
      for (i = 0;i < labels.length; i++) {
        color.push(obj[labels[i]]);
      }
      this.color = zeroArray(color);
    }
    if (limiters[this.model]) {
      channels = convert[this.model].channels;
      for (i = 0;i < channels; i++) {
        var limit = limiters[this.model][i];
        if (limit) {
          this.color[i] = limit(this.color[i]);
        }
      }
    }
    this.valpha = Math.max(0, Math.min(1, this.valpha));
    if (Object.freeze) {
      Object.freeze(this);
    }
  }
  function roundTo(num, places) {
    return Number(num.toFixed(places));
  }
  function roundToPlace(places) {
    return function(num) {
      return roundTo(num, places);
    };
  }
  function getset(model, channel, modifier) {
    model = Array.isArray(model) ? model : [model];
    model.forEach(function(m) {
      (limiters[m] || (limiters[m] = []))[channel] = modifier;
    });
    model = model[0];
    return function(val) {
      var result;
      if (arguments.length) {
        if (modifier) {
          val = modifier(val);
        }
        result = this[model]();
        result.color[channel] = val;
        return result;
      }
      result = this[model]().color[channel];
      if (modifier) {
        result = modifier(result);
      }
      return result;
    };
  }
  function maxfn(max) {
    return function(v) {
      return Math.max(0, Math.min(max, v));
    };
  }
  function assertArray(val) {
    return Array.isArray(val) ? val : [val];
  }
  function zeroArray(arr, length) {
    for (var i = 0;i < length; i++) {
      if (typeof arr[i] !== "number") {
        arr[i] = 0;
      }
    }
    return arr;
  }
  var colorString = require_color_string();
  var convert = require_color_convert();
  var _slice = [].slice;
  var skippedModels = [
    "keyword",
    "gray",
    "hex"
  ];
  var hashedModelKeys = {};
  Object.keys(convert).forEach(function(model) {
    hashedModelKeys[_slice.call(convert[model].labels).sort().join("")] = model;
  });
  var limiters = {};
  Color.prototype = {
    toString: function() {
      return this.string();
    },
    toJSON: function() {
      return this[this.model]();
    },
    string: function(places) {
      var self2 = this.model in colorString.to ? this : this.rgb();
      self2 = self2.round(typeof places === "number" ? places : 1);
      var args = self2.valpha === 1 ? self2.color : self2.color.concat(this.valpha);
      return colorString.to[self2.model](args);
    },
    percentString: function(places) {
      var self2 = this.rgb().round(typeof places === "number" ? places : 1);
      var args = self2.valpha === 1 ? self2.color : self2.color.concat(this.valpha);
      return colorString.to.rgb.percent(args);
    },
    array: function() {
      return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
    },
    object: function() {
      var result = {};
      var channels = convert[this.model].channels;
      var labels = convert[this.model].labels;
      for (var i = 0;i < channels; i++) {
        result[labels[i]] = this.color[i];
      }
      if (this.valpha !== 1) {
        result.alpha = this.valpha;
      }
      return result;
    },
    unitArray: function() {
      var rgb = this.rgb().color;
      rgb[0] /= 255;
      rgb[1] /= 255;
      rgb[2] /= 255;
      if (this.valpha !== 1) {
        rgb.push(this.valpha);
      }
      return rgb;
    },
    unitObject: function() {
      var rgb = this.rgb().object();
      rgb.r /= 255;
      rgb.g /= 255;
      rgb.b /= 255;
      if (this.valpha !== 1) {
        rgb.alpha = this.valpha;
      }
      return rgb;
    },
    round: function(places) {
      places = Math.max(places || 0, 0);
      return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
    },
    alpha: function(val) {
      if (arguments.length) {
        return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
      }
      return this.valpha;
    },
    red: getset("rgb", 0, maxfn(255)),
    green: getset("rgb", 1, maxfn(255)),
    blue: getset("rgb", 2, maxfn(255)),
    hue: getset(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, function(val) {
      return (val % 360 + 360) % 360;
    }),
    saturationl: getset("hsl", 1, maxfn(100)),
    lightness: getset("hsl", 2, maxfn(100)),
    saturationv: getset("hsv", 1, maxfn(100)),
    value: getset("hsv", 2, maxfn(100)),
    chroma: getset("hcg", 1, maxfn(100)),
    gray: getset("hcg", 2, maxfn(100)),
    white: getset("hwb", 1, maxfn(100)),
    wblack: getset("hwb", 2, maxfn(100)),
    cyan: getset("cmyk", 0, maxfn(100)),
    magenta: getset("cmyk", 1, maxfn(100)),
    yellow: getset("cmyk", 2, maxfn(100)),
    black: getset("cmyk", 3, maxfn(100)),
    x: getset("xyz", 0, maxfn(100)),
    y: getset("xyz", 1, maxfn(100)),
    z: getset("xyz", 2, maxfn(100)),
    l: getset("lab", 0, maxfn(100)),
    a: getset("lab", 1),
    b: getset("lab", 2),
    keyword: function(val) {
      if (arguments.length) {
        return new Color(val);
      }
      return convert[this.model].keyword(this.color);
    },
    hex: function(val) {
      if (arguments.length) {
        return new Color(val);
      }
      return colorString.to.hex(this.rgb().round().color);
    },
    rgbNumber: function() {
      var rgb = this.rgb().color;
      return (rgb[0] & 255) << 16 | (rgb[1] & 255) << 8 | rgb[2] & 255;
    },
    luminosity: function() {
      var rgb = this.rgb().color;
      var lum = [];
      for (var i = 0;i < rgb.length; i++) {
        var chan = rgb[i] / 255;
        lum[i] = chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4);
      }
      return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
    },
    contrast: function(color2) {
      var lum1 = this.luminosity();
      var lum2 = color2.luminosity();
      if (lum1 > lum2) {
        return (lum1 + 0.05) / (lum2 + 0.05);
      }
      return (lum2 + 0.05) / (lum1 + 0.05);
    },
    level: function(color2) {
      var contrastRatio = this.contrast(color2);
      if (contrastRatio >= 7.1) {
        return "AAA";
      }
      return contrastRatio >= 4.5 ? "AA" : "";
    },
    isDark: function() {
      var rgb = this.rgb().color;
      var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      return yiq < 128;
    },
    isLight: function() {
      return !this.isDark();
    },
    negate: function() {
      var rgb = this.rgb();
      for (var i = 0;i < 3; i++) {
        rgb.color[i] = 255 - rgb.color[i];
      }
      return rgb;
    },
    lighten: function(ratio) {
      var hsl = this.hsl();
      hsl.color[2] += hsl.color[2] * ratio;
      return hsl;
    },
    darken: function(ratio) {
      var hsl = this.hsl();
      hsl.color[2] -= hsl.color[2] * ratio;
      return hsl;
    },
    saturate: function(ratio) {
      var hsl = this.hsl();
      hsl.color[1] += hsl.color[1] * ratio;
      return hsl;
    },
    desaturate: function(ratio) {
      var hsl = this.hsl();
      hsl.color[1] -= hsl.color[1] * ratio;
      return hsl;
    },
    whiten: function(ratio) {
      var hwb = this.hwb();
      hwb.color[1] += hwb.color[1] * ratio;
      return hwb;
    },
    blacken: function(ratio) {
      var hwb = this.hwb();
      hwb.color[2] += hwb.color[2] * ratio;
      return hwb;
    },
    grayscale: function() {
      var rgb = this.rgb().color;
      var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
      return Color.rgb(val, val, val);
    },
    fade: function(ratio) {
      return this.alpha(this.valpha - this.valpha * ratio);
    },
    opaquer: function(ratio) {
      return this.alpha(this.valpha + this.valpha * ratio);
    },
    rotate: function(degrees) {
      var hsl = this.hsl();
      var hue = hsl.color[0];
      hue = (hue + degrees) % 360;
      hue = hue < 0 ? 360 + hue : hue;
      hsl.color[0] = hue;
      return hsl;
    },
    mix: function(mixinColor, weight) {
      if (!mixinColor || !mixinColor.rgb) {
        throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
      }
      var color1 = mixinColor.rgb();
      var color2 = this.rgb();
      var p = weight === undefined ? 0.5 : weight;
      var w = 2 * p - 1;
      var a = color1.alpha() - color2.alpha();
      var w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
      var w2 = 1 - w1;
      return Color.rgb(w1 * color1.red() + w2 * color2.red(), w1 * color1.green() + w2 * color2.green(), w1 * color1.blue() + w2 * color2.blue(), color1.alpha() * p + color2.alpha() * (1 - p));
    }
  };
  Object.keys(convert).forEach(function(model) {
    if (skippedModels.indexOf(model) !== -1) {
      return;
    }
    var channels = convert[model].channels;
    Color.prototype[model] = function() {
      if (this.model === model) {
        return new Color(this);
      }
      if (arguments.length) {
        return new Color(arguments, model);
      }
      var newAlpha = typeof arguments[channels] === "number" ? channels : this.valpha;
      return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
    };
    Color[model] = function(color) {
      if (typeof color === "number") {
        color = zeroArray(_slice.call(arguments), channels);
      }
      return new Color(color, model);
    };
  });
  module.exports = Color;
});

// node_modules/text-hex/index.js
var require_text_hex = __commonJS((exports, module) => {
  module.exports = function hex(str) {
    for (var i = 0, hash = 0;i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash))
      ;
    var color = Math.floor(Math.abs(Math.sin(hash) * 1e4 % 1 * 16777216)).toString(16);
    return "#" + Array(6 - color.length + 1).join("0") + color;
  };
});

// node_modules/colorspace/index.js
var require_colorspace = __commonJS((exports, module) => {
  var color = require_color();
  var hex = require_text_hex();
  module.exports = function colorspace(namespace, delimiter) {
    var split = namespace.split(delimiter || ":");
    var base = hex(split[0]);
    if (!split.length)
      return base;
    for (var i = 0, l = split.length - 1;i < l; i++) {
      base = color(base).mix(color(hex(split[i + 1]))).saturate(1).hex();
    }
    return base;
  };
});

// node_modules/kuler/index.js
var require_kuler = __commonJS((exports, module) => {
  function Kuler(text, color) {
    if (color)
      return new Kuler(text).style(color);
    if (!(this instanceof Kuler))
      return new Kuler(text);
    this.text = text;
  }
  Kuler.prototype.prefix = "\x1B[";
  Kuler.prototype.suffix = "m";
  Kuler.prototype.hex = function hex(color) {
    color = color[0] === "#" ? color.substring(1) : color;
    if (color.length === 3) {
      color = color.split("");
      color[5] = color[2];
      color[4] = color[2];
      color[3] = color[1];
      color[2] = color[1];
      color[1] = color[0];
      color = color.join("");
    }
    var r = color.substring(0, 2), g = color.substring(2, 4), b = color.substring(4, 6);
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
  };
  Kuler.prototype.rgb = function rgb(r, g, b) {
    var red = r / 255 * 5, green = g / 255 * 5, blue = b / 255 * 5;
    return this.ansi(red, green, blue);
  };
  Kuler.prototype.ansi = function ansi(r, g, b) {
    var red = Math.round(r), green = Math.round(g), blue = Math.round(b);
    return 16 + red * 36 + green * 6 + blue;
  };
  Kuler.prototype.reset = function reset() {
    return this.prefix + "39;49" + this.suffix;
  };
  Kuler.prototype.style = function style(color) {
    return this.prefix + "38;5;" + this.rgb.apply(this, this.hex(color)) + this.suffix + this.text + this.reset();
  };
  module.exports = Kuler;
});

// node_modules/@dabh/diagnostics/modifiers/namespace-ansi.js
var require_namespace_ansi = __commonJS((exports, module) => {
  var colorspace = require_colorspace();
  var kuler = require_kuler();
  module.exports = function ansiModifier(args, options) {
    var namespace = options.namespace;
    var ansi = options.colors !== false ? kuler(namespace + ":", colorspace(namespace)) : namespace + ":";
    args[0] = ansi + " " + args[0];
    return args;
  };
});

// node_modules/enabled/index.js
var require_enabled = __commonJS((exports, module) => {
  module.exports = function enabled(name, variable) {
    if (!variable)
      return false;
    var variables = variable.split(/[\s,]+/), i = 0;
    for (;i < variables.length; i++) {
      variable = variables[i].replace("*", ".*?");
      if (variable.charAt(0) === "-") {
        if (new RegExp("^" + variable.substr(1) + "$").test(name)) {
          return false;
        }
        continue;
      }
      if (new RegExp("^" + variable + "$").test(name)) {
        return true;
      }
    }
    return false;
  };
});

// node_modules/@dabh/diagnostics/adapters/index.js
var require_adapters = __commonJS((exports, module) => {
  var enabled = require_enabled();
  module.exports = function create(fn) {
    return function adapter(namespace) {
      try {
        return enabled(namespace, fn());
      } catch (e) {
      }
      return false;
    };
  };
});

// node_modules/@dabh/diagnostics/adapters/process.env.js
var require_process_env = __commonJS((exports, module) => {
  var adapter = require_adapters();
  module.exports = adapter(function processenv() {
    return process.env.DEBUG || process.env.DIAGNOSTICS;
  });
});

// node_modules/@dabh/diagnostics/logger/console.js
var require_console2 = __commonJS((exports, module) => {
  module.exports = function(meta, messages) {
    try {
      Function.prototype.apply.call(console.log, console, messages);
    } catch (e) {
    }
  };
});

// node_modules/@dabh/diagnostics/node/development.js
var require_development = __commonJS((exports, module) => {
  var create = require_diagnostics();
  var tty = import.meta.require("tty").isatty(1);
  var diagnostics = create(function dev(namespace, options) {
    options = options || {};
    options.colors = "colors" in options ? options.colors : tty;
    options.namespace = namespace;
    options.prod = false;
    options.dev = true;
    if (!dev.enabled(namespace) && !(options.force || dev.force)) {
      return dev.nope(options);
    }
    return dev.yep(options);
  });
  diagnostics.modify(require_namespace_ansi());
  diagnostics.use(require_process_env());
  diagnostics.set(require_console2());
  module.exports = diagnostics;
});

// node_modules/@dabh/diagnostics/node/index.js
var require_node2 = __commonJS((exports, module) => {
  if (false) {
  } else {
    module.exports = require_development();
  }
});

// node_modules/winston/lib/winston/tail-file.js
var require_tail_file = __commonJS((exports, module) => {
  function noop() {
  }
  var fs = import.meta.require("fs");
  var { StringDecoder } = import.meta.require("string_decoder");
  var { Stream } = require_readable();
  module.exports = (options, iter) => {
    const buffer = Buffer.alloc(64 * 1024);
    const decode = new StringDecoder("utf8");
    const stream = new Stream;
    let buff = "";
    let pos = 0;
    let row = 0;
    if (options.start === -1) {
      delete options.start;
    }
    stream.readable = true;
    stream.destroy = () => {
      stream.destroyed = true;
      stream.emit("end");
      stream.emit("close");
    };
    fs.open(options.file, "a+", "0644", (err, fd) => {
      if (err) {
        if (!iter) {
          stream.emit("error", err);
        } else {
          iter(err);
        }
        stream.destroy();
        return;
      }
      (function read() {
        if (stream.destroyed) {
          fs.close(fd, noop);
          return;
        }
        return fs.read(fd, buffer, 0, buffer.length, pos, (error, bytes) => {
          if (error) {
            if (!iter) {
              stream.emit("error", error);
            } else {
              iter(error);
            }
            stream.destroy();
            return;
          }
          if (!bytes) {
            if (buff) {
              if (options.start == null || row > options.start) {
                if (!iter) {
                  stream.emit("line", buff);
                } else {
                  iter(null, buff);
                }
              }
              row++;
              buff = "";
            }
            return setTimeout(read, 1000);
          }
          let data = decode.write(buffer.slice(0, bytes));
          if (!iter) {
            stream.emit("data", data);
          }
          data = (buff + data).split(/\n+/);
          const l = data.length - 1;
          let i = 0;
          for (;i < l; i++) {
            if (options.start == null || row > options.start) {
              if (!iter) {
                stream.emit("line", data[i]);
              } else {
                iter(null, data[i]);
              }
            }
            row++;
          }
          buff = data[l];
          pos += bytes;
          return read();
        });
      })();
    });
    if (!iter) {
      return stream;
    }
    return stream.destroy;
  };
});

// node_modules/winston/lib/winston/transports/file.js
var require_file = __commonJS((exports, module) => {
  var fs = import.meta.require("fs");
  var path = import.meta.require("path");
  var asyncSeries = require_series();
  var zlib = import.meta.require("zlib");
  var { MESSAGE } = require_triple_beam();
  var { Stream, PassThrough } = require_readable();
  var TransportStream = require_winston_transport();
  var debug = require_node2()("winston:file");
  var os = import.meta.require("os");
  var tailFile = require_tail_file();
  module.exports = class File extends TransportStream {
    constructor(options = {}) {
      super(options);
      this.name = options.name || "file";
      function throwIf(target, ...args) {
        args.slice(1).forEach((name) => {
          if (options[name]) {
            throw new Error(`Cannot set ${name} and ${target} together`);
          }
        });
      }
      this._stream = new PassThrough;
      this._stream.setMaxListeners(30);
      this._onError = this._onError.bind(this);
      if (options.filename || options.dirname) {
        throwIf("filename or dirname", "stream");
        this._basename = this.filename = options.filename ? path.basename(options.filename) : "winston.log";
        this.dirname = options.dirname || path.dirname(options.filename);
        this.options = options.options || { flags: "a" };
      } else if (options.stream) {
        console.warn("options.stream will be removed in winston@4. Use winston.transports.Stream");
        throwIf("stream", "filename", "maxsize");
        this._dest = this._stream.pipe(this._setupStream(options.stream));
        this.dirname = path.dirname(this._dest.path);
      } else {
        throw new Error("Cannot log to file without filename or stream.");
      }
      this.maxsize = options.maxsize || null;
      this.rotationFormat = options.rotationFormat || false;
      this.zippedArchive = options.zippedArchive || false;
      this.maxFiles = options.maxFiles || null;
      this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
      this.tailable = options.tailable || false;
      this.lazy = options.lazy || false;
      this._size = 0;
      this._pendingSize = 0;
      this._created = 0;
      this._drain = false;
      this._opening = false;
      this._ending = false;
      this._fileExist = false;
      if (this.dirname)
        this._createLogDirIfNotExist(this.dirname);
      if (!this.lazy)
        this.open();
    }
    finishIfEnding() {
      if (this._ending) {
        if (this._opening) {
          this.once("open", () => {
            this._stream.once("finish", () => this.emit("finish"));
            setImmediate(() => this._stream.end());
          });
        } else {
          this._stream.once("finish", () => this.emit("finish"));
          setImmediate(() => this._stream.end());
        }
      }
    }
    log(info, callback = () => {
    }) {
      if (this.silent) {
        callback();
        return true;
      }
      if (this._drain) {
        this._stream.once("drain", () => {
          this._drain = false;
          this.log(info, callback);
        });
        return;
      }
      if (this._rotate) {
        this._stream.once("rotate", () => {
          this._rotate = false;
          this.log(info, callback);
        });
        return;
      }
      if (this.lazy) {
        if (!this._fileExist) {
          if (!this._opening) {
            this.open();
          }
          this.once("open", () => {
            this._fileExist = true;
            this.log(info, callback);
            return;
          });
          return;
        }
        if (this._needsNewFile(this._pendingSize)) {
          this._dest.once("close", () => {
            if (!this._opening) {
              this.open();
            }
            this.once("open", () => {
              this.log(info, callback);
              return;
            });
            return;
          });
          return;
        }
      }
      const output = `${info[MESSAGE]}${this.eol}`;
      const bytes = Buffer.byteLength(output);
      function logged() {
        this._size += bytes;
        this._pendingSize -= bytes;
        debug("logged %s %s", this._size, output);
        this.emit("logged", info);
        if (this._rotate) {
          return;
        }
        if (this._opening) {
          return;
        }
        if (!this._needsNewFile()) {
          return;
        }
        if (this.lazy) {
          this._endStream(() => {
            this.emit("fileclosed");
          });
          return;
        }
        this._rotate = true;
        this._endStream(() => this._rotateFile());
      }
      this._pendingSize += bytes;
      if (this._opening && !this.rotatedWhileOpening && this._needsNewFile(this._size + this._pendingSize)) {
        this.rotatedWhileOpening = true;
      }
      const written = this._stream.write(output, logged.bind(this));
      if (!written) {
        this._drain = true;
        this._stream.once("drain", () => {
          this._drain = false;
          callback();
        });
      } else {
        callback();
      }
      debug("written", written, this._drain);
      this.finishIfEnding();
      return written;
    }
    query(options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = normalizeQuery(options);
      const file = path.join(this.dirname, this.filename);
      let buff = "";
      let results = [];
      let row = 0;
      const stream = fs.createReadStream(file, {
        encoding: "utf8"
      });
      stream.on("error", (err) => {
        if (stream.readable) {
          stream.destroy();
        }
        if (!callback) {
          return;
        }
        return err.code !== "ENOENT" ? callback(err) : callback(null, results);
      });
      stream.on("data", (data) => {
        data = (buff + data).split(/\n+/);
        const l = data.length - 1;
        let i = 0;
        for (;i < l; i++) {
          if (!options.start || row >= options.start) {
            add(data[i]);
          }
          row++;
        }
        buff = data[l];
      });
      stream.on("close", () => {
        if (buff) {
          add(buff, true);
        }
        if (options.order === "desc") {
          results = results.reverse();
        }
        if (callback)
          callback(null, results);
      });
      function add(buff2, attempt) {
        try {
          const log = JSON.parse(buff2);
          if (check(log)) {
            push(log);
          }
        } catch (e) {
          if (!attempt) {
            stream.emit("error", e);
          }
        }
      }
      function push(log) {
        if (options.rows && results.length >= options.rows && options.order !== "desc") {
          if (stream.readable) {
            stream.destroy();
          }
          return;
        }
        if (options.fields) {
          log = options.fields.reduce((obj, key) => {
            obj[key] = log[key];
            return obj;
          }, {});
        }
        if (options.order === "desc") {
          if (results.length >= options.rows) {
            results.shift();
          }
        }
        results.push(log);
      }
      function check(log) {
        if (!log) {
          return;
        }
        if (typeof log !== "object") {
          return;
        }
        const time = new Date(log.timestamp);
        if (options.from && time < options.from || options.until && time > options.until || options.level && options.level !== log.level) {
          return;
        }
        return true;
      }
      function normalizeQuery(options2) {
        options2 = options2 || {};
        options2.rows = options2.rows || options2.limit || 10;
        options2.start = options2.start || 0;
        options2.until = options2.until || new Date;
        if (typeof options2.until !== "object") {
          options2.until = new Date(options2.until);
        }
        options2.from = options2.from || options2.until - 24 * 60 * 60 * 1000;
        if (typeof options2.from !== "object") {
          options2.from = new Date(options2.from);
        }
        options2.order = options2.order || "desc";
        return options2;
      }
    }
    stream(options = {}) {
      const file = path.join(this.dirname, this.filename);
      const stream = new Stream;
      const tail = {
        file,
        start: options.start
      };
      stream.destroy = tailFile(tail, (err, line) => {
        if (err) {
          return stream.emit("error", err);
        }
        try {
          stream.emit("data", line);
          line = JSON.parse(line);
          stream.emit("log", line);
        } catch (e) {
          stream.emit("error", e);
        }
      });
      return stream;
    }
    open() {
      if (!this.filename)
        return;
      if (this._opening)
        return;
      this._opening = true;
      this.stat((err, size) => {
        if (err) {
          return this.emit("error", err);
        }
        debug("stat done: %s { size: %s }", this.filename, size);
        this._size = size;
        this._dest = this._createStream(this._stream);
        this._opening = false;
        this.once("open", () => {
          if (!this._stream.emit("rotate")) {
            this._rotate = false;
          }
        });
      });
    }
    stat(callback) {
      const target = this._getFile();
      const fullpath = path.join(this.dirname, target);
      fs.stat(fullpath, (err, stat) => {
        if (err && err.code === "ENOENT") {
          debug("ENOENT\xA0ok", fullpath);
          this.filename = target;
          return callback(null, 0);
        }
        if (err) {
          debug(`err ${err.code} ${fullpath}`);
          return callback(err);
        }
        if (!stat || this._needsNewFile(stat.size)) {
          return this._incFile(() => this.stat(callback));
        }
        this.filename = target;
        callback(null, stat.size);
      });
    }
    close(cb) {
      if (!this._stream) {
        return;
      }
      this._stream.end(() => {
        if (cb) {
          cb();
        }
        this.emit("flush");
        this.emit("closed");
      });
    }
    _needsNewFile(size) {
      size = size || this._size;
      return this.maxsize && size >= this.maxsize;
    }
    _onError(err) {
      this.emit("error", err);
    }
    _setupStream(stream) {
      stream.on("error", this._onError);
      return stream;
    }
    _cleanupStream(stream) {
      stream.removeListener("error", this._onError);
      stream.destroy();
      return stream;
    }
    _rotateFile() {
      this._incFile(() => this.open());
    }
    _endStream(callback = () => {
    }) {
      if (this._dest) {
        this._stream.unpipe(this._dest);
        this._dest.end(() => {
          this._cleanupStream(this._dest);
          callback();
        });
      } else {
        callback();
      }
    }
    _createStream(source) {
      const fullpath = path.join(this.dirname, this.filename);
      debug("create stream start", fullpath, this.options);
      const dest = fs.createWriteStream(fullpath, this.options).on("error", (err) => debug(err)).on("close", () => debug("close", dest.path, dest.bytesWritten)).on("open", () => {
        debug("file open ok", fullpath);
        this.emit("open", fullpath);
        source.pipe(dest);
        if (this.rotatedWhileOpening) {
          this._stream = new PassThrough;
          this._stream.setMaxListeners(30);
          this._rotateFile();
          this.rotatedWhileOpening = false;
          this._cleanupStream(dest);
          source.end();
        }
      });
      debug("create stream ok", fullpath);
      return dest;
    }
    _incFile(callback) {
      debug("_incFile", this.filename);
      const ext = path.extname(this._basename);
      const basename = path.basename(this._basename, ext);
      const tasks = [];
      if (this.zippedArchive) {
        tasks.push(function(cb) {
          const num = this._created > 0 && !this.tailable ? this._created : "";
          this._compressFile(path.join(this.dirname, `${basename}${num}${ext}`), path.join(this.dirname, `${basename}${num}${ext}.gz`), cb);
        }.bind(this));
      }
      tasks.push(function(cb) {
        if (!this.tailable) {
          this._created += 1;
          this._checkMaxFilesIncrementing(ext, basename, cb);
        } else {
          this._checkMaxFilesTailable(ext, basename, cb);
        }
      }.bind(this));
      asyncSeries(tasks, callback);
    }
    _getFile() {
      const ext = path.extname(this._basename);
      const basename = path.basename(this._basename, ext);
      const isRotation = this.rotationFormat ? this.rotationFormat() : this._created;
      return !this.tailable && this._created ? `${basename}${isRotation}${ext}` : `${basename}${ext}`;
    }
    _checkMaxFilesIncrementing(ext, basename, callback) {
      if (!this.maxFiles || this._created < this.maxFiles) {
        return setImmediate(callback);
      }
      const oldest = this._created - this.maxFiles;
      const isOldest = oldest !== 0 ? oldest : "";
      const isZipped = this.zippedArchive ? ".gz" : "";
      const filePath = `${basename}${isOldest}${ext}${isZipped}`;
      const target = path.join(this.dirname, filePath);
      fs.unlink(target, callback);
    }
    _checkMaxFilesTailable(ext, basename, callback) {
      const tasks = [];
      if (!this.maxFiles) {
        return;
      }
      const isZipped = this.zippedArchive ? ".gz" : "";
      for (let x = this.maxFiles - 1;x > 1; x--) {
        tasks.push(function(i, cb) {
          let fileName = `${basename}${i - 1}${ext}${isZipped}`;
          const tmppath = path.join(this.dirname, fileName);
          fs.exists(tmppath, (exists) => {
            if (!exists) {
              return cb(null);
            }
            fileName = `${basename}${i}${ext}${isZipped}`;
            fs.rename(tmppath, path.join(this.dirname, fileName), cb);
          });
        }.bind(this, x));
      }
      asyncSeries(tasks, () => {
        fs.rename(path.join(this.dirname, `${basename}${ext}${isZipped}`), path.join(this.dirname, `${basename}1${ext}${isZipped}`), callback);
      });
    }
    _compressFile(src, dest, callback) {
      fs.access(src, fs.F_OK, (err) => {
        if (err) {
          return callback();
        }
        var gzip = zlib.createGzip();
        var inp = fs.createReadStream(src);
        var out = fs.createWriteStream(dest);
        out.on("finish", () => {
          fs.unlink(src, callback);
        });
        inp.pipe(gzip).pipe(out);
      });
    }
    _createLogDirIfNotExist(dirPath) {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
  };
});

// node_modules/winston/lib/winston/transports/http.js
var require_http = __commonJS((exports, module) => {
  var http = import.meta.require("http");
  var https = import.meta.require("https");
  var { Stream } = require_readable();
  var TransportStream = require_winston_transport();
  var { configure } = require_safe_stable_stringify();
  module.exports = class Http extends TransportStream {
    constructor(options = {}) {
      super(options);
      this.options = options;
      this.name = options.name || "http";
      this.ssl = !!options.ssl;
      this.host = options.host || "localhost";
      this.port = options.port;
      this.auth = options.auth;
      this.path = options.path || "";
      this.maximumDepth = options.maximumDepth;
      this.agent = options.agent;
      this.headers = options.headers || {};
      this.headers["content-type"] = "application/json";
      this.batch = options.batch || false;
      this.batchInterval = options.batchInterval || 5000;
      this.batchCount = options.batchCount || 10;
      this.batchOptions = [];
      this.batchTimeoutID = -1;
      this.batchCallback = {};
      if (!this.port) {
        this.port = this.ssl ? 443 : 80;
      }
    }
    log(info, callback) {
      this._request(info, null, null, (err, res) => {
        if (res && res.statusCode !== 200) {
          err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
        }
        if (err) {
          this.emit("warn", err);
        } else {
          this.emit("logged", info);
        }
      });
      if (callback) {
        setImmediate(callback);
      }
    }
    query(options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = {
        method: "query",
        params: this.normalizeQuery(options)
      };
      const auth = options.params.auth || null;
      delete options.params.auth;
      const path = options.params.path || null;
      delete options.params.path;
      this._request(options, auth, path, (err, res, body) => {
        if (res && res.statusCode !== 200) {
          err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
        }
        if (err) {
          return callback(err);
        }
        if (typeof body === "string") {
          try {
            body = JSON.parse(body);
          } catch (e) {
            return callback(e);
          }
        }
        callback(null, body);
      });
    }
    stream(options = {}) {
      const stream = new Stream;
      options = {
        method: "stream",
        params: options
      };
      const path = options.params.path || null;
      delete options.params.path;
      const auth = options.params.auth || null;
      delete options.params.auth;
      let buff = "";
      const req = this._request(options, auth, path);
      stream.destroy = () => req.destroy();
      req.on("data", (data) => {
        data = (buff + data).split(/\n+/);
        const l = data.length - 1;
        let i = 0;
        for (;i < l; i++) {
          try {
            stream.emit("log", JSON.parse(data[i]));
          } catch (e) {
            stream.emit("error", e);
          }
        }
        buff = data[l];
      });
      req.on("error", (err) => stream.emit("error", err));
      return stream;
    }
    _request(options, auth, path, callback) {
      options = options || {};
      auth = auth || this.auth;
      path = path || this.path || "";
      if (this.batch) {
        this._doBatch(options, callback, auth, path);
      } else {
        this._doRequest(options, callback, auth, path);
      }
    }
    _doBatch(options, callback, auth, path) {
      this.batchOptions.push(options);
      if (this.batchOptions.length === 1) {
        const me = this;
        this.batchCallback = callback;
        this.batchTimeoutID = setTimeout(function() {
          me.batchTimeoutID = -1;
          me._doBatchRequest(me.batchCallback, auth, path);
        }, this.batchInterval);
      }
      if (this.batchOptions.length === this.batchCount) {
        this._doBatchRequest(this.batchCallback, auth, path);
      }
    }
    _doBatchRequest(callback, auth, path) {
      if (this.batchTimeoutID > 0) {
        clearTimeout(this.batchTimeoutID);
        this.batchTimeoutID = -1;
      }
      const batchOptionsCopy = this.batchOptions.slice();
      this.batchOptions = [];
      this._doRequest(batchOptionsCopy, callback, auth, path);
    }
    _doRequest(options, callback, auth, path) {
      const headers = Object.assign({}, this.headers);
      if (auth && auth.bearer) {
        headers.Authorization = `Bearer ${auth.bearer}`;
      }
      const req = (this.ssl ? https : http).request({
        ...this.options,
        method: "POST",
        host: this.host,
        port: this.port,
        path: `/${path.replace(/^\//, "")}`,
        headers,
        auth: auth && auth.username && auth.password ? `${auth.username}:${auth.password}` : "",
        agent: this.agent
      });
      req.on("error", callback);
      req.on("response", (res) => res.on("end", () => callback(null, res)).resume());
      const jsonStringify = configure({
        ...this.maximumDepth && { maximumDepth: this.maximumDepth }
      });
      req.end(Buffer.from(jsonStringify(options, this.options.replacer), "utf8"));
    }
  };
});

// node_modules/is-stream/index.js
var require_is_stream = __commonJS((exports, module) => {
  var isStream = (stream) => stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
  isStream.writable = (stream) => isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
  isStream.readable = (stream) => isStream(stream) && stream.readable !== false && typeof stream._read === "function" && typeof stream._readableState === "object";
  isStream.duplex = (stream) => isStream.writable(stream) && isStream.readable(stream);
  isStream.transform = (stream) => isStream.duplex(stream) && typeof stream._transform === "function";
  module.exports = isStream;
});

// node_modules/winston/lib/winston/transports/stream.js
var require_stream = __commonJS((exports, module) => {
  var isStream = require_is_stream();
  var { MESSAGE } = require_triple_beam();
  var os = import.meta.require("os");
  var TransportStream = require_winston_transport();
  module.exports = class Stream extends TransportStream {
    constructor(options = {}) {
      super(options);
      if (!options.stream || !isStream(options.stream)) {
        throw new Error("options.stream is required.");
      }
      this._stream = options.stream;
      this._stream.setMaxListeners(Infinity);
      this.isObjectMode = options.stream._writableState.objectMode;
      this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
    }
    log(info, callback) {
      setImmediate(() => this.emit("logged", info));
      if (this.isObjectMode) {
        this._stream.write(info);
        if (callback) {
          callback();
        }
        return;
      }
      this._stream.write(`${info[MESSAGE]}${this.eol}`);
      if (callback) {
        callback();
      }
      return;
    }
  };
});

// node_modules/winston/lib/winston/transports/index.js
var require_transports = __commonJS((exports) => {
  Object.defineProperty(exports, "Console", {
    configurable: true,
    enumerable: true,
    get() {
      return require_console();
    }
  });
  Object.defineProperty(exports, "File", {
    configurable: true,
    enumerable: true,
    get() {
      return require_file();
    }
  });
  Object.defineProperty(exports, "Http", {
    configurable: true,
    enumerable: true,
    get() {
      return require_http();
    }
  });
  Object.defineProperty(exports, "Stream", {
    configurable: true,
    enumerable: true,
    get() {
      return require_stream();
    }
  });
});

// node_modules/winston/lib/winston/config/index.js
var require_config2 = __commonJS((exports) => {
  var logform = require_logform();
  var { configs } = require_triple_beam();
  exports.cli = logform.levels(configs.cli);
  exports.npm = logform.levels(configs.npm);
  exports.syslog = logform.levels(configs.syslog);
  exports.addColors = logform.levels;
});

// node_modules/async/eachOf.js
var require_eachOf = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function eachOfArrayLike(coll, iteratee, callback) {
    callback = (0, _once2.default)(callback);
    var index = 0, completed = 0, { length } = coll, canceled = false;
    if (length === 0) {
      callback(null);
    }
    function iteratorCallback(err, value) {
      if (err === false) {
        canceled = true;
      }
      if (canceled === true)
        return;
      if (err) {
        callback(err);
      } else if (++completed === length || value === _breakLoop2.default) {
        callback(null);
      }
    }
    for (;index < length; index++) {
      iteratee(coll[index], index, (0, _onlyOnce2.default)(iteratorCallback));
    }
  }
  function eachOfGeneric(coll, iteratee, callback) {
    return (0, _eachOfLimit2.default)(coll, Infinity, iteratee, callback);
  }
  function eachOf(coll, iteratee, callback) {
    var eachOfImplementation = (0, _isArrayLike2.default)(coll) ? eachOfArrayLike : eachOfGeneric;
    return eachOfImplementation(coll, (0, _wrapAsync2.default)(iteratee), callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _isArrayLike = require_isArrayLike();
  var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
  var _breakLoop = require_breakLoop();
  var _breakLoop2 = _interopRequireDefault(_breakLoop);
  var _eachOfLimit = require_eachOfLimit2();
  var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);
  var _once = require_once();
  var _once2 = _interopRequireDefault(_once);
  var _onlyOnce = require_onlyOnce();
  var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
  var _wrapAsync = require_wrapAsync();
  var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)(eachOf, 3);
  module.exports = exports.default;
});

// node_modules/async/internal/withoutIndex.js
var require_withoutIndex = __commonJS((exports, module) => {
  function _withoutIndex(iteratee) {
    return (value, index, callback) => iteratee(value, callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _withoutIndex;
  module.exports = exports.default;
});

// node_modules/async/forEach.js
var require_forEach = __commonJS((exports, module) => {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function eachLimit(coll, iteratee, callback) {
    return (0, _eachOf2.default)(coll, (0, _withoutIndex2.default)((0, _wrapAsync2.default)(iteratee)), callback);
  }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _eachOf = require_eachOf();
  var _eachOf2 = _interopRequireDefault(_eachOf);
  var _withoutIndex = require_withoutIndex();
  var _withoutIndex2 = _interopRequireDefault(_withoutIndex);
  var _wrapAsync = require_wrapAsync();
  var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
  var _awaitify = require_awaitify();
  var _awaitify2 = _interopRequireDefault(_awaitify);
  exports.default = (0, _awaitify2.default)(eachLimit, 3);
  module.exports = exports.default;
});

// node_modules/fn.name/index.js
var require_fn = __commonJS((exports, module) => {
  var toString = Object.prototype.toString;
  module.exports = function name(fn) {
    if (typeof fn.displayName === "string" && fn.constructor.name) {
      return fn.displayName;
    } else if (typeof fn.name === "string" && fn.name) {
      return fn.name;
    }
    if (typeof fn === "object" && fn.constructor && typeof fn.constructor.name === "string")
      return fn.constructor.name;
    var named = fn.toString(), type = toString.call(fn).slice(8, -1);
    if (type === "Function") {
      named = named.substring(named.indexOf("(") + 1, named.indexOf(")"));
    } else {
      named = type;
    }
    return named || "anonymous";
  };
});

// node_modules/one-time/index.js
var require_one_time = __commonJS((exports, module) => {
  var name = require_fn();
  module.exports = function one(fn) {
    var called = 0, value;
    function onetime() {
      if (called)
        return value;
      called = 1;
      value = fn.apply(this, arguments);
      fn = null;
      return value;
    }
    onetime.displayName = name(fn);
    return onetime;
  };
});

// node_modules/stack-trace/lib/stack-trace.js
var require_stack_trace = __commonJS((exports) => {
  function CallSite(properties) {
    for (var property in properties) {
      this[property] = properties[property];
    }
  }
  exports.get = function(belowFn) {
    var oldLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = Infinity;
    var dummyObject = {};
    var v8Handler = Error.prepareStackTrace;
    Error.prepareStackTrace = function(dummyObject2, v8StackTrace2) {
      return v8StackTrace2;
    };
    Error.captureStackTrace(dummyObject, belowFn || exports.get);
    var v8StackTrace = dummyObject.stack;
    Error.prepareStackTrace = v8Handler;
    Error.stackTraceLimit = oldLimit;
    return v8StackTrace;
  };
  exports.parse = function(err) {
    if (!err.stack) {
      return [];
    }
    var self2 = this;
    var lines = err.stack.split("\n").slice(1);
    return lines.map(function(line) {
      if (line.match(/^\s*[-]{4,}$/)) {
        return self2._createParsedCallSite({
          fileName: line,
          lineNumber: null,
          functionName: null,
          typeName: null,
          methodName: null,
          columnNumber: null,
          native: null
        });
      }
      var lineMatch = line.match(/at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/);
      if (!lineMatch) {
        return;
      }
      var object = null;
      var method = null;
      var functionName = null;
      var typeName = null;
      var methodName = null;
      var isNative = lineMatch[5] === "native";
      if (lineMatch[1]) {
        functionName = lineMatch[1];
        var methodStart = functionName.lastIndexOf(".");
        if (functionName[methodStart - 1] == ".")
          methodStart--;
        if (methodStart > 0) {
          object = functionName.substr(0, methodStart);
          method = functionName.substr(methodStart + 1);
          var objectEnd = object.indexOf(".Module");
          if (objectEnd > 0) {
            functionName = functionName.substr(objectEnd + 1);
            object = object.substr(0, objectEnd);
          }
        }
        typeName = null;
      }
      if (method) {
        typeName = object;
        methodName = method;
      }
      if (method === "<anonymous>") {
        methodName = null;
        functionName = null;
      }
      var properties = {
        fileName: lineMatch[2] || null,
        lineNumber: parseInt(lineMatch[3], 10) || null,
        functionName,
        typeName,
        methodName,
        columnNumber: parseInt(lineMatch[4], 10) || null,
        native: isNative
      };
      return self2._createParsedCallSite(properties);
    }).filter(function(callSite) {
      return !!callSite;
    });
  };
  var strProperties = [
    "this",
    "typeName",
    "functionName",
    "methodName",
    "fileName",
    "lineNumber",
    "columnNumber",
    "function",
    "evalOrigin"
  ];
  var boolProperties = [
    "topLevel",
    "eval",
    "native",
    "constructor"
  ];
  strProperties.forEach(function(property) {
    CallSite.prototype[property] = null;
    CallSite.prototype["get" + property[0].toUpperCase() + property.substr(1)] = function() {
      return this[property];
    };
  });
  boolProperties.forEach(function(property) {
    CallSite.prototype[property] = false;
    CallSite.prototype["is" + property[0].toUpperCase() + property.substr(1)] = function() {
      return this[property];
    };
  });
  exports._createParsedCallSite = function(properties) {
    return new CallSite(properties);
  };
});

// node_modules/winston/lib/winston/exception-stream.js
var require_exception_stream = __commonJS((exports, module) => {
  var { Writable } = require_readable();
  module.exports = class ExceptionStream extends Writable {
    constructor(transport) {
      super({ objectMode: true });
      if (!transport) {
        throw new Error("ExceptionStream requires a TransportStream instance.");
      }
      this.handleExceptions = true;
      this.transport = transport;
    }
    _write(info, enc, callback) {
      if (info.exception) {
        return this.transport.log(info, callback);
      }
      callback();
      return true;
    }
  };
});

// node_modules/winston/lib/winston/exception-handler.js
var require_exception_handler = __commonJS((exports, module) => {
  var os = import.meta.require("os");
  var asyncForEach = require_forEach();
  var debug = require_node2()("winston:exception");
  var once = require_one_time();
  var stackTrace = require_stack_trace();
  var ExceptionStream = require_exception_stream();
  module.exports = class ExceptionHandler {
    constructor(logger) {
      if (!logger) {
        throw new Error("Logger is required to handle exceptions");
      }
      this.logger = logger;
      this.handlers = new Map;
    }
    handle(...args) {
      args.forEach((arg) => {
        if (Array.isArray(arg)) {
          return arg.forEach((handler) => this._addHandler(handler));
        }
        this._addHandler(arg);
      });
      if (!this.catcher) {
        this.catcher = this._uncaughtException.bind(this);
        process.on("uncaughtException", this.catcher);
      }
    }
    unhandle() {
      if (this.catcher) {
        process.removeListener("uncaughtException", this.catcher);
        this.catcher = false;
        Array.from(this.handlers.values()).forEach((wrapper) => this.logger.unpipe(wrapper));
      }
    }
    getAllInfo(err) {
      let message = null;
      if (err) {
        message = typeof err === "string" ? err : err.message;
      }
      return {
        error: err,
        level: "error",
        message: [
          `uncaughtException: ${message || "(no error message)"}`,
          err && err.stack || "  No stack trace"
        ].join("\n"),
        stack: err && err.stack,
        exception: true,
        date: new Date().toString(),
        process: this.getProcessInfo(),
        os: this.getOsInfo(),
        trace: this.getTrace(err)
      };
    }
    getProcessInfo() {
      return {
        pid: process.pid,
        uid: process.getuid ? process.getuid() : null,
        gid: process.getgid ? process.getgid() : null,
        cwd: process.cwd(),
        execPath: process.execPath,
        version: process.version,
        argv: process.argv,
        memoryUsage: process.memoryUsage()
      };
    }
    getOsInfo() {
      return {
        loadavg: os.loadavg(),
        uptime: os.uptime()
      };
    }
    getTrace(err) {
      const trace = err ? stackTrace.parse(err) : stackTrace.get();
      return trace.map((site) => {
        return {
          column: site.getColumnNumber(),
          file: site.getFileName(),
          function: site.getFunctionName(),
          line: site.getLineNumber(),
          method: site.getMethodName(),
          native: site.isNative()
        };
      });
    }
    _addHandler(handler) {
      if (!this.handlers.has(handler)) {
        handler.handleExceptions = true;
        const wrapper = new ExceptionStream(handler);
        this.handlers.set(handler, wrapper);
        this.logger.pipe(wrapper);
      }
    }
    _uncaughtException(err) {
      const info = this.getAllInfo(err);
      const handlers = this._getExceptionHandlers();
      let doExit = typeof this.logger.exitOnError === "function" ? this.logger.exitOnError(err) : this.logger.exitOnError;
      let timeout;
      if (!handlers.length && doExit) {
        console.warn("winston: exitOnError cannot be true with no exception handlers.");
        console.warn("winston: not exiting process.");
        doExit = false;
      }
      function gracefulExit() {
        debug("doExit", doExit);
        debug("process._exiting", process._exiting);
        if (doExit && !process._exiting) {
          if (timeout) {
            clearTimeout(timeout);
          }
          process.exit(1);
        }
      }
      if (!handlers || handlers.length === 0) {
        return process.nextTick(gracefulExit);
      }
      asyncForEach(handlers, (handler, next) => {
        const done = once(next);
        const transport = handler.transport || handler;
        function onDone(event) {
          return () => {
            debug(event);
            done();
          };
        }
        transport._ending = true;
        transport.once("finish", onDone("finished"));
        transport.once("error", onDone("error"));
      }, () => doExit && gracefulExit());
      this.logger.log(info);
      if (doExit) {
        timeout = setTimeout(gracefulExit, 3000);
      }
    }
    _getExceptionHandlers() {
      return this.logger.transports.filter((wrap) => {
        const transport = wrap.transport || wrap;
        return transport.handleExceptions;
      });
    }
  };
});

// node_modules/winston/lib/winston/rejection-stream.js
var require_rejection_stream = __commonJS((exports, module) => {
  var { Writable } = require_readable();
  module.exports = class RejectionStream extends Writable {
    constructor(transport) {
      super({ objectMode: true });
      if (!transport) {
        throw new Error("RejectionStream requires a TransportStream instance.");
      }
      this.handleRejections = true;
      this.transport = transport;
    }
    _write(info, enc, callback) {
      if (info.rejection) {
        return this.transport.log(info, callback);
      }
      callback();
      return true;
    }
  };
});

// node_modules/winston/lib/winston/rejection-handler.js
var require_rejection_handler = __commonJS((exports, module) => {
  var os = import.meta.require("os");
  var asyncForEach = require_forEach();
  var debug = require_node2()("winston:rejection");
  var once = require_one_time();
  var stackTrace = require_stack_trace();
  var RejectionStream = require_rejection_stream();
  module.exports = class RejectionHandler {
    constructor(logger) {
      if (!logger) {
        throw new Error("Logger is required to handle rejections");
      }
      this.logger = logger;
      this.handlers = new Map;
    }
    handle(...args) {
      args.forEach((arg) => {
        if (Array.isArray(arg)) {
          return arg.forEach((handler) => this._addHandler(handler));
        }
        this._addHandler(arg);
      });
      if (!this.catcher) {
        this.catcher = this._unhandledRejection.bind(this);
        process.on("unhandledRejection", this.catcher);
      }
    }
    unhandle() {
      if (this.catcher) {
        process.removeListener("unhandledRejection", this.catcher);
        this.catcher = false;
        Array.from(this.handlers.values()).forEach((wrapper) => this.logger.unpipe(wrapper));
      }
    }
    getAllInfo(err) {
      let message = null;
      if (err) {
        message = typeof err === "string" ? err : err.message;
      }
      return {
        error: err,
        level: "error",
        message: [
          `unhandledRejection: ${message || "(no error message)"}`,
          err && err.stack || "  No stack trace"
        ].join("\n"),
        stack: err && err.stack,
        rejection: true,
        date: new Date().toString(),
        process: this.getProcessInfo(),
        os: this.getOsInfo(),
        trace: this.getTrace(err)
      };
    }
    getProcessInfo() {
      return {
        pid: process.pid,
        uid: process.getuid ? process.getuid() : null,
        gid: process.getgid ? process.getgid() : null,
        cwd: process.cwd(),
        execPath: process.execPath,
        version: process.version,
        argv: process.argv,
        memoryUsage: process.memoryUsage()
      };
    }
    getOsInfo() {
      return {
        loadavg: os.loadavg(),
        uptime: os.uptime()
      };
    }
    getTrace(err) {
      const trace = err ? stackTrace.parse(err) : stackTrace.get();
      return trace.map((site) => {
        return {
          column: site.getColumnNumber(),
          file: site.getFileName(),
          function: site.getFunctionName(),
          line: site.getLineNumber(),
          method: site.getMethodName(),
          native: site.isNative()
        };
      });
    }
    _addHandler(handler) {
      if (!this.handlers.has(handler)) {
        handler.handleRejections = true;
        const wrapper = new RejectionStream(handler);
        this.handlers.set(handler, wrapper);
        this.logger.pipe(wrapper);
      }
    }
    _unhandledRejection(err) {
      const info = this.getAllInfo(err);
      const handlers = this._getRejectionHandlers();
      let doExit = typeof this.logger.exitOnError === "function" ? this.logger.exitOnError(err) : this.logger.exitOnError;
      let timeout;
      if (!handlers.length && doExit) {
        console.warn("winston: exitOnError cannot be true with no rejection handlers.");
        console.warn("winston: not exiting process.");
        doExit = false;
      }
      function gracefulExit() {
        debug("doExit", doExit);
        debug("process._exiting", process._exiting);
        if (doExit && !process._exiting) {
          if (timeout) {
            clearTimeout(timeout);
          }
          process.exit(1);
        }
      }
      if (!handlers || handlers.length === 0) {
        return process.nextTick(gracefulExit);
      }
      asyncForEach(handlers, (handler, next) => {
        const done = once(next);
        const transport = handler.transport || handler;
        function onDone(event) {
          return () => {
            debug(event);
            done();
          };
        }
        transport._ending = true;
        transport.once("finish", onDone("finished"));
        transport.once("error", onDone("error"));
      }, () => doExit && gracefulExit());
      this.logger.log(info);
      if (doExit) {
        timeout = setTimeout(gracefulExit, 3000);
      }
    }
    _getRejectionHandlers() {
      return this.logger.transports.filter((wrap) => {
        const transport = wrap.transport || wrap;
        return transport.handleRejections;
      });
    }
  };
});

// node_modules/winston/lib/winston/profiler.js
var require_profiler = __commonJS((exports, module) => {
  class Profiler {
    constructor(logger) {
      const Logger = require_logger();
      if (typeof logger !== "object" || Array.isArray(logger) || !(logger instanceof Logger)) {
        throw new Error("Logger is required for profiling");
      } else {
        this.logger = logger;
        this.start = Date.now();
      }
    }
    done(...args) {
      if (typeof args[args.length - 1] === "function") {
        console.warn("Callback function no longer supported as of winston@3.0.0");
        args.pop();
      }
      const info = typeof args[args.length - 1] === "object" ? args.pop() : {};
      info.level = info.level || "info";
      info.durationMs = Date.now() - this.start;
      return this.logger.write(info);
    }
  }
  module.exports = Profiler;
});

// node_modules/winston/lib/winston/logger.js
var require_logger = __commonJS((exports, module) => {
  function getLevelValue(levels, level) {
    const value = levels[level];
    if (!value && value !== 0) {
      return null;
    }
    return value;
  }
  var { Stream, Transform } = require_readable();
  var asyncForEach = require_forEach();
  var { LEVEL, SPLAT } = require_triple_beam();
  var isStream = require_is_stream();
  var ExceptionHandler = require_exception_handler();
  var RejectionHandler = require_rejection_handler();
  var LegacyTransportStream = require_legacy();
  var Profiler = require_profiler();
  var { warn } = require_common();
  var config = require_config2();
  var formatRegExp = /%[scdjifoO%]/g;

  class Logger extends Transform {
    constructor(options) {
      super({ objectMode: true });
      this.configure(options);
    }
    child(defaultRequestMetadata) {
      const logger = this;
      return Object.create(logger, {
        write: {
          value: function(info) {
            const infoClone = Object.assign({}, defaultRequestMetadata, info);
            if (info instanceof Error) {
              infoClone.stack = info.stack;
              infoClone.message = info.message;
            }
            logger.write(infoClone);
          }
        }
      });
    }
    configure({
      silent,
      format,
      defaultMeta,
      levels,
      level = "info",
      exitOnError = true,
      transports,
      colors,
      emitErrs,
      formatters,
      padLevels,
      rewriters,
      stripColors,
      exceptionHandlers,
      rejectionHandlers
    } = {}) {
      if (this.transports.length) {
        this.clear();
      }
      this.silent = silent;
      this.format = format || this.format || require_json()();
      this.defaultMeta = defaultMeta || null;
      this.levels = levels || this.levels || config.npm.levels;
      this.level = level;
      if (this.exceptions) {
        this.exceptions.unhandle();
      }
      if (this.rejections) {
        this.rejections.unhandle();
      }
      this.exceptions = new ExceptionHandler(this);
      this.rejections = new RejectionHandler(this);
      this.profilers = {};
      this.exitOnError = exitOnError;
      if (transports) {
        transports = Array.isArray(transports) ? transports : [transports];
        transports.forEach((transport) => this.add(transport));
      }
      if (colors || emitErrs || formatters || padLevels || rewriters || stripColors) {
        throw new Error([
          "{ colors, emitErrs, formatters, padLevels, rewriters, stripColors } were removed in winston@3.0.0.",
          "Use a custom winston.format(function) instead.",
          "See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md"
        ].join("\n"));
      }
      if (exceptionHandlers) {
        this.exceptions.handle(exceptionHandlers);
      }
      if (rejectionHandlers) {
        this.rejections.handle(rejectionHandlers);
      }
    }
    isLevelEnabled(level) {
      const givenLevelValue = getLevelValue(this.levels, level);
      if (givenLevelValue === null) {
        return false;
      }
      const configuredLevelValue = getLevelValue(this.levels, this.level);
      if (configuredLevelValue === null) {
        return false;
      }
      if (!this.transports || this.transports.length === 0) {
        return configuredLevelValue >= givenLevelValue;
      }
      const index = this.transports.findIndex((transport) => {
        let transportLevelValue = getLevelValue(this.levels, transport.level);
        if (transportLevelValue === null) {
          transportLevelValue = configuredLevelValue;
        }
        return transportLevelValue >= givenLevelValue;
      });
      return index !== -1;
    }
    log(level, msg, ...splat) {
      if (arguments.length === 1) {
        level[LEVEL] = level.level;
        this._addDefaultMeta(level);
        this.write(level);
        return this;
      }
      if (arguments.length === 2) {
        if (msg && typeof msg === "object") {
          msg[LEVEL] = msg.level = level;
          this._addDefaultMeta(msg);
          this.write(msg);
          return this;
        }
        msg = { [LEVEL]: level, level, message: msg };
        this._addDefaultMeta(msg);
        this.write(msg);
        return this;
      }
      const [meta] = splat;
      if (typeof meta === "object" && meta !== null) {
        const tokens = msg && msg.match && msg.match(formatRegExp);
        if (!tokens) {
          const info = Object.assign({}, this.defaultMeta, meta, {
            [LEVEL]: level,
            [SPLAT]: splat,
            level,
            message: msg
          });
          if (meta.message)
            info.message = `${info.message} ${meta.message}`;
          if (meta.stack)
            info.stack = meta.stack;
          if (meta.cause)
            info.cause = meta.cause;
          this.write(info);
          return this;
        }
      }
      this.write(Object.assign({}, this.defaultMeta, {
        [LEVEL]: level,
        [SPLAT]: splat,
        level,
        message: msg
      }));
      return this;
    }
    _transform(info, enc, callback) {
      if (this.silent) {
        return callback();
      }
      if (!info[LEVEL]) {
        info[LEVEL] = info.level;
      }
      if (!this.levels[info[LEVEL]] && this.levels[info[LEVEL]] !== 0) {
        console.error("[winston] Unknown logger level: %s", info[LEVEL]);
      }
      if (!this._readableState.pipes) {
        console.error("[winston] Attempt to write logs with no transports, which can increase memory usage: %j", info);
      }
      try {
        this.push(this.format.transform(info, this.format.options));
      } finally {
        this._writableState.sync = false;
        callback();
      }
    }
    _final(callback) {
      const transports = this.transports.slice();
      asyncForEach(transports, (transport, next) => {
        if (!transport || transport.finished)
          return setImmediate(next);
        transport.once("finish", next);
        transport.end();
      }, callback);
    }
    add(transport) {
      const target = !isStream(transport) || transport.log.length > 2 ? new LegacyTransportStream({ transport }) : transport;
      if (!target._writableState || !target._writableState.objectMode) {
        throw new Error("Transports must WritableStreams in objectMode. Set { objectMode: true }.");
      }
      this._onEvent("error", target);
      this._onEvent("warn", target);
      this.pipe(target);
      if (transport.handleExceptions) {
        this.exceptions.handle();
      }
      if (transport.handleRejections) {
        this.rejections.handle();
      }
      return this;
    }
    remove(transport) {
      if (!transport)
        return this;
      let target = transport;
      if (!isStream(transport) || transport.log.length > 2) {
        target = this.transports.filter((match) => match.transport === transport)[0];
      }
      if (target) {
        this.unpipe(target);
      }
      return this;
    }
    clear() {
      this.unpipe();
      return this;
    }
    close() {
      this.exceptions.unhandle();
      this.rejections.unhandle();
      this.clear();
      this.emit("close");
      return this;
    }
    setLevels() {
      warn.deprecated("setLevels");
    }
    query(options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = options || {};
      const results = {};
      const queryObject = Object.assign({}, options.query || {});
      function queryTransport(transport, next) {
        if (options.query && typeof transport.formatQuery === "function") {
          options.query = transport.formatQuery(queryObject);
        }
        transport.query(options, (err, res) => {
          if (err) {
            return next(err);
          }
          if (typeof transport.formatResults === "function") {
            res = transport.formatResults(res, options.format);
          }
          next(null, res);
        });
      }
      function addResults(transport, next) {
        queryTransport(transport, (err, result) => {
          if (next) {
            result = err || result;
            if (result) {
              results[transport.name] = result;
            }
            next();
          }
          next = null;
        });
      }
      asyncForEach(this.transports.filter((transport) => !!transport.query), addResults, () => callback(null, results));
    }
    stream(options = {}) {
      const out = new Stream;
      const streams = [];
      out._streams = streams;
      out.destroy = () => {
        let i = streams.length;
        while (i--) {
          streams[i].destroy();
        }
      };
      this.transports.filter((transport) => !!transport.stream).forEach((transport) => {
        const str = transport.stream(options);
        if (!str) {
          return;
        }
        streams.push(str);
        str.on("log", (log) => {
          log.transport = log.transport || [];
          log.transport.push(transport.name);
          out.emit("log", log);
        });
        str.on("error", (err) => {
          err.transport = err.transport || [];
          err.transport.push(transport.name);
          out.emit("error", err);
        });
      });
      return out;
    }
    startTimer() {
      return new Profiler(this);
    }
    profile(id, ...args) {
      const time = Date.now();
      if (this.profilers[id]) {
        const timeEnd = this.profilers[id];
        delete this.profilers[id];
        if (typeof args[args.length - 2] === "function") {
          console.warn("Callback function no longer supported as of winston@3.0.0");
          args.pop();
        }
        const info = typeof args[args.length - 1] === "object" ? args.pop() : {};
        info.level = info.level || "info";
        info.durationMs = time - timeEnd;
        info.message = info.message || id;
        return this.write(info);
      }
      this.profilers[id] = time;
      return this;
    }
    handleExceptions(...args) {
      console.warn("Deprecated: .handleExceptions() will be removed in winston@4. Use .exceptions.handle()");
      this.exceptions.handle(...args);
    }
    unhandleExceptions(...args) {
      console.warn("Deprecated: .unhandleExceptions() will be removed in winston@4. Use .exceptions.unhandle()");
      this.exceptions.unhandle(...args);
    }
    cli() {
      throw new Error([
        "Logger.cli() was removed in winston@3.0.0",
        "Use a custom winston.formats.cli() instead.",
        "See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md"
      ].join("\n"));
    }
    _onEvent(event, transport) {
      function transportEvent(err) {
        if (event === "error" && !this.transports.includes(transport)) {
          this.add(transport);
        }
        this.emit(event, err, transport);
      }
      if (!transport["__winston" + event]) {
        transport["__winston" + event] = transportEvent.bind(this);
        transport.on(event, transport["__winston" + event]);
      }
    }
    _addDefaultMeta(msg) {
      if (this.defaultMeta) {
        Object.assign(msg, this.defaultMeta);
      }
    }
  }
  Object.defineProperty(Logger.prototype, "transports", {
    configurable: false,
    enumerable: true,
    get() {
      const { pipes } = this._readableState;
      return !Array.isArray(pipes) ? [pipes].filter(Boolean) : pipes;
    }
  });
  module.exports = Logger;
});

// node_modules/winston/lib/winston/create-logger.js
var require_create_logger = __commonJS((exports, module) => {
  function isLevelEnabledFunctionName(level) {
    return "is" + level.charAt(0).toUpperCase() + level.slice(1) + "Enabled";
  }
  var { LEVEL } = require_triple_beam();
  var config = require_config2();
  var Logger = require_logger();
  var debug = require_node2()("winston:create-logger");
  module.exports = function(opts = {}) {
    opts.levels = opts.levels || config.npm.levels;

    class DerivedLogger extends Logger {
      constructor(options) {
        super(options);
      }
    }
    const logger = new DerivedLogger(opts);
    Object.keys(opts.levels).forEach(function(level) {
      debug('Define prototype method for "%s"', level);
      if (level === "log") {
        console.warn('Level "log" not defined: conflicts with the method "log". Use a different level name.');
        return;
      }
      DerivedLogger.prototype[level] = function(...args) {
        const self2 = this || logger;
        if (args.length === 1) {
          const [msg] = args;
          const info = msg && msg.message && msg || { message: msg };
          info.level = info[LEVEL] = level;
          self2._addDefaultMeta(info);
          self2.write(info);
          return this || logger;
        }
        if (args.length === 0) {
          self2.log(level, "");
          return self2;
        }
        return self2.log(level, ...args);
      };
      DerivedLogger.prototype[isLevelEnabledFunctionName(level)] = function() {
        return (this || logger).isLevelEnabled(level);
      };
    });
    return logger;
  };
});

// node_modules/winston/lib/winston/container.js
var require_container = __commonJS((exports, module) => {
  var createLogger = require_create_logger();
  module.exports = class Container {
    constructor(options = {}) {
      this.loggers = new Map;
      this.options = options;
    }
    add(id, options) {
      if (!this.loggers.has(id)) {
        options = Object.assign({}, options || this.options);
        const existing = options.transports || this.options.transports;
        if (existing) {
          options.transports = Array.isArray(existing) ? existing.slice() : [existing];
        } else {
          options.transports = [];
        }
        const logger = createLogger(options);
        logger.on("close", () => this._delete(id));
        this.loggers.set(id, logger);
      }
      return this.loggers.get(id);
    }
    get(id, options) {
      return this.add(id, options);
    }
    has(id) {
      return !!this.loggers.has(id);
    }
    close(id) {
      if (id) {
        return this._removeLogger(id);
      }
      this.loggers.forEach((val, key) => this._removeLogger(key));
    }
    _removeLogger(id) {
      if (!this.loggers.has(id)) {
        return;
      }
      const logger = this.loggers.get(id);
      logger.close();
      this._delete(id);
    }
    _delete(id) {
      this.loggers.delete(id);
    }
  };
});

// node_modules/winston/lib/winston.js
var require_winston = __commonJS((exports) => {
  var logform = require_logform();
  var { warn } = require_common();
  exports.version = require_package2().version;
  exports.transports = require_transports();
  exports.config = require_config2();
  exports.addColors = logform.levels;
  exports.format = logform.format;
  exports.createLogger = require_create_logger();
  exports.Logger = require_logger();
  exports.ExceptionHandler = require_exception_handler();
  exports.RejectionHandler = require_rejection_handler();
  exports.Container = require_container();
  exports.Transport = require_winston_transport();
  exports.loggers = new exports.Container;
  var defaultLogger = exports.createLogger();
  Object.keys(exports.config.npm.levels).concat([
    "log",
    "query",
    "stream",
    "add",
    "remove",
    "clear",
    "profile",
    "startTimer",
    "handleExceptions",
    "unhandleExceptions",
    "handleRejections",
    "unhandleRejections",
    "configure",
    "child"
  ]).forEach((method) => exports[method] = (...args) => defaultLogger[method](...args));
  Object.defineProperty(exports, "level", {
    get() {
      return defaultLogger.level;
    },
    set(val) {
      defaultLogger.level = val;
    }
  });
  Object.defineProperty(exports, "exceptions", {
    get() {
      return defaultLogger.exceptions;
    }
  });
  Object.defineProperty(exports, "rejections", {
    get() {
      return defaultLogger.rejections;
    }
  });
  ["exitOnError"].forEach((prop) => {
    Object.defineProperty(exports, prop, {
      get() {
        return defaultLogger[prop];
      },
      set(val) {
        defaultLogger[prop] = val;
      }
    });
  });
  Object.defineProperty(exports, "default", {
    get() {
      return {
        exceptionHandlers: defaultLogger.exceptionHandlers,
        rejectionHandlers: defaultLogger.rejectionHandlers,
        transports: defaultLogger.transports
      };
    }
  });
  warn.deprecated(exports, "setLevels");
  warn.forFunctions(exports, "useFormat", ["cli"]);
  warn.forProperties(exports, "useFormat", ["padLevels", "stripColors"]);
  warn.forFunctions(exports, "deprecated", [
    "addRewriter",
    "addFilter",
    "clone",
    "extend"
  ]);
  warn.forProperties(exports, "deprecated", ["emitErrs", "levelLength"]);
});

// node_modules/@hapi/hoek/lib/assertError.js
var require_assertError = __commonJS((exports, module) => {
  module.exports = class AssertError extends Error {
    name = "AssertError";
    constructor(message, ctor) {
      super(message || "Unknown error");
      if (typeof Error.captureStackTrace === "function") {
        Error.captureStackTrace(this, ctor);
      }
    }
  };
});

// node_modules/@hapi/hoek/lib/stringify.js
var require_stringify = __commonJS((exports, module) => {
  module.exports = function(...args) {
    try {
      return JSON.stringify(...args);
    } catch (err) {
      return "[Cannot display object: " + err.message + "]";
    }
  };
});

// node_modules/@hapi/hoek/lib/assert.js
var require_assert = __commonJS((exports, module) => {
  var AssertError = require_assertError();
  var Stringify = require_stringify();
  var assert = module.exports = function(condition, ...args) {
    if (condition) {
      return;
    }
    if (args.length === 1 && args[0] instanceof Error) {
      throw args[0];
    }
    const msgs = args.filter((arg) => arg !== "").map((arg) => {
      return typeof arg === "string" ? arg : arg instanceof Error ? arg.message : Stringify(arg);
    });
    throw new AssertError(msgs.join(" "), assert);
  };
});

// node_modules/@hapi/hoek/lib/reach.js
var require_reach = __commonJS((exports, module) => {
  var Assert = require_assert();
  var internals = {};
  module.exports = function(obj, chain, options) {
    if (chain === false || chain === null || chain === undefined) {
      return obj;
    }
    options = options || {};
    if (typeof options === "string") {
      options = { separator: options };
    }
    const isChainArray = Array.isArray(chain);
    Assert(!isChainArray || !options.separator, "Separator option is not valid for array-based chain");
    const path = isChainArray ? chain : chain.split(options.separator || ".");
    let ref = obj;
    for (let i = 0;i < path.length; ++i) {
      let key = path[i];
      const type = options.iterables && internals.iterables(ref);
      if (Array.isArray(ref) || type === "set") {
        const number = Number(key);
        if (Number.isInteger(number)) {
          key = number < 0 ? ref.length + number : number;
        }
      }
      if (!ref || typeof ref === "function" && options.functions === false || !type && ref[key] === undefined) {
        Assert(!options.strict || i + 1 === path.length, "Missing segment", key, "in reach path ", chain);
        Assert(typeof ref === "object" || options.functions === true || typeof ref !== "function", "Invalid segment", key, "in reach path ", chain);
        ref = options.default;
        break;
      }
      if (!type) {
        ref = ref[key];
      } else if (type === "set") {
        ref = [...ref][key];
      } else {
        ref = ref.get(key);
      }
    }
    return ref;
  };
  internals.iterables = function(ref) {
    if (ref instanceof Set) {
      return "set";
    }
    if (ref instanceof Map) {
      return "map";
    }
  };
});

// node_modules/@hapi/hoek/lib/types.js
var require_types = __commonJS((exports, module) => {
  var internals = {};
  exports = module.exports = {
    array: Array.prototype,
    buffer: Buffer && Buffer.prototype,
    date: Date.prototype,
    error: Error.prototype,
    generic: Object.prototype,
    map: Map.prototype,
    promise: Promise.prototype,
    regex: RegExp.prototype,
    set: Set.prototype,
    url: URL.prototype,
    weakMap: WeakMap.prototype,
    weakSet: WeakSet.prototype
  };
  internals.typeMap = new Map([
    ["[object Error]", exports.error],
    ["[object Map]", exports.map],
    ["[object Promise]", exports.promise],
    ["[object Set]", exports.set],
    ["[object URL]", exports.url],
    ["[object WeakMap]", exports.weakMap],
    ["[object WeakSet]", exports.weakSet]
  ]);
  exports.getInternalProto = function(obj) {
    if (Array.isArray(obj)) {
      return exports.array;
    }
    if (Buffer && obj instanceof Buffer) {
      return exports.buffer;
    }
    if (obj instanceof Date) {
      return exports.date;
    }
    if (obj instanceof RegExp) {
      return exports.regex;
    }
    if (obj instanceof Error) {
      return exports.error;
    }
    const objName = Object.prototype.toString.call(obj);
    return internals.typeMap.get(objName) || exports.generic;
  };
});

// node_modules/@hapi/hoek/lib/utils.js
var require_utils = __commonJS((exports) => {
  exports.keys = function(obj, options = {}) {
    return options.symbols !== false ? Reflect.ownKeys(obj) : Object.getOwnPropertyNames(obj);
  };
});

// node_modules/@hapi/hoek/lib/clone.js
var require_clone = __commonJS((exports, module) => {
  var Reach = require_reach();
  var Types = require_types();
  var Utils = require_utils();
  var internals = {
    needsProtoHack: new Set([Types.set, Types.map, Types.weakSet, Types.weakMap]),
    structuredCloneExists: typeof structuredClone === "function"
  };
  module.exports = internals.clone = function(obj, options = {}, _seen = null) {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
    let clone = internals.clone;
    let seen = _seen;
    if (options.shallow) {
      if (options.shallow !== true) {
        return internals.cloneWithShallow(obj, options);
      }
      clone = (value) => value;
    } else if (seen) {
      const lookup = seen.get(obj);
      if (lookup) {
        return lookup;
      }
    } else {
      seen = new Map;
    }
    const baseProto = Types.getInternalProto(obj);
    switch (baseProto) {
      case Types.buffer:
        return Buffer?.from(obj);
      case Types.date:
        return new Date(obj.getTime());
      case Types.regex:
      case Types.url:
        return new baseProto.constructor(obj);
    }
    const newObj = internals.base(obj, baseProto, options);
    if (newObj === obj) {
      return obj;
    }
    if (seen) {
      seen.set(obj, newObj);
    }
    if (baseProto === Types.set) {
      for (const value of obj) {
        newObj.add(clone(value, options, seen));
      }
    } else if (baseProto === Types.map) {
      for (const [key, value] of obj) {
        newObj.set(key, clone(value, options, seen));
      }
    }
    const keys = Utils.keys(obj, options);
    for (const key of keys) {
      if (key === "__proto__") {
        continue;
      }
      if (baseProto === Types.array && key === "length") {
        newObj.length = obj.length;
        continue;
      }
      if (internals.structuredCloneExists && baseProto === Types.error && key === "stack") {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      if (descriptor) {
        if (descriptor.get || descriptor.set) {
          Object.defineProperty(newObj, key, descriptor);
        } else if (descriptor.enumerable) {
          newObj[key] = clone(obj[key], options, seen);
        } else {
          Object.defineProperty(newObj, key, { enumerable: false, writable: true, configurable: true, value: clone(obj[key], options, seen) });
        }
      } else {
        Object.defineProperty(newObj, key, {
          enumerable: true,
          writable: true,
          configurable: true,
          value: clone(obj[key], options, seen)
        });
      }
    }
    return newObj;
  };
  internals.cloneWithShallow = function(source, options) {
    const keys = options.shallow;
    options = Object.assign({}, options);
    options.shallow = false;
    const seen = new Map;
    for (const key of keys) {
      const ref = Reach(source, key);
      if (typeof ref === "object" || typeof ref === "function") {
        seen.set(ref, ref);
      }
    }
    return internals.clone(source, options, seen);
  };
  internals.base = function(obj, baseProto, options) {
    if (options.prototype === false) {
      if (internals.needsProtoHack.has(baseProto)) {
        return new baseProto.constructor;
      }
      return baseProto === Types.array ? [] : {};
    }
    const proto = Object.getPrototypeOf(obj);
    if (proto && proto.isImmutable) {
      return obj;
    }
    if (baseProto === Types.array) {
      const newObj = [];
      if (proto !== baseProto) {
        Object.setPrototypeOf(newObj, proto);
      }
      return newObj;
    } else if (baseProto === Types.error && internals.structuredCloneExists && (proto === baseProto || Error.isPrototypeOf(proto.constructor))) {
      const err = structuredClone(obj);
      if (Object.getPrototypeOf(err) !== proto) {
        Object.setPrototypeOf(err, proto);
      }
      return err;
    }
    if (internals.needsProtoHack.has(baseProto)) {
      const newObj = new proto.constructor;
      if (proto !== baseProto) {
        Object.setPrototypeOf(newObj, proto);
      }
      return newObj;
    }
    return Object.create(proto);
  };
});

// node_modules/@hapi/hoek/lib/merge.js
var require_merge = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var Utils = require_utils();
  var internals = {};
  module.exports = internals.merge = function(target, source, options) {
    Assert(target && typeof target === "object", "Invalid target value: must be an object");
    Assert(source === null || source === undefined || typeof source === "object", "Invalid source value: must be null, undefined, or an object");
    if (!source) {
      return target;
    }
    options = Object.assign({ nullOverride: true, mergeArrays: true }, options);
    if (Array.isArray(source)) {
      Assert(Array.isArray(target), "Cannot merge array onto an object");
      if (!options.mergeArrays) {
        target.length = 0;
      }
      for (let i = 0;i < source.length; ++i) {
        target.push(Clone(source[i], { symbols: options.symbols }));
      }
      return target;
    }
    const keys = Utils.keys(source, options);
    for (let i = 0;i < keys.length; ++i) {
      const key = keys[i];
      if (key === "__proto__" || !Object.prototype.propertyIsEnumerable.call(source, key)) {
        continue;
      }
      const value = source[key];
      if (value && typeof value === "object") {
        if (target[key] === value) {
          continue;
        }
        if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key]) !== Array.isArray(value) || value instanceof Date || Buffer && Buffer.isBuffer(value) || value instanceof RegExp) {
          target[key] = Clone(value, { symbols: options.symbols });
        } else {
          internals.merge(target[key], value, options);
        }
      } else {
        if (value !== null && value !== undefined) {
          target[key] = value;
        } else if (options.nullOverride) {
          target[key] = value;
        }
      }
    }
    return target;
  };
});

// node_modules/@hapi/hoek/lib/applyToDefaults.js
var require_applyToDefaults = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var Merge = require_merge();
  var Reach = require_reach();
  var internals = {};
  module.exports = function(defaults, source, options = {}) {
    Assert(defaults && typeof defaults === "object", "Invalid defaults value: must be an object");
    Assert(!source || source === true || typeof source === "object", "Invalid source value: must be true, falsy or an object");
    Assert(typeof options === "object", "Invalid options: must be an object");
    if (!source) {
      return null;
    }
    if (options.shallow) {
      return internals.applyToDefaultsWithShallow(defaults, source, options);
    }
    const copy = Clone(defaults);
    if (source === true) {
      return copy;
    }
    const nullOverride = options.nullOverride !== undefined ? options.nullOverride : false;
    return Merge(copy, source, { nullOverride, mergeArrays: false });
  };
  internals.applyToDefaultsWithShallow = function(defaults, source, options) {
    const keys = options.shallow;
    Assert(Array.isArray(keys), "Invalid keys");
    const seen = new Map;
    const merge = source === true ? null : new Set;
    for (let key of keys) {
      key = Array.isArray(key) ? key : key.split(".");
      const ref = Reach(defaults, key);
      if (ref && typeof ref === "object") {
        seen.set(ref, merge && Reach(source, key) || ref);
      } else if (merge) {
        merge.add(key);
      }
    }
    const copy = Clone(defaults, {}, seen);
    if (!merge) {
      return copy;
    }
    for (const key of merge) {
      internals.reachCopy(copy, source, key);
    }
    const nullOverride = options.nullOverride !== undefined ? options.nullOverride : false;
    return Merge(copy, source, { nullOverride, mergeArrays: false });
  };
  internals.reachCopy = function(dst, src, path) {
    for (const segment of path) {
      if (!(segment in src)) {
        return;
      }
      const val = src[segment];
      if (typeof val !== "object" || val === null) {
        return;
      }
      src = val;
    }
    const value = src;
    let ref = dst;
    for (let i = 0;i < path.length - 1; ++i) {
      const segment = path[i];
      if (typeof ref[segment] !== "object") {
        ref[segment] = {};
      }
      ref = ref[segment];
    }
    ref[path[path.length - 1]] = value;
  };
});

// node_modules/@hapi/hoek/lib/bench.js
var require_bench = __commonJS((exports, module) => {
  var internals = {};
  module.exports = internals.Bench = class {
    constructor() {
      this.ts = 0;
      this.reset();
    }
    reset() {
      this.ts = internals.Bench.now();
    }
    elapsed() {
      return internals.Bench.now() - this.ts;
    }
    static now() {
      const ts = process.hrtime();
      return ts[0] * 1000 + ts[1] / 1e6;
    }
  };
});

// node_modules/@hapi/hoek/lib/ignore.js
var require_ignore = __commonJS((exports, module) => {
  module.exports = function() {
  };
});

// node_modules/@hapi/hoek/lib/block.js
var require_block = __commonJS((exports, module) => {
  var Ignore = require_ignore();
  module.exports = function() {
    return new Promise(Ignore);
  };
});

// node_modules/@hapi/hoek/lib/deepEqual.js
var require_deepEqual = __commonJS((exports, module) => {
  var Types = require_types();
  var internals = {
    mismatched: null
  };
  module.exports = function(obj, ref, options) {
    options = Object.assign({ prototype: true }, options);
    return !!internals.isDeepEqual(obj, ref, options, []);
  };
  internals.isDeepEqual = function(obj, ref, options, seen) {
    if (obj === ref) {
      return obj !== 0 || 1 / obj === 1 / ref;
    }
    const type = typeof obj;
    if (type !== typeof ref) {
      return false;
    }
    if (obj === null || ref === null) {
      return false;
    }
    if (type === "function") {
      if (!options.deepFunction || obj.toString() !== ref.toString()) {
        return false;
      }
    } else if (type !== "object") {
      return obj !== obj && ref !== ref;
    }
    const instanceType = internals.getSharedType(obj, ref, !!options.prototype);
    switch (instanceType) {
      case Types.buffer:
        return Buffer && Buffer.prototype.equals.call(obj, ref);
      case Types.promise:
        return obj === ref;
      case Types.regex:
      case Types.url:
        return obj.toString() === ref.toString();
      case internals.mismatched:
        return false;
    }
    for (let i = seen.length - 1;i >= 0; --i) {
      if (seen[i].isSame(obj, ref)) {
        return true;
      }
    }
    seen.push(new internals.SeenEntry(obj, ref));
    try {
      return !!internals.isDeepEqualObj(instanceType, obj, ref, options, seen);
    } finally {
      seen.pop();
    }
  };
  internals.getSharedType = function(obj, ref, checkPrototype) {
    if (checkPrototype) {
      if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf(ref)) {
        return internals.mismatched;
      }
      return Types.getInternalProto(obj);
    }
    const type = Types.getInternalProto(obj);
    if (type !== Types.getInternalProto(ref)) {
      return internals.mismatched;
    }
    return type;
  };
  internals.valueOf = function(obj) {
    const objValueOf = obj.valueOf;
    if (objValueOf === undefined) {
      return obj;
    }
    try {
      return objValueOf.call(obj);
    } catch (err) {
      return err;
    }
  };
  internals.hasOwnEnumerableProperty = function(obj, key) {
    return Object.prototype.propertyIsEnumerable.call(obj, key);
  };
  internals.isSetSimpleEqual = function(obj, ref) {
    for (const entry of Set.prototype.values.call(obj)) {
      if (!Set.prototype.has.call(ref, entry)) {
        return false;
      }
    }
    return true;
  };
  internals.isDeepEqualObj = function(instanceType, obj, ref, options, seen) {
    const { isDeepEqual, valueOf, hasOwnEnumerableProperty } = internals;
    const { keys, getOwnPropertySymbols } = Object;
    if (instanceType === Types.array) {
      if (options.part) {
        for (const objValue of obj) {
          for (const refValue of ref) {
            if (isDeepEqual(objValue, refValue, options, seen)) {
              return true;
            }
          }
        }
      } else {
        if (obj.length !== ref.length) {
          return false;
        }
        for (let i = 0;i < obj.length; ++i) {
          if (!isDeepEqual(obj[i], ref[i], options, seen)) {
            return false;
          }
        }
        return true;
      }
    } else if (instanceType === Types.set) {
      if (obj.size !== ref.size) {
        return false;
      }
      if (!internals.isSetSimpleEqual(obj, ref)) {
        const ref2 = new Set(Set.prototype.values.call(ref));
        for (const objEntry of Set.prototype.values.call(obj)) {
          if (ref2.delete(objEntry)) {
            continue;
          }
          let found = false;
          for (const refEntry of ref2) {
            if (isDeepEqual(objEntry, refEntry, options, seen)) {
              ref2.delete(refEntry);
              found = true;
              break;
            }
          }
          if (!found) {
            return false;
          }
        }
      }
    } else if (instanceType === Types.map) {
      if (obj.size !== ref.size) {
        return false;
      }
      for (const [key, value] of Map.prototype.entries.call(obj)) {
        if (value === undefined && !Map.prototype.has.call(ref, key)) {
          return false;
        }
        if (!isDeepEqual(value, Map.prototype.get.call(ref, key), options, seen)) {
          return false;
        }
      }
    } else if (instanceType === Types.error) {
      if (obj.name !== ref.name || obj.message !== ref.message) {
        return false;
      }
    }
    const valueOfObj = valueOf(obj);
    const valueOfRef = valueOf(ref);
    if ((obj !== valueOfObj || ref !== valueOfRef) && !isDeepEqual(valueOfObj, valueOfRef, options, seen)) {
      return false;
    }
    const objKeys = keys(obj);
    if (!options.part && objKeys.length !== keys(ref).length && !options.skip) {
      return false;
    }
    let skipped = 0;
    for (const key of objKeys) {
      if (options.skip && options.skip.includes(key)) {
        if (ref[key] === undefined) {
          ++skipped;
        }
        continue;
      }
      if (!hasOwnEnumerableProperty(ref, key)) {
        return false;
      }
      if (!isDeepEqual(obj[key], ref[key], options, seen)) {
        return false;
      }
    }
    if (!options.part && objKeys.length - skipped !== keys(ref).length) {
      return false;
    }
    if (options.symbols !== false) {
      const objSymbols = getOwnPropertySymbols(obj);
      const refSymbols = new Set(getOwnPropertySymbols(ref));
      for (const key of objSymbols) {
        if (!options.skip?.includes(key)) {
          if (hasOwnEnumerableProperty(obj, key)) {
            if (!hasOwnEnumerableProperty(ref, key)) {
              return false;
            }
            if (!isDeepEqual(obj[key], ref[key], options, seen)) {
              return false;
            }
          } else if (hasOwnEnumerableProperty(ref, key)) {
            return false;
          }
        }
        refSymbols.delete(key);
      }
      for (const key of refSymbols) {
        if (hasOwnEnumerableProperty(ref, key)) {
          return false;
        }
      }
    }
    return true;
  };
  internals.SeenEntry = class {
    constructor(obj, ref) {
      this.obj = obj;
      this.ref = ref;
    }
    isSame(obj, ref) {
      return this.obj === obj && this.ref === ref;
    }
  };
});

// node_modules/@hapi/hoek/lib/escapeRegex.js
var require_escapeRegex = __commonJS((exports, module) => {
  module.exports = function(string) {
    return string.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, "\\$&");
  };
});

// node_modules/@hapi/hoek/lib/contain.js
var require_contain = __commonJS((exports, module) => {
  var Assert = require_assert();
  var DeepEqual = require_deepEqual();
  var EscapeRegex = require_escapeRegex();
  var Utils = require_utils();
  var internals = {};
  module.exports = function(ref, values, options = {}) {
    if (typeof values !== "object") {
      values = [values];
    }
    Assert(!Array.isArray(values) || values.length, "Values array cannot be empty");
    if (typeof ref === "string") {
      return internals.string(ref, values, options);
    }
    if (Array.isArray(ref)) {
      return internals.array(ref, values, options);
    }
    Assert(typeof ref === "object", "Reference must be string or an object");
    return internals.object(ref, values, options);
  };
  internals.array = function(ref, values, options) {
    if (!Array.isArray(values)) {
      values = [values];
    }
    if (!ref.length) {
      return false;
    }
    if (options.only && options.once && ref.length !== values.length) {
      return false;
    }
    let compare;
    const map = new Map;
    for (const value of values) {
      if (!options.deep || !value || typeof value !== "object") {
        const existing = map.get(value);
        if (existing) {
          ++existing.allowed;
        } else {
          map.set(value, { allowed: 1, hits: 0 });
        }
      } else {
        compare = compare ?? internals.compare(options);
        let found = false;
        for (const [key, existing] of map.entries()) {
          if (compare(key, value)) {
            ++existing.allowed;
            found = true;
            break;
          }
        }
        if (!found) {
          map.set(value, { allowed: 1, hits: 0 });
        }
      }
    }
    let hits = 0;
    for (const item of ref) {
      let match;
      if (!options.deep || !item || typeof item !== "object") {
        match = map.get(item);
      } else {
        compare = compare ?? internals.compare(options);
        for (const [key, existing] of map.entries()) {
          if (compare(key, item)) {
            match = existing;
            break;
          }
        }
      }
      if (match) {
        ++match.hits;
        ++hits;
        if (options.once && match.hits > match.allowed) {
          return false;
        }
      }
    }
    if (options.only && hits !== ref.length) {
      return false;
    }
    for (const match of map.values()) {
      if (match.hits === match.allowed) {
        continue;
      }
      if (match.hits < match.allowed && !options.part) {
        return false;
      }
    }
    return !!hits;
  };
  internals.object = function(ref, values, options) {
    Assert(options.once === undefined, "Cannot use option once with object");
    const keys = Utils.keys(ref, options);
    if (!keys.length) {
      return false;
    }
    if (Array.isArray(values)) {
      return internals.array(keys, values, options);
    }
    const symbols = Object.getOwnPropertySymbols(values).filter((sym) => values.propertyIsEnumerable(sym));
    const targets = [...Object.keys(values), ...symbols];
    const compare = internals.compare(options);
    const set = new Set(targets);
    for (const key of keys) {
      if (!set.has(key)) {
        if (options.only) {
          return false;
        }
        continue;
      }
      if (!compare(values[key], ref[key])) {
        return false;
      }
      set.delete(key);
    }
    if (set.size) {
      return options.part ? set.size < targets.length : false;
    }
    return true;
  };
  internals.string = function(ref, values, options) {
    if (ref === "") {
      return values.length === 1 && values[0] === "" || !options.once && !values.some((v) => v !== "");
    }
    const map = new Map;
    const patterns = [];
    for (const value of values) {
      Assert(typeof value === "string", "Cannot compare string reference to non-string value");
      if (value) {
        const existing = map.get(value);
        if (existing) {
          ++existing.allowed;
        } else {
          map.set(value, { allowed: 1, hits: 0 });
          patterns.push(EscapeRegex(value));
        }
      } else if (options.once || options.only) {
        return false;
      }
    }
    if (!patterns.length) {
      return true;
    }
    const regex = new RegExp(`(${patterns.join("|")})`, "g");
    const leftovers = ref.replace(regex, ($0, $1) => {
      ++map.get($1).hits;
      return "";
    });
    if (options.only && leftovers) {
      return false;
    }
    let any = false;
    for (const match of map.values()) {
      if (match.hits) {
        any = true;
      }
      if (match.hits === match.allowed) {
        continue;
      }
      if (match.hits < match.allowed && !options.part) {
        return false;
      }
      if (options.once) {
        return false;
      }
    }
    return !!any;
  };
  internals.compare = function(options) {
    if (!options.deep) {
      return internals.shallow;
    }
    const hasOnly = options.only !== undefined;
    const hasPart = options.part !== undefined;
    const flags = {
      prototype: hasOnly ? options.only : hasPart ? !options.part : false,
      part: hasOnly ? !options.only : hasPart ? options.part : false
    };
    return (a, b) => DeepEqual(a, b, flags);
  };
  internals.shallow = function(a, b) {
    return a === b;
  };
});

// node_modules/@hapi/hoek/lib/escapeHeaderAttribute.js
var require_escapeHeaderAttribute = __commonJS((exports, module) => {
  var Assert = require_assert();
  module.exports = function(attribute) {
    Assert(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~\"\\]*$/.test(attribute), "Bad attribute value (" + attribute + ")");
    return attribute.replace(/\\/g, "\\\\").replace(/\"/g, '\\"');
  };
});

// node_modules/@hapi/hoek/lib/escapeHtml.js
var require_escapeHtml = __commonJS((exports, module) => {
  var internals = {};
  module.exports = function(input) {
    if (!input) {
      return "";
    }
    let escaped = "";
    for (let i = 0;i < input.length; ++i) {
      const charCode = input.charCodeAt(i);
      if (internals.isSafe(charCode)) {
        escaped += input[i];
      } else {
        escaped += internals.escapeHtmlChar(charCode);
      }
    }
    return escaped;
  };
  internals.escapeHtmlChar = function(charCode) {
    const namedEscape = internals.namedHtml.get(charCode);
    if (namedEscape) {
      return namedEscape;
    }
    if (charCode >= 256) {
      return "&#" + charCode + ";";
    }
    const hexValue = charCode.toString(16).padStart(2, "0");
    return `&#x${hexValue};`;
  };
  internals.isSafe = function(charCode) {
    return internals.safeCharCodes.has(charCode);
  };
  internals.namedHtml = new Map([
    [38, "&amp;"],
    [60, "&lt;"],
    [62, "&gt;"],
    [34, "&quot;"],
    [160, "&nbsp;"],
    [162, "&cent;"],
    [163, "&pound;"],
    [164, "&curren;"],
    [169, "&copy;"],
    [174, "&reg;"]
  ]);
  internals.safeCharCodes = function() {
    const safe = new Set;
    for (let i = 32;i < 123; ++i) {
      if (i >= 97 || i >= 65 && i <= 90 || i >= 48 && i <= 57 || i === 32 || i === 46 || i === 44 || i === 45 || i === 58 || i === 95) {
        safe.add(i);
      }
    }
    return safe;
  }();
});

// node_modules/@hapi/hoek/lib/escapeJson.js
var require_escapeJson = __commonJS((exports, module) => {
  var internals = {};
  module.exports = function(input) {
    if (!input) {
      return "";
    }
    return input.replace(/[<>&\u2028\u2029]/g, internals.escape);
  };
  internals.escape = function(char) {
    return internals.replacements.get(char);
  };
  internals.replacements = new Map([
    ["<", "\\u003c"],
    [">", "\\u003e"],
    ["&", "\\u0026"],
    ["\u2028", "\\u2028"],
    ["\u2029", "\\u2029"]
  ]);
});

// node_modules/@hapi/hoek/lib/flatten.js
var require_flatten = __commonJS((exports, module) => {
  var internals = {};
  module.exports = internals.flatten = function(array, target) {
    const result = target || [];
    for (const entry of array) {
      if (Array.isArray(entry)) {
        internals.flatten(entry, result);
      } else {
        result.push(entry);
      }
    }
    return result;
  };
});

// node_modules/@hapi/hoek/lib/intersect.js
var require_intersect = __commonJS((exports, module) => {
  var internals = {};
  module.exports = function(array1, array2, options = {}) {
    if (!array1 || !array2) {
      return options.first ? null : [];
    }
    const common = [];
    const hash = Array.isArray(array1) ? new Set(array1) : array1;
    const found = new Set;
    for (const value of array2) {
      if (internals.has(hash, value) && !found.has(value)) {
        if (options.first) {
          return value;
        }
        common.push(value);
        found.add(value);
      }
    }
    return options.first ? null : common;
  };
  internals.has = function(ref, key) {
    if (typeof ref.has === "function") {
      return ref.has(key);
    }
    return ref[key] !== undefined;
  };
});

// node_modules/@hapi/hoek/lib/isPromise.js
var require_isPromise = __commonJS((exports, module) => {
  module.exports = function(promise) {
    return typeof promise?.then === "function";
  };
});

// node_modules/@hapi/hoek/lib/once.js
var require_once2 = __commonJS((exports, module) => {
  var internals = {
    wrapped: Symbol("wrapped")
  };
  module.exports = function(method) {
    if (method[internals.wrapped]) {
      return method;
    }
    let once = false;
    const wrappedFn = function(...args) {
      if (!once) {
        once = true;
        method(...args);
      }
    };
    wrappedFn[internals.wrapped] = true;
    return wrappedFn;
  };
});

// node_modules/@hapi/hoek/lib/reachTemplate.js
var require_reachTemplate = __commonJS((exports, module) => {
  var Reach = require_reach();
  module.exports = function(obj, template, options) {
    return template.replace(/{([^{}]+)}/g, ($0, chain) => {
      const value = Reach(obj, chain, options);
      return value ?? "";
    });
  };
});

// node_modules/@hapi/hoek/lib/wait.js
var require_wait = __commonJS((exports, module) => {
  var internals = {
    maxTimer: 2 ** 31 - 1
  };
  module.exports = function(timeout, returnValue, options) {
    if (typeof timeout === "bigint") {
      timeout = Number(timeout);
    }
    if (timeout >= Number.MAX_SAFE_INTEGER) {
      timeout = Infinity;
    }
    if (typeof timeout !== "number" && timeout !== undefined) {
      throw new TypeError("Timeout must be a number or bigint");
    }
    return new Promise((resolve) => {
      const _setTimeout = options ? options.setTimeout : setTimeout;
      const activate = () => {
        const time = Math.min(timeout, internals.maxTimer);
        timeout -= time;
        _setTimeout(() => timeout > 0 ? activate() : resolve(returnValue), time);
      };
      if (timeout !== Infinity) {
        activate();
      }
    });
  };
});

// node_modules/@hapi/hoek/lib/index.js
var require_lib = __commonJS((exports) => {
  exports.applyToDefaults = require_applyToDefaults();
  exports.assert = require_assert();
  exports.AssertError = require_assertError();
  exports.Bench = require_bench();
  exports.block = require_block();
  exports.clone = require_clone();
  exports.contain = require_contain();
  exports.deepEqual = require_deepEqual();
  exports.escapeHeaderAttribute = require_escapeHeaderAttribute();
  exports.escapeHtml = require_escapeHtml();
  exports.escapeJson = require_escapeJson();
  exports.escapeRegex = require_escapeRegex();
  exports.flatten = require_flatten();
  exports.ignore = require_ignore();
  exports.intersect = require_intersect();
  exports.isPromise = require_isPromise();
  exports.merge = require_merge();
  exports.once = require_once2();
  exports.reach = require_reach();
  exports.reachTemplate = require_reachTemplate();
  exports.stringify = require_stringify();
  exports.wait = require_wait();
});

// node_modules/@hapi/boom/lib/index.js
var require_lib2 = __commonJS((exports) => {
  var Hoek = require_lib();
  var internals = {
    codes: new Map([
      [100, "Continue"],
      [101, "Switching Protocols"],
      [102, "Processing"],
      [200, "OK"],
      [201, "Created"],
      [202, "Accepted"],
      [203, "Non-Authoritative Information"],
      [204, "No Content"],
      [205, "Reset Content"],
      [206, "Partial Content"],
      [207, "Multi-Status"],
      [300, "Multiple Choices"],
      [301, "Moved Permanently"],
      [302, "Moved Temporarily"],
      [303, "See Other"],
      [304, "Not Modified"],
      [305, "Use Proxy"],
      [307, "Temporary Redirect"],
      [400, "Bad Request"],
      [401, "Unauthorized"],
      [402, "Payment Required"],
      [403, "Forbidden"],
      [404, "Not Found"],
      [405, "Method Not Allowed"],
      [406, "Not Acceptable"],
      [407, "Proxy Authentication Required"],
      [408, "Request Time-out"],
      [409, "Conflict"],
      [410, "Gone"],
      [411, "Length Required"],
      [412, "Precondition Failed"],
      [413, "Request Entity Too Large"],
      [414, "Request-URI Too Large"],
      [415, "Unsupported Media Type"],
      [416, "Requested Range Not Satisfiable"],
      [417, "Expectation Failed"],
      [418, "I\'m a teapot"],
      [422, "Unprocessable Entity"],
      [423, "Locked"],
      [424, "Failed Dependency"],
      [425, "Too Early"],
      [426, "Upgrade Required"],
      [428, "Precondition Required"],
      [429, "Too Many Requests"],
      [431, "Request Header Fields Too Large"],
      [451, "Unavailable For Legal Reasons"],
      [500, "Internal Server Error"],
      [501, "Not Implemented"],
      [502, "Bad Gateway"],
      [503, "Service Unavailable"],
      [504, "Gateway Time-out"],
      [505, "HTTP Version Not Supported"],
      [506, "Variant Also Negotiates"],
      [507, "Insufficient Storage"],
      [509, "Bandwidth Limit Exceeded"],
      [510, "Not Extended"],
      [511, "Network Authentication Required"]
    ])
  };
  exports.Boom = class extends Error {
    constructor(messageOrError, options = {}) {
      if (messageOrError instanceof Error) {
        return exports.boomify(Hoek.clone(messageOrError), options);
      }
      const { statusCode = 500, data = null, ctor = exports.Boom } = options;
      const error = new Error(messageOrError ? messageOrError : undefined);
      Error.captureStackTrace(error, ctor);
      error.data = data;
      const boom = internals.initialize(error, statusCode);
      Object.defineProperty(boom, "typeof", { value: ctor });
      if (options.decorate) {
        Object.assign(boom, options.decorate);
      }
      return boom;
    }
    static [Symbol.hasInstance](instance) {
      if (this === exports.Boom) {
        return exports.isBoom(instance);
      }
      return this.prototype.isPrototypeOf(instance);
    }
  };
  exports.isBoom = function(err, statusCode) {
    return err instanceof Error && !!err.isBoom && (!statusCode || err.output.statusCode === statusCode);
  };
  exports.boomify = function(err, options) {
    Hoek.assert(err instanceof Error, "Cannot wrap non-Error object");
    options = options || {};
    if (options.data !== undefined) {
      err.data = options.data;
    }
    if (options.decorate) {
      Object.assign(err, options.decorate);
    }
    if (!err.isBoom) {
      return internals.initialize(err, options.statusCode ?? 500, options.message);
    }
    if (options.override === false || !options.statusCode && !options.message) {
      return err;
    }
    return internals.initialize(err, options.statusCode ?? err.output.statusCode, options.message);
  };
  exports.badRequest = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 400, data, ctor: exports.badRequest });
  };
  exports.unauthorized = function(message, scheme, attributes) {
    const err = new exports.Boom(message, { statusCode: 401, ctor: exports.unauthorized });
    if (!scheme) {
      return err;
    }
    if (typeof scheme !== "string") {
      err.output.headers["WWW-Authenticate"] = scheme.join(", ");
      return err;
    }
    let wwwAuthenticate = `${scheme}`;
    if (attributes || message) {
      err.output.payload.attributes = {};
    }
    if (attributes) {
      if (typeof attributes === "string") {
        wwwAuthenticate += " " + Hoek.escapeHeaderAttribute(attributes);
        err.output.payload.attributes = attributes;
      } else {
        wwwAuthenticate += " " + Object.keys(attributes).map((name) => {
          const value = attributes[name] ?? "";
          err.output.payload.attributes[name] = value;
          return `${name}="${Hoek.escapeHeaderAttribute(value.toString())}"`;
        }).join(", ");
      }
    }
    if (message) {
      if (attributes) {
        wwwAuthenticate += ",";
      }
      wwwAuthenticate += ` error="${Hoek.escapeHeaderAttribute(message)}"`;
      err.output.payload.attributes.error = message;
    } else {
      err.isMissing = true;
    }
    err.output.headers["WWW-Authenticate"] = wwwAuthenticate;
    return err;
  };
  exports.paymentRequired = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 402, data, ctor: exports.paymentRequired });
  };
  exports.forbidden = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 403, data, ctor: exports.forbidden });
  };
  exports.notFound = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 404, data, ctor: exports.notFound });
  };
  exports.methodNotAllowed = function(messageOrError, data, allow) {
    const err = new exports.Boom(messageOrError, { statusCode: 405, data, ctor: exports.methodNotAllowed });
    if (typeof allow === "string") {
      allow = [allow];
    }
    if (Array.isArray(allow)) {
      err.output.headers.Allow = allow.join(", ");
    }
    return err;
  };
  exports.notAcceptable = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 406, data, ctor: exports.notAcceptable });
  };
  exports.proxyAuthRequired = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 407, data, ctor: exports.proxyAuthRequired });
  };
  exports.clientTimeout = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 408, data, ctor: exports.clientTimeout });
  };
  exports.conflict = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 409, data, ctor: exports.conflict });
  };
  exports.resourceGone = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 410, data, ctor: exports.resourceGone });
  };
  exports.lengthRequired = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 411, data, ctor: exports.lengthRequired });
  };
  exports.preconditionFailed = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 412, data, ctor: exports.preconditionFailed });
  };
  exports.entityTooLarge = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 413, data, ctor: exports.entityTooLarge });
  };
  exports.uriTooLong = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 414, data, ctor: exports.uriTooLong });
  };
  exports.unsupportedMediaType = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 415, data, ctor: exports.unsupportedMediaType });
  };
  exports.rangeNotSatisfiable = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 416, data, ctor: exports.rangeNotSatisfiable });
  };
  exports.expectationFailed = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 417, data, ctor: exports.expectationFailed });
  };
  exports.teapot = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 418, data, ctor: exports.teapot });
  };
  exports.badData = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 422, data, ctor: exports.badData });
  };
  exports.locked = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 423, data, ctor: exports.locked });
  };
  exports.failedDependency = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 424, data, ctor: exports.failedDependency });
  };
  exports.tooEarly = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 425, data, ctor: exports.tooEarly });
  };
  exports.preconditionRequired = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 428, data, ctor: exports.preconditionRequired });
  };
  exports.tooManyRequests = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 429, data, ctor: exports.tooManyRequests });
  };
  exports.illegal = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 451, data, ctor: exports.illegal });
  };
  exports.internal = function(message, data, statusCode = 500) {
    return internals.serverError(message, data, statusCode, exports.internal);
  };
  exports.notImplemented = function(message, data) {
    return internals.serverError(message, data, 501, exports.notImplemented);
  };
  exports.badGateway = function(message, data) {
    return internals.serverError(message, data, 502, exports.badGateway);
  };
  exports.serverUnavailable = function(message, data) {
    return internals.serverError(message, data, 503, exports.serverUnavailable);
  };
  exports.gatewayTimeout = function(message, data) {
    return internals.serverError(message, data, 504, exports.gatewayTimeout);
  };
  exports.badImplementation = function(message, data) {
    const err = internals.serverError(message, data, 500, exports.badImplementation);
    err.isDeveloperError = true;
    return err;
  };
  internals.initialize = function(err, statusCode, message) {
    const numberCode = parseInt(statusCode, 10);
    Hoek.assert(!isNaN(numberCode) && numberCode >= 400, "First argument must be a number (400+):", statusCode);
    err.isBoom = true;
    err.isServer = numberCode >= 500;
    if (!err.hasOwnProperty("data")) {
      err.data = null;
    }
    err.output = {
      statusCode: numberCode,
      payload: {},
      headers: {}
    };
    Object.defineProperty(err, "reformat", { value: internals.reformat, configurable: true });
    if (!message && !err.message) {
      err.reformat();
      message = err.output.payload.error;
    }
    if (message) {
      const props = Object.getOwnPropertyDescriptor(err, "message") || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(err), "message");
      Hoek.assert(!props || props.configurable && !props.get, "The error is not compatible with boom");
      err.message = message + (err.message ? ": " + err.message : "");
      err.output.payload.message = err.message;
    }
    err.reformat();
    return err;
  };
  internals.reformat = function(debug = false) {
    this.output.payload.statusCode = this.output.statusCode;
    this.output.payload.error = internals.codes.get(this.output.statusCode) || "Unknown";
    if (this.output.statusCode === 500 && debug !== true) {
      this.output.payload.message = "An internal server error occurred";
    } else if (this.message) {
      this.output.payload.message = this.message;
    }
  };
  internals.serverError = function(messageOrError, data, statusCode, ctor) {
    if (data instanceof Error && !data.isBoom) {
      return exports.boomify(data, { statusCode, message: messageOrError });
    }
    return new exports.Boom(messageOrError, { statusCode, data, ctor });
  };
});

// node_modules/reflect-metadata/Reflect.js
var require_Reflect = __commonJS(() => {
  /*! *****************************************************************************
  Copyright (C) Microsoft. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var Reflect2;
  (function(Reflect3) {
    (function(factory) {
      var root = typeof globalThis === "object" ? globalThis : typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : sloppyModeThis();
      var exporter = makeExporter(Reflect3);
      if (typeof root.Reflect !== "undefined") {
        exporter = makeExporter(root.Reflect, exporter);
      }
      factory(exporter, root);
      if (typeof root.Reflect === "undefined") {
        root.Reflect = Reflect3;
      }
      function makeExporter(target, previous) {
        return function(key, value) {
          Object.defineProperty(target, key, { configurable: true, writable: true, value });
          if (previous)
            previous(key, value);
        };
      }
      function functionThis() {
        try {
          return Function("return this;")();
        } catch (_) {
        }
      }
      function indirectEvalThis() {
        try {
          return (undefined, eval)("(function() { return this; })()");
        } catch (_) {
        }
      }
      function sloppyModeThis() {
        return functionThis() || indirectEvalThis();
      }
    })(function(exporter, root) {
      var hasOwn = Object.prototype.hasOwnProperty;
      var supportsSymbol = typeof Symbol === "function";
      var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
      var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
      var supportsCreate = typeof Object.create === "function";
      var supportsProto = { __proto__: [] } instanceof Array;
      var downLevel = !supportsCreate && !supportsProto;
      var HashMap = {
        create: supportsCreate ? function() {
          return MakeDictionary(Object.create(null));
        } : supportsProto ? function() {
          return MakeDictionary({ __proto__: null });
        } : function() {
          return MakeDictionary({});
        },
        has: downLevel ? function(map, key) {
          return hasOwn.call(map, key);
        } : function(map, key) {
          return key in map;
        },
        get: downLevel ? function(map, key) {
          return hasOwn.call(map, key) ? map[key] : undefined;
        } : function(map, key) {
          return map[key];
        }
      };
      var functionPrototype = Object.getPrototypeOf(Function);
      var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
      var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
      var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
      var registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : undefined;
      var metadataRegistry = GetOrCreateMetadataRegistry();
      var metadataProvider = CreateMetadataProvider(metadataRegistry);
      function decorate(decorators, target, propertyKey, attributes) {
        if (!IsUndefined(propertyKey)) {
          if (!IsArray(decorators))
            throw new TypeError;
          if (!IsObject(target))
            throw new TypeError;
          if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
            throw new TypeError;
          if (IsNull(attributes))
            attributes = undefined;
          propertyKey = ToPropertyKey(propertyKey);
          return DecorateProperty(decorators, target, propertyKey, attributes);
        } else {
          if (!IsArray(decorators))
            throw new TypeError;
          if (!IsConstructor(target))
            throw new TypeError;
          return DecorateConstructor(decorators, target);
        }
      }
      exporter("decorate", decorate);
      function metadata(metadataKey, metadataValue) {
        function decorator(target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError;
          if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
            throw new TypeError;
          OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        return decorator;
      }
      exporter("metadata", metadata);
      function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError;
        if (!IsUndefined(propertyKey))
          propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
      }
      exporter("defineMetadata", defineMetadata);
      function hasMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError;
        if (!IsUndefined(propertyKey))
          propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryHasMetadata(metadataKey, target, propertyKey);
      }
      exporter("hasMetadata", hasMetadata);
      function hasOwnMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError;
        if (!IsUndefined(propertyKey))
          propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
      }
      exporter("hasOwnMetadata", hasOwnMetadata);
      function getMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError;
        if (!IsUndefined(propertyKey))
          propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryGetMetadata(metadataKey, target, propertyKey);
      }
      exporter("getMetadata", getMetadata);
      function getOwnMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError;
        if (!IsUndefined(propertyKey))
          propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
      }
      exporter("getOwnMetadata", getOwnMetadata);
      function getMetadataKeys(target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError;
        if (!IsUndefined(propertyKey))
          propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryMetadataKeys(target, propertyKey);
      }
      exporter("getMetadataKeys", getMetadataKeys);
      function getOwnMetadataKeys(target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError;
        if (!IsUndefined(propertyKey))
          propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryOwnMetadataKeys(target, propertyKey);
      }
      exporter("getOwnMetadataKeys", getOwnMetadataKeys);
      function deleteMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError;
        if (!IsUndefined(propertyKey))
          propertyKey = ToPropertyKey(propertyKey);
        if (!IsObject(target))
          throw new TypeError;
        if (!IsUndefined(propertyKey))
          propertyKey = ToPropertyKey(propertyKey);
        var provider = GetMetadataProvider(target, propertyKey, false);
        if (IsUndefined(provider))
          return false;
        return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
      }
      exporter("deleteMetadata", deleteMetadata);
      function DecorateConstructor(decorators, target) {
        for (var i = decorators.length - 1;i >= 0; --i) {
          var decorator = decorators[i];
          var decorated = decorator(target);
          if (!IsUndefined(decorated) && !IsNull(decorated)) {
            if (!IsConstructor(decorated))
              throw new TypeError;
            target = decorated;
          }
        }
        return target;
      }
      function DecorateProperty(decorators, target, propertyKey, descriptor) {
        for (var i = decorators.length - 1;i >= 0; --i) {
          var decorator = decorators[i];
          var decorated = decorator(target, propertyKey, descriptor);
          if (!IsUndefined(decorated) && !IsNull(decorated)) {
            if (!IsObject(decorated))
              throw new TypeError;
            descriptor = decorated;
          }
        }
        return descriptor;
      }
      function OrdinaryHasMetadata(MetadataKey, O, P) {
        var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn2)
          return true;
        var parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent))
          return OrdinaryHasMetadata(MetadataKey, parent, P);
        return false;
      }
      function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
        var provider = GetMetadataProvider(O, P, false);
        if (IsUndefined(provider))
          return false;
        return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
      }
      function OrdinaryGetMetadata(MetadataKey, O, P) {
        var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn2)
          return OrdinaryGetOwnMetadata(MetadataKey, O, P);
        var parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent))
          return OrdinaryGetMetadata(MetadataKey, parent, P);
        return;
      }
      function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
        var provider = GetMetadataProvider(O, P, false);
        if (IsUndefined(provider))
          return;
        return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
      }
      function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
        var provider = GetMetadataProvider(O, P, true);
        provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
      }
      function OrdinaryMetadataKeys(O, P) {
        var ownKeys = OrdinaryOwnMetadataKeys(O, P);
        var parent = OrdinaryGetPrototypeOf(O);
        if (parent === null)
          return ownKeys;
        var parentKeys = OrdinaryMetadataKeys(parent, P);
        if (parentKeys.length <= 0)
          return ownKeys;
        if (ownKeys.length <= 0)
          return parentKeys;
        var set = new _Set;
        var keys = [];
        for (var _i = 0, ownKeys_1 = ownKeys;_i < ownKeys_1.length; _i++) {
          var key = ownKeys_1[_i];
          var hasKey = set.has(key);
          if (!hasKey) {
            set.add(key);
            keys.push(key);
          }
        }
        for (var _a = 0, parentKeys_1 = parentKeys;_a < parentKeys_1.length; _a++) {
          var key = parentKeys_1[_a];
          var hasKey = set.has(key);
          if (!hasKey) {
            set.add(key);
            keys.push(key);
          }
        }
        return keys;
      }
      function OrdinaryOwnMetadataKeys(O, P) {
        var provider = GetMetadataProvider(O, P, false);
        if (!provider) {
          return [];
        }
        return provider.OrdinaryOwnMetadataKeys(O, P);
      }
      function Type(x) {
        if (x === null)
          return 1;
        switch (typeof x) {
          case "undefined":
            return 0;
          case "boolean":
            return 2;
          case "string":
            return 3;
          case "symbol":
            return 4;
          case "number":
            return 5;
          case "object":
            return x === null ? 1 : 6;
          default:
            return 6;
        }
      }
      function IsUndefined(x) {
        return x === undefined;
      }
      function IsNull(x) {
        return x === null;
      }
      function IsSymbol(x) {
        return typeof x === "symbol";
      }
      function IsObject(x) {
        return typeof x === "object" ? x !== null : typeof x === "function";
      }
      function ToPrimitive(input, PreferredType) {
        switch (Type(input)) {
          case 0:
            return input;
          case 1:
            return input;
          case 2:
            return input;
          case 3:
            return input;
          case 4:
            return input;
          case 5:
            return input;
        }
        var hint = PreferredType === 3 ? "string" : PreferredType === 5 ? "number" : "default";
        var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
        if (exoticToPrim !== undefined) {
          var result = exoticToPrim.call(input, hint);
          if (IsObject(result))
            throw new TypeError;
          return result;
        }
        return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
      }
      function OrdinaryToPrimitive(O, hint) {
        if (hint === "string") {
          var toString_1 = O.toString;
          if (IsCallable(toString_1)) {
            var result = toString_1.call(O);
            if (!IsObject(result))
              return result;
          }
          var valueOf = O.valueOf;
          if (IsCallable(valueOf)) {
            var result = valueOf.call(O);
            if (!IsObject(result))
              return result;
          }
        } else {
          var valueOf = O.valueOf;
          if (IsCallable(valueOf)) {
            var result = valueOf.call(O);
            if (!IsObject(result))
              return result;
          }
          var toString_2 = O.toString;
          if (IsCallable(toString_2)) {
            var result = toString_2.call(O);
            if (!IsObject(result))
              return result;
          }
        }
        throw new TypeError;
      }
      function ToBoolean(argument) {
        return !!argument;
      }
      function ToString(argument) {
        return "" + argument;
      }
      function ToPropertyKey(argument) {
        var key = ToPrimitive(argument, 3);
        if (IsSymbol(key))
          return key;
        return ToString(key);
      }
      function IsArray(argument) {
        return Array.isArray ? Array.isArray(argument) : argument instanceof Object ? argument instanceof Array : Object.prototype.toString.call(argument) === "[object Array]";
      }
      function IsCallable(argument) {
        return typeof argument === "function";
      }
      function IsConstructor(argument) {
        return typeof argument === "function";
      }
      function IsPropertyKey(argument) {
        switch (Type(argument)) {
          case 3:
            return true;
          case 4:
            return true;
          default:
            return false;
        }
      }
      function SameValueZero(x, y) {
        return x === y || x !== x && y !== y;
      }
      function GetMethod(V, P) {
        var func = V[P];
        if (func === undefined || func === null)
          return;
        if (!IsCallable(func))
          throw new TypeError;
        return func;
      }
      function GetIterator(obj) {
        var method = GetMethod(obj, iteratorSymbol);
        if (!IsCallable(method))
          throw new TypeError;
        var iterator = method.call(obj);
        if (!IsObject(iterator))
          throw new TypeError;
        return iterator;
      }
      function IteratorValue(iterResult) {
        return iterResult.value;
      }
      function IteratorStep(iterator) {
        var result = iterator.next();
        return result.done ? false : result;
      }
      function IteratorClose(iterator) {
        var f = iterator["return"];
        if (f)
          f.call(iterator);
      }
      function OrdinaryGetPrototypeOf(O) {
        var proto = Object.getPrototypeOf(O);
        if (typeof O !== "function" || O === functionPrototype)
          return proto;
        if (proto !== functionPrototype)
          return proto;
        var prototype = O.prototype;
        var prototypeProto = prototype && Object.getPrototypeOf(prototype);
        if (prototypeProto == null || prototypeProto === Object.prototype)
          return proto;
        var constructor = prototypeProto.constructor;
        if (typeof constructor !== "function")
          return proto;
        if (constructor === O)
          return proto;
        return constructor;
      }
      function CreateMetadataRegistry() {
        var fallback;
        if (!IsUndefined(registrySymbol) && typeof root.Reflect !== "undefined" && !(registrySymbol in root.Reflect) && typeof root.Reflect.defineMetadata === "function") {
          fallback = CreateFallbackProvider(root.Reflect);
        }
        var first;
        var second;
        var rest;
        var targetProviderMap = new _WeakMap;
        var registry = {
          registerProvider,
          getProvider,
          setProvider
        };
        return registry;
        function registerProvider(provider) {
          if (!Object.isExtensible(registry)) {
            throw new Error("Cannot add provider to a frozen registry.");
          }
          switch (true) {
            case fallback === provider:
              break;
            case IsUndefined(first):
              first = provider;
              break;
            case first === provider:
              break;
            case IsUndefined(second):
              second = provider;
              break;
            case second === provider:
              break;
            default:
              if (rest === undefined)
                rest = new _Set;
              rest.add(provider);
              break;
          }
        }
        function getProviderNoCache(O, P) {
          if (!IsUndefined(first)) {
            if (first.isProviderFor(O, P))
              return first;
            if (!IsUndefined(second)) {
              if (second.isProviderFor(O, P))
                return first;
              if (!IsUndefined(rest)) {
                var iterator = GetIterator(rest);
                while (true) {
                  var next = IteratorStep(iterator);
                  if (!next) {
                    return;
                  }
                  var provider = IteratorValue(next);
                  if (provider.isProviderFor(O, P)) {
                    IteratorClose(iterator);
                    return provider;
                  }
                }
              }
            }
          }
          if (!IsUndefined(fallback) && fallback.isProviderFor(O, P)) {
            return fallback;
          }
          return;
        }
        function getProvider(O, P) {
          var providerMap = targetProviderMap.get(O);
          var provider;
          if (!IsUndefined(providerMap)) {
            provider = providerMap.get(P);
          }
          if (!IsUndefined(provider)) {
            return provider;
          }
          provider = getProviderNoCache(O, P);
          if (!IsUndefined(provider)) {
            if (IsUndefined(providerMap)) {
              providerMap = new _Map;
              targetProviderMap.set(O, providerMap);
            }
            providerMap.set(P, provider);
          }
          return provider;
        }
        function hasProvider(provider) {
          if (IsUndefined(provider))
            throw new TypeError;
          return first === provider || second === provider || !IsUndefined(rest) && rest.has(provider);
        }
        function setProvider(O, P, provider) {
          if (!hasProvider(provider)) {
            throw new Error("Metadata provider not registered.");
          }
          var existingProvider = getProvider(O, P);
          if (existingProvider !== provider) {
            if (!IsUndefined(existingProvider)) {
              return false;
            }
            var providerMap = targetProviderMap.get(O);
            if (IsUndefined(providerMap)) {
              providerMap = new _Map;
              targetProviderMap.set(O, providerMap);
            }
            providerMap.set(P, provider);
          }
          return true;
        }
      }
      function GetOrCreateMetadataRegistry() {
        var metadataRegistry2;
        if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
          metadataRegistry2 = root.Reflect[registrySymbol];
        }
        if (IsUndefined(metadataRegistry2)) {
          metadataRegistry2 = CreateMetadataRegistry();
        }
        if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
          Object.defineProperty(root.Reflect, registrySymbol, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: metadataRegistry2
          });
        }
        return metadataRegistry2;
      }
      function CreateMetadataProvider(registry) {
        var metadata2 = new _WeakMap;
        var provider = {
          isProviderFor: function(O, P) {
            var targetMetadata = metadata2.get(O);
            if (IsUndefined(targetMetadata))
              return false;
            return targetMetadata.has(P);
          },
          OrdinaryDefineOwnMetadata: OrdinaryDefineOwnMetadata2,
          OrdinaryHasOwnMetadata: OrdinaryHasOwnMetadata2,
          OrdinaryGetOwnMetadata: OrdinaryGetOwnMetadata2,
          OrdinaryOwnMetadataKeys: OrdinaryOwnMetadataKeys2,
          OrdinaryDeleteMetadata
        };
        metadataRegistry.registerProvider(provider);
        return provider;
        function GetOrCreateMetadataMap(O, P, Create) {
          var targetMetadata = metadata2.get(O);
          var createdTargetMetadata = false;
          if (IsUndefined(targetMetadata)) {
            if (!Create)
              return;
            targetMetadata = new _Map;
            metadata2.set(O, targetMetadata);
            createdTargetMetadata = true;
          }
          var metadataMap = targetMetadata.get(P);
          if (IsUndefined(metadataMap)) {
            if (!Create)
              return;
            metadataMap = new _Map;
            targetMetadata.set(P, metadataMap);
            if (!registry.setProvider(O, P, provider)) {
              targetMetadata.delete(P);
              if (createdTargetMetadata) {
                metadata2.delete(O);
              }
              throw new Error("Wrong provider for target.");
            }
          }
          return metadataMap;
        }
        function OrdinaryHasOwnMetadata2(MetadataKey, O, P) {
          var metadataMap = GetOrCreateMetadataMap(O, P, false);
          if (IsUndefined(metadataMap))
            return false;
          return ToBoolean(metadataMap.has(MetadataKey));
        }
        function OrdinaryGetOwnMetadata2(MetadataKey, O, P) {
          var metadataMap = GetOrCreateMetadataMap(O, P, false);
          if (IsUndefined(metadataMap))
            return;
          return metadataMap.get(MetadataKey);
        }
        function OrdinaryDefineOwnMetadata2(MetadataKey, MetadataValue, O, P) {
          var metadataMap = GetOrCreateMetadataMap(O, P, true);
          metadataMap.set(MetadataKey, MetadataValue);
        }
        function OrdinaryOwnMetadataKeys2(O, P) {
          var keys = [];
          var metadataMap = GetOrCreateMetadataMap(O, P, false);
          if (IsUndefined(metadataMap))
            return keys;
          var keysObj = metadataMap.keys();
          var iterator = GetIterator(keysObj);
          var k = 0;
          while (true) {
            var next = IteratorStep(iterator);
            if (!next) {
              keys.length = k;
              return keys;
            }
            var nextValue = IteratorValue(next);
            try {
              keys[k] = nextValue;
            } catch (e) {
              try {
                IteratorClose(iterator);
              } finally {
                throw e;
              }
            }
            k++;
          }
        }
        function OrdinaryDeleteMetadata(MetadataKey, O, P) {
          var metadataMap = GetOrCreateMetadataMap(O, P, false);
          if (IsUndefined(metadataMap))
            return false;
          if (!metadataMap.delete(MetadataKey))
            return false;
          if (metadataMap.size === 0) {
            var targetMetadata = metadata2.get(O);
            if (!IsUndefined(targetMetadata)) {
              targetMetadata.delete(P);
              if (targetMetadata.size === 0) {
                metadata2.delete(targetMetadata);
              }
            }
          }
          return true;
        }
      }
      function CreateFallbackProvider(reflect) {
        var { defineMetadata: defineMetadata2, hasOwnMetadata: hasOwnMetadata2, getOwnMetadata: getOwnMetadata2, getOwnMetadataKeys: getOwnMetadataKeys2, deleteMetadata: deleteMetadata2 } = reflect;
        var metadataOwner = new _WeakMap;
        var provider = {
          isProviderFor: function(O, P) {
            var metadataPropertySet = metadataOwner.get(O);
            if (!IsUndefined(metadataPropertySet) && metadataPropertySet.has(P)) {
              return true;
            }
            if (getOwnMetadataKeys2(O, P).length) {
              if (IsUndefined(metadataPropertySet)) {
                metadataPropertySet = new _Set;
                metadataOwner.set(O, metadataPropertySet);
              }
              metadataPropertySet.add(P);
              return true;
            }
            return false;
          },
          OrdinaryDefineOwnMetadata: defineMetadata2,
          OrdinaryHasOwnMetadata: hasOwnMetadata2,
          OrdinaryGetOwnMetadata: getOwnMetadata2,
          OrdinaryOwnMetadataKeys: getOwnMetadataKeys2,
          OrdinaryDeleteMetadata: deleteMetadata2
        };
        return provider;
      }
      function GetMetadataProvider(O, P, Create) {
        var registeredProvider = metadataRegistry.getProvider(O, P);
        if (!IsUndefined(registeredProvider)) {
          return registeredProvider;
        }
        if (Create) {
          if (metadataRegistry.setProvider(O, P, metadataProvider)) {
            return metadataProvider;
          }
          throw new Error("Illegal state.");
        }
        return;
      }
      function CreateMapPolyfill() {
        var cacheSentinel = {};
        var arraySentinel = [];
        var MapIterator = function() {
          function MapIterator2(keys, values, selector) {
            this._index = 0;
            this._keys = keys;
            this._values = values;
            this._selector = selector;
          }
          MapIterator2.prototype["@@iterator"] = function() {
            return this;
          };
          MapIterator2.prototype[iteratorSymbol] = function() {
            return this;
          };
          MapIterator2.prototype.next = function() {
            var index = this._index;
            if (index >= 0 && index < this._keys.length) {
              var result = this._selector(this._keys[index], this._values[index]);
              if (index + 1 >= this._keys.length) {
                this._index = -1;
                this._keys = arraySentinel;
                this._values = arraySentinel;
              } else {
                this._index++;
              }
              return { value: result, done: false };
            }
            return { value: undefined, done: true };
          };
          MapIterator2.prototype.throw = function(error) {
            if (this._index >= 0) {
              this._index = -1;
              this._keys = arraySentinel;
              this._values = arraySentinel;
            }
            throw error;
          };
          MapIterator2.prototype.return = function(value) {
            if (this._index >= 0) {
              this._index = -1;
              this._keys = arraySentinel;
              this._values = arraySentinel;
            }
            return { value, done: true };
          };
          return MapIterator2;
        }();
        var Map2 = function() {
          function Map3() {
            this._keys = [];
            this._values = [];
            this._cacheKey = cacheSentinel;
            this._cacheIndex = -2;
          }
          Object.defineProperty(Map3.prototype, "size", {
            get: function() {
              return this._keys.length;
            },
            enumerable: true,
            configurable: true
          });
          Map3.prototype.has = function(key) {
            return this._find(key, false) >= 0;
          };
          Map3.prototype.get = function(key) {
            var index = this._find(key, false);
            return index >= 0 ? this._values[index] : undefined;
          };
          Map3.prototype.set = function(key, value) {
            var index = this._find(key, true);
            this._values[index] = value;
            return this;
          };
          Map3.prototype.delete = function(key) {
            var index = this._find(key, false);
            if (index >= 0) {
              var size = this._keys.length;
              for (var i = index + 1;i < size; i++) {
                this._keys[i - 1] = this._keys[i];
                this._values[i - 1] = this._values[i];
              }
              this._keys.length--;
              this._values.length--;
              if (SameValueZero(key, this._cacheKey)) {
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
              }
              return true;
            }
            return false;
          };
          Map3.prototype.clear = function() {
            this._keys.length = 0;
            this._values.length = 0;
            this._cacheKey = cacheSentinel;
            this._cacheIndex = -2;
          };
          Map3.prototype.keys = function() {
            return new MapIterator(this._keys, this._values, getKey);
          };
          Map3.prototype.values = function() {
            return new MapIterator(this._keys, this._values, getValue);
          };
          Map3.prototype.entries = function() {
            return new MapIterator(this._keys, this._values, getEntry);
          };
          Map3.prototype["@@iterator"] = function() {
            return this.entries();
          };
          Map3.prototype[iteratorSymbol] = function() {
            return this.entries();
          };
          Map3.prototype._find = function(key, insert) {
            if (!SameValueZero(this._cacheKey, key)) {
              this._cacheIndex = -1;
              for (var i = 0;i < this._keys.length; i++) {
                if (SameValueZero(this._keys[i], key)) {
                  this._cacheIndex = i;
                  break;
                }
              }
            }
            if (this._cacheIndex < 0 && insert) {
              this._cacheIndex = this._keys.length;
              this._keys.push(key);
              this._values.push(undefined);
            }
            return this._cacheIndex;
          };
          return Map3;
        }();
        return Map2;
        function getKey(key, _) {
          return key;
        }
        function getValue(_, value) {
          return value;
        }
        function getEntry(key, value) {
          return [key, value];
        }
      }
      function CreateSetPolyfill() {
        var Set2 = function() {
          function Set3() {
            this._map = new _Map;
          }
          Object.defineProperty(Set3.prototype, "size", {
            get: function() {
              return this._map.size;
            },
            enumerable: true,
            configurable: true
          });
          Set3.prototype.has = function(value) {
            return this._map.has(value);
          };
          Set3.prototype.add = function(value) {
            return this._map.set(value, value), this;
          };
          Set3.prototype.delete = function(value) {
            return this._map.delete(value);
          };
          Set3.prototype.clear = function() {
            this._map.clear();
          };
          Set3.prototype.keys = function() {
            return this._map.keys();
          };
          Set3.prototype.values = function() {
            return this._map.keys();
          };
          Set3.prototype.entries = function() {
            return this._map.entries();
          };
          Set3.prototype["@@iterator"] = function() {
            return this.keys();
          };
          Set3.prototype[iteratorSymbol] = function() {
            return this.keys();
          };
          return Set3;
        }();
        return Set2;
      }
      function CreateWeakMapPolyfill() {
        var UUID_SIZE = 16;
        var keys = HashMap.create();
        var rootKey = CreateUniqueKey();
        return function() {
          function WeakMap2() {
            this._key = CreateUniqueKey();
          }
          WeakMap2.prototype.has = function(target) {
            var table = GetOrCreateWeakMapTable(target, false);
            return table !== undefined ? HashMap.has(table, this._key) : false;
          };
          WeakMap2.prototype.get = function(target) {
            var table = GetOrCreateWeakMapTable(target, false);
            return table !== undefined ? HashMap.get(table, this._key) : undefined;
          };
          WeakMap2.prototype.set = function(target, value) {
            var table = GetOrCreateWeakMapTable(target, true);
            table[this._key] = value;
            return this;
          };
          WeakMap2.prototype.delete = function(target) {
            var table = GetOrCreateWeakMapTable(target, false);
            return table !== undefined ? delete table[this._key] : false;
          };
          WeakMap2.prototype.clear = function() {
            this._key = CreateUniqueKey();
          };
          return WeakMap2;
        }();
        function CreateUniqueKey() {
          var key;
          do
            key = "@@WeakMap@@" + CreateUUID();
          while (HashMap.has(keys, key));
          keys[key] = true;
          return key;
        }
        function GetOrCreateWeakMapTable(target, create) {
          if (!hasOwn.call(target, rootKey)) {
            if (!create)
              return;
            Object.defineProperty(target, rootKey, { value: HashMap.create() });
          }
          return target[rootKey];
        }
        function FillRandomBytes(buffer, size) {
          for (var i = 0;i < size; ++i)
            buffer[i] = Math.random() * 255 | 0;
          return buffer;
        }
        function GenRandomBytes(size) {
          if (typeof Uint8Array === "function") {
            var array = new Uint8Array(size);
            if (typeof crypto !== "undefined") {
              crypto.getRandomValues(array);
            } else if (typeof msCrypto !== "undefined") {
              msCrypto.getRandomValues(array);
            } else {
              FillRandomBytes(array, size);
            }
            return array;
          }
          return FillRandomBytes(new Array(size), size);
        }
        function CreateUUID() {
          var data = GenRandomBytes(UUID_SIZE);
          data[6] = data[6] & 79 | 64;
          data[8] = data[8] & 191 | 128;
          var result = "";
          for (var offset = 0;offset < UUID_SIZE; ++offset) {
            var byte = data[offset];
            if (offset === 4 || offset === 6 || offset === 8)
              result += "-";
            if (byte < 16)
              result += "0";
            result += byte.toString(16).toLowerCase();
          }
          return result;
        }
      }
      function MakeDictionary(obj) {
        obj.__ = undefined;
        delete obj.__;
        return obj;
      }
    });
  })(Reflect2 || (Reflect2 = {}));
});

// src/index.ts
var import_dotenv = __toESM(require_main(), 1);

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1;i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1;j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (!patternCache[label]) {
      if (match[2]) {
        patternCache[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
      } else {
        patternCache[label] = [label, match[1], true];
      }
    }
    return patternCache[label];
  }
  return null;
};
var getPath = (request) => {
  const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
  return match ? match[1] : "";
};
var getQueryStrings = (url) => {
  const queryIndex = url.indexOf("?", 8);
  return queryIndex === -1 ? "" : "?" + url.slice(queryIndex + 1);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
};
var mergePath = (...paths) => {
  let p = "";
  let endsWithSlash = false;
  for (let path of paths) {
    if (p[p.length - 1] === "/") {
      p = p.slice(0, -1);
      endsWithSlash = true;
    }
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (path === "/" && endsWithSlash) {
      p = `${p}/`;
    } else if (path !== "/") {
      p = `${p}${path}`;
    }
    if (path === "/" && p === "") {
      p = "/";
    }
  }
  return p;
};
var checkOptionalParameter = (path) => {
  if (!path.match(/\:.+\?$/)) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return /%/.test(value) ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? undefined : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return;
    }
  }
  const results = {};
  encoded ?? (encoded = /[%+]/.test(url));
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? undefined : nextKeyIndex : valueIndex);
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? undefined : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ?? (results[name] = value);
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = (cookie, name) => {
  const pairs = cookie.trim().split(";");
  return pairs.reduce((parsedCookie, pairStr) => {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      return parsedCookie;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      return parsedCookie;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
    }
    return parsedCookie;
  }, {});
};
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
  }
  if (opt.domain) {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite}`;
  }
  if (opt.partitioned) {
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt = {}) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))).then(() => buffer[0]));
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/utils/stream.js
var StreamingApi = class {
  constructor(writable, _readable) {
    this.abortSubscribers = [];
    this.writable = writable;
    this.writer = writable.getWriter();
    this.encoder = new TextEncoder;
    const reader = _readable.getReader();
    this.responseReadable = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        done ? controller.close() : controller.enqueue(value);
      },
      cancel: () => {
        this.abortSubscribers.forEach((subscriber) => subscriber());
      }
    });
  }
  async write(input) {
    try {
      if (typeof input === "string") {
        input = this.encoder.encode(input);
      }
      await this.writer.write(input);
    } catch (e) {
    }
    return this;
  }
  async writeln(input) {
    await this.write(input + "\n");
    return this;
  }
  sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  async close() {
    try {
      await this.writer.close();
    } catch (e) {
    }
  }
  async pipe(body) {
    this.writer.releaseLock();
    await body.pipeTo(this.writable, { preventClose: true });
    this.writer = this.writable.getWriter();
  }
  async onAbort(listener) {
    this.abortSubscribers.push(listener);
  }
};

// node_modules/hono/dist/context.js
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = (headers, map = {}) => {
  Object.entries(map).forEach(([key, value]) => headers.set(key, value));
  return headers;
};
var _status;
var _executionCtx;
var _headers;
var _preparedHeaders;
var _res;
var _isFresh;
var Context = class {
  constructor(req, options) {
    this.env = {};
    this._var = {};
    this.finalized = false;
    this.error = undefined;
    __privateAdd(this, _status, 200);
    __privateAdd(this, _executionCtx, undefined);
    __privateAdd(this, _headers, undefined);
    __privateAdd(this, _preparedHeaders, undefined);
    __privateAdd(this, _res, undefined);
    __privateAdd(this, _isFresh, true);
    this.renderer = (content) => this.html(content);
    this.notFoundHandler = () => new Response;
    this.render = (...args) => this.renderer(...args);
    this.setRenderer = (renderer) => {
      this.renderer = renderer;
    };
    this.header = (name, value, options2) => {
      if (value === undefined) {
        if (__privateGet(this, _headers)) {
          __privateGet(this, _headers).delete(name);
        } else if (__privateGet(this, _preparedHeaders)) {
          delete __privateGet(this, _preparedHeaders)[name.toLocaleLowerCase()];
        }
        if (this.finalized) {
          this.res.headers.delete(name);
        }
        return;
      }
      if (options2?.append) {
        if (!__privateGet(this, _headers)) {
          __privateSet(this, _isFresh, false);
          __privateSet(this, _headers, new Headers(__privateGet(this, _preparedHeaders)));
          __privateSet(this, _preparedHeaders, {});
        }
        __privateGet(this, _headers).append(name, value);
      } else {
        if (__privateGet(this, _headers)) {
          __privateGet(this, _headers).set(name, value);
        } else {
          __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
          __privateGet(this, _preparedHeaders)[name.toLowerCase()] = value;
        }
      }
      if (this.finalized) {
        if (options2?.append) {
          this.res.headers.append(name, value);
        } else {
          this.res.headers.set(name, value);
        }
      }
    };
    this.status = (status) => {
      __privateSet(this, _isFresh, false);
      __privateSet(this, _status, status);
    };
    this.set = (key, value) => {
      this._var ?? (this._var = {});
      this._var[key] = value;
    };
    this.get = (key) => {
      return this._var ? this._var[key] : undefined;
    };
    this.newResponse = (data, arg, headers) => {
      if (__privateGet(this, _isFresh) && !headers && !arg && __privateGet(this, _status) === 200) {
        return new Response(data, {
          headers: __privateGet(this, _preparedHeaders)
        });
      }
      if (arg && typeof arg !== "number") {
        const headers2 = setHeaders(new Headers(arg.headers), __privateGet(this, _preparedHeaders));
        return new Response(data, {
          headers: headers2,
          status: arg.status
        });
      }
      const status = typeof arg === "number" ? arg : __privateGet(this, _status);
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _headers) ?? __privateSet(this, _headers, new Headers);
      setHeaders(__privateGet(this, _headers), __privateGet(this, _preparedHeaders));
      if (__privateGet(this, _res)) {
        __privateGet(this, _res).headers.forEach((v, k) => {
          __privateGet(this, _headers)?.set(k, v);
        });
        setHeaders(__privateGet(this, _headers), __privateGet(this, _preparedHeaders));
      }
      headers ?? (headers = {});
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          __privateGet(this, _headers).set(k, v);
        } else {
          __privateGet(this, _headers).delete(k);
          for (const v2 of v) {
            __privateGet(this, _headers).append(k, v2);
          }
        }
      }
      return new Response(data, {
        status,
        headers: __privateGet(this, _headers)
      });
    };
    this.body = (data, arg, headers) => {
      return typeof arg === "number" ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    this.text = (text, arg, headers) => {
      if (!__privateGet(this, _preparedHeaders)) {
        if (__privateGet(this, _isFresh) && !headers && !arg) {
          return new Response(text);
        }
        __privateSet(this, _preparedHeaders, {});
      }
      __privateGet(this, _preparedHeaders)["content-type"] = TEXT_PLAIN;
      return typeof arg === "number" ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    this.json = (object, arg, headers) => {
      const body = JSON.stringify(object);
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _preparedHeaders)["content-type"] = "application/json; charset=UTF-8";
      return typeof arg === "number" ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    this.jsonT = (object, arg, headers) => {
      return this.json(object, arg, headers);
    };
    this.html = (html, arg, headers) => {
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _preparedHeaders)["content-type"] = "text/html; charset=UTF-8";
      if (typeof html === "object") {
        if (!(html instanceof Promise)) {
          html = html.toString();
        }
        if (html instanceof Promise) {
          return html.then((html2) => resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {})).then((html2) => {
            return typeof arg === "number" ? this.newResponse(html2, arg, headers) : this.newResponse(html2, arg);
          });
        }
      }
      return typeof arg === "number" ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    this.redirect = (location, status = 302) => {
      __privateGet(this, _headers) ?? __privateSet(this, _headers, new Headers);
      __privateGet(this, _headers).set("Location", location);
      return this.newResponse(null, status);
    };
    this.streamText = (cb, arg, headers) => {
      headers ?? (headers = {});
      this.header("content-type", TEXT_PLAIN);
      this.header("x-content-type-options", "nosniff");
      this.header("transfer-encoding", "chunked");
      return this.stream(cb, arg, headers);
    };
    this.stream = (cb, arg, headers) => {
      const { readable, writable } = new TransformStream;
      const stream = new StreamingApi(writable, readable);
      cb(stream).finally(() => stream.close());
      return typeof arg === "number" ? this.newResponse(stream.responseReadable, arg, headers) : this.newResponse(stream.responseReadable, arg);
    };
    this.cookie = (name, value, opt) => {
      const cookie = serialize(name, value, opt);
      this.header("set-cookie", cookie, { append: true });
    };
    this.notFound = () => {
      return this.notFoundHandler(this);
    };
    this.req = req;
    if (options) {
      __privateSet(this, _executionCtx, options.executionCtx);
      this.env = options.env;
      if (options.notFoundHandler) {
        this.notFoundHandler = options.notFoundHandler;
      }
    }
  }
  get event() {
    if (__privateGet(this, _executionCtx) && "respondWith" in __privateGet(this, _executionCtx)) {
      return __privateGet(this, _executionCtx);
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (__privateGet(this, _executionCtx)) {
      return __privateGet(this, _executionCtx);
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    __privateSet(this, _isFresh, false);
    return __privateGet(this, _res) || __privateSet(this, _res, new Response("404 Not Found", { status: 404 }));
  }
  set res(_res2) {
    __privateSet(this, _isFresh, false);
    if (__privateGet(this, _res) && _res2) {
      __privateGet(this, _res).headers.delete("content-type");
      for (const [k, v] of __privateGet(this, _res).headers.entries()) {
        if (k === "set-cookie") {
          const cookies = __privateGet(this, _res).headers.getSetCookie();
          _res2.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res2.headers.append("set-cookie", cookie);
          }
        } else {
          _res2.headers.set(k, v);
        }
      }
    }
    __privateSet(this, _res, _res2);
    this.finalized = true;
  }
  get var() {
    return { ...this._var };
  }
  get runtime() {
    const global2 = globalThis;
    if (global2?.Deno !== undefined) {
      return "deno";
    }
    if (global2?.Bun !== undefined) {
      return "bun";
    }
    if (typeof global2?.WebSocketPair === "function") {
      return "workerd";
    }
    if (typeof global2?.EdgeRuntime === "string") {
      return "edge-light";
    }
    if (global2?.fastly !== undefined) {
      return "fastly";
    }
    if (global2?.__lagon__ !== undefined) {
      return "lagon";
    }
    if (global2?.process?.release?.name === "node") {
      return "node";
    }
    return "other";
  }
};
_status = new WeakMap;
_executionCtx = new WeakMap;
_headers = new WeakMap;
_preparedHeaders = new WeakMap;
_res = new WeakMap;
_isFresh = new WeakMap;

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        if (context instanceof Context) {
          context.req.routeIndex = i;
        }
      } else {
        handler = i === middleware.length && next || undefined;
      }
      if (!handler) {
        if (context instanceof Context && context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      } else {
        try {
          res = await handler(context, () => {
            return dispatch(i + 1);
          });
        } catch (err) {
          if (err instanceof Error && context instanceof Context && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/http-exception.js
var HTTPException = class extends Error {
  constructor(status = 500, options) {
    super(options?.message);
    this.res = options?.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      return this.res;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};

// node_modules/hono/dist/utils/body.js
function isFormDataContent(contentType) {
  if (contentType === null) {
    return false;
  }
  return contentType.startsWith("multipart/form-data") || contentType.startsWith("application/x-www-form-urlencoded");
}
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = {};
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  return form;
}
function isArrayField(field) {
  return Array.isArray(field);
}
var parseBody = async (request, options = { all: false }) => {
  const contentType = request.headers.get("Content-Type");
  if (isFormDataContent(contentType)) {
    return parseFormData(request, options);
  }
  return {};
};
var handleParsingAllValues = (form, key, value) => {
  if (form[key] && isArrayField(form[key])) {
    appendToExistingArray(form[key], value);
  } else if (form[key]) {
    convertToNewArray(form, key, value);
  } else {
    form[key] = value;
  }
};
var appendToExistingArray = (arr, value) => {
  arr.push(value);
};
var convertToNewArray = (form, key, value) => {
  form[key] = [form[key], value];
};

// node_modules/hono/dist/request.js
var __accessCheck2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet2 = (obj, member, getter) => {
  __accessCheck2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet2 = (obj, member, value, setter) => {
  __accessCheck2(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _validatedData;
var _matchResult;
var HonoRequest = class {
  constructor(request, path = "/", matchResult = [[]]) {
    __privateAdd2(this, _validatedData, undefined);
    __privateAdd2(this, _matchResult, undefined);
    this.routeIndex = 0;
    this.bodyCache = {};
    this.cachedBody = (key) => {
      const { bodyCache, raw: raw2 } = this;
      const cachedBody = bodyCache[key];
      if (cachedBody) {
        return cachedBody;
      }
      if (bodyCache.arrayBuffer) {
        return (async () => {
          return await new Response(bodyCache.arrayBuffer)[key]();
        })();
      }
      return bodyCache[key] = raw2[key]();
    };
    this.raw = request;
    this.path = path;
    __privateSet2(this, _matchResult, matchResult);
    __privateSet2(this, _validatedData, {});
  }
  param(key) {
    return key ? this.getDecodedParam(key) : this.getAllDecodedParams();
  }
  getDecodedParam(key) {
    const paramKey = __privateGet2(this, _matchResult)[0][this.routeIndex][1][key];
    const param = this.getParamValue(paramKey);
    return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : undefined;
  }
  getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(__privateGet2(this, _matchResult)[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.getParamValue(__privateGet2(this, _matchResult)[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? decodeURIComponent_(value) : value;
      }
    }
    return decoded;
  }
  getParamValue(paramKey) {
    return __privateGet2(this, _matchResult)[1] ? __privateGet2(this, _matchResult)[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name.toLowerCase()) ?? undefined;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  cookie(key) {
    const cookie = this.raw.headers.get("Cookie");
    if (!cookie) {
      return;
    }
    const obj = parse(cookie);
    if (key) {
      const value = obj[key];
      return value;
    } else {
      return obj;
    }
  }
  async parseBody(options) {
    if (this.bodyCache.parsedBody) {
      return this.bodyCache.parsedBody;
    }
    const parsedBody = await parseBody(this, options);
    this.bodyCache.parsedBody = parsedBody;
    return parsedBody;
  }
  json() {
    return this.cachedBody("json");
  }
  text() {
    return this.cachedBody("text");
  }
  arrayBuffer() {
    return this.cachedBody("arrayBuffer");
  }
  blob() {
    return this.cachedBody("blob");
  }
  formData() {
    return this.cachedBody("formData");
  }
  addValidatedData(target, data) {
    __privateGet2(this, _validatedData)[target] = data;
  }
  valid(target) {
    return __privateGet2(this, _validatedData)[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return __privateGet2(this, _matchResult)[0].map(([[, route]]) => route);
  }
  get routePath() {
    return __privateGet2(this, _matchResult)[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
  get headers() {
    return this.raw.headers;
  }
  get body() {
    return this.raw.body;
  }
  get bodyUsed() {
    return this.raw.bodyUsed;
  }
  get integrity() {
    return this.raw.integrity;
  }
  get keepalive() {
    return this.raw.keepalive;
  }
  get referrer() {
    return this.raw.referrer;
  }
  get signal() {
    return this.raw.signal;
  }
};
_validatedData = new WeakMap;
_matchResult = new WeakMap;

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/hono-base.js
function defineDynamicClass() {
  return class {
  };
}
var __accessCheck3 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet3 = (obj, member, getter) => {
  __accessCheck3(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd3 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet3 = (obj, member, value, setter) => {
  __accessCheck3(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var COMPOSED_HANDLER = Symbol("composedHandler");
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  const message = "Internal Server Error";
  return c.text(message, 500);
};
var _path;
var _Hono = class extends defineDynamicClass() {
  constructor(options = {}) {
    super();
    this._basePath = "/";
    __privateAdd3(this, _path, "/");
    this.routes = [];
    this.notFoundHandler = notFoundHandler;
    this.errorHandler = errorHandler;
    this.onError = (handler) => {
      this.errorHandler = handler;
      return this;
    };
    this.notFound = (handler) => {
      this.notFoundHandler = handler;
      return this;
    };
    this.head = () => {
      console.warn("`app.head()` is no longer used. `app.get()` implicitly handles the HEAD method.");
      return this;
    };
    this.handleEvent = (event) => {
      return this.dispatch(event.request, event, undefined, event.request.method);
    };
    this.fetch = (request, Env, executionCtx) => {
      return this.dispatch(request, executionCtx, Env, request.method);
    };
    this.request = (input, requestInit, Env, executionCtx) => {
      if (input instanceof Request) {
        if (requestInit !== undefined) {
          input = new Request(input, requestInit);
        }
        return this.fetch(input, Env, executionCtx);
      }
      input = input.toString();
      const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`;
      const req = new Request(path, requestInit);
      return this.fetch(req, Env, executionCtx);
    };
    this.fire = () => {
      addEventListener("fetch", (event) => {
        event.respondWith(this.dispatch(event.request, event, undefined, event.request.method));
      });
    };
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.map((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          __privateSet3(this, _path, args1);
        } else {
          this.addRoute(method, __privateGet3(this, _path), args1);
        }
        args.map((handler) => {
          if (typeof handler !== "string") {
            this.addRoute(method, __privateGet3(this, _path), handler);
          }
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      if (!method) {
        return this;
      }
      __privateSet3(this, _path, path);
      for (const m of [method].flat()) {
        handlers.map((handler) => {
          this.addRoute(m.toUpperCase(), __privateGet3(this, _path), handler);
        });
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        __privateSet3(this, _path, arg1);
      } else {
        handlers.unshift(arg1);
      }
      handlers.map((handler) => {
        this.addRoute(METHOD_NAME_ALL, __privateGet3(this, _path), handler);
      });
      return this;
    };
    const strict = options.strict ?? true;
    delete options.strict;
    Object.assign(this, options);
    this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
  }
  clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  route(path, app) {
    const subApp = this.basePath(path);
    if (!app) {
      return subApp;
    }
    app.routes.map((r) => {
      let handler;
      if (app.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  showRoutes() {
    const length = 8;
    this.routes.map((route) => {
      console.log(`\x1B[32m${route.method}\x1B[0m ${" ".repeat(length - route.method.length)} ${route.path}`);
    });
  }
  mount(path, applicationHandler, optionHandler) {
    const mergedPath = mergePath(this._basePath, path);
    const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
    const handler = async (c, next) => {
      let executionContext = undefined;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      const options = optionHandler ? optionHandler(c) : [c.env, executionContext];
      const optionsArray = Array.isArray(options) ? options : [options];
      const queryStrings = getQueryStrings(c.req.url);
      const res = await applicationHandler(new Request(new URL((c.req.path.slice(pathPrefixLength) || "/") + queryStrings, c.req.url), c.req.raw), ...optionsArray);
      if (res) {
        return res;
      }
      await next();
    };
    this.addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  get routerName() {
    this.matchRoute("GET", "/");
    return this.router.name;
  }
  addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  matchRoute(method, path) {
    return this.router.match(method, path);
  }
  handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.matchRoute(method, path);
    const c = new Context(new HonoRequest(request, path, matchResult), {
      env,
      executionCtx,
      notFoundHandler: this.notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.notFoundHandler(c);
        });
      } catch (err) {
        return this.handleError(err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.notFoundHandler(c))).catch((err) => this.handleError(err, c)) : res;
    }
    const composed = compose(matchResult[0], this.errorHandler, this.notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error("Context is not finalized. You may forget returning Response object or `await next()`");
        }
        return context.res;
      } catch (err) {
        return this.handleError(err, c);
      }
    })();
  }
};
var Hono = _Hono;
_path = new WeakMap;

// node_modules/hono/dist/router/reg-exp-router/node.js
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var Node = class {
  constructor() {
    this.children = {};
  }
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.index !== undefined) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.children[regexpStr];
      if (!node) {
        if (Object.keys(this.children).some((k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[regexpStr] = new Node;
        if (name !== "") {
          node.varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.varIndex]);
      }
    } else {
      node = this.children[token];
      if (!node) {
        if (Object.keys(this.children).some((k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[token] = new Node;
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.children[k];
      return (typeof c.varIndex === "number" ? `(${k})@${c.varIndex}` : k) + c.buildRegExpStr();
    });
    if (typeof this.index === "number") {
      strList.unshift(`#${this.index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  constructor() {
    this.context = { varIndex: 0 };
    this.root = new Node;
  }
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0;; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1;i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1;j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.root.insert(tokens, index, paramAssoc, this.context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (typeof handlerIndex !== "undefined") {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (typeof paramIndex !== "undefined") {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ?? (wildcardRegExpCache[path] = new RegExp(path === "*" ? "" : `^${path.replace(/\/\*/, "(?:|/.*)")}\$`));
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = {};
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie;
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map((route) => [!/\*|\/:/.test(route[0]), ...route]).sort(([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length);
  const staticMap = {};
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length;i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, {}]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = {};
      paramCount -= 1;
      for (;paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length;i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length;j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length;k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return;
}
var methodNames = [METHOD_NAME_ALL, ...METHODS].map((method) => method.toUpperCase());
var emptyParam = [];
var nullMatcher = [/^$/, [], {}];
var wildcardRegExpCache = {};
var RegExpRouter = class {
  constructor() {
    this.name = "RegExpRouter";
    this.middleware = { [METHOD_NAME_ALL]: {} };
    this.routes = { [METHOD_NAME_ALL]: {} };
  }
  add(method, path, handler) {
    var _a;
    const { middleware, routes } = this;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (methodNames.indexOf(method) === -1) {
      methodNames.push(method);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = {};
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          var _a2;
          (_a2 = middleware[m])[path] || (_a2[path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
        });
      } else {
        (_a = middleware[method])[path] || (_a[path] = findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach((p) => re.test(p) && routes[m][p].push([handler, paramCount]));
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length;i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        var _a2;
        if (method === METHOD_NAME_ALL || method === m) {
          (_a2 = routes[m])[path2] || (_a2[path2] = [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ]);
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  buildAllMatchers() {
    const matchers = {};
    methodNames.forEach((method) => {
      matchers[method] = this.buildMatcher(method) || matchers[METHOD_NAME_ALL];
    });
    this.middleware = this.routes = undefined;
    return matchers;
  }
  buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.middleware, this.routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute || (hasOwnRoute = true);
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]]));
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  constructor(init) {
    this.name = "SmartRouter";
    this.routers = [];
    this.routes = [];
    Object.assign(this, init);
  }
  add(method, path, handler) {
    if (!this.routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.routes) {
      throw new Error("Fatal error");
    }
    const { routers, routes } = this;
    const len = routers.length;
    let i = 0;
    let res;
    for (;i < len; i++) {
      const router = routers[i];
      try {
        routes.forEach((args) => {
          router.add(...args);
        });
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.routers = [router];
      this.routes = undefined;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.routes || this.routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var Node2 = class {
  constructor(method, handler, children) {
    this.order = 0;
    this.params = {};
    this.children = children || {};
    this.methods = [];
    this.name = "";
    if (method && handler) {
      const m = {};
      m[method] = { handler, possibleKeys: [], score: 0, name: this.name };
      this.methods = [m];
    }
    this.patterns = [];
  }
  insert(method, path, handler) {
    this.name = `${method} ${path}`;
    this.order = ++this.order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    const parentPatterns = [];
    for (let i = 0, len = parts.length;i < len; i++) {
      const p = parts[i];
      if (Object.keys(curNode.children).includes(p)) {
        parentPatterns.push(...curNode.patterns);
        curNode = curNode.children[p];
        const pattern2 = getPattern(p);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.children[p] = new Node2;
      const pattern = getPattern(p);
      if (pattern) {
        curNode.patterns.push(pattern);
        parentPatterns.push(...curNode.patterns);
        possibleKeys.push(pattern[1]);
      }
      parentPatterns.push(...curNode.patterns);
      curNode = curNode.children[p];
    }
    if (!curNode.methods.length) {
      curNode.methods = [];
    }
    const m = {};
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
      name: this.name,
      score: this.order
    };
    m[method] = handlerSet;
    curNode.methods.push(m);
    return curNode;
  }
  gHSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.methods.length;i < len; i++) {
      const m = node.methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== undefined) {
        handlerSet.params = {};
        handlerSet.possibleKeys.forEach((key) => {
          const processed = processedSet[handlerSet.name];
          handlerSet.params[key] = params[key] && !processed ? params[key] : nodeParams[key] ?? params[key];
          processedSet[handlerSet.name] = true;
        });
        handlerSets.push(handlerSet);
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.params = {};
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    for (let i = 0, len = parts.length;i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length;j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.children[part];
        if (nextNode) {
          nextNode.params = node.params;
          if (isLast === true) {
            if (nextNode.children["*"]) {
              handlerSets.push(...this.gHSets(nextNode.children["*"], method, node.params, {}));
            }
            handlerSets.push(...this.gHSets(nextNode, method, node.params, {}));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.patterns.length;k < len3; k++) {
          const pattern = node.patterns[k];
          const params = { ...node.params };
          if (pattern === "*") {
            const astNode = node.children["*"];
            if (astNode) {
              handlerSets.push(...this.gHSets(astNode, method, node.params, {}));
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp && matcher.test(restPathString)) {
            params[name] = restPathString;
            handlerSets.push(...this.gHSets(child, method, node.params, params));
            continue;
          }
          if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
            if (typeof key === "string") {
              params[name] = part;
              if (isLast === true) {
                handlerSets.push(...this.gHSets(child, method, params, node.params));
                if (child.children["*"]) {
                  handlerSets.push(...this.gHSets(child.children["*"], method, params, node.params));
                }
              } else {
                child.params = params;
                tempNodes.push(child);
              }
            }
          }
        }
      }
      curNodes = tempNodes;
    }
    const results = handlerSets.sort((a, b) => {
      return a.score - b.score;
    });
    return [results.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  constructor() {
    this.name = "TrieRouter";
    this.node = new Node2;
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (const p of results) {
        this.node.insert(method, p, handler);
      }
      return;
    }
    this.node.insert(method, path, handler);
  }
  match(method, path) {
    return this.node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter, new TrieRouter]
    });
  }
};

// src/helper/logger.ts
var import_moment = __toESM(require_moment(), 1);
var import_winston = __toESM(require_winston(), 1);
var { combine, timestamp, printf, colorize } = import_winston.format;
var loggerFormat = printf(({ level, message, timestamp: timestamp2 }) => {
  return `${timestamp2} [${level}]: ${message}`;
});
var Logger = import_winston.createLogger({
  level: "debug",
  format: combine(colorize(), timestamp({
    format: () => import_moment.default().format("ddd, DD MMM YYYY HH:mm:ss")
  }), loggerFormat),
  transports: [new import_winston.transports.Console]
});

// src/helper/error-handler.ts
var import_boom = __toESM(require_lib2(), 1);
var ErrorHandler = (err, c) => {
  const boomError = import_boom.default.boomify(err);
  return c.json({
    message: boomError.message,
    statusCode: boomError.output.statusCode
  }, boomError.output.statusCode);
};

// src/routes/index.ts
var import_reflect_metadata = __toESM(require_Reflect(), 1);

// src/helper/http-logger.ts
var httpLogger = async (c, next) => {
  const headersObj = Object.entries(c.req.headers).reduce((acc, [name, value]) => {
    if (value !== undefined) {
      acc[name] = value;
    }
    return acc;
  }, {});
  const start = performance.now();
  Logger.http({
    message: `Request | Method: ${c.req.method} | Headers: ${JSON.stringify(headersObj)} | URL: ${c.req.url}`
  });
  try {
    await next();
  } catch (err) {
    Logger.error(`Error occurred: ${err}`);
    throw err;
  }
  const durationInMs = performance.now() - start;
  Logger.http({
    message: `Response | Method: ${c.req.method} | URL: ${c.req.url} | Status: ${c.res.status} | Duration: ${durationInMs.toFixed(2)} ms`
  });
};
// src/helper/base-response.ts
var BaseResponse = (c, resMessage, type, result = null) => {
  let responseData;
  let status = 200;
  switch (type) {
    case "created":
      responseData = { statusCode: 201, status: true, message: resMessage };
      break;
    case "success":
      responseData = { statusCode: 200, status: true, message: resMessage, data: result };
      break;
    case "unauthorized":
      responseData = { statusCode: 403, status: false, error: resMessage };
      break;
    case "internalServerError":
      responseData = { statusCode: 500, status: false, error: resMessage };
      break;
    default:
      responseData = { statusCode: 200, status: true, message: resMessage, data: result };
      break;
  }
  return c.json(responseData, { status });
};
// src/helper/request.ts
import { createServer } from "http";
var convertToRequest = async (req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;
  const headers = new Headers(req.headers);
  const options = { method, headers };
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    options.body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        resolve(data);
      });
      req.on("error", (err) => {
        reject(err);
      });
    });
  }
  return new Request(url.toString(), options);
};
var serverless = (app) => createServer(async (req, res) => {
  try {
    const request = await convertToRequest(req);
    const response = await app.fetch(request);
    res.statusCode = response.status;
    res.statusMessage = response.statusText;
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });
    const body = await response.text();
    res.end(body);
  } catch (err) {
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});
// src/service/user-service.ts
var users = [];
var getAllUsers = () => users;
var addUser = (user) => {
  const newUser = { id: users.length + 1, ...user };
  users.push(newUser);
  return newUser;
};
var deleteUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return null;
};

// src/controller/user-controller.ts
var contextLogger = "UserController";
var getUsersHandler = (c) => {
  const users2 = getAllUsers();
  Logger.info(`${contextLogger} | getUser`, users2);
  return BaseResponse(c, "User created successfully", "success", { data: users2 });
};
var addUserHandler = async (c) => {
  const body = await c.req.json();
  const user = addUser(body);
  return BaseResponse(c, "User created successfully", "created", { data: user });
};
var deleteUserHandler = (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const deletedUser = deleteUser(id);
  if (deletedUser) {
    return BaseResponse(c, "User delete successfully", "success", { data: [] });
  }
  return BaseResponse(c, "User delete successfully", "internalServerError");
};

// src/routes/user-route.ts
var userRoutes = new Hono2;
userRoutes.get("/", getUsersHandler);
userRoutes.post("/", addUserHandler);
userRoutes.delete("/:id", deleteUserHandler);
var user_route_default = userRoutes;

// src/routes/index.ts
var router = new Hono2;
var basePath = "/hono";
router.route(`${basePath}/user`, user_route_default);

// src/index.ts
import_dotenv.config();
var app = new Hono2;
var port = process.env.PORT || 8000;
app.use("*", httpLogger);
app.onError(ErrorHandler);
app.route("/api", router);
app.notFound((c) => c.text("Route not found", 404));
var server = serverless(app);
server.listen(port, () => {
  Logger.info(`[Hono-Service] Server is running on port ${port}`);
});
