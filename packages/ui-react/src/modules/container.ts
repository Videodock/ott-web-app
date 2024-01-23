import 'reflect-metadata'; // include once in the app for inversify (see: https://github.com/inversify/InversifyJS/blob/master/README.md#-installation)

import { Container } from 'inversify';

const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

export { container };
