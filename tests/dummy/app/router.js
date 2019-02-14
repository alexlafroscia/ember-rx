import AddonDocsRouter, { docsRoute } from "ember-cli-addon-docs/router";
import config from "./config/environment";

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  docsRoute(this, function() {
    this.route("cookbook", function() {
      this.route("count-prop-changes");
    });

    this.route("features", function() {
      this.route("element-modifier");
      this.route("scheduler");
    });
  });

  this.route("testing", function() {
    this.route("observable-model");
  });
});

export default Router;
