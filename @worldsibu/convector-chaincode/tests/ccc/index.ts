import { Controller, Invokable, Param } from '@worldsibu/convector-controller';

@Controller('test')
export class TestController {
  @Invokable()
  public async test() {
    // EMPTY
  }
}
