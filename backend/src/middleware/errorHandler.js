const { Prisma } = require("@prisma/client");

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === "LIMIT_FILE_SIZE") { status = 413; message = "File too large (max 5 MB)"; }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") { status = 404; message = "Record not found"; }
    if (err.code === "P2003") { status = 400; message = "Invalid reference (related record does not exist)"; }
    if (err.code === "P2002") { status = 409; message = "Already exists"; }
  }

  if (status >= 500) console.error(err.stack);
  res.status(status).json({
    success: false,
    error: status >= 500 && process.env.NODE_ENV === "production" ? "Internal Server Error" : message
  });
};

module.exports = errorHandler;
