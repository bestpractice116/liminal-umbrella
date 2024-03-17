export class UserChangedNickname {
    constructor(
      public id: string,
      public oldNickname: string,
      public newNickname: string,
    ) {}
  }