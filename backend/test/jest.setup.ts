jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    genSalt: jest.fn().mockResolvedValue('salt'),
    compare: jest
      .fn()
      .mockImplementation((s: string, hash: string) =>
        Promise.resolve(`hashed-${s}` === hash),
      ),
    hash: jest
      .fn()
      .mockImplementation((s: string) => Promise.resolve(`hashed-${s}`)),
  },
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));
