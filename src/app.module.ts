import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { LoggerModule } from 'nestjs-pino';
import { MongooseModule } from '@nestjs/mongoose';
import { CartsModule } from './carts/carts.module';
import { OutboxModule } from './outbox/outbox.module';
import RepositoryMongodbModule from '@linhx/nest-repo-mongodb';
import KafkaModule from '@linhx/nest-kafka';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    LoggerModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      dbName: process.env.MONGO_DB_NAME,
      replicaSet: process.env.MONGO_DB_REPLICA,
    }),
    RepositoryMongodbModule.forRoot(),
    KafkaModule.forRoot({
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: process.env.KAFKA_BROKERS.split(','),
    }),
    EventEmitterModule.forRoot(),
    OutboxModule,
    OrdersModule,
    CartsModule,
  ],
})
export class AppModule {}
