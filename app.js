'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var Slack = require('slack-client');
var _ = require('lodash');

var AUTORECONNECT = true;
var AUTOMARK = true;
var TOKEN = process.env.AWESOMO_SLACK_TOKEN;

// enumerate object keys & values
var entries = _regeneratorRuntime.mark(function entries(obj) {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key;

  return _regeneratorRuntime.wrap(function entries$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 3;
        _iterator = _getIterator(_Object$keys(obj));

      case 5:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 12;
          break;
        }

        key = _step.value;
        context$1$0.next = 9;
        return [key, obj[key]];

      case 9:
        _iteratorNormalCompletion = true;
        context$1$0.next = 5;
        break;

      case 12:
        context$1$0.next = 18;
        break;

      case 14:
        context$1$0.prev = 14;
        context$1$0.t0 = context$1$0['catch'](3);
        _didIteratorError = true;
        _iteratorError = context$1$0.t0;

      case 18:
        context$1$0.prev = 18;
        context$1$0.prev = 19;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 21:
        context$1$0.prev = 21;

        if (!_didIteratorError) {
          context$1$0.next = 24;
          break;
        }

        throw _iteratorError;

      case 24:
        return context$1$0.finish(21);

      case 25:
        return context$1$0.finish(18);

      case 26:
      case 'end':
        return context$1$0.stop();
    }
  }, entries, this, [[3, 14, 18, 26], [19,, 21, 25]]);
});

// returns a regex
var listenForPingRegex = function listenForPingRegex(self) {
  return new RegExp('.*' + self.id + '.*ping', 'ig');
};

// determines channel name
var getChannelName = function getChannelName(channel) {
  var channelName = channel && channel.is_channel ? '#' : '';
  channelName = channelName + (channel ? channel.name : 'UNKNOWN_CHANNEL');
  return channelName;
};

// determines username
var getUserName = function getUserName(user) {
  if (user && user.name) {
    return '@' + user.name;
  }
  return 'UNKNOWN_USER';
};

// determines user's first name
var getFirstName = function getFirstName(user) {
  if (user) {
    if (user.profile.first_name) {
      return user.profile.first_name;
    }
    return user.name;
  }
  return '';
};

// wrapper for console.log
var log = function log(msg) {
  return console.log('→  ' + msg);
};

// init slack instance
var slack = new Slack(TOKEN, AUTORECONNECT, AUTOMARK);

// connect to Slack
slack.on('open', function () {

  var channels = [];
  var groups = [];

  // get the channels that bot is a member of
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = _getIterator(entries(slack.channels)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var channel = _step2.value;

      if (channel[1].is_member) {
        channels.push('#' + channel[1].name);
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
        _iterator2['return']();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  // get all groups that are open and not archived
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = _getIterator(entries(slack.groups)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var group = _step3.value;

      if (group[1].is_open && !group[1].is_archived) {
        groups.push(group[1].name);
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3['return']) {
        _iterator3['return']();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  // connection message
  return console.log('\n  ****************************************************************\n  *  Connected to Slack. You are @' + slack.self.name + ' of ' + slack.team.name + '.\n  *  You are in: ' + _.union(channels, groups).join(', ') + '.\n  ****************************************************************\n  ');
});

// respond to messages in Slack
slack.on('message', function (message) {

  var channel = slack.getChannelGroupOrDMByID(message.channel);
  var user = slack.getUserByID(message.user);
  var channelName = getChannelName(channel);
  var userName = getUserName(user);
  var type = message.type;
  var timestamp = message.ts;
  var text = message.text;

  if (text) {
    log('Received: ' + type + ' ' + channelName + ' ' + userName + ' ' + timestamp + ' ' + text);
  }

  if (type === 'message' && text && channel) {

    // respond to ping
    if (text.match(listenForPingRegex(slack.self))) {
      log('sending PONG');
      channel.send(userName + ': PONG');
    }
  } else {

    // this one should probably be impossible, since we're in slack.on 'message'
    var typeError = type !== 'message' ? 'unexpected type ' + type + '.' : null;

    // can happen on delete/edit/a few other events
    var textError = !text ? 'text was undefined.' : null;

    // in theory some events could happen with no channel
    var channelError = !channel ? 'channel was undefined.' : null;

    // space delimited string of my errors
    var errors = [typeError, textError, channelError].filter(function (el) {
      return el !== null;
    }).join(' ');

    return log('@' + slack.self.name + ' could not respond. ' + errors);
  }
});

// log errors
slack.on('error', function (error) {
  return console.error('Error: ' + error);
});

slack.login();

