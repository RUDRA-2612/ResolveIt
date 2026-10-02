let query = $state('');

export const searchStore = {
  get query() { return query; },
  set query(v) { query = v; }
};
