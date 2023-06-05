import { Message, MessageService } from '@linhx/nest-kafka';
import { Inject } from '@nestjs/common';
import { Outbox } from './entities/outbox.entity';
import {
  OutboxRepository,
  OutboxRepositoryProviderName,
} from './outbox.repository';
import { Transactional } from '../decorators/transactional.decorator';
import { TRANSACTIONAL_EVENT_COMMITTED } from '../decorators/constants';
import { Service } from '../decorators/service.decorator';
import { OutBoxService } from './outbox.service';
import { OnEvent } from '@nestjs/event-emitter';
import { TRANSACTION_STORE } from '../commons/transaction-store';
import { CommitEvent } from '../decorators/transactional.interface';

@Service()
export class OutboxServiceImpl implements OutBoxService<Outbox> {
  constructor(
    @Inject(OutboxRepositoryProviderName)
    private readonly outboxRepo: OutboxRepository,
    private readonly messageService: MessageService,
  ) {}

  private trxHasOutbox = new Set<string>();

  @Transactional()
  async save(msg: Message): Promise<Outbox> {
    const outbox = await this.outboxRepo.createWithTrxUuid(msg);
    const trxUuid = TRANSACTION_STORE.getTransactionUuid();
    this.trxHasOutbox.add(trxUuid);
    return outbox;
  }

  @OnEvent(TRANSACTIONAL_EVENT_COMMITTED)
  @Transactional({ new: true, noEmitCommittedEvent: true })
  async sendByTrxUuid(payload: CommitEvent) {
    console.log('sendByTrxUuid', payload);
    const { trxUuid, committed } = payload;
    const hasOutbox = this.trxHasOutbox.has(trxUuid);
    this.trxHasOutbox.delete(trxUuid);
    if (!hasOutbox || !committed) {
      return;
    }
    const outboxes = await this.outboxRepo.findAll({
      transactionUuid: trxUuid,
    });
    if (!outboxes || !outboxes.length) {
      return;
    }
    await Promise.all(
      outboxes.map((outbox) => this.messageService.send(outbox)),
    );
    await this.outboxRepo.deleteMany({
      transactionUuid: trxUuid,
    });
  }
}
