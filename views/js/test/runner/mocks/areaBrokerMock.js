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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'taoTests/runner/areaBroker'
], function ($, _, areaBroker) {
    'use strict';

    /**
     * The list of default areas
     * @type {string[]}
     */
    var defaultAreas = [
        'content',      //where the content is renderer, for example an item
        'toolbox',      //the place to add arbitrary tools, like a zoom, a comment box, etc.
        'navigation',   //the navigation controls like next, previous, skip
        'control',      //the control center of the test, progress, timers, etc.
        'header',       //the area that could contains the test titles
        'panel'         //a panel to add more advanced GUI (item review, navigation pane, etc.)
    ];

    var mockId = 0;

    /**
     * Gets the default container
     * @returns {*|jQuery|HTMLElement}
     */
    function getDefaultContainer() {
        return $('<div />').attr('id', 'area-broker-mock-' + (mockId++)).addClass('test-runner').appendTo('#qunit-fixture');
    }

    /**
     * Build and return a new areaBrocker with dedicated areas.
     * @param $container - The container in which make the rendering. Default to #qunit-fixture
     * @param areas - A list of areas to create
     * @returns {areaBroker} - Returns the new areaBrocker
     */
    function areaBrokerMock($container, areas) {
        var mapping = {};

        if (!$container) {
            $container = getDefaultContainer();
        }

        if (!areas) {
            areas = defaultAreas;
        } else {
            areas = _.keys(_.merge(_.object(areas), _.object(defaultAreas)));
        }

        if (typeof $container === 'string' || $container instanceof HTMLElement) {
            $container = $($container);
        }

        $container.empty();

        _.forEach(areas, function (areaId) {
            mapping[areaId] = $('<div />').addClass(areaId).appendTo($container);
        });

        return areaBroker($container, mapping);
    }

    return areaBrokerMock;
});
