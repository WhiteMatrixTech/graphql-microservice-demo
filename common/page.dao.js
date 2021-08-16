const { UserInputError } = require('apollo-server-errors');
const { toCursor, fromCursor } = require('./util');

exports.connectionResolver = async ({ first, last, before = '', after = '', ...args }, model) => {
  if (first && last) {
    throw new UserInputError('不能同时传递first和last参数');
  }
  const edges = [];
  const afterCursor = fromCursor(after);
  const beforeCursor = fromCursor(before);
  const where = {
    ...(afterCursor ? { id: { gt: afterCursor } } : {}),
    ...(beforeCursor ? { id: { lt: beforeCursor } } : {}),
    ...(Object.keys(args).length ? args : {})
  };
  const condition = {
    where,
    take: first || -last
  };
  const nodes = await model.findMany(condition);
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    edges.push({
      cursor: toCursor(node.id),
      node
    });
  }
  const startCursor = edges.length > 0 ? edges[0].cursor : '';
  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : '';
  let hasPrevPage = false;
  let hasNextPage = false;
  if (startCursor) {
    const startCursorDecode = fromCursor(startCursor);
    const count = await model.count({
      where: {
        id: {
          lt: startCursorDecode
        }
      }
    });
    hasPrevPage = count > 0;
  }
  if (endCursor) {
    const endCursorDecode = fromCursor(endCursor);
    const count = await model.count({
      where: {
        id: {
          gt: endCursorDecode
        }
      }
    });
    hasNextPage = count > 0;
  }

  const totalCount = await model.count({ where });
  return {
    edges,
    nodes,
    totalCount,
    pageInfo: {
      startCursor,
      endCursor,
      hasPrevPage,
      hasNextPage
    }
  };
};
