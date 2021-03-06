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
  it('should be return 400 if no email is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        password: 'any',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  it('should be return 400 if no password is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any@email.com',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  it('should be return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.route();
    expect(httpResponse.statusCode).toBe(500);
  });

  it('should be return 500 if httpRequest has no body', async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.route({});
    expect(httpResponse.statusCode).toBe(500);
  });

  it('should be return 500 if AuthUseCase throw', async () => {
    const { sut, authUseCase } = makeSut();
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any',
      },
    };
    authUseCase.auth = jest.fn().mockRejectedValue(new Error());
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
  });

  it('should be called AuthUseCase with correct params', async () => {
    const { sut, authUseCase } = makeSut();
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any',
      },
    };
    await sut.route(httpRequest);
    expect(authUseCase.auth).toBeCalledWith(httpRequest.body.email, httpRequest.body.password);
  });

  it('should be return 200 when valid credentials are provided', async () => {
    const { sut, authUseCase } = makeSut();
    const httpRequest = {
      body: {
        email: 'valid@email.com',
        password: 'valid',
      },
    };
    authUseCase.auth = jest.fn().mockReturnValue('valid');
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual({ accessToken: 'valid' });
  });

  it('should be return 401 when invalid credentials are provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(401);
    expect(httpResponse.body).toEqual(new UnauthorizedError());
  });
});
