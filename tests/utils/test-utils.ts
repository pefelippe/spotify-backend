import { Request, Response } from 'express'
import { Container } from '../../src/container'

export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  method: 'GET',
  path: '/test',
  query: {},
  params: {},
  body: {},
  headers: {},
  ...overrides,
})

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
  }
  return res
}

export const createMockContainer = (): Container => {
  const mockAuthService = {
    getToken: jest.fn(),
    getRefreshToken: jest.fn(),
    validateToken: jest.fn(),
  }

  const mockAuthController = {
    login: jest.fn(),
    callback: jest.fn(),
    refreshToken: jest.fn(),
  }

  return {
    services: {
      authService: mockAuthService,
    },
    controllers: {
      authController: mockAuthController,
    },
  } as unknown as Container
}

export const mockNext = jest.fn() 