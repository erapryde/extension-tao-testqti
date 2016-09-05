/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016  (original work) Open Assessment Technologies SA;
 *
 * @author Alexander Zagovorichev <zagovorichev@1pt.com>
 */

/**
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_implv2p1.html#section10008 modalFeedback
 */

define([
    'jquery',
    'lodash',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/plugins/content/dialog/itemInlineMessage',
    'taoQtiTest/runner/plugins/content/dialog/itemAlertMessage',
    'ui/autoscroll'
], function ($, _, pluginFactory, inlineMessage, alertMessage, autoscroll) {
    'use strict';

    /**
     * Modal or inline type of the messages
     */
    var inlineMode;

    /**
     * Form of the feedback
     * by default dialog (modal) form
     */
    var messagePlugin;

    /**
     * All feedback messages
     */
    var renderedFeedbacks;

    /**
     * modalFeedback was resolved
     */
    var isDestroyed;

    function destroyFeedback(selfPlugin, feedback) {

        var removed = false;
        _.remove(renderedFeedbacks, function (storedFeedback) {

            var found = storedFeedback === feedback;
            if (found) {
                removed = true;
            }
            return found;
        });

        if (removed) {
            feedback.destroy();

            if (!renderedFeedbacks.length) {
                selfPlugin.trigger('resume');
            }
        }
    }

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'QtiModalFeedback',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();
            inlineMode = !!module.config().inlineModalFeedback;

            messagePlugin = inlineMode ? inlineMessage : alertMessage;
            renderedFeedbacks = [];
            isDestroyed = false;

            if (inlineMode) {
                testRunner
                    .off('plugin-resume.itemInlineMessage')
                    .on('plugin-resume.itemInlineMessage', function () {
                        self.destroy();
                    });
            } else {
                testRunner
                    .off('plugin-resume.itemAlertMessage')
                    .on('plugin-resume.itemAlertMessage', function (feedback) {
                        destroyFeedback(self, feedback);
                    });
            }

            testRunner.on('modalFeedbacks', function(renderingQueue) {
                self.render(renderingQueue);
            });
        },

        /**
         * Called during the runner's render phase
         */
        render: function render(renderingQueue) {
            var self = this;
            var testRunner = this.getTestRunner();

            if (renderingQueue.length) {

                _.each(renderingQueue, function (renderingToken) {

                    var feedback = messagePlugin(testRunner, testRunner.getAreaBroker());
                    feedback.init({
                        dom: renderingToken.feedback.render({
                            inline: inlineMode
                        }),
                        // for alerts will be used #modalMessages container
                        $container: inlineMode ? renderingToken.$container : null
                    });
                    feedback.render();

                    renderedFeedbacks.push(feedback);
                });

                // auto scroll to the first feedback, only for the "inline" mode
                if (inlineMode && renderedFeedbacks) {
                    autoscroll($('.qti-modalFeedback', testRunner.getAreaBroker().getContentArea()).first(), testRunner.getAreaBroker().getContentArea().parents('.content-wrapper'));
                }
            } else {
                self.trigger('resume');
            }

        },

        /**
         * Called during the runner's destroy phase
         * allow to run that function only once
         */
        destroy: function destroy() {
            var tFeedbacks, i;
            if (!isDestroyed) {
                isDestroyed = true;
                tFeedbacks = renderedFeedbacks.slice(0);
                for (i in tFeedbacks) {
                    destroyFeedback(this, tFeedbacks[i]);
                }
            }
        }
    });
});
