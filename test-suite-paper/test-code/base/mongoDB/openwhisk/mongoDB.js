const MongoClient = require('mongodb').MongoClient;

function main(args) {
  let uri = `mongodb://${args.username}:${args.password}@${args.dbip}/${args.dbname}`;
  let client = new MongoClient(uri);
  let item = undefined;
  return new Promise((resolve, reject) => {
    client.connect()
    .then((db) => {
      let collection = db.db(args.dbname).collection('documents');
      return collection.findOne({'name': 'Test document for OpenWhisk'});
    })
    .then((data) => {
      item = data;
      return client.close();
    })
    .then(() => {
      resolve(item);
    })
    .catch((error) => {
      reject(error);
    });
  });
}

exports.main = main;
