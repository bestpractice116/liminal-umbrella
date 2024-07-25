import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

export default dayjs;
