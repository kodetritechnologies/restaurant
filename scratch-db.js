const fs = require('fs');
const mongoose = require('mongoose');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const uri = `mongodb://${env.DB_USERNAME}:${env.DB_PASS}@ac-dwrpxci-shard-00-00.o4cvr9a.mongodb.net:27017,ac-dwrpxci-shard-00-01.o4cvr9a.mongodb.net:27017,ac-dwrpxci-shard-00-02.o4cvr9a.mongodb.net:27017/${env.DB_NAME}?ssl=true&replicaSet=atlas-jhv7w4-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kodetritechnologies`;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected successfully to DB");
    
    const chefs = await mongoose.connection.db.collection('chefs').find({}).toArray();
    console.log("Chefs count:", chefs.length);
    console.log("Chefs data:", JSON.stringify(chefs, null, 2));

    const galleries = await mongoose.connection.db.collection('galleries').find({}).toArray();
    console.log("Galleries count:", galleries.length);
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Connect error:", err);
    process.exit(1);
  });
