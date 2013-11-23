using Nancy.Security;
using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Linq;
using ComicRackWebViewer;
using LinqToDB;

namespace BCR
{
  public class BCRUser : IUserIdentity
  {
    // Cache the entire list of comic progress, so we only need to perform one SQL lookup instead of
    // one per comic. This speeds up the displaying of a list of comics.
    public Dictionary<Guid, comic_progress> comicProgress2 = new Dictionary<Guid, comic_progress>();

    public Guid homeListId;

    public user_settings settings2 = new user_settings();

    public IEnumerable<string> Claims { get; set; }

    public string FullName { get; set; }

    public int UserId { get; set; }

    public string UserName { get; set; }

    public comic_progress GetComicProgress(Guid comicId)
    {
      comic_progress progress;
      if (comicProgress2.TryGetValue(comicId, out progress))
      {
        return progress;
      }

      return null;
    }

    public user_settings GetSettings()
    {
      return settings2;
    }

    public void Initialize()
    {
      settings2 = (from s in Database.Instance.DB.user_settings 
                  where s.user_id == UserId 
                  select s).Single();

      comicProgress2.Clear();

      var result = from comic in Database.Instance.DB.comic_progress
                    where comic.user_id == UserId
                    select comic;

      comicProgress2 = result.ToDictionary<comic_progress, Guid>((p) => { return Guid.Parse(p.comic_id); });
    }

    public void ResetComicProgress(Guid comicId)
    {
      comicProgress2.Remove(comicId);
      string comic_id = comicId.ToString();
      
      Database.Instance.DB.comic_progress
        .Where(p => p.comic_id == comic_id && p.user_id == UserId)
        .Delete();
    }

    public bool SetAccessLevel()
    {
      return false;
    }

    public bool SetPassword()
    {
      return false;
    }

    public void UpdateComicProgress(Guid comicId, int currentPage)
    {
      comic_progress progress2;
      if (comicProgress2.TryGetValue(comicId, out progress2))
      {
        if (currentPage > progress2.last_page_read)
          progress2.last_page_read = currentPage;

        progress2.current_page = currentPage;
        progress2.date_last_read = System.DateTime.Now.ToString("s");

        Database.Instance.DB.Update(progress2);
      }
      else
      {
        progress2 = new comic_progress();
        progress2.comic_id = comicId.ToString();
        progress2.last_page_read = currentPage;
        progress2.current_page = currentPage;
        progress2.date_last_read = System.DateTime.Now.ToString("s");

        comicProgress2.Add(comicId, progress2);

        progress2.id = Convert.ToInt64(Database.Instance.DB.InsertWithIdentity(progress2));
        comicProgress2.Add(comicId, progress2);
        
      }
    }

    public void UpdateSettings(user_settings settings)
    {
      settings2 = settings;
      Database.Instance.DB.Update(settings2);
    }
    /*
    public Guid GetHomeList()
    {
      object homeListId = Database.Instance.ExecuteScalar("SELECT home_list_id FROM user_settings WHERE user_id = " + UserId + " LIMIT 1;");
      if (homeListId != null)
      {
        Guid listId = new Guid(homeListId.ToString());

        // Check if list still exists, if not, return main library.
        var list = Program.Database.ComicLists.FindItem(listId);
        if (list == null)
        {
          // Home list no longer exists, return main library.
          string s = "cYo.Projects.ComicRack.Engine.Database.ComicLibraryListItem";
          ComicListItem item = Program.Database.ComicLists.GetItems<ComicListItem>(false).FirstOrDefault((ComicListItem cli) => cli.GetType().ToString() == s);
          if (item != null)
          {
            listId = item.Id;
          }
        }

        return listId;
      }
    }
    */
  }
}