

Ext.define('Comic.view.Login', {
    extend : 'Ext.form.Panel',
    xtype : 'loginview',
    
    requires : ['Ext.form.FieldSet', 'Ext.field.Password'],
        
    config: {
      items: [
        {
            xtype: "toolbar",
            title: 'Badaap Comic Reader Login',
            ui: 'light',
            docked: "top",
        },
        {
          xtype: 'fieldset',
          //title: 'Badaap Comic Reader Login',
          items: [
            {
                xtype: 'textfield',
                name: 'username',
                label: 'Username',
                required: true
            },
            {
                xtype: 'passwordfield',
                name: 'password',
                label: 'Password',
                required: true
            }
          ]
        },
        {
          xtype: 'fieldset',
          title: '',
          items: [
            {
                xtype: "button",
                text: 'Ok',
                ui: 'action',
                itemId: 'submitbutton',
                //handler: this.onLoginButtonTap,
                //scope: this
            }
          ]
        }
      ]
    }
});
