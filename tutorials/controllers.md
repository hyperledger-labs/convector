# Controllers

We define controllers as the business logic applied to models.
Every possible action over a model, should be configured thought controllers.

The package `@worldsibu/convector-core-controller` contains the necessary code to create controllers. Here's an example of one:

```typescript
import * as yup from 'yup';
import {
  Controller, ConvectorController, Invokable, Param
} from '@worldsibu/convector-core-controller';

@Controller('test-controller')
export class TestController extends ConvectorController {
  @Invokable()
  public async init( @Param(yup.string()) token: Token ) {
    
  }
}
```

The first thing to notice is we're extending `ConvectorController`. This is a really thin class, only containing the basic information of the sender and the transaction.

The `@Controller` decorator let Convector know this class is a controller, and all its methods should be available in the chaincode using the namespace provided.

The `@Invokable` decorator let Convector know all the available methods in this controller. You can probably have more methods in this class, but not all of them are exposed in the chaincode API

Finally, the `@Param` decorator parses the arguments coming in the transactions to the appropriate schema you define. You can also use Models as schemas and they will be instantiated and validated for you.
