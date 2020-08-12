# vidly-app-backend
A simple virtual movie rental service application that provides a CRUD RESTful web service that allows a customer to rent
a movie and return it.

## Backend
The backend was implemented using Node.js (v 8.9.1) and Express.js to build a CRUD RESTful API. Multiple npm 
packages were used including Joi for input validation, mongoose as a driver for mongoDB that was the database used for persistence
and winston for error logging.

## Database
MongoDB was used as database server to store documents in collections. Mongoose was used to interface with the database
for storing, retirveing, querying and updating documents.

## Deployment
The backend was deployed to heroku server with MongoDB provided as a service in the cloud. (MongoAtlas)
