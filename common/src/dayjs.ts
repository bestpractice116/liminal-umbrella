import dayjs from 'antd/node_modules/dayjs';
import type { Dayjs } from 'antd/node_modules/dayjs';
import weekday from 'antd/node_modules/dayjs/plugin/weekday';
import localeData from 'antd/node_modules/dayjs/plugin/localeData';
import weekOfYear from 'antd/node_modules/dayjs/plugin/weekOfYear';
import weekYear from 'antd/node_modules/dayjs/plugin/weekYear';
import advancedFormat from 'antd/node_modules/dayjs/plugin/advancedFormat';
import customParseFormat from 'antd/node_modules/dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(function (o, c) {
  // todo support Wo (ISO week)
  var proto = c.prototype;
  var oldFormat = proto.format;
  proto.format = function f(formatStr) {
    var str = (formatStr || '').replace('Wo', 'wo');
    return oldFormat.bind(this)(str);
  };
});

export type { Dayjs };
export default dayjs;
