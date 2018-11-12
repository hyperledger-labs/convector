import { ConvectorController, Controller, Invokable, Param } from '@worldsibu/convector-core-controller';

@Controller('test')
export class TestController extends ConvectorController {
  @Invokable()
  public async test() {
    // EMPTY
  }
}
