import EventBus from "js-event-bus"

class EventBusSt {
  private static instance: EventBusSt
  public eventbus: EventBus

  private constructor() {
    this.eventbus = new EventBus()
  }

  public static getInstance(): EventBusSt {
    if (!EventBusSt.instance) {
      EventBusSt.instance = new EventBusSt()
    }
    return EventBusSt.instance
  }
}
export default EventBusSt
