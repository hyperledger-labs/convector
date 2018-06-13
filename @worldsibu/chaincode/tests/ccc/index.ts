import { Controller, Invokable, Param } from '@worldsibu/chaincode-utils';

@Controller('test')
export class TestController {
  @Invokable()
  public async test() {
    // EMPTY
  }
}
