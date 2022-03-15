import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";

export const Files = new FilesCollection({
  storagePath: "assets/app/uploads/uploadedFiles",
  downloadRoute: "/files/documents",
  collectionName: "Files",
  permissions: 0o755,
  allowClientCode: true,
  cacheControl: "public, max-age=31536000",
  responseHeaders(responseCode, fileRef, versionRef, version, http) {
    const headers = {};
    switch (responseCode) {
      case "206":
        headers["Pragma"] = "private";
        headers["Transfer-Encoding"] = "chunked";
        break;
      case "400":
        headers["Cache-Control"] = "no-cache";
        break;
      case "416":
        headers["Content-Range"] = "bytes */" + versionRef.size;
    }
    headers["Connection"] = "keep-alive";
    headers["Content-Type"] = versionRef.type || "application/octet-stream";
    headers["Accept-Ranges"] = "bytes";
    headers["Access-Control-Allow-Origin"] = "*";
    return headers;
  },
  onbeforeunloadMessage() {
    return "Upload is still in progress! Upload will be aborted if you leave this page!";
  },
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in pdf/png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|pdf|jpg|jpeg/i.test(file.extension)) {
      return true;
    }
    return false;
  },
  onAfterUpload(file) {
    if (Meteor.isServer) {
    }
  },
});
