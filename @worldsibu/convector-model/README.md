# Convector Model

This module contains the base model to be used as a base for any other model.

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
