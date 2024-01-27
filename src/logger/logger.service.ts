import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as winston from 'winston';
import { LogLevel } from './enums/enums';

@Injectable()
export class LoggerService implements OnModuleDestroy {
  private readonly _logger: winston.Logger;

  constructor() {
    this._logger = winston.createLogger({
      format: this.createFormat(),
      level: LogLevel.Info,
      levels: Object.fromEntries(
        Object.entries(LogLevel).map(([key, value], index) => [value, index]),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  private createFormat() {
    return winston.format.combine(
      winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss.SSS' }),
      winston.format.printf((info) => {
        return `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`;
      }),
    );
  }

  getLevel() {
    return this._logger.level;
  }

  setLevel(level: string) {
    this._logger.level = level;
  }

  log(message: any, ...optionalParams: any[]): void {
    this.logger.log(message, { ...optionalParams });
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  debug(message: string, metadata?: Record<any, any>): void {
    this.logger.debug(message, metadata);
  }

  info(message: string, metadata?: Record<any, any>): void {
    this.logger.info(message, metadata);
  }

  error(
    message: string,
    metadata?: Record<string, any>,
    error?: unknown,
  ): void {
    if (error instanceof Error && metadata) {
      metadata['error'] = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }
    this.logger.error(message);
  }

  async onModuleDestroy(): Promise<void> {
    await new Promise((resolve) => {
      this.logger.once('finish', () => {
        this.logger.end();
        return resolve(null);
      });
    });
  }

  private get logger(): winston.Logger {
    return this._logger;
  }
}
