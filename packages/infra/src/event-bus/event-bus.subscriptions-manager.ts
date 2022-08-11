import {Type, IEventBusSubscriptionsManager, IIntegrationEventHandler, IntegrationEvent} from "@ilotustech/common";
import {Injectable} from "@nestjs/common";

@Injectable({})
export class EventBusSubscriptionsManager implements IEventBusSubscriptionsManager{
  private handlers: Map<string, IIntegrationEventHandler[]> = new Map()

  addSubscription(event: Type<IntegrationEvent>, handler: IIntegrationEventHandler) {
    const eventName = event.name;
    const handlerName = handler.constructor.name

    if (!this.hasSubscriptionsForEvent(eventName)) this.handlers.set(eventName, []);

    const handlers = this.handlers.get(eventName) as IIntegrationEventHandler[];
    const existed = handlers.some(item => item.constructor.name === handlerName)

    if (existed) {
      throw new Error(`Handler Type ${handlerName} already registered for '${eventName}'`)
    }
    this.handlers.set(eventName, [...handlers, handler])
  }

  hasSubscriptionsForEvent(eventName: string): boolean {
    return this.handlers.has(eventName)
  }

  getHandlersForEvent(eventName: string): IIntegrationEventHandler[]{
    return this.handlers.get(eventName) ?? []
  }

  getHandlers(): IIntegrationEventHandler[] {
    return [...this.handlers].map(item => item[1]).flat()
  }
}
