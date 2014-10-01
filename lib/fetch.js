require('dotenv').load();

var keystone = require('../../keystone'),
    config = require('config'),
    RSVP = require('rsvp');

var promise = new RSVP.Promise(function(resolve, reject) {
  keystone.init(config.keystone);
  keystone.set('cloudinary config', config.cloudinary);
  keystone.import('../../../models');

  // Connect to database
  keystone.mongoose.connect(process.env.MONGO_URI + '/keystone_' + config.current_locale || exports.mongo_url + '/keystone_' + config.current_locale);
  keystone.mongoose.connection.on('error', function(err) {
    if (keystone.get('logger')) {
      console.log('------------------------------------------------');
      console.log('Mongo Error:\n');
      console.log(err);
      throw new Error("Mongo Error");
    }
  }).on('open', function() {
    keystone.fetch()
      .then(function(data) {
        config.broccoli.build = true;
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

module.exports.getData = promise;