# Convector Base Chaincode

This module contains the code to build chaincodes using a model/controller system, where the models describe the different objects and controllers handle the business logic in a separate layer.

This is meant to be used with Hyperledger Fabric, and thus rely on the [chaincode stub](https://fabric-shim.github.io/ChaincodeStub.html) to access and persist data.

All the controllers' methods are registered using the convention `controller_function`, this way, if you want to invoke a function called `create` in a controller called `person`, you need to invoke the method `person_create`.

It's necessary to invoke the method `initControllers` after instantiate or upgrade the chaincode in order to initialize the controller mapping.
