const mongoose = require('mongoose');
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl);
const util = require('util');
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() {

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));
    // check if a key exists in redis
    const cachedValue = await client.get(key);

    if(cachedValue){

        const doc = JSON.parse(cachedValue);

        return Array.isArray(doc) 
            ? doc.map(d => new this.model(d))
             : new this.model(doc);
    }

    // reach out to mongo
    const result = await exec.apply(this, arguments);

    client.set(key, JSON.stringify(result));

    return result;

}

