
/* global SubmarineCable */
import Component from '@ember/component';
import { getOwner } from '@ember/application';
import $ from 'jquery';

export default Component.extend({
  classNames: ['map-container'],

  didInsertElement() {
    this._super(...arguments);
    const application = getOwner(this).application;
    $('body').find('.ember-view').first().addClass('map-container');

    if (!application.selectedCableIds) {
      application.set('selectedCableIds', []);
    }

    if (!application.map && application.mapConfig) {
      const mapConfig = Object.assign({}, application.mapConfig, {
        onCableClick: (feature, nativeEvt) => {
          const id =
            feature?.properties?.id ||
            feature?.id ||
            feature?.properties?.slug;
          if (!id) return;

          const isMulti = nativeEvt?.metaKey || nativeEvt?.ctrlKey;
          const set = new Set(application.selectedCableIds);

          if (set.has(id)) {
            set.delete(id);           
          } else {
            if (!isMulti) set.clear();
            set.add(id);              
          }
          application.set('selectedCableIds', Array.from(set));

          if (application.map?.refreshStyles) {
            application.map.refreshStyles(application.selectedCableIds);
          }
        },

        onMapClickBlank: () => {
          application.set('selectedCableIds', []);
          if (application.map?.refreshStyles) {
            application.map.refreshStyles([]);
          }
        },

        selectedIds: () => application.selectedCableIds
      });

      application.set('map', new SubmarineCable.Map('map', mapConfig));
    }
  }
});
