import Route from "ember-observable/route";

export default class ObservableModel extends Route {
  constructor() {
    super(...arguments);

    this.queryParams = {
      page: {
        refreshModel: true
      }
    };
  }
}
