var env = process.env.NODE_ENV || 'development';
console.log("env****", env);

if (env === 'development' || env === 'test') {
    var config = require('./config.json');
    var envCongif = config[env];
    Object.keys(envCongif).forEach((key) => {
        process.env[key] = envCongif[key];
    })
}