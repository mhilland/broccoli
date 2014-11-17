require('dotenv').load();

var keystone = require('../../keystone'),
    config = require('config'),
    RSVP = require('rsvp');

module.exports.getData = new RSVP.Promise(function(resolve, reject) {
  var locale = process.env.CURRENT_LOCALE;

  keystone.init(config.keystone);
  keystone.set('cloudinary config', config.cloudinary);
  keystone.db = [];
  keystone.db[locale] = keystone.mongoose.createConnection(process.env.MONGO_URI + '/keystone_' + locale || exports.mongo_url + '/keystone_' + locale);

  keystone.db[locale].on('error', function(err) {
    if (keystone.get('logger')) {
      console.log('------------------------------------------------');
      console.log('Mongo Error:\n');
      console.log(err);
      throw new Error("Mongo Error");
    }
  }).on('open', function() {
    keystone.import('../../../models');

    keystone.fetch()
      .then(function(data) {
        data.config = config;
        keystone.data = JSON.stringify(data);

        resolve(data);
      }, function(err) {
        if (err) {
          reject(err);
        }
      });
  });
});