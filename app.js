import * as faceapi from "face-api.js";
import fetch from 'node-fetch';
import * as tf from "@tensorflow/tfjs-node";

import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

import { MongoClient } from "mongodb";

var storeDB = process.env.STORE_DB || false;
var dbHost = process.env.DBHOST || "mongodb://root:example@127.0.0.1:27017/";
var dbUser = process.env.DBUSER || "face2expression";
var dbPass = process.env.DBPASS || "face2expression";
var dbUrl = "mongodb://" + dbUser + ":" + dbPass + "@" + dbHost + "/";
var dbName = process.env.DBNAME || "face2expression";
var collectionName = process.env.COLLECTION || "expressions";
const app = express();
const port = process.env.PORT || 3000;
app.use(fileUpload());
app.use(cors());

// Make face-api.js use that fetch implementation
faceapi.env.monkeyPatch({ fetch: fetch });

await faceapi.tf.setBackend("tensorflow");
await faceapi.tf.enableProdMode();
await faceapi.tf.ENV.set("DEBUG", false);
await faceapi.tf.ready();

await faceapi.nets.ssdMobilenetv1.loadFromDisk('./weights');
await faceapi.nets.faceExpressionNet.loadFromDisk('./weights');

async function image(file) {
  const decoded = tf.node.decodeImage(file, 3);
  const casted = decoded.toFloat();
  const result = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  return result;
}

app.post("/upload", async (req, res) => {

  const { file } = req.files;
  const tensor = tf.node.decodeImage(file.data);

  const results = await faceapi.detectAllFaces(tensor).withFaceExpressions();
  var expression = "NA";
  var expVal = 0;

  if (results[0]) {
    var ob = results[0].expressions;
    //console.log(results[0].expressions);
    var keys = Object.keys(ob);
    //console.log(keys);
    keys.forEach(x => {
      if (expVal <= ob[x]) {
        expVal = ob[x];
        expression = x;
      }

      //console.log( x + ":" + expVal + " === " + ob[x]);
    });
  }

  res.json({
    expression: expression
  });

if(storeDB) {
  console.log("inserting into db [" + dbName + "]");
  try {
    MongoClient.connect(dbUrl, function (err, db) {
      try {
        if (err) console.log(err);
        var dbo = db.db(dbName);
        var myobj = { expression: expression, created_t: Date.now() };
        dbo.collection(collectionName).insertOne(myobj, function (err, res) {
          if (err) console.log(err);
          console.log("1 document inserted");
          db.close();
        });
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
}
  

});

app.listen(port, () => {
  console.log("Server started on port" + port);
});