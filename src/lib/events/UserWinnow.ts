import { User } from '../database/model.js';

export class UserWinnow {
    constructor(
        public id: string,
        public dbUser: User,
    ) {}
}