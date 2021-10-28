/* @flow */

import { type Personalization } from '../props';

import { setupDivideLogoAnimation, } from './divide-logo-animation';
import { setupSlideLogoAnimation } from './slide-logo-animation';
import { type ButtonAnimationOutputParams } from './types';


export function getButtonAnimation(personalization : ?Personalization) : ButtonAnimationOutputParams | Object {
    if (!personalization || __WEB__) {
        return {};
    }

    const {
        buttonAnimation: {
            id: animationId = '',
            text: animationLabelText = 'Safe and easy way to pay'
        } = {}
    } = personalization;
    if (animationId === 'run-divide-logo-animation') {
        return setupDivideLogoAnimation(animationLabelText);
    } else if (animationId === 'alternate-slide-logo-animation') {
        return setupSlideLogoAnimation(animationLabelText);
    }

    return {};
}
