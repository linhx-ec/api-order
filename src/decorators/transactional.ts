import { Db, TransactionStore } from '@linhx/nest-repo';
import { v4 as uuidv4 } from 'uuid';
import {
  TRANSACTION_STORE,
  transactionStore,
} from '../commons/transaction-store';
import {
  TRANSACTIONAL_EVENT_COMMITTED,
  TRANSACTIONAL_OPTIONS,
  TRANSACTIONAL_WATERMARK,
} from './constants';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TransactionalOptions } from './transactional.interface';

const alreadyOverrideTransactionalMethod = Symbol(
  'alreadyOverrideTransactionalMethod',
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const overrideTransactionalMethods = (target: Function) => {
  const proto = (target as any).prototype;

  const injectEventEmitter = Inject(EventEmitter2);
  injectEventEmitter(proto, '_eventEmitter_');

  const propertiesName = Object.getOwnPropertyNames(proto);
  for (const propertyName of propertiesName) {
    if (propertyName === 'constructor') {
      continue;
    }
    const desc = Object.getOwnPropertyDescriptor(proto, propertyName);

    const alreadyCreated: boolean = Reflect.getOwnMetadata(
      alreadyOverrideTransactionalMethod,
      proto,
      propertyName,
    );
    if (alreadyCreated) {
      break;
    }
    Reflect.defineMetadata(
      alreadyOverrideTransactionalMethod,
      true, // set alreadyCreated
      proto,
      propertyName,
    );

    const isTransactionalMethod: boolean = Reflect.getOwnMetadata(
      TRANSACTIONAL_WATERMARK,
      proto,
      propertyName,
    );

    const metadatas = Reflect.getMetadataKeys(desc.value).map((key) => {
      return [key, Reflect.getMetadata(key, desc.value)];
    });
    if (isTransactionalMethod) {
      overrideTrxMethod(proto, desc, propertyName);
    } else {
      overrideNonTrxMethod(proto, desc);
    }
    Object.defineProperty(proto, propertyName, desc);
    // redefine the old metadata of the method since the desc.value was changed
    metadatas.forEach((metadata) => {
      Reflect.defineMetadata(metadata[0], metadata[1], desc.value);
    });
  }
};

const genTrxUuid = (transactionStore: TransactionStore) => {
  for (let i = 0; i < 10; i++) {
    const trxUuid = uuidv4();
    if (!transactionStore.existsUuid(trxUuid)) {
      return trxUuid;
    }
  }
  throw new Error('Can not create transaction uuid');
};

const overrideTrxMethod = (
  target: Record<string, any>,
  descriptor: PropertyDescriptor,
  propertyName: string,
) => {
  const originalFunc = descriptor.value!;
  const options: TransactionalOptions = Reflect.getMetadata(
    TRANSACTIONAL_OPTIONS,
    target,
    propertyName,
  );
  descriptor.value = function (...args) {
    let trxUuid = transactionStore.getStore() as string;
    if (
      !trxUuid ||
      !TRANSACTION_STORE.hasTransaction(trxUuid) ||
      options?.new
    ) {
      const db: Db = this.db; // TODO not perfect (fixed name, still have to inject manually)
      if (!db) {
        throw new Error(
          `Must inject DB to ${target.constructor.name}: \`@Inject(DB_PROVIDER) private db: Db\``,
        );
      }
      trxUuid = genTrxUuid(TRANSACTION_STORE);
      return transactionStore.run(trxUuid, async () => {
        let committed = false;
        try {
          const res = await db.withTransaction(null, (_trx) => {
            TRANSACTION_STORE.set(trxUuid, _trx); // add transaction to the store
            return originalFunc.apply(this, args);
          });
          TRANSACTION_STORE.remove(trxUuid); // remove the transaction from the store
          committed = true;
          return res;
        } finally {
          // send event committed
          if (!options?.noEmitCommittedEvent) {
            (this._eventEmitter_ as EventEmitter2)?.emit(
              TRANSACTIONAL_EVENT_COMMITTED,
              {
                trxUuid,
                committed,
              },
            );
          }
        }
      });
    }
    return originalFunc.apply(this, args);
  };
};

const overrideNonTrxMethod = (
  target: Record<string, any>,
  descriptor?: PropertyDescriptor,
) => {
  const originalFunc = descriptor.value!;
  descriptor.value = function (...args) {
    const trxUuid = genTrxUuid(TRANSACTION_STORE);
    return transactionStore.run(trxUuid, () => {
      TRANSACTION_STORE.set(trxUuid, null); // add transaction to the store
      const val = originalFunc.apply(this, args);
      TRANSACTION_STORE.remove(trxUuid); // remove the transaction from the store
      return val;
    });
  };
};
