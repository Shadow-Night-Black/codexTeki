import AbilityContext = require('../AbilityContext');
import BaseCard = require('../basecard');
import DrawCard = require('../drawcard');
import { CardGameAction, CardActionProperties } from './CardGameAction';
import { Locations, CardTypes, EventNames }  from '../Constants';

export interface AttachActionProperties extends CardActionProperties {
    attachment?: DrawCard,
}

export class AttachAction extends CardGameAction {
    name = 'attach';
    eventName = EventNames.OnCardAttached;
    targetType = [CardTypes.Character];
    
    constructor(properties: ((context: AbilityContext) => AttachActionProperties) | AttachActionProperties) {
        super(properties);
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as AttachActionProperties;
        return ['attach {1} to {0}', [properties.target, properties.attachment]];
    }

    canAffect(card: BaseCard, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties) as AttachActionProperties;
        if(!context || !context.player || !card || card.location !== Locations.PlayArea) {
            return false;
        } else if(!properties.attachment || properties.attachment.anotherUniqueInPlay(context.player) || !properties.attachment.canAttach(card, context)) {
            return false;
        }
        return card.allowAttachment(properties.attachment) && super.canAffect(card, context);
    }
    
    checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.parent, event.context, additionalProperties);
    }

    isEventFullyResolved(event, card: DrawCard, context: AbilityContext, additionalProperties): boolean {
        let { attachment } = this.getProperties(context, additionalProperties) as AttachActionProperties;
        return event.parent === card && event.card === attachment && event.name === this.eventName && !event.cancelled;
    }

    addPropertiesToEvent(event, card: DrawCard, context: AbilityContext, additionalProperties): void {
        let { attachment } = this.getProperties(context, additionalProperties) as AttachActionProperties;
        event.name = this.eventName;
        event.parent = card;
        event.card = attachment;
        event.context = context;
    }

    eventHandler(event): void {
        if(event.card.location === Locations.PlayArea) {
            event.card.parent.removeAttachment(event.card);
        } else {
            event.card.controller.removeCardFromPile(event.card);
            event.card.new = true;
            event.card.moveTo(Locations.PlayArea);
        }
        event.parent.attachments.push(event.card);
        event.card.parent = event.parent;
        if(event.card.controller !== event.context.player) {
            event.card.controller = event.context.player;
            event.card.updateEffectContexts();
        }
    }
}
