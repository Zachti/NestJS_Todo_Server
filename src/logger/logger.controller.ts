import { Controller, Get, Put, Query, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from './logger.service';
import { LogLevelValidationPipe } from './validators/logLevel.validator';

@Controller('logs')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get('level')
  getLogLevel(@Res() res: Response) {
    res.send(`Success: ${this.loggerService.getLevel().toUpperCase()}`);
  }

  @Put('level')
  @UsePipes(new LogLevelValidationPipe())
  setLogLevel(@Query('logger-level') level: string) {
    this.loggerService.setLevel(level);
    return `Success: ${this.loggerService.getLevel().toUpperCase()}`;
  }
}