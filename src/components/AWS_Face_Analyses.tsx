import React, { useEffect, useState } from 'react';
import AWS from "aws-sdk";
import './Style.css';
import { ImageBlob } from 'aws-sdk/clients/rekognition';
import { ifError } from 'assert';

export default function Test() {
  const [image, setImage] = useState<any>();
  const [result, setResult] = useState<any>(null);

      //Calls DetectFaces API and shows estimated ages of detected faces
      function DetectFaces(imageData: Blob | ArrayBuffer) {
        console.log(imageData)
        AWS.config.region = 'eu-west-2';
        var rekognition = new AWS.Rekognition();
        var params = {
          Image: {
            Bytes: imageData as ImageBlob
          },
          Attributes: [

            'ALL',
          ]
        };
        rekognition.detectFaces(params, function (err, data) {
          if(err) console.log(err)
          else {
            setResult(Object.entries(data.FaceDetails![0]));
            console.log(data.FaceDetails);

          }
        });
      }
      //Loads selected image and unencodes image bytes for Rekognition DetectFaces API
      function ProcessImage(e: React.ChangeEvent<HTMLInputElement>) {
        AnonLog();
        //var control = document.getElementById("fileToUpload") ;
        var file = e.target.files![0];
        setImage(URL.createObjectURL(file))
    
        // Load base64 encoded image 
        var reader = new FileReader();
        reader.onload = (function (theFile) {
          return function (e: any) {
            var img = document.createElement('img');
            var image = null;
            img.src = e.target?.result;
            var jpg = true;
            try {
              image = atob(e.target.result.split("data:image/jpeg;base64,")[1]);
    
            } catch (e) {
              jpg = false;
            }
            if (jpg === false) {
              try {
                image = atob(e.target.result.split("data:image/png;base64,")[1]);
              } catch (e) {
                alert("Not an image file Rekognition can process");
                return;
              }
            }
            if (!image) {
              return;
            }
            //unencode image bytes for Rekognition DetectFaces API 
            var length = image.length;
            var imageBytes = new ArrayBuffer(length);
            var ua = new Uint8Array(imageBytes);
            for (var i = 0; i < length; i++) {
              ua[i] = image?.charCodeAt(i);
            }
            //Call Rekognition  
            DetectFaces(imageBytes);
          };
        })(file);
        reader.readAsDataURL(file);
      }

      function AnonLog() {
        // Configure the credentials provider to use your identity pool
        AWS.config.region = 'eu-west-2'; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'eu-west-2:371cdf1c-657e-4e3f-a6a0-3cdcf905bfdc'
        });
      }

    return(
        <>
        <div>
          <h1>Reconaissance faciale</h1>
        </div>
        <div className='body'> 
            <div>
            <div className='select'>
              <label>
                Select image
              <input className='inputStyle' type="file"  name="fileToUpload" id="fileToUpload" accept="image/*"
                onChange={(e) =>
                    ProcessImage(e)
                  }/>
              </label>
            </div>
          </div>
          <div>
            <div id='container'>
              <div id='img'>
                <img src={image} className='imageStyle' alt=''/>
              </div>            
              <div className='result' id='resultat'>
                <h3>Information</h3>

                {
                  (result || []).map(function (key: string) {
                     
                    return (
                      <>

                        <p className='title'>{key[0]}</p>
                        
                        {
                          (Object.entries(key[1]) || []).map(function (element: string[]) {
                            console.log("Type " + typeof element);

                            return (
                              <div >
                                {
                                  typeof element[1] == 'object' ?
                                    // Fix : added Object.entries to turn element[1] to a 2 dimensional array and use map afterwards
                                    Object.entries(element[1]).map(e => <p>{e[0] + " : " + e[1]}</p>)
                                    : <p>{element[0]}:{element[1] + ""}</p>
                                }
                              </div>
                            )
                          }) 
                     }
                      </>
                    )
                  })
                }
              </div>
            </div>
            </div>
            
          </div>
        </>
    );
}
