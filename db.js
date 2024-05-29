const mongoose = require('mongoose');

//to run in local atmosphere use the below link
// const mongoURI = "mongodb://localhost:27017/inotebook"


require('dotenv').config()

async function connectToMongo () {
    mongoose.connect(process.env.mongoURI).then(()=>
        console.log("Connect to Mongo Successfully")).catch(err => console.log(err));
    
}

module.exports = connectToMongo;










// async function connectToMongo() {
//     await mongoose.connect(mongoURI).then(()=> console.log("Connected to Mongo Successfully")).catch(err => console.log(err));
//   }
  
//   module.exports = connectToMongo;