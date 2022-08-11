import {IntegrationEvent} from "@domain";
import {Type} from "@type";
import {IIntegrationEventHandler} from "./integration-event-handler.port";

export interface IEventBusSubscriptionsManager {
  addSubscription(event: Type<IntegrationEvent>, handler: IIntegrationEventHandler): void

  hasSubscriptionsForEvent(eventName: string): boolean

  getHandlersForEvent(eventName: string): IIntegrationEventHandler[]

  getHandlers(): IIntegrationEventHandler[]
}

