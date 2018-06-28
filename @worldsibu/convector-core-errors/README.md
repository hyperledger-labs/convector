# Convector Errors

This module contains standarized errors to use across all the other convector modules.

An error is just a class extending the base javascript Error object, with a static method `test` useful for the error class to validate if it should trigger or not.
