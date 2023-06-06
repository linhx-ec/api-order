import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { LoggerModule } from 'nestjs-pino';
import { MongooseModule } from '@nestjs/mongoose';
import { CartsModule } from './carts/carts.module';
import { OutboxModule } from './outbox/outbox.module';
import RepositoryMongodbModule from '@linhx/nest-repo-mongodb';
import KafkaModule from '@linhx/nest-kafka';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { CommitEvent } from '@linhx/nest-repo/lib/decorators/transactional.interface';
import { TRANSACTIONAL_EVENT_COMMITTED } from '@linhx/nest-repo';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      dbName: process.env.MONGO_DB_NAME,
      replicaSet: process.env.MONGO_DB_REPLICA,
    }),
    EventEmitterModule.forRoot(),
    RepositoryMongodbModule.forRoot({
      eventEmitterProvider: {
        inject: [EventEmitter2],
        useFactory: (eventEmitter2: EventEmitter2) => {
          return {
            emit(data: CommitEvent) {
              return eventEmitter2.emit(TRANSACTIONAL_EVENT_COMMITTED, data);
            },
            onCommitted() {
              // use @OnEvent, so don't have to do anything
              return this;
            },
          };
        },
      },
    }),
    KafkaModule.forRoot({
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: process.env.KAFKA_BROKERS.split(','),
    }),
    OutboxModule,
    OrdersModule,
    CartsModule,
  ],
})
export class AppModule {}
