import {IEventHandler, IntegrationEvent} from '../events';

export interface IEventBusSubscriptionsManager {
  addSubscription(
    event: ClassType<IntegrationEvent>,
    handler: IEventHandler,
  ): void;

  hasSubscriptionsForEvent(eventName: string): boolean;

  getHandlersForEvent(eventName: string): IEventHandler[];

  getHandlers(): IEventHandler[];
}
