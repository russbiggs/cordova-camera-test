/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  function writeFile(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
}


function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    var imgURIs = [];


    var URIList = document.querySelector('.uri-list');

    function addImgURI(uri){
        imgURIs.push(uri);
        while (URIList.firstChild) {
            URIList.removeChild(URIList.firstChild)
        }
        for (const uri of imgURIs) {
            var li = document.createElement('li');
            var img = document.createElement('img');
            img.src = uri.toString()
            img.style.maxHeight = '100px';
            li.appendChild(img)
            var textNode = document.createTextNode(uri.toString());
            li.appendChild(textNode)
            URIList.append(li);
        }
    }   



    document.getElementById('camera-btn').addEventListener('click', openCamera)

    function setOptions(srcType) {
        var options = {
            // Some common settings are 20, 50, and 100
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            correctOrientation: true  //Corrects Android orientation quirks
        }
        return options;
    }
      
      function promisify(f) {
        return function (...args) {
          return new Promise((resolve, reject) => {
            function callback(result, err) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            }
      
            args.push(callback);
      
            f.call(this, ...args); 
          });
        };
      };



    const getPicture = promisify(navigator.camera.getPicture)
    const resFs = promisify(window.resolveLocalFileSystemURL)

    function openCamera(selection) {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = setOptions(srcType);

        navigator.camera.getPicture(function cameraSuccess(imageUri) {
            window.resolveLocalFileSystemURL(imageUri, function success(fileEntry) {
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function success(dirEntry) {
                    fileEntry.moveTo(dirEntry, `${uuidv4()}.jpg`, function(entry){
                        addImgURI(entry.nativeURL)
                    }, (e)=> {console.log(e)});
                });
            }, ()=>{});

    
        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");
    
        }, options);
        
    }
}
