var keystone = require('../../keystone'),
    config = require('config'),
    RSVP = require('rsvp');

var promise = new RSVP.Promise(function(resolve, reject) {
  keystone.init(config.keystone);
  keystone.set('cloudinary config', config.cloudinary);
  keystone.import('../../../models');

  // Connect to database
  keystone.mongoose.connect(config.keystone.mongo);
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