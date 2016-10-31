var Pgb = require("pg-bluebird");
var Config = require('config');
var util = require('util');

exports.getDrugTopoJson = function (req, res, next) {
  
  var pgb = new Pgb();
  var cnn;
  var id = req.query.id;
  var poly_50, poly_100;

  pgb.connect(Config.pg)
    .then(function(connection) {
      cnn = connection;
      q_str = util.format("SELECT ST_AsGeoJSON(block_poly_50) FROM dengue_prevention_block " +
        "WHERE no='%s'", id);
      return cnn.client.query(q_str);
    })
    .then(function(result) {
      poly_50 = JSON.parse(result.rows[0].st_asgeojson); 
      q_str = util.format("SELECT ST_AsGeoJSON(block_poly_100) FROM dengue_prevention_block " +
        "WHERE no='%s'", id);
      return cnn.client.query(q_str);
    })
    .then(function(result) {
      poly_100 = JSON.parse(result.rows[0].st_asgeojson); 
      q_str = util.format("SELECT ST_AsGeoJSON(block_poly_150) FROM dengue_prevention_block " +
        "WHERE no='%s'", id);
      return cnn.client.query(q_str);
    })
    .then(function(result) {
      poly_150 = JSON.parse(result.rows[0].st_asgeojson);
      cnn.done();

      res.json({
        poly_50: poly_50,
        poly_100: poly_100,
        poly_150: poly_150
      });
    })
    .catch(function (error) {
      console.log(error);
      next(error);
    });
};
