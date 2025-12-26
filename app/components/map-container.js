
/* global SubmarineCable */
import Component from '@ember/component';
import { getOwner } from '@ember/application';
// import $ from 'jquery';

function getFeatureId(feature) {
  if (!feature) { return null; }
  if (typeof feature.getProperty === 'function') {
    return feature.getProperty('slug') || feature.getProperty('id');
  }
  var props = feature.properties || {};
  return props.id || props.slug || feature.id || null;
}

export default Component.extend({
  classNames: ['map-container'],

  didInsertElement: function () {
    this._super.apply(this, arguments);
    var application = getOwner(this).application;

    // $('body').find('.ember-view').first().addClass('map-container');

    if (!application.selectedCableIds) {
      application.set('selectedCableIds', []);
    }

    if (!application.map && application.mapConfig) {
      var mapConfig = Object.assign({}, application.mapConfig, {
        onCableClick: function (feature, nativeEvt) {
          var id = getFeatureId(feature);
          if (!id) { return; }

          var isMulti = !!(nativeEvt && (nativeEvt.metaKey || nativeEvt.ctrlKey));
          var set = new Set(application.selectedCableIds || []);

          if (set.has(id)) {
            set.delete(id);
          } else {
            if (!isMulti) { set.clear(); } 
            set.add(id);
          }
          application.set('selectedCableIds', Array.from(set));

          if (application.map && typeof application.map.refreshStyles === 'function') {
            application.map.refreshStyles(application.selectedCableIds);
          }
        },

        onMapClickBlank: function () {
          application.set('selectedCableIds', []);
          if (application.map && typeof application.map.refreshStyles === 'function') {
            application.map.refreshStyles([]);
          }
        },

        selectedIds: function () { return application.selectedCableIds; }
      });

      application.set('map', new SubmarineCable.Map('map', mapConfig));
    }
  }
});
