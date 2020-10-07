const MissingParamError = require('../helpers/missing-param-error');
const UnauthorizedError = require('../helpers/unauthorized-error');
const LoginRouter = require('./login-router');

const makeSut = () => {
  const authUseCaseSpy = {
    auth: jest.fn(),
  };
  const sut = new LoginRouter(authUseCaseSpy);
  return { sut, authUseCase: authUseCaseSpy };
};

describe('Login Router', () => {
  it('should be return 400 if no email is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        password: 'any',
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  it('should be return 400 if no password is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any@email.com',
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  it('should be return 500 if no httpRequest is provided', () => {
    const { sut } = makeSut();
    const httpResponse = sut.route();
    expect(httpResponse.statusCode).toBe(500);
  });

  it('should be return 500 if httpRequest has no body', () => {
    const { sut } = makeSut();
    const httpResponse = sut.route({});
    expect(httpResponse.statusCode).toBe(500);
  });

  it('should be called AuthUseCase with correct params', () => {
    const { sut, authUseCase } = makeSut();
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any',
      },
    };
    sut.route(httpRequest);
    expect(authUseCase.auth).toBeCalledWith(httpRequest.body.email, httpRequest.body.password);
  });

  it('should be return 401 when invalid credentials are provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid',
      },
    };
    httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(401);
    expect(httpResponse.body).toEqual(new UnauthorizedError());
  });
});
