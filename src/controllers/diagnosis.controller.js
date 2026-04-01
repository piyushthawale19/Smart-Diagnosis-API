const diagnosisService = require("../services/diagnosis.service");

const diagnose = async (req, res, next) => {
  try {
    const data = await diagnosisService.runDiagnosis({
      userId: req.user._id,
      symptoms: req.body.symptoms,
    });

    return res.status(200).json({
      success: true,
      message: "Diagnosis generated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const history = async (req, res, next) => {
  try {
    const data = await diagnosisService.getHistory({
      userId: req.user._id,
      page: req.query.page,
      pageSize: req.query.pageSize,
      from: req.query.from,
      to: req.query.to,
    });

    return res.status(200).json({
      success: true,
      message: "History fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  diagnose,
  history,
};
