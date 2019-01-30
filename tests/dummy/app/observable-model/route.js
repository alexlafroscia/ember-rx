import Route from "ember-rx/route";

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
