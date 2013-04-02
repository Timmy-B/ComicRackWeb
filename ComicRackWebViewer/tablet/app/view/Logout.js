

Ext.define('Comic.view.Logout', {
    extend : 'Ext.form.Panel',
    xtype : 'logoutview',
    
    requires : ['Ext.form.FieldSet', 'Ext.field.Password'],
        
    config: {
      items: [
        {
            xtype: "toolbar",
            title: 'Badaap Comic Reader Logout',
            ui: 'light',
            docked: "top"
        },
        {
                xtype: "label",
                html: '',
                itemId: 'fullnametext'
            },
        {
          xtype: 'fieldset',
          title: '',
          items: [
            
            {
                xtype: "button",
                text: 'Logout',
                ui: 'action',
                itemId: 'submitbutton'
            }
          ]
        }
      ]
    }
});
