/* @flow */

import paypal from 'src/index';
import { getElement } from '../../tests/common';

function renderCheckout() {
    paypal.Checkout.renderTo(window.top.frames[0], {

        payment: window.xprops.payment,
        onAuthorize(data, actions) : void {

            return window.xprops.onAuthorize({
                ...data,

                payment: {}

            }, {
                ...actions,

                payment: {
                    execute() {
                        // pass
                    },

                    get() : Object {
                        return {};
                    }
                },

                restart() {
                    renderCheckout();
                }
            });
        },

        onAuth() {
            // pass
        },

        onCancel: window.xprops.onCancel,
        commit: window.xprops.commit,
        locale: window.xprops.locale,
        testAction: window.xprops.testAction
    });
}

getElement('#button', document).addEventListener('click', (event : Event) => {
    renderCheckout();
});



