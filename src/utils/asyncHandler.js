const asynhandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)
    .catch((err) => next(err)));
  };
};


export default asynhandler;


// this is used to handle async errors in express routes and middlewares