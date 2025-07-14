const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // Multer specific error
  if (err instanceof Error && err.message.includes("Only")) {
    return res.status(400).json({
      message: err.message
    });
  }

  // Multer field limit error (optional)
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      message: "Unexpected field. Please upload files in the correct field."
    });
  }

  // Other generic errors
  res.status(500).json({
    message: err.message || "Server Error"
  });
};

export default errorMiddleware;
