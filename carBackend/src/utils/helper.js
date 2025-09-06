const { default: mongoose } = require("mongoose");
function fail(res, msg) {
    return res.status(200).send({ status: false, message: msg, data: null });
};
  
function success(res, msg, data) {
    return res.status(200).send({ status: true, message: msg, data: data });
};
  
function error(res, msg, err) {
    return res.status(500).send({ status: false, message: msg || 'Internal Server Error' });
};

 function lookup(
    from,
    local,
    foreign,
    as,
    project = null,
    customPipeline = null
  ) {
    let obj = {
      $lookup: {
        from: from,
        localField: local,
        foreignField: foreign,
        as: as,
      },
    };
  
    if (project) {
      obj.$lookup.pipeline = [{ $project: project }];
    }
  
    if (customPipeline) {
      obj.$lookup.pipeline = customPipeline;
  
      if (project) {
        obj.$lookup.pipeline.push({ $project: project });
      }
    }
  
    return obj;
  };
  
function unwind(property, preserveNullAndEmptyArrays = true) {
    if (preserveNullAndEmptyArrays) {
      return {
        $unwind: {
          path: property,
          preserveNullAndEmptyArrays: true,
        },
      };
    } else {
      return {
        $unwind: property,
      };
    }
  };
  
function match(conditions) {
    return { $match: conditions };
  };
  
function project(fields) {
    return { $project: fields };
  };
  
  

module.exports = {
    fail,
    success,
    error,
    lookup,
    unwind,
    match,
    project
};  