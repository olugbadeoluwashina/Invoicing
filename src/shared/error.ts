class AppError extends Error {
  
  constructor(message: string, private status: number, private errorType: string) {
    super(message);
    this.name = 'AppError';
    this.message = message;
    this.status = status;
    this.errorType = errorType;
  }
}

class ValidationError extends AppError {
  constructor(message: string) {  // just a string — no Zod awareness
    super(message, 422, "VALIDATION_ERROR");
  }
}

export { 
    AppError, ValidationError };
