exports.main = function(args) {
  const forever = require('forever');
  const superagent = require('superagent');
  const webpack = require('webpack');
  const browserify = require('browserify');
  const docx = require('docx');

  return {
    payload: 'All modules were loaded'
  }
}
