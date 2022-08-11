import { Type } from '@type';
import { IntegrationEvent } from '@domain';
import { IIntegrationEventHandler } from './integration-event-handler.port';

export interface IEventBus {
  publish(event: IntegrationEvent): void;

  subscribe(
    event: Type<IntegrationEvent>,
    handler: IIntegrationEventHandler,
  ): void;

  destroy(): Promise<void>;
}
