import { 
  registerDecorator, 
  ValidationOptions, 
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { BautismoEstado } from '../enums/bautismo-estado.enum';

// Validador para cédula (11 dígitos)
@ValidatorConstraint({ async: false })
export class IsValidCedulaConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return true; // Si es opcional y no se proporciona, es válido
    return /^\d{11}$/.test(value);
  }
}

export function IsValidCedula(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCedulaConstraint,
    });
  };
}

// Validador para teléfono (10 dígitos)
@ValidatorConstraint({ async: false })
export class IsValidPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return false;
    return /^\d{10}$/.test(value);
  }
}

export function IsValidPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPhoneConstraint,
    });
  };
}

// Validador para fecha de bautismo
@ValidatorConstraint({ async: false })
export class IsValidBautismoDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    
    // Si el estado no es BAUTIZADO, la fecha debe ser nula/vacía
    if (object.bautismoEstado !== BautismoEstado.BAUTIZADO) {
      return !value || value === '';
    }
    
    // Si es BAUTIZADO, la fecha es obligatoria
    if (!value) return false;
    
    // Validar que no sea fecha futura
    const fechaBautismo = new Date(value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return fechaBautismo <= hoy;
  }
}

export function IsValidBautismoDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidBautismoDateConstraint,
    });
  };
}

// Validador para fecha de nacimiento (entre 1 y 100 años)
@ValidatorConstraint({ async: false })
export class IsValidBirthDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return false;
    
    const fechaNacimiento = new Date(value);
    const hoy = new Date();
    
    // Calcular edad
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    
    // Validar que tenga entre 1 y 100 años
    return edad >= 1 && edad <= 100;
  }
}

export function IsValidBirthDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidBirthDateConstraint,
    });
  };
}

// Validador para fecha de ingreso (no futura)
@ValidatorConstraint({ async: false })
export class IsValidIngresoDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return true; // Opcional
    
    const fechaIngreso = new Date(value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return fechaIngreso <= hoy;
  }
}

export function IsValidIngresoDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidIngresoDateConstraint,
    });
  };
}