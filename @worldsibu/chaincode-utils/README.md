# Chaincode Utils

This module contains different utilities such as decorators to work on controllers and models for data validations and extraction.

## Usage of controller decorators

### Controller

Controllers need to be tagged in order to extract the namespace and register it in the target chaincode.

```ts
@Controller('my-controller')
class MyController { }
```

### Invokable

Not all the controller methods are invokable from the public chaincode, some of them might be just private helpers for internal use. Thus, we need to tag which methods are actually going to be exposed as a method in chaincode.

```ts
class MyController {
  @Invokable()
  public myInvokableMethod () { }
}
```

### Param

In chaincode, the params arrive all as a string array, but this is not convenient at all. The param method takes care to register and validate the number and type of params, verify the model content, and properly convert them to the expected type.

Param makes use of [yup](https://github.com/jquense/yup), so if you want, you can also pass a yup schema instead of a model

```ts
class MyModel { }

class MyController {
  public myInvokableMethod (
    @Param(MyModel)
    myModel: MyModel,
    @Param(yup.string())
    name: string
  ) { }
}
```

## Usage of model decorators

### Default

Some properties might have default values, but we don't really want to apply them all the times, for example, when you're expecting a partial object with changes to apply them as an update to an existing model. The defaults are applied only before storing an object in memory.

For convenience, the default can be either a value or a method, in cases when you want to execute some logic to get the default value.

```ts
class MyModel {
  @Default('unknown')
  public name: string;

  @Default(() => Date.now())
  public created: number;
}
```

### Read Only

There are some properties that you either want to assign in code and not allow any modification or that you want them to be assignable by the user but once in memory they cannot be changed. In either of those changes you need to assign a value once and disallow updates.

```ts
class MyModel {
  @ReadOnly()
  public type = 'my-model'; // Won't allow to change this

  @ReadOnly()
  public id: string; // Will wait for a value but once set it will reject others
}
```

### Validate

Since the values in chaincode arrive all as strings, you'll want to parse the values to the corresponding type. We make use of yup for this.

```ts
class MyModel {
  @Validate(yup.string())
  public name: string;

  @Validate(yup.array(yup.string()))
  public tags: string[];
}
```

### Required

This decorator makes sure that, before storing the model in memory, all the required properties have data.

```ts
class MyModel {
  @Required()
  public name: string;
}
```
