const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 7000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7e8fa.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  console.log("this is error",err)
  const serviceCollection = client.db("handymanservice").collection("services");
  // console.log(serviceCollection);
  const feedbackCollection = client.db("handymanservice").collection("feedback");
  // console.log(feedbackCollection);
  const orderCollection = client.db("handymanservice").collection("order");
  // console.log(orderCollection);
  const adminCollection = client.db("handymanservice").collection("admin");
  // console.log(adminCollection);
  
  //-----------  Test DB Connection start ---------
  app.get('/', (req, res) => {
    res.send('Hi! DB is working!');
  });
  //-----------  Test DB Connection end ---------

//   //-----------  admin add service start ---------
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;

    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimType,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
    serviceCollection.insertOne({ title, description, image })
      .then(result => {
        res.send(result.insertedCount > 0);
        console.log("service added successfully")
      })
  })

  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        return res.send(documents);
      })
  });
  //----------- admin add service end ---------

  //------------ Admin ServiceList show start  ----------

  app.get('/customerServiceList', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        return res.send(documents);
      })
  })

  //------------ Admin ServiceList show end  ----------

  //------------ Make Admin start  ----------
  app.post('/makeAdmin', (req, res) => {
    const makeAdmin = req.body;
    // console.log(makeAdmin);
    adminCollection.insertOne(makeAdmin)
      .then(result => {
        console.log(result.insertedCount);
        res.send(result.insertedCount > 0);
      })
  })
  app.get('/showAllAdmin', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
  //------------ Make Admin end ----------

  //------------ Customer Order start  ----------  
  app.post('/addOrder', (req, res) => {
    const order = req.body;
    console.log(order)
    orderCollection.insertOne(order)
      .then(result => {
        // console.log(result.insertedCount);
        res.send(result.insertedCount > 0);
      })
  })
  app.get('/order', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
  //------------ Customer Order end  ----------
  //----------- Customer feedback start ---------
  app.post('/addReview', (req, res) => {
    const name = req.body.name;
    const companyName = req.body.companyName;
    const description = req.body.description;
    // console.log(name,companyName,description);

    feedbackCollection.insertOne({ name, companyName, description })
      .then(result => {
        console.log(result);
        res.send(result.insertedCount > 0);
      })
  })

  app.get('/feedback', (req, res) => {
    feedbackCollection.find({})
      .toArray((err, documents) => {
        return res.send(documents);
      })
      
  })
//   //------------ Customer feedback end  ----------
});

app.listen(process.env.PORT || port);