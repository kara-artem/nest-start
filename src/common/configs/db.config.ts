import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { ConfigService } from '@nestjs/config';

export const getPostgresConfig = async (configService: ConfigService): Promise<PostgresConnectionOptions> => {
  return {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: Number(configService.get('POSTGRES_PORT')),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    entities: [__dirname + '/../../**/**/*.entity{.ts,.js}'],
    synchronize: true,
    migrationsRun: false,
    logging: false,
  };
};
