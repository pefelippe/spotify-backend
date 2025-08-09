import { validateTokenFormat, createFieldValidator } from '../../../src/utils/validation'

describe('Validation Utils', () => {
  describe('validateTokenFormat', () => {
    it('should validate a correctly formatted JWT token', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      expect(validateTokenFormat(validToken)).toBe(true)
    })

    it('should reject token with wrong number of parts', () => {
      const invalidToken = 'invalid.token'
      expect(validateTokenFormat(invalidToken)).toBe(false)
    })

    it('should reject empty token', () => {
      expect(validateTokenFormat('')).toBe(false)
    })

    it('should reject token with empty parts', () => {
      const invalidToken = '..'
      expect(validateTokenFormat(invalidToken)).toBe(false)
    })
  })

  describe('createFieldValidator', () => {
    describe('required validation', () => {
      it('should validate required string field', () => {
        const validator = createFieldValidator({ field: 'name', required: true, type: 'string' })
        
        expect(validator('test')).toBeNull()
        expect(validator('')).toBe('name is required')
        expect(validator(undefined)).toBe('name is required')
        expect(validator(null)).toBe('name is required')
      })

      it('should validate required number field', () => {
        const validator = createFieldValidator({ field: 'age', required: true, type: 'number' })
        
        expect(validator(25)).toBeNull()
        expect(validator(undefined)).toBe('age is required')
        expect(validator(null)).toBe('age is required')
      })

      it('should validate required array field', () => {
        const validator = createFieldValidator({ field: 'items', required: true, type: 'array' })
        
        expect(validator([1, 2, 3])).toBeNull()
        expect(validator(undefined)).toBe('items is required')
        expect(validator(null)).toBe('items is required')
      })
    })

    describe('type validation', () => {
      it('should validate string type', () => {
        const validator = createFieldValidator({ field: 'name', type: 'string' })
        
        expect(validator('test')).toBeNull()
        expect(validator(123)).toBe('name must be a string')
        expect(validator(true)).toBe('name must be a string')
      })

      it('should validate number type', () => {
        const validator = createFieldValidator({ field: 'age', type: 'number' })
        
        expect(validator(25)).toBeNull()
        expect(validator('25')).toBe('age must be a number')
        expect(validator(NaN)).toBe('age must be a number')
      })

      it('should validate boolean type', () => {
        const validator = createFieldValidator({ field: 'active', type: 'boolean' })
        
        expect(validator(true)).toBeNull()
        expect(validator(false)).toBeNull()
        expect(validator('true')).toBe('active must be a boolean')
        expect(validator(1)).toBe('active must be a boolean')
      })

      it('should validate array type', () => {
        const validator = createFieldValidator({ field: 'items', type: 'array' })
        
        expect(validator([1, 2, 3])).toBeNull()
        expect(validator('not an array')).toBe('items must be an array')
        expect(validator(123)).toBe('items must be an array')
      })
    })

    describe('custom validator', () => {
      it('should use custom validator function', () => {
        const validator = createFieldValidator({
          field: 'email',
          validator: (value) => typeof value === 'string' && value.includes('@')
        })
        
        expect(validator('test@example.com')).toBeNull()
        expect(validator('invalid-email')).toBe('email is invalid')
        expect(validator(123)).toBe('email is invalid')
      })

      it('should use custom error message', () => {
        const validator = createFieldValidator({
          field: 'email',
          validator: (value) => typeof value === 'string' && value.includes('@'),
          message: 'Invalid email format'
        })
        
        expect(validator('invalid-email')).toBe('Invalid email format')
      })
    })

    describe('optional fields', () => {
      it('should handle optional fields', () => {
        const validator = createFieldValidator({ field: 'description', type: 'string' })
        
        expect(validator(undefined)).toBeNull()
        expect(validator(null)).toBeNull()
        expect(validator('')).toBeNull()
        expect(validator('test')).toBeNull()
        expect(validator(123)).toBe('description must be a string')
      })
    })
  })
}) 