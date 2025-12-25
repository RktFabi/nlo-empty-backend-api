import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiException } from '../exceptions/api-exception';
import { ValidationErrors } from '../exceptions/errors/validation.errors';

@Injectable()
export class ApiValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.shouldValidate(metatype)) {
      return value;
    }

    const obj = plainToInstance(metatype, value);
    const errors = await validate(obj);

    if (errors.length > 0) {
      const firstError = errors[0];

      const field = firstError.property;
      const constraints = firstError.constraints || {};

      // Map validation constraints to error codes
      const error_code = this.getErrorCode(field, constraints);

      // Get the first constraint message
      const message = Object.values(constraints)[0] || 'Invalid input';

      throw new ApiException(
        error_code,
        message,
        400,
        {
          field,
          constraints: firstError.constraints,
          value: firstError.value,
        },
      );
    }

    return value;
  }

  private shouldValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private getErrorCode(field: string, constraints: Record<string, string>): string {
    // Check for specific field-based errors
    if (field === 'payment_method' && constraints.isIn) {
      return ValidationErrors.ERR_INVALID_PAYMENT_METHOD;
    }

    if (field === 'currency' && (constraints.isIn || constraints.isString)) {
      return ValidationErrors.ERR_INVALID_CURRENCY;
    }

    if (field === 'receipt_country' && constraints.isIn) {
      return ValidationErrors.ERR_UNSUPPORTED_RECEIPT_COUNTRY;
    }

    if (field === 'country' && constraints.isIn) {
      return ValidationErrors.ERR_INVALID_COUNTRY;
    }

    if (field === 'amount') {
      if (constraints.isPositive || constraints.min) {
        return ValidationErrors.ERR_AMOUNT_BELOW_MINIMUM;
      } else if (constraints.max) {
        return ValidationErrors.ERR_AMOUNT_ABOVE_MAXIMUM;
      }
    }

    // Check for address-related fields
    if (['street', 'city', 'province_state', 'zip_postal_code'].includes(field)) {
      return ValidationErrors.ERR_INVALID_ADDRESS;
    }

    // Default to missing required field for isNotEmpty, isString, isNumber, etc.
    return ValidationErrors.ERR_MISSING_REQUIRED_FIELD;
  }
}
