# MEAN Stack App

Repository holding a test application using the MEAN stack. Will incrementally add new things as I learn.

# Requirements

You should have the following applications installed on your system:

- NodeJS https://nodejs.org/en/
- MongoDB https://www.mongodb.com/

# Import Data

To work with the data included under /api/data/hotel-data.json import it to MongoDB using the following command from the app root folder:
```
mongoimport --db meanhotel --collection hotels /api/data/hotel-data.json
```