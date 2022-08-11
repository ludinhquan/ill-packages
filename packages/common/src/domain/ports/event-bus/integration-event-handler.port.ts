import { Result } from 'oxide.ts/dist';
import { IntegrationEvent } from '@domain';

export interface IIntegrationEventHandler {
  handle(event: IntegrationEvent): Promise<Result<unknown, Error>>;
}
