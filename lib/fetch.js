require('dotenv').load();

var keystone = require('../../keystone'),
    config = require('config'),
    RSVP = require('rsvp');

var promise = new RSVP.Promise(function(resolve, reject) {
  keystone.init(config.keystone);
  keystone.set('cloudinary config', config.cloudinary);
  keystone.db = [];
  keystone.db[config.current_locale] = keystone.mongoose.createConnection(process.env.MONGO_URI + '/keystone_' + config.current_locale || exports.mongo_url + '/keystone_' + config.current_locale);

  /*config.locales.forEach(function (locale) {
    if (locale != config.current_locale) {
      keystone.db[locale] = keystone.db[config.current_locale].useDb('keystone_' + locale);
    }
  });*/

  // Connect to database
  //keystone.mongoose.connect(process.env.MONGO_URI + '/keystone_' + config.current_locale || exports.mongo_url + '/keystone_' + config.current_locale);
  keystone.db[config.current_locale].on('error', function(err) {
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

module.exports.getData = promise;