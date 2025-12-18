/**
 * Shared response helpers to keep API envelopes consistent.
 * Shape:
 *   { success: boolean, data: any, message: string | null, errorCode: string | null }
 */
const buildSuccess = (data = null, message = null) => ({
  success: true,
  data,
  message,
  errorCode: null,
});

const buildError = (message, { errorCode = 'INTERNAL_ERROR', data = null } = {}) => ({
  success: false,
  data,
  message,
  errorCode,
});

/**
 * Send a success response with optional extra fields (e.g., timestamp, meta).
 */
const sendSuccess = (res, data = null, { message = null, status = 200, extra = {} } = {}) =>
  res.status(status).json({
    ...buildSuccess(data, message),
    ...extra,
  });

const sendError = (res, message, { status = 500, errorCode = 'INTERNAL_ERROR', data = null } = {}) =>
  res.status(status).json(buildError(message, { errorCode, data }));

module.exports = {
  buildSuccess,
  buildError,
  sendSuccess,
  sendError,
};

