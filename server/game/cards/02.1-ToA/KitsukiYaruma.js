const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes, EventNames } = require('../../Constants');

class KitsukiYaruma extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Flip province facedown',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: card => !card.isBroken && !card.facedown
            },
            effect: 'turn {0} facedown',
            handler: context => {
                context.target.leavesPlay();
                if(context.target.isConflictProvince()) {
                    this.game.addMessage('{0} is immediately revealed again!', context.target);
                    context.target.inConflict = true;
                    this.game.raiseEvent(EventNames.OnCardRevealed, { context: context, card: context.target });
                } else {
                    context.target.facedown = true;
                }
            }
        });
    }
}

KitsukiYaruma.id = 'kitsuki-yaruma';

module.exports = KitsukiYaruma;
