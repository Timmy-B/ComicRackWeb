Ext.define('Comic.controller.Login', {
    extend: 'Ext.app.Controller',
    requires: [ 
      'Comic.view.Main',
      'Comic.view.Login',
      'Comic.view.Logout',
      'Comic.RemoteApi',
    ],
    config: {
        refs: {
          mainview: 'mainview',
          loginview: 'loginview', 
          loginbutton: 'loginview #submitbutton',
          logoutbutton: 'logoutview #submitbutton',
        },
        control: {
            loginbutton: {
              tap: 'onLogin'
            },
            logoutbutton: {
              tap: 'onLogout'
            }
        }
    },
    
    //called when the Application is launched, remove if not needed
    launch: function(app) {
        console.log('Comic.controller.Login loaded');
    },
    
    onLogin: function () {
        var loginForm=this.getLoginview();
        var loginFormValues=loginForm.getValues();
        
        Comic.RemoteApi.Login(loginFormValues.username, loginFormValues.password, true, function(success)
        {
          if (success)
          {
            console.log('Login successful');
                        
            Ext.Viewport.remove(loginForm);
            Ext.Viewport.add(Ext.create('Comic.view.Main'));
          }
          else
          {
            console.log('Login failed');
            
            Ext.Msg.alert('Login failed', 'Bad username or password');
          }
        });
    },
    
    onLogout: function() {
      var mainview = this.getMainview();
      Comic.RemoteApi.Logout(function(success) {
        Ext.Viewport.remove(mainview);
        Ext.Viewport.add(Ext.create('Comic.view.Login'));
      });
    }
});