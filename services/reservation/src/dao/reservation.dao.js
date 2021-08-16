exports.findReservation = (args = {}, model) =>
  model.findFirst({
    where: {
      ...args
    }
  });
