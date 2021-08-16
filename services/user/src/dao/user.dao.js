exports.findUser = (args = {}, model) =>
  model.findFirst({
    where: {
      ...args
    }
  });

exports.findUsers = (args = {}, model) =>
  model.findMany({
    where: {
      ...args
    }
  });
