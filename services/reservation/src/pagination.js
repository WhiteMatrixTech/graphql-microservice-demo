exports.pageResolver = async (parent, { first, after }, model) => {
  const edgesArray = [];
  const cursorDecode = Buffer.from(after, 'base64').toString('ascii');
  const condition = {
    take: first
  };
  if (cursorDecode) {
    condition.where = {
      id: {
        gt: cursorDecode
      }
    };
  }

  const edges = await model.findMany(condition);
  for (let i = 0; i < edges.length; i += 1) {
    const edge = edges[i];
    edgesArray.push({
      cursor: Buffer.from(edge.id.toString()).toString('base64'),
      node: {
        id: edge.id,
        item: edge
      }
    });
  }
  const startCursor = edgesArray.length > 0 ? edgesArray[0].cursor : NaN;
  const endCursor = edgesArray.length > 0 ? edgesArray[edgesArray.length - 1].cursor : NaN;
  let hasPrevPage = false;
  let hasNextPage = false;
  if (startCursor) {
    const startCursorDecode = Buffer.from(startCursor, 'base64').toString('ascii');
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
    const endCursorDecode = Buffer.from(endCursor, 'base64').toString('ascii');
    const count = await model.count({
      where: {
        id: {
          gt: endCursorDecode
        }
      }
    });
    hasNextPage = count > 0;
  }

  const totalCount = await model.count();
  return {
    edges: edgesArray,
    totalCount,
    pageInfo: {
      endCursor,
      hasPrevPage,
      hasNextPage
    }
  };
};
