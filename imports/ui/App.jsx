import React from "react";
import { Files } from "../../imports/api/files.js";
import { useTracker } from "meteor/react-meteor-data";
import SingleUploads from "./SingleUploads";
import MultipleUploads from "./MultipleUploads";

export const App = () => {
  const { files, loading, downloadLinks } = useTracker(() => {
    const files = Files.find({}).fetch();
    const downloadLinks = files.map((file) => {
      return Files.link(file);
    });
    const handle = Meteor.subscribe("files.all");
    return {
      files,
      loading: !handle.ready(),
      downloadLinks,
    };
  });

  const removeFile = (e, fileId) => {
    e.preventDefault();
    Files.remove(fileId);
    console.log("Removed");
  };

  return (
    <div className="container">
      <div className="container-div">
        <SingleUploads />
        <MultipleUploads />
      </div>

      <div className="container-div">
        <h1>Uploaded files:</h1>

        {loading && <p>Loading...</p>}

        {files &&
          files.map(({ name, _id }) => {
            return (
              <p key={_id} onClick={(e) => removeFile(e, _id)}>
                {name}
              </p>
            );
          })}
        {downloadLinks && (
          <p>
            <b>Downloads links</b>{" "}
          </p>
        )}
        {downloadLinks &&
          downloadLinks.map((link) => {
            return (
              <p key={link}>
                <a href={link}>{link}</a>
              </p>
            );
          })}
      </div>
    </div>
  );
};
