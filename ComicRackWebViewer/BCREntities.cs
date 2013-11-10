using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Engine.Database;
using System;
using System.Collections.Generic;
using System.Linq;


namespace BCR
{
    // (Smart/Folder/Item) list
    public class ComicList
    {
        public string Name { get; set; }
        public Guid   Id { get; set; }
        public int    ListsCount { get; set; }
        public IEnumerable<ComicList> Lists { get; set; }
        public string Type { get; set; }
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
    
    public class SeriesVolume : IEquatable<SeriesVolume>
    {
        public string Title { get; set; }
        public int Volume { get; set; }
        public Guid Id { get; set; }
        public int Count { get; set; }

        public bool Equals(SeriesVolume other)
        {
            return Title.Equals(other.Title) && (Volume.Equals(other.Volume));
        }

        public override bool Equals(object obj)
        {
            var series = obj as SeriesVolume;
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
        public string Caption { get; set; }
        public string Title { get; set; }
        public int Volume { get; set; }
        public string Number { get; set; }
        public int Count { get; set; }
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
        public int CurrentPage { get; set; }
        
        public string ShadowSeries { get; set; }
        public string ShadowTitle { get; set; }
        public int ShadowVolume { get; set; }
        public string ShadowNumber { get; set; }
        public int ShadowCount { get; set; }
        public int ShadowYear { get; set; }
        public string ShadowFormat { get; set; }
    }
    
    
    
    // For displaying in the ComicList
    // Ideally I want to use the OData $select for this via Linq2Rest, but everytime I try to do
    // some $select operations ComicRack hangs in the Linq2Rest library. I have no idea why :(
    public class ComicExcerpt
    {
        public string FilePath { get; set; }
        public Guid Id { get; set; }
        public int Month { get; set; }
        public int PageCount { get; set; }

        public string Opened { get; set; }
        public int LastPageRead { get; set; }
        public int CurrentPage { get; set; }
        
        public string Caption { get; set; }
        
        public string ShadowSeries { get; set; }
        public string ShadowTitle { get; set; }
        public int ShadowVolume { get; set; }
        public string ShadowNumber { get; set; }
        public int ShadowCount { get; set; }
        public int ShadowYear { get; set; }
        public string ShadowFormat { get; set; }
    }

    public class ComicProgress
    {
        public Guid Id { get; set; }

        public string DateLastRead { get; set; }
        public int LastPageRead { get; set; }
        public int CurrentPage { get; set; }
        
        public int DatabaseId { get; set; }
    }

    public class SortSettings
    {
      public string OrderBy1 { get; set; }
      public bool Direction1 { get; set; }
      public string OrderBy2 { get; set; }
      public bool Direction2 { get; set; }
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
         
        public static Comic ToComic(this ComicBook x, BCRUser user)
        {
            
            ComicProgress progress = user.GetComicProgress(x.Id);

            return new Comic
                {
                    Id = x.Id,
                    FilePath = x.FilePath,
                    Caption = x.Caption,
                    
                    ShadowTitle = x.ShadowTitle,
                    ShadowVolume = x.ShadowVolume,
                    ShadowNumber = x.ShadowNumber,
                    ShadowYear = x.ShadowYear,
                    ShadowSeries = x.ShadowSeries,
                    ShadowFormat = x.ShadowFormat,
                    ShadowCount = x.ShadowCount,
                                            
                    Title = x.Title,
                    Volume = x.Volume,
                    Number = x.Number,
                    Year = x.Year,
                    Series = x.Series,
                    Format = x.Format,
                    Count = x.Count,
                                            
                    Month = x.Month,
                    
                    Date = new ComicDate(x.Year, x.Month),
                    PageCount = x.PageCount,
                    AlternateCount = x.AlternateCount,
                    AlternateSeries = x.AlternateSeries,
                    Summary = x.Summary,
                    Publisher = x.Publisher,
                    Imprint = x.Imprint,
                    
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
                    Opened = user.settings.use_comicrack_progress ? x.OpenedTimeAsText : (progress == null ? "" : progress.DateLastRead),
                    CurrentPage = user.settings.use_comicrack_progress ? x.CurrentPage : (progress == null ? 0 : progress.CurrentPage),
                    LastPageRead = user.settings.use_comicrack_progress ? x.LastPageRead : (progress == null ? 0 : progress.LastPageRead)
                };
        }
        
        public static ComicExcerpt ToComicExcerpt(this ComicBook x, BCRUser user)
        {
            ComicProgress progress = user.GetComicProgress(x.Id);
            
            return new ComicExcerpt
                {
                    Id = x.Id,
                    FilePath = x.FilePath,
                    Caption = x.Caption,
                    
                    ShadowTitle = x.ShadowTitle,
                    ShadowVolume = x.ShadowVolume,
                    ShadowNumber = x.ShadowNumber,
                    ShadowYear = x.ShadowYear,
                    ShadowSeries = x.ShadowSeries,
                    ShadowFormat = x.ShadowFormat,
                    ShadowCount = x.ShadowCount,
                                           
                    Month = x.Month,
                    PageCount = x.PageCount,
                    Opened = user.settings.use_comicrack_progress ? x.OpenedTimeAsText : (progress == null ? "" : progress.DateLastRead),
                    CurrentPage = user.settings.use_comicrack_progress ? x.CurrentPage : (progress == null ? 0 : progress.CurrentPage),
                    LastPageRead = user.settings.use_comicrack_progress ? x.LastPageRead : (progress == null ? 0 : progress.LastPageRead)
                };
        }
        
        public static ComicExcerpt ToComicExcerpt(this Comic x)
        {
            return new ComicExcerpt
                    {
                        Id = x.Id,
                        FilePath = x.FilePath,
                        Caption = x.Caption,
                        
                        ShadowTitle = x.ShadowTitle,
                        ShadowVolume = x.ShadowVolume,
                        ShadowNumber = x.ShadowNumber,
                        ShadowYear = x.ShadowYear,
                        ShadowSeries = x.ShadowSeries,
                        ShadowFormat = x.ShadowFormat,
                        ShadowCount = x.ShadowCount,
                                               
                        Month = x.Month,
                        PageCount = x.PageCount,
                        Opened = x.Opened,
                        LastPageRead = x.LastPageRead
                    };
        }

        public static Series ToSeries(this ComicBook x)
        {
            return new Series
                    {
                        Title = x.ShadowSeries,
                        Volume = x.ShadowVolume,
                        Id = x.Id,
                    };
        }
        
    }

}
