using System;
using System.Collections.Generic;
using System.Linq;
using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Engine.Database;


namespace ComicRackWebViewer
{
    /*
    public class BCRSettingsStore {
      public bool open_current_comic_at_launch { get; set; }
      public bool open_next_comic { get; set; }
      public int page_fit_mode { get; set; }
      public int zoom_on_tap { get; set; }
      public int toggle_paging_bar { get; set; }
      public bool use_page_turn_drag { get; set; }
      public int page_turn_drag_threshold { get; set; }
      public bool use_page_change_area { get; set; }
      public int page_change_area_width { get; set; }
    }
    */
  
  
    // (Smart/Folder/Item) list
    public class ComicList
    {
        public string Name { get; set; }
        public Guid   Id { get; set; }
        public int    ListsCount { get; set; }
        public IEnumerable<ComicList> Lists { get; set; }
        public string Type { get; set; }
    }
  
    // Collection of books from a FolderList
    public class BooksList
    {
        public string Name { get; set; }
        public Guid   Id { get; set; }
        public IEnumerable<Comic> Comics { get; set; }
        public bool IsDesc { get; set; }
    }
	
    public class Publisher
    {
        public string Name { get; set; }
        public string Imprint { get; set; }
    }

    public class Series : IEquatable<Series>
    {
        public string Title { get; set; }
        public int Volume { get; set; }
        public Guid Id { get; set; }
        public int Count { get; set; }

        public bool Equals(Series other)
        {
            return Title.Equals(other.Title) && (Volume.Equals(other.Volume));
        }

        public override bool Equals(object obj)
        {
            var series = obj as Series;
            if (series == null)
            {
                return false;
            }
            return Equals(series);
        }

        public override int GetHashCode()
        {
            return Title.GetHashCode() ^ Volume.GetHashCode() * 29;
        }
    }

    public class ComicDate : IComparable<ComicDate>, IComparable
    {
        public ComicDate(int year, int month)
        {
            Year = year;
            Month = month;
        }

        public int Year { get; set; }
        public int Month { get; set; }


        public int CompareTo(ComicDate other)
        {
            if (Year == other.Year)
            {
                return Month.CompareTo(other.Month);
            }
            return Year.CompareTo(other.Year);
        }

        public int CompareTo(object obj)
        {
            var date = obj as ComicDate;
            if (date == null)
            {
                return -1;
            }
            return CompareTo(date);
        }
    }

    public class Comic
    {
        public string FilePath { get; set; }
        public string Title { get; set; }
        public int Volume { get; set; }
        public float Number { get; set; }
        public Guid Id { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public ComicDate Date { get; set; }
        public int PageCount { get; set; }
        public string AlternateSeries { get; set; }
        public int AlternateCount { get; set; }
        public string Summary { get; set; }
        public string Publisher { get; set; }
        public string Imprint { get; set; }
        public string Series { get; set; }
        public string Format { get; set; }
        public float Rating { get; set; }
        public string Writer { get; set; }
        public string Penciller { get; set; }
        public string Inker { get; set; }
        public string Colorist { get; set; }
        public string Letterer { get; set; }
        public string CoverArtist { get; set; }
        public string Editor { get; set; }
        public string Genre { get; set; }
        public string Tags { get; set; }
        public string Characters { get; set; }
        public string Teams { get; set; }
        public string Locations { get; set; }
        public string Web { get; set; }
        public string Notes { get; set; }
        public string ScanInfo { get; set; }
        public string Opened { get; set; }
        public int LastPageRead { get; set; }
    }


    public static class EntityExtensions
    {
        public static IEnumerable<Series> AsSeries(this IEnumerable<ComicBook> comics)
        {
            return comics.Select(x => x.ToSeries()).Distinct();
        }

               
        public static ComicList ToComicList(this ComicListItem x, int depth = -1)
        {
          ComicList list = new ComicList{
            Name = x.Name,
            Id = x.Id,
            ListsCount = 0,
            Type = x.GetType().ToString().Split('.').LastOrDefault()
          };
          
          ComicListItemFolder folderList = x as ComicListItemFolder;
          if (folderList != null)
          {
            list.ListsCount = folderList.Items.Count;
            // recurse ?
            if (depth != 0)
            {
              list.Lists = folderList.Items.Select(c => c.ToComicList(depth-1));
            }
          }
          
          return list;
        }
         
        public static Comic ToComic(this ComicBook x)
        {
          
            float f;
            if (!float.TryParse(x.Number, out f))
            {
                f = -1;
            }
            string title = x.Title;
            if (string.IsNullOrEmpty(title))
            {
                title = x.Caption;
            }
            return new Comic
                    {
                        Title = title,
                        Volume = x.Volume,
                        Id = x.Id,
                        FilePath = x.FilePath,
                        Number = f,
                        Year = x.Year,
                        Month = x.Month,
                        Date = new ComicDate(x.Year, x.Month),
                        PageCount = x.PageCount,
                        AlternateCount = x.AlternateCount,
                        AlternateSeries = x.AlternateSeries,
                        Summary = x.Summary,
                        Publisher = x.Publisher,
                        Imprint = x.Imprint,
                        Series = x.Series,
                        Format = x.Format,
                        Rating = x.Rating,
                        Writer = x.Writer,
                        Penciller = x.Penciller,
                        Inker = x.Inker,
                        Colorist = x.Colorist,
                        Letterer = x.Letterer,
                        CoverArtist = x.CoverArtist,
                        Editor = x.Editor,
                        Genre = x.Genre,
                        Tags = x.Tags,
                        Characters = x.Characters,
                        Teams = x.Teams,
                        Locations = x.Locations,
                        Web = x.Web,
                        Notes = x.Notes,
                        ScanInfo = x.ScanInformation,
                        Opened = x.OpenedTimeAsText,
                        LastPageRead = x.LastPageRead
                    };
        }

        public static Series ToSeries(this ComicBook x)
        {
            return new Series
                    {
                        Title = x.Series,
                        Volume = x.Volume,
                        Id = x.Id,
                    };
        }
        
    }
}
