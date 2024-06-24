import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('getcloudtrailsecrets')
  getCloudTrailSecrets(){
  }

  @Get('getexposedsecrets')
  getExposedSecrets(
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0
  )  {
    return this.appService.getExposedSecrets({limit, offset});
  }

  @Delete('deletesecret/:id')
  async deleteSecret(@Param('id') id: string): Promise<void> {
    return this.appService.deleteSecret(id)
  }
}
