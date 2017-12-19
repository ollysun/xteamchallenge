var fs = require('fs')
var path = require('path')
var StringDecoder = require('string_decoder').StringDecoder;
/**
 * General purpose data encoding
 *
 * (string): string
 */
function encode (data) {
  return (new Buffer(data)).toString('base64')
}

/**
 * Inverse of `encode`
 *
 * (string): string
 */
function decode (data) {
  return (new Buffer('' + data, 'base64')).toString()
  //var decoder = new StringDecoder('utf8')
  //return decoder.write(data)
}

/**
 * Encode a superhero name
 *
 * (string): string
*/
module.exports.encodeName = function (name) {
  return encode('@' + name)
}

/**
 * Load the database
 *
 * (string, (?Error, ?Object))
 */
module.exports.loadDb = function (dbFile, cb) {
  fs.readFile(dbFile, function (err, res) {
    if (err) { return cb(err) }

    var messages
    try {
      messages = JSON.parse(res)
    } catch (e) {
      return cb(err)
    }

    return cb(null, { file: dbFile, messages: messages })
  })
}

/**
 * Find the user's inbox, given their encoded username
 *
 * (Object, string): Object
 */
module.exports.findInbox = function (db, encodedName) {
  var messages = db.messages
  return {
    dir: path.dirname(db.file),
    messages: Object.keys(messages).reduce(function (acc, key) {
      if (messages[key].to === encodedName) {
        return acc.concat({
          hash: key,
          lastHash: messages[key].last,
          from: messages[key].from
        })
      } else { return acc }
    }, [])
  }
}

/**
 * Find the next message, given the hash of the previous message
 *
 * ({ messages: Array<Object> }, string): string
 */
module.exports.findNextMessage = function (inbox, lastHash) {
  // find the message which comes after lastHash
  var found, msg,pathflow
  for (var i = 0; i < inbox.messages.length; i += 1) {
    if (inbox.messages[i].lastHash === lastHash) {
      found = i
      break
    }
  }
  msg = 'from: '
  pathflow = path.join(inbox.dir, inbox.messages[found].hash);
  // read and decode the message
  return  msg + decode(inbox.messages[found].from) + '\n---\n' +
    decode(fs.readFileSync(pathflow))
}
