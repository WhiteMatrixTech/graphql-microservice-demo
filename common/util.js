exports.toCursor = (id) => Buffer.from(id.toString()).toString('base64');

exports.fromCursor = (cursor) => Buffer.from(cursor, 'base64').toString('ascii');
