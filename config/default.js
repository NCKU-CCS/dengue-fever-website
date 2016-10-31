var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var Controllers= function (filePath) {
  return path.normalize(rootPath+'/api/controllers/'+filePath);
}

var Models= function (filePath) {
  return path.normalize(rootPath+'/api/models/'+filePath);
}

var Views= function (filePath) {
  return path.normalize(rootPath+'/api/views/'+filePath);
}

var Email= path.normalize(rootPath+'/api/email');


module.exports= {
  //port
  port: 3000,
  pg: process.env.POSTGRES_PATH,

  //path
  rootPath: rootPath,
  Controllers: Controllers,
  Models: Models,
  Views: Views
};

