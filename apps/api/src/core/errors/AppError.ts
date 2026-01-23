export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
export class ApiError extends AppError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
  }
}
