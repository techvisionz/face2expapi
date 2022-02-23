# face2expapi
This is a simple node wrapper with one endpoint to detect the expression for given image file based on <a href="https://justadudewhohacks.github.io/face-api.js/docs/index.html">face-api</a> with pre-trained data. Trained data is available under "weights" directory. User can overwrite this train data and rebuild the image using Dockerfile.

# Docker
Use following docker-compose command to run program

<code>docker-compose up -d</code>

# API Endpoint
/upload end point is exposed to upload the file and get expression as JSON response.

Postman screenshot is available below (postman collection _**(Face2Exp.postman_collection.json)**_ is also available in source directory)

![alt login](https://raw.githubusercontent.com/techvisionz/face2expapi/main/postman_screeshot.png)
