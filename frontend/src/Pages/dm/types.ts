import { type GameCreateItem } from 'common/schema';
import { Dayjs } from 'dayjs';
import { Keyable } from '../../lib/CRUD';

export type GameForm = GameCreateItem & { date?: Dayjs | undefined } & Keyable
