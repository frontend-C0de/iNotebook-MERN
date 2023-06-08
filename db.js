const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://yashu:HL11S7T868QCIvwY@yashu.rvnkb6i.mongodb.net/test"
const connectToMongo = () =>{
    mongoose.connect(mongoURI, ()=>{
        console.log("connected to mongo successfully");
    })
}

module.exports = connectToMongo;


