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
    // code
  }
}
```

The first thing to notice is we're extending `ConvectorController`. This is a really thin class, only containing the basic information of the sender and the transaction.

The `@Controller` decorator let Convector know this class is a controller, and all its methods should be available in the chaincode using the namespace provided.

The `@Invokable` decorator let Convector know all the available methods in this controller. You can probably have more methods in this class, but not all of them are exposed in the chaincode API

Finally, the `@Param` decorator parses the arguments coming in the transactions to the appropriate schema you define. You can also use Models as schemas and they will be instantiated and validated for you.

## Usage

After the chaincode is installed and instantiated in the peers, the method [[Chaincode.initControllers]] is invoked. This method is responsible of iterating over all the controllers specified for the chaincode, imoport them, instantiate all of them and geister all its `@Invokable` methods in the chaincode to be accesible from the outside. In order to avoid method collitions between multiple controllers, the functions are registered under a namespace, the controller name provided in the `@Controller` decorator. All the methods get registered in the blokchain using the name `{controller}_{method}`.

## Anatomy of a Controller

Controllers are meant for you to validate permissions and update models. It is very usual (but not strict) that you'll have 3 main sections in your controller bodies:

- Validation - Check for permissions or other conditionals that might end up in throwing an error and cancelling the transaction
- Modification
- Store

```typescript
@Controller('token')
export class TokenController extends ConvectorController {
  @Invokable()
  public async transfer(
    @Param(yup.string()) to: string,
    @Param(yup.number()) amount: number
  ) {
    const token = await Token.getOne('TKN');

    // Validation phase
    if (token.balances[this.sender] < amount) {
      throw new Error('Sender does not have enough founds');
    }

    // Modification phase
    token.balances[this.sender] -= amount;
    token.balances[to] += amount;

    // Store
    await token.save();
  }
}
```

## Do and Don'ts

**Do** declare new public or private methods in the class to have common logic.
**Don't** call another `@Invokable` method directly from your controller, this will mess up the arguments since we're expecting some aditional parameters from the blockchain and not the ones you declare.

**Do** store information in blockchain using models.
**Don't** use any instance property inside a controller. The instance properties here are reset every time the controller is instantiated again.

**Do** use `this.sender` as a way to identify the tx sender and validate permissions.
**Don't** trust any parameter in your function as an identity validation, since anyone could have invoked you and moked that param.
