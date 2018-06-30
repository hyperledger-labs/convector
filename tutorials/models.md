## Models

We define models as assets you interact with in a blockchain
Every data structure should be a model, since it defines what are the minimum necessary properties to be present.

The package `@worldsibu/convector-core-model` contains the necessary code to create models. Here's an example of one:

```typescript
import * as yup from 'yup';
import {
  ConvectorModel, ReadOnly, Required, Validate
} from '@worldsibu/convector-core-model';

export class ExampleModel extends ConvectorModel<ExampleModel> {
  @ReadOnly()
  @Validate(yup.string())
  public readonly type = 'io.worldsibu.examples.example-model';

  @Required()
  @Validate(yup.string())
  public name: string;

  @Required()
  @Validate(yup.number())
  @Default(() => Date.now())
  public updated: number;
}
```

Notice we're extending `ConvectorModel`. This class is full of rich methods you can use to manipulate the data. Checkout the ChaincodeModel for documentation.

There are multiple decorators you can use to model the data:

- `@ReadOnly()` - used when you want a property to be set once and then sealed to modifications
- `@Required()` - used when you want the property to be ensured there will be a value
- `@Default(val | () => val)` - used when you want to provide a default value before saving the data to the blockchain if there was no value provided
- `@Required(Schema|Model)` - used to validate the property to conform a format

## Usage

The children classes can be used in 1 of 3 ways:

### As an model query

```ts
class MyModel extends ConvectorModel<MyModel> { ... }

const model = new MyModel(id);
model.fetch()
  .then(onModelFound)
  .catch(onModelNotFound);
```

### As a param constructor and validator

```ts
class MyModel extends ConvectorModel<MyModel> { /* ... */ }

@Controller('my-controller')
class MyController {
  @Invokable()
  public async myMethod(
    @Param(MyModel)
    myModel: MyModel
  ) {
    myModel.save();
  }
}
```

### As a container to start filling the model

```ts
class MyModel extends ConvectorModel<MyModel> { /* ... */ }

const myModel = new MyModel();
myModel.name = 'name';
myModel.info = 'info';
/* ... */
myModel.save();
```
