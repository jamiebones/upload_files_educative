import React, { useEffect, useState } from "react";
import { Files } from "../../imports/api/files.js";
import { useTracker } from "meteor/react-meteor-data";

export const App = () => {
  const [progress, setProgress] = useState([]);
  const [uploading, setUploading] = useState([]);
  const [fileStatus, setFileStatus] = useState([]);
  const [error, setError] = useState([]);
  const [count, setCount] = useState(0);
  const [fileUploading, setFileUploading] = useState(false);

  

  const handleToggle = (e, fileEvent) => {
    fileEvent.toggle();
    console.log("button toggled");
  };

  const handleCancel = (e, fileEvent) => {
    fileEvent.abort();
    //remove the file
    console.log("upload cancelled");
  };

  useEffect(() => {
    if (fileUploading) {
      const fileInput = document.getElementById("file-input");
      fileInput.value = "";
    }
  }, [fileUploading]);

  const { files, loading } = useTracker(() => {
    const files = Files.find({}).fetch();
    const handle = Meteor.subscribe("files.all");
    return {
      files,
      loading: !handle.ready(),
    };
  });

  const removeFile = (e, fileId) => {
    e.preventDefault();
    Files.remove(fileId);
    console.log("Removed");
  };

  const showUploads = (progress, fileStatus, fileEvent) => {
    if (uploading.length == 0) {
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

        <button onClick={(e) => handleCancel(e, fileEvent)}>Abort</button>
        <button onClick={(e) => handleToggle(e, fileEvent)}>Toggle</button>
      </div>
    );
  };

  fileUploadFunction = (file, index) => {
    return new Promise((resolve, reject) => {
      let uploadInstance = Files.insert(
        {
          file: file,
          meta: {
            "key" : "jamie"
          },
          transport: "http",
          chunkSize: 'dynamic',
        },
        false
      );

      uploadInstance.start(); // Must manually start the upload
      
      setUploading((prevUploading) => {
        const newUploading = [...prevUploading];
        newUploading[index] = uploadInstance;
        return newUploading;
      });

      uploadInstance.on("start", function (error, fileObj) {
        setFileStatus((prevFileStatus) => {
          const newFileStatus = [...prevFileStatus];
          newFileStatus[index] = "starting uploading for " + fileObj.name;
          return newFileStatus;
        });
      });

      uploadInstance.on("end", function (error, fileObj) {
        setFileStatus((prevFileStatus) => {
          const newFileStatus = [...prevFileStatus];
          newFileStatus[index] = "finish uploading for " + fileObj.name;
          return newFileStatus;
        });
      });

      uploadInstance.on("uploaded", function (error, fileObj) {
        resolve("uploaded successfully");
        //remove the instance here
        setUploading((prevUploading) => {
          return prevUploading.slice(index, 1);
        });
      });

      uploadInstance.on("error", function (error, fileObj) {
        setError((prevError) => {
          const newError = [...prevError];
          newError[index] = `Error uploading ${fileObj.name} : error`;
          return newError;
        });

        reject(`There was an error uploading : ${fileObj.name} || ${error}`);
      });

      uploadInstance.on("progress", function (progress, fileObj) {
        setProgress((prev) => {
          const newProgress = [...prev];
          newProgress[index] = progress;
          return newProgress;
        });
      });
    });
  };

  const uploadFunction = async (e) => {
    e.preventDefault();
    //set the state variable to their default value
    setProgress([]);
    setUploading([]);
    setFileStatus([]);
    setError([]);
    setCount(0);
    setFileUploading(false);
    if (e.target.files) {
      let files = e.target.files;
      let filesArr = Array.from(files);
      setFileUploading(true);
      for (let i = 0; i < filesArr.length; i++) {
        const file = filesArr[i];
        //please do validation here

        try {
          fileUploadFunction(file, i).then((result) => {
            setCount((prevCount) => prevCount + 1);
            console.log("result", result);
          });
        } catch (error) {
          console.log("error ", error);
        }
      }
    }
  };

  return (
    <div>
      <h1 className="title">Uploading Files With Meteor-Files</h1>
      <div className="container">
        <div className="container-div">
          <input
            type="file"
            onChange={uploadFunction}
            multiple
            id="file-input"
          />

          {error.length > 0 &&
            error.map((error, index) => {
              return (
                <p key={index} className="text-danger">
                  {error}
                </p>
              );
            })}

          {progress &&
            progress.length > 0 &&
            progress.map((prog, index) => {
              return (
                <div key={index}>
                  {showUploads(prog, fileStatus[index], uploading[index])}
                </div>
              );
            })}
          {count > 0 && <p>{count} files uploaded successfully</p>}
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
        </div>
      </div>
    </div>
  );
};
