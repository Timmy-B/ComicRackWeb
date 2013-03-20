namespace BCR
{
    using System.Collections.Generic;
    using System.Collections.Specialized;
    using Nancy.Security;

    public class BCRUser : IUserIdentity
    {
        public string UserName { get; set; }
        public int UserId { get; set; }
        

        public IEnumerable<string> Claims { get; set; }
        
        
        public bool SetAccessLevel()
        {
          return false;
        }
        
        public bool SetPassword()
        {
          return false;
        }

        public void UpdateSettings(UserSettings settings)
        {
          settings.Save(this);
        }
        
        public UserSettings GetSettings()
        {
          UserSettings settings = new UserSettings();
          settings.Load(this);
          return settings;
        }
    }
}