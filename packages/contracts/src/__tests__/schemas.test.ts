import { loginSchema, vehicleProfileSchema } from '../index';

describe('Validation Schemas', () => {
  it('should validate valid login credentials', () => {
    const valid = { email: 'driver@example.com', password: 'securePassword123' };
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalid = { email: 'not-an-email', password: '123' };
    const result = loginSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate vehicle profile schema with canonical fields', () => {
    const validVehicle = {
      make: 'Hyundai',
      model: 'Creta',
      registrationNumber: 'MH02FZ4821',
      fuelType: 'PETROL' as const,
      dataSource: 'USER_CONFIRMED' as const,
    };
    const result = vehicleProfileSchema.safeParse(validVehicle);
    expect(result.success).toBe(true);
  });
});
