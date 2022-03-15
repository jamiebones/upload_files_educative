import { Meteor } from "meteor/meteor";
import { Files} from "./files";


if (Meteor.isServer) {
    Meteor.publish('files.all', function () {
      return Files.find().cursor;
    });
  }