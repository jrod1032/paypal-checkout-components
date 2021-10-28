/* @flow */
/** @jsx node */
import { LOGO_CLASS } from '@paypal/sdk-logos/src';
import { node, Fragment, type ChildType, type ElementNode } from 'jsx-pragmatic/src';

import { CLASS } from '../../../constants';
import { BUTTON_SIZE_STYLE } from '../config';

import type { ButtonAnimationOutputParams, LabelOptions, ButtonSizes } from './types';

export const ANIMATION = {
    LABEL_CONTAINER: ('divide-logo-animation-label-container' : 'divide-logo-animation-label-container'),
    CONTAINER:     ('fadeout-logo-and-show-label-animation' : 'fadeout-logo-and-show-label-animation'),
    ELEMENT:       ('fadeout-logo-and-show-label-animation-element' : 'fadeout-logo-and-show-label-animation-element'),
};

export function LabelForDivideLogoAnimation({ animationLabelText } : LabelOptions) : ChildType {
    // experimentName must match elmo experiment name
    const config = {
        labelText:      animationLabelText,
        labelClass:     ANIMATION.LABEL_CONTAINER,
        experimentName: 'Varied_Button_Design'
    };
   
    return (
        <Fragment>
            <div class={ config.labelClass } data-experiment={ config.experimentName }> <span>{config.labelText}</span></div>
            <style innerHTML={ `
                .${ CLASS.DOM_READY } .${ ANIMATION.CONTAINER } img.${ LOGO_CLASS.LOGO }{
                    position: relative;
                }
                
                .${ ANIMATION.CONTAINER } .${ ANIMATION.LABEL_CONTAINER } {
                    position: absolute;
                    opacity: 0; 
                    color: #142C8E;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    font-size: 16px;
                }
            ` } />;
        </Fragment>
    );
}

const getPositionsOfElementsForAnimation = function(document, configuration) : ResizeButtonAnimationDomElementPositions | null {
    const { ANIMATION_CONTAINER, PAYPAL_BUTTON_LABEL, PAYPAL_LOGO } = configuration.cssClasses;
    // get the animation main container to force specificity( in css ) and make sure we are running the right animation
    const animationContainer = (document && document.querySelector(`.${ ANIMATION_CONTAINER }`)) || null;
    // get the label container element having into account the animation container to force specificity in css
    const paypalLabelContainerElement = (animationContainer && animationContainer.querySelector(`.${ PAYPAL_BUTTON_LABEL }`)) || null;

    if (!animationContainer) {
        console.log('no animation container')
        return null;
    }
    
    // get paypal label container's width to calculate initial and final translate positions
    const paypalLabelContainerElementWith  = (paypalLabelContainerElement &&  paypalLabelContainerElement.offsetWidth) || 0;

    // find label text element
    const textElement = (paypalLabelContainerElement && paypalLabelContainerElement.querySelector('span')) || 0;
    // find label text dom element to help to calculate initial and final translate position
    const textElementWidth = (textElement && textElement.offsetWidth) || 0;
    // calculate initial translate position to start the animation with the text in that position
    const initialTranslateXTextPosition = (paypalLabelContainerElementWith - textElementWidth) / 2;
    
    // get the logo image element from dom to get the left position
    const logoElement = (paypalLabelContainerElement && paypalLabelContainerElement.querySelector(`.${ PAYPAL_LOGO }`)) || null;
    // get the left position of the logo element to later calculate the translate position
    const logoElementLeftPosition = (logoElement && logoElement.getBoundingClientRect().left) || 0;

    // get margin of paypal label container as an integer to later calculate logo translate position
    let marginPaypalLabelContainer = document.defaultView.getComputedStyle(paypalLabelContainerElement).getPropertyValue('margin-left');
    marginPaypalLabelContainer = marginPaypalLabelContainer ? parseInt(marginPaypalLabelContainer.replace('px', ''), 10) : 0;
    // calculate translate position based on the logo left position and margin of paypal label container
    const logoTranslateXPosition = logoElementLeftPosition - marginPaypalLabelContainer;
    return {
        initialTranslateXTextPosition,
        paypalLabelContainerElement,
        logoTranslateXPosition
    };
};

export function createReplaceLogoAnimation() : Function {
    return (params, cssClasses) : void => {
        const { initialTranslateXTextPosition, paypalLabelContainerElement, logoTranslateXPosition } = params;
        const { ANIMATION_LABEL_CONTAINER, ANIMATION_CONTAINER, DOM_READY, PAYPAL_LOGO, ANIMATION_LABEL_ELEMENT } = cssClasses;
        const animations = `
            .${ ANIMATION_CONTAINER }:hover img.${ PAYPAL_LOGO } {
                animation: move-logo-to-left 0.3s linear both;
            }
            
            .${ ANIMATION_CONTAINER }:hover .${ ANIMATION_LABEL_ELEMENT } {
                animation: fadein-label-text 2s linear both;
            }
            @keyframes move-logo-to-left {
                100%{
                    opacity: 0;
                    visibility: hidden;
                    opacity:0;
                    transition: visibility 0s 0, opacity 0.1s linear;
                    transform: translateX(-${ logoTranslateXPosition }px);
                }
            }
            @keyframes fadein-label-text {
                0%{
                    visibility: hidden;
                    opacity: 0;
                    transform: translateX(${ initialTranslateXTextPosition }px);
                }
                100% {
                    visibility: visible;
                    opacity: 1;
                    transform: translateX(${ initialTranslateXTextPosition }px);
                }
            }
        `;

        if (paypalLabelContainerElement) {
            const style = document.createElement('style');
            paypalLabelContainerElement.appendChild(style);
            style.appendChild(document.createTextNode(animations));
        }
    };
}

function animationConfiguration () : ButtonSizes {
    return {
        large:      { min: BUTTON_SIZE_STYLE.large.minWidth },
        huge:       { max: BUTTON_SIZE_STYLE.huge.maxWidth },
        tiny:       { min: BUTTON_SIZE_STYLE.tiny.minWidth },
        medium:     { max: BUTTON_SIZE_STYLE.medium.maxWidth },
        cssClasses: {
            DOM_READY:                  CLASS.DOM_READY,
            ANIMATION_CONTAINER:        ANIMATION.CONTAINER,
            PAYPAL_LOGO:                LOGO_CLASS.LOGO,
            ANIMATION_LABEL_CONTAINER:  ANIMATION.LABEL_CONTAINER,
            PAYPAL_BUTTON_LABEL:        CLASS.BUTTON_LABEL,
            ANIMATION_LABEL_ELEMENT:    ANIMATION.ELEMENT
        }
    };
}

export function setupSlideLogoAnimation (animationLabelText : string) : ButtonAnimationOutputParams {
    const animationProps = { animationLabelText };
    const animationFn = createReplaceLogoAnimation();
    const animationConfig = animationConfiguration();
    console.log('animationProps: ', animationProps)
    console.log('animationConfig: ', animationConfig)
    const buttonAnimationScript = `
        const elementPositionsForAnimation = ${ getPositionsOfElementsForAnimation.toString() }( document, ${ JSON.stringify(animationConfig) })
        console.log('elementPositionsForAnimation: ', elementPositionsForAnimation)
        if (elementPositionsForAnimation) {
            const animation = ${ animationFn.toString() }
            animation(elementPositionsForAnimation, ${ JSON.stringify(animationConfig.cssClasses) })
        }
    `;
    return {
        buttonAnimationContainerClass: ANIMATION.CONTAINER,
        buttonAnimationScript,
        buttonAnimationComponent:      (<LabelForDivideLogoAnimation { ...animationProps } />)
    };
}
