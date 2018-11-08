# Models

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

Notice we're extending `ConvectorModel`. This class is full of rich methods you can use to manipulate the data.

There are multiple decorators you can use to model the data:

- `@ReadOnly()` - used when you want a property to be set once and then sealed to modifications
- `@Required()` - used when you want the property to be ensured there will be a value
- `@Default(val | () => val)` - used when you want to provide a default value before saving the data to the blockchain if there was no value provided
- `@Required(Schema|Model)` - used to validate the property to conform a format

## Usage

The children classes can be used in 1 of 3 ways:

### 1. As an model query

```ts
class MyModel extends ConvectorModel<MyModel> { ... }

const model = new MyModel(id);
model.fetch()
  .then(onModelFound)
  .catch(onModelNotFound);
```
or
```ts
class MyModel extends ConvectorModel<MyModel> { ... }

MyModel.getOne(id)
  .then(onModelFound);
```

### 2. As a param constructor and validator

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

### 3. As a container to start filling the model

```ts
class MyModel extends ConvectorModel<MyModel> { /* ... */ }

const myModel = new MyModel();
myModel.name = 'name';
myModel.info = 'info';
/* ... */
myModel.save();
```

## API

Models are based on `ConvectorModel<T>`, and it provides some basic *static* methods to use on models.

### Querying the chaincode

Some static methods are present for you to query the chaincode storage. All these methods are subject to the `storage` capabilities, for example, using `storage-couchdb` you will be able to query the database in a more fashin way, even using views or similar.

```typescript
// Get one of the models based on the ID
MyModel.getOne(id).then(onModelFound);

// Get all the elements based on the `type` field
MyModel.getAll('io.worldsibu.models.test').then(onModelsFound);

// Complex queries, depending on the `convector-storage` in use
MyModel.query({ amount: { $lte: 5 } }).then(onModelsFound);
```

### Basic properties

All models are required to have an `id` and a `type` field. The declaration of both can be omitted if wanted, but both of them must have a value. If you pass a string as the only param while instantiating a model, it will be used as the ID of that model.

### Base methods

- To fetch the model content from the ledger and load the data into a model use `async myModel.fetch()`, the ID must have been set before this
- To create or update a whole model in the blockchain you mut use `async myModel.save()`
- To update a portion of an existing model in the blockchain you must use `async myModel.update({ changes })`
- To delete the model content in the blockchain you must use `async myModel.delete()` however, notice that a delete in blockchain terms, is just removing the current value from the state, but the historical data will still be there and cannot be removed
- To clone a model you can use `myModel.clone()`
- To convert a model to json you can do `JSON.stringify(myModel)` or `myModel.toJSON()`
