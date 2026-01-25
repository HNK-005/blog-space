import {
  RESPONSE_MESSAGE_KEY,
  ResponseMessage,
} from './response-message.decorator';

describe('Response Message', () => {
  it('should return the correct response message', () => {
    const message = 'Test message';
    const decorator = ResponseMessage(message);
    expect(typeof decorator).toBe('function');
    expect(decorator.KEY).toBe(RESPONSE_MESSAGE_KEY);
  });
});
