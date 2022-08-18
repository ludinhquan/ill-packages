import { Result } from 'oxide.ts';
import { IntegrationEvent } from '@domain';

export interface IIntegrationEventHandler {
  handle(event: IntegrationEvent): Promise<Result<unknown, Error>>;
}
