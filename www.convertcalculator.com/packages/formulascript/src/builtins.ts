import ARRAY from './functions/array';
import AVERAGE from './functions/average';
import B64DECODE from './functions/b64decode';
import B64ENCODE from './functions/b64encode';
import CONTAINS from './functions/contains';
import CONVERT from './functions/convert';
import CONVERTCURRENCY from './functions/convertcurrency';
import COUNT from './functions/count';
import COUNTA from './functions/counta';
import COUPON from './functions/coupon';
import { functions as datetime } from './functions/datetime';
import DISTANCE from './functions/distance';
import DRIVINGDISTANCE from './functions/drivingdistance';
import DRIVINGDURATION from './functions/drivingduration';
import EXTEND from './functions/extend';
import FILTER from './functions/filter';
import { functions as financial } from './functions/financial';
import FIND from './functions/find';
import FINDINDEX from './functions/findindex';
import FIRST from './functions/first';
import FLATMAP from './functions/flatmap';
import GET from './functions/get';
import GOOGLESHEET from './functions/googlesheet';
import INSERT from './functions/insert';
import IRR from './functions/irr';
import ISARRAY from './functions/isarray';
import ISBOOL from './functions/isbool';
import ISFUNCTION from './functions/isfunction';
import ISNUMBER from './functions/isnumber';
import ISSTRING from './functions/isstring';
import JOIN from './functions/join';
import JSONPARSE from './functions/jsonparse';
import KEYS from './functions/keys';
import LAST from './functions/last';
import LOG10 from './functions/log10';
import { functions as logical } from './functions/logical';
import { functions as lookup } from './functions/lookup';
import MAP from './functions/map';
import MARKDOWNTABLE from './functions/markdowntable';
import { functions as math } from './functions/math';
import MAX from './functions/max';
import MEDIAN from './functions/median';
import MIN from './functions/min';
import MOD from './functions/mod';
import MODE from './functions/mode';
import NETWORKDAYS from './functions/networkdays';
import NORMDIST from './functions/normdist';
import OBJECT from './functions/object';
import PARSEDATE from './functions/parsedate';
import PARSETIME from './functions/parsetime';
import POP from './functions/pop';
import PUSH from './functions/push';
import RANDOMID from './functions/randomid';
import RANGE from './functions/range';
import REDUCE from './functions/reduce';
import REFERENCE from './functions/reference';
import REGEXMATCH from './functions/regexmatch';
import REMOVE from './functions/remove';
import ROUND from './functions/round';
import ROUNDDOWN from './functions/rounddown';
import ROUNDUP from './functions/roundup';
import SHA1 from './functions/sha1';
import SHA256 from './functions/sha256';
import SLICE from './functions/slice';
import SQRT from './functions/sqrt';
import { functions as statistical } from './functions/statistical';
import SUM from './functions/sum';
import TABLE from './functions/table';
import TABLEFILTER from './functions/tablefilter';
import TABLEFINDFIRST from './functions/tablefindfirst';
import TABLEFINDMANY from './functions/tablefindmany';
import TABLESORT from './functions/tablesort';
import { functions as text } from './functions/text';
import TOJSON from './functions/tojson';
import TRANSPOSE from './functions/transpose';
import UNIQUE from './functions/unique';
import URLENCODE from './functions/urlencode';
import WORKDAY from './functions/workday';
import ZIP from './functions/zip';

const builtins = Object.freeze({
  ...logical,
  ...math,
  ...text,
  ...financial,
  ...datetime,
  ...lookup,
  ...statistical,
  NULL: () => {
    throw new Error('#NULL! value is null');
  },
  CONVERT,
  DISTANCE,
  DRIVINGDISTANCE,
  DRIVINGDURATION,
  UNIQUE,
  COUPON,
  CONVERTCURRENCY,
  GOOGLESHEET,
  GET,
  RANDOMID,
  TABLE,
  TABLEFINDFIRST,
  TABLEFINDMANY,
  SHA1,
  SHA256,
  ARRAY,
  ARGS2ARRAY: ARRAY,
  OBJECT,
  PUSH,
  POP,
  LAST,
  TABLESORT,
  NORMDIST,
  RANGE,
  MAP,
  FILTER,
  FIND,
  COUNT,
  SLICE,
  EXTEND,
  KEYS,
  REFERENCE,
  JOIN,
  ZIP,
  REDUCE,
  URLENCODE,
  AVERAGE,
  MEAN: AVERAGE,
  MEDIAN,
  MODE,
  INSERT,
  REMOVE,
  TRANSPOSE,
  PARSEDATE,
  PARSETIME,
  NETWORKDAYS,
  WORKDAY,
  FIRST,
  TABLEFILTER,
  B64DECODE,
  B64ENCODE,
  JSONPARSE,
  TOJSON,
  MARKDOWNTABLE,
  REGEXMATCH,
  ISNUMBER,
  ISARRAY,
  ISBOOL,
  ISFUNCTION,
  ISSTRING,
  FLATMAP,
  IRR,
  CONTAINS,
  FINDINDEX,

  // -- datetime --
  // TODAY,
  // DATE,
  // TIMEVALUE,
  // MONTH,
  // WEEKDAY,
  // DATEDIF,
  // DAYS,
  // DAY,
  // YEAR,
  // HOUR,
  // MINUTE,
  // EDATE,
  // NOW,
  // WORKDAY,
  // NETWORKDAYS,
  // SECOND,
  // DATEVALUE,

  // -- logical --
  // IF,
  // AND,
  // OR,
  // NOT,
  // CHOOSE,
  // ISNUMBER,
  // ISBLANK,
  // SWITCH,
  // IFS,
  // ISERROR,

  // -- math --
  ROUND,
  ROUNDUP,
  ROUNDDOWN,
  SUM,
  MAX,
  MIN,
  MOD,
  SQRT,
  LOG10,
  // ABS,
  // CEILING,
  // FLOOR,
  // PI,
  // LOG,
  // SIN,
  // DIVIDE,
  // MULTIPLY,
  // INT,
  // POWER,
  // TRUNC,
  // DEGREES,
  // LN,
  // RAND,
  // MROUND,
  // RANDBETWEEN,
  // MINA,
  // MAXA,
  // ATAN,
  // EXP,
  // CEILINGMATH,
  // AVERAGE,
  // EVEN,

  // -- text --
  // CONCATENATE,
  // UPPER,
  // VALUE,
  // CHAR,
  // TEXT,
  // LEFT,
  // LEFTB,
  // LEN,
  // SUBSTITUTE,
  // RIGHT,
  // RIGHTB,
  // SPLIT,
  // TRIM,

  // -- financial --
  // FV,
  // PMT,
  // IPMT,
  // CUMIPMT,
  // NPV,
  // PV,
  // NPER,
  // RATE,
  // EFFECT,

  // -- lookup --
  // FINDFIRST,
  // FINDMANY,
  // VLOOKUP,
  // HLOOKUP,
  // INDEX,
  // COLUMN,
  // ROW,
  // FINDIFS,

  // -- statistical --
  // SUMIF,
  // SUMIFS,
  // COUNTIF,
  // COUNTIFS,
  COUNTA,
});

export default builtins;
