/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/plugin/weekday';
import 'dayjs/plugin/localeData';
import 'dayjs/plugin/weekOfYear';
import 'dayjs/plugin/weekYear';
import 'dayjs/plugin/advancedFormat';
import 'dayjs/plugin/customParseFormat';
dayjs.extend(require('dayjs/plugin/customParseFormat'));
dayjs.extend(require('dayjs/plugin/advancedFormat'));
dayjs.extend(require('dayjs/plugin/weekday'));
dayjs.extend(require('dayjs/plugin/localeData'));
dayjs.extend(require('dayjs/plugin/weekOfYear'));
dayjs.extend(require('dayjs/plugin/weekYear'));
dayjs.extend(function (_o, c) {
  // todo support Wo (ISO week)
  const proto = c.prototype;
  const oldFormat = proto.format;
  proto.format = function f(formatStr) {
    const str = (formatStr ?? '').replace('Wo', 'wo');
    return oldFormat.bind(this)(str);
  };
});

export type { Dayjs };
export default dayjs;
