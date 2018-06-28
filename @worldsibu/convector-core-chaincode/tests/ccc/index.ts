import { Controller, Invokable, Param } from '@worldsibu/convector-core-controller';

@Controller('test')
export class TestController {
  @Invokable()
  public async test() {
    // EMPTY
  }
}
