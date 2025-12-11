import { Injectable } from '@nestjs/common';

@Injectable()
export class PlaygroundService {
  getTestObject() {
    return { id: 1, name: 'Test Object' };
  }

  getTestArray() {
    return [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
  }
}
