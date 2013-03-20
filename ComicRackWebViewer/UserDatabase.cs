namespace BCR
{
    using Nancy.Security;
    using System;
    using System.Collections.Generic;
    using System.Collections.Specialized;
    using SaltedHash;
   
    
    public class UserDatabase
    {        
        static UserDatabase()
        {
        }

        public static IUserIdentity GetUserFromApiKey(string apiKey)
        {
          NameValueCollection result = Database.Instance.QuerySingle("SELECT * FROM user_apikeys WHERE apikey = '" + apiKey + "' LIMIT 1;");
          if (result == null)
            return null;
                    
          result = Database.Instance.QuerySingle("SELECT * FROM user WHERE id = " + result["user_id"] + " LIMIT 1;");
          if (result == null)
            return null;
          
          return new BCRUser {UserName = result["username"], UserId = Convert.ToInt32(result["id"])};
        }

        public static string LoginUser(string username, string password)
        {
          NameValueCollection result = Database.Instance.QuerySingle("SELECT * FROM user WHERE username = '" + username + "' LIMIT 1;");
          if (result == null)
            return null;
          
          SaltedHash sh = new SaltedHash();
          if (!sh.VerifyHashString(password, result["password"], result["salt"]))
          {
            // invalid password
            Console.WriteLine("Invalid password for user " + username);
            return null;
          }
          
          //now that the user is validated, create an api key that can be used for subsequent requests
          var apiKey = Guid.NewGuid().ToString();
          
          Database.Instance.ExecuteNonQuery("INSERT INTO user_apikeys (user_id, apikey) VALUES (" + result["id"] + ", '" + apiKey + "');");
          
          return apiKey;            
        }

        public static void RemoveApiKey(string apiKey)
        {
          Database.Instance.ExecuteNonQuery("DELETE FROM user_apikeys WHERE apikey = '" + apiKey + "';");
        }
        
        public static int GetUserId(string username)
        {
          object result = Database.Instance.ExecuteScalar("SELECT id FROM user WHERE username = '" + username + "' LIMIT 1;");
          if (result == null)
            return -1;          
          else
            return Convert.ToInt32(result);
        }
        
        public static bool AddUser(string username, string password)
        {
          SaltedHash sh = new SaltedHash();

          string hash;
          string salt;

          sh.GetHashAndSaltString(password, out hash, out salt);
          
          int result = Database.Instance.ExecuteNonQuery("INSERT INTO user (username, password, salt) VALUES ('" + username + "','" + hash + "','" + salt + "');");
          
          return result > 0;
        }
        
        public static bool RemoveUser(int userid)
        {
          int result = Database.Instance.ExecuteNonQuery("DELETE FROM user WHERE id = " + userid + ";");
          return result > 0;
        }
        
        public static bool SetPassword(int userid, string password)
        {
          // TODO: validate password strength
          // TODO: remove active api keys
          
          SaltedHash sh = new SaltedHash();

          string hash;
          string salt;

          sh.GetHashAndSaltString(password, out hash, out salt);
          
          int result = Database.Instance.ExecuteNonQuery("UPDATE user SET password='" + hash + "', salt='" + salt + "' WHERE id=" + userid + ";");
          
          return result > 0;
        }
        
        /*
        public static bool SetUsername(int userid, string username)
        {
          // TODO: check if username is unique
          int result = Database.Instance.ExecuteNonQuery("UPDATE user SET username='" + username + "' WHERE id=" + userid + ";");
          
          return result > 0;
        }
        */
        
        public static bool SetFullName(int userid, string fullname)
        {
          int result = Database.Instance.ExecuteNonQuery("UPDATE user SET fullname='" + fullname + "' WHERE id=" + userid + ";");
          
          return result > 0;
        }
        
        
    }
}