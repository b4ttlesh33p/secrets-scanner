import { Injectable, OnModuleInit } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { FunctionConfiguration } from 'aws-sdk/clients/lambda';
import { secrets } from 'secrets';

@Injectable()
export class AppService implements OnModuleInit{
  secretsManager = new AWS.SecretsManager()
  lambda = new AWS.Lambda()
  secrets = secrets

  lambdaFunctions
  lambdasScannedSecrets

  async onModuleInit() {
    await this.getLambdas() // normally this would be the result of a step function that seperatly gets all lambda functions, gets all secrets and then runs the secret scanning logic. after that i would save the data in a DB and return results directly from it, so the insight fetching process is detached from the scanning process
    this.lambdasScannedSecrets = this.lambdaFunctions.reduce((previous, current) => {
      return [...previous, ...this.findSecretsInLambda(current)]
    }, [])
  }

  private async getLambdas() {
    this.lambdaFunctions = (await this.lambda.listFunctions().promise()).Functions
  }


  private findSecretsInLambda(lambda: FunctionConfiguration){
    return secrets.reduce((previous, current) => { 
      if (Object.values(lambda.Environment?.Variables).includes(current.SecretString))
        return [...previous, current.ARN]
      return previous
    }, []) 
  }

  getExposedSecrets({limit = 100, offset = 0}: {limit: number, offset: number}): string[] {
    return this.lambdasScannedSecrets.slice(offset, limit)
  }

  deleteSecret(id: string): any {
    const data = this.secretsManager.deleteSecret({SecretId: id, ForceDeleteWithoutRecovery: true})
    return data
  }
}
