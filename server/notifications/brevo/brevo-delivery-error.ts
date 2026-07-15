export class BrevoDeliveryError extends Error {
  readonly fallbackEligible: boolean;
  readonly httpStatus?: number;

  constructor(
    message: string,
    options: { fallbackEligible: boolean; httpStatus?: number; code?: string },
  ) {
    super(message);
    this.name = "BrevoDeliveryError";
    this.fallbackEligible = options.fallbackEligible;
    this.httpStatus = options.httpStatus;

    if (options.code) {
      (this as Error & { code?: string }).code = options.code;
    }
  }
}
