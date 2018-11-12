import { resolve } from 'path';
import { readFileSync } from 'fs';
import * as Client from 'fabric-client';
import { IEnrollmentRequest, IRegisterRequest } from 'fabric-ca-client';
import { ClientHelper, ClientConfig } from '@worldsibu/convector-common-fabric-helper';

export type UserParams = IRegisterRequest;
export type AdminParams = IEnrollmentRequest;

export class Registry extends ClientHelper {
  static async create(config: ClientConfig) {
    config.keyStore = resolve(process.cwd(), config.keyStore);
    await Client.newDefaultKeyValueStore({ path: config.keyStore });

    const registry = new Registry(config);
    await registry.init();

    return registry;
  }

  static async createFromFile(configPath: string) {
    try {
      const config: ClientConfig =
        JSON.parse(readFileSync(resolve(process.cwd(), configPath), 'utf8'));

      config.keyStore = resolve(configPath, config.keyStore);

      return await this.create(config);
    } catch (e) {
      console.log('Error while reading config file', e);
    }
  }

  constructor(public config: ClientConfig) {
    super(config);
  }

  public async init() {
    await super.init();

    const cryptoSuite = Client.newCryptoSuite();
    const cryptoStore = Client.newCryptoKeyStore({ path: this.config.keyStore });

    cryptoSuite.setCryptoKeyStore(cryptoStore);
    this.client.setCryptoSuite(cryptoSuite);
  }

  public async addAdmin(params: AdminParams, mspid: string) {
    const user = await this.client.getUserContext(params.enrollmentID, true);

    if (user && user.isEnrolled()) {
      return user;
    }

    const ca = this.client.getCertificateAuthority();

    const { key, certificate } = await ca.enroll(params);

    return await this.client.createUser({
      mspid,
      skipPersistence: false,
      username: params.enrollmentID,
      cryptoContent: {
        privateKeyPEM: key.toBytes(),
        signedCertPEM: certificate
      }
    });
  }

  public async addUser(params: UserParams, adminUsername: string, mspid: string) {
    const admin = await this.client.getUserContext(adminUsername, true);

    if (!admin || !admin.isEnrolled()) {
      throw new Error(`Admin ${adminUsername} user is not enrolled ` +
        `when trying to register user ${params.enrollmentID}`);
    }

    const user = await this.client.getUserContext(params.enrollmentID, true);

    if (user && user.isEnrolled()) {
      return user;
    }

    const ca = this.client.getCertificateAuthority();

    const enrollmentSecret = await ca.register(params, admin);

    const { key, certificate } = await ca.enroll({
      enrollmentSecret,
      enrollmentID: params.enrollmentID
    });

    return await this.client.createUser({
      mspid,
      skipPersistence: false,
      username: params.enrollmentID,
      cryptoContent: {
        privateKeyPEM: key.toBytes(),
        signedCertPEM: certificate
      }
    });
  }
}
