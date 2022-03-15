import { Meteor } from "meteor/meteor";
import "/imports/api/publication";
import { Files } from "/imports/api/files";
import helmet from "helmet";
import { WebApp } from "meteor/webapp";

Meteor.startup(() => {
  WebApp.connectHandlers.use(helmet());
});
