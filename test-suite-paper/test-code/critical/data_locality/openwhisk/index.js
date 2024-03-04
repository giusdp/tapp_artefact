const MongoClient = require('mongodb').MongoClient;

function main(args) {
  let uri = `mongodb://${args.username}:${args.password}@${args.dbip}/${args.dbname}`;
  let client = new MongoClient(uri);
  let item = undefined;
  return new Promise((resolve, reject) => {
    client.connect()
    .then((db) => {
      let collection = db.db(args.dbname).collection('large_documents');
      return collection.find().project({_id: 1}).toArray();
    })
    .then((data) => {
      item = data.length;
      return client.close();
    })
    .then(() => {
      resolve({'payload': item});
    })
    .catch((error) => {
      reject(error);
    });
  });
}

exports.main = main;
