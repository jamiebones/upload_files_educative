import React, { useEffect, useState } from "react";
import { Files } from "../../imports/api/files.js";

export default SingleUploads = () => {
  const [progress, setProgress] = useState(0);
  const [fileEvent, setFileEvent] = useState(null);
  const [fileStatus, setFileStatus] = useState("");
  const [error, setError] = useState(null);


  const inputRef = React.useRef();

  const handleToggle = (e) => {
    fileEvent.toggle();
    console.log("button toggled");
  };

  const handleCancel = (e) => {
    fileEvent.abort();
    //remove the file
    console.log("upload cancelled");
  };

  const showUploads = () => {
    if (fileEvent == null) {
      return null;
    }

    return (
      <div>
        <p> {fileStatus}</p>
        <div className="progress">
          <div
            style={{ width: progress + "%" }}
            aria-valuemax="100"
            aria-valuemin="0"
            aria-valuenow={progress || 0}
            role="progressbar"
            className="progress-bar"
          >
            <span className="center-text">{progress} %</span>
          </div>
        </div>

        <button onClick={handleCancel}>Abort</button>
        <button onClick={handleToggle}>Toggle</button>
      </div>
    );
  };

  const fileUploadFunction = (file) => {
    let uploadInstance = Files.insert(
      {
        file: file,
        meta: {
          key: "jamie",
        },
        transport: "ddp",
        chunkSize: "dynamic",
      },
      false
    );

    setFileEvent(uploadInstance);
    uploadInstance.start(); // Must manually start the upload

    uploadInstance.on("start", function (error, fileObj) {
      setFileStatus("starting uploading for " + fileObj.name);
    });

    uploadInstance.on("end", function (error, fileObj) {
      setFileStatus("finish uploading for " + fileObj.name);
    });

    uploadInstance.on("uploaded", function (error, fileObj) {
      setFileStatus("uploaded " + fileObj.name + " successfully");
      setFileEvent(null);
      inputRef.current.value = "";
    });

    uploadInstance.on("error", function (error, fileObj) {
      setError(`Error during upload: ${error}`);
      setFileEvent(null);
    });

    uploadInstance.on("progress", function (progress, fileObj) {
      setProgress(progress);
    });
  };

  const uploadFunction = (e) => {
    e.preventDefault();
    //set the state variable to their default value
    setProgress("0");
    setFileEvent(null);
    setFileStatus("");
    setError(null);
    if (e.target.files) {
      let file = e.target.files[0];
      fileUploadFunction(file);
    }
  };

  return (
    <div className="container-div">
      <h1 className="title">
        Uploading Files With Meteor-Files (Single upload)
      </h1>
      <input
        type="file"
        onChange={uploadFunction}
        id="file-input"
        ref={inputRef}
      />

      {error && <p>{error}</p>}

      {showUploads()}
    </div>
  );
};
