import { Pollution } from '../../../models/pollution';

export class AddFavorite {
  static readonly type = '[Favorites] Add';

  constructor(readonly pollution: Pollution) {}
}

export class RemoveFavorite {
  static readonly type = '[Favorites] Remove';

  constructor(readonly pollutionId: number | string) {}
}

export class ClearFavorites {
  static readonly type = '[Favorites] Clear';
}

export class ToggleFavorite {
  static readonly type = '[Favorites] Toggle';

  constructor(readonly pollution: Pollution) {}
}

// The favorites are copies of pollutions: this brings them up to date with what the API returns
export class SyncFavorites {
  static readonly type = '[Favorites] Sync';

  constructor(readonly pollutions: Pollution[]) {}
}
