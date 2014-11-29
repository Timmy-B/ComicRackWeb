/*
  Icon spinner field
  
  Original code:
  http://davehiren.blogspot.nl/2012/04/sencha-touch-spinner-field-change.html
*/
  
Ext.define('Ext.ux.IconSpinner', {
  extend: 'Ext.field.Spinner',
  xtype: 'iconspinnerfield',

  requires: [
    'Ext.field.Spinner'
  ],
  config: {
    iconPlusDisabled: 'resources/images/spinner-plus.png',
    iconMinusDisabled: 'resources/images/spinner-minus.png',
    iconPlusEnabled: 'resources/images/spinner-plus-color.png',
    iconMinusEnabled: 'resources/images/spinner-minus-color.png',
  },

  initialize: function()
  {
    this.on('disabledchange', this.onDisabledChange);
  },
  
  onDisabledChange: function( spinner, value, oldValue, eOpts )
  {
    var me = this;
    me.spinDownButton.setHtml('<img class="icon-spinner-button" src="' + me.getImageMinus() + '"/>');
    me.spinUpButton.setHtml('<img class="icon-spinner-button" src="' + me.getImagePlus() + '"/>');
  },

  updateComponent: function (newComponent) {
        this.callParent(arguments);

        var innerElement = this.innerElement,
            cls = this.getCls();

        if (newComponent) {
            this.spinDownButton = Ext.Element.create({
                cls: 'minusButton',
                html: '<img class="icon-spinner-button" src="' + this.getImageMinus() + '"/>'
            });

            this.spinUpButton = Ext.Element.create({
                cls:'plusButton',
                html: '<img class="icon-spinner-button" src="' + this.getImagePlus() + '"/>'
            });

            this.downRepeater = this.createRepeater(this.spinDownButton, this.onSpinDown);
            this.upRepeater = this.createRepeater(this.spinUpButton, this.onSpinUp);
        }
  },

  getImageMinus: function ()
  {
    return this.isDisabled() ? this.getIconMinusDisabled() : this.getIconMinusEnabled();
  },
  getImagePlus: function () {
    return this.isDisabled() ? this.getIconPlusDisabled() : this.getIconPlusEnabled();
  }

});