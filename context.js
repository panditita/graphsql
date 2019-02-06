const { MongoClient } = require('mongodb');

let mongo;

async function context() {
	if (!mongo) {
		mongo = await MongoClient.connect('mongodb://localhost:27017/graphsql', { useNewUrlParser: true });
		mongo = mongo.db('graphsql');
	}
	return {
		mongo
	};
}

module.exports = context;
