using Linq2Rest.Parser;
using Nancy;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text.RegularExpressions;

namespace BCR
{
  public class NaturalSortComparer<T> : IComparer<string>, IDisposable
    {
        private bool isAscending;
     
        public NaturalSortComparer(bool inAscendingOrder = true)
        {
            this.isAscending = inAscendingOrder;
        }
     
        #region IComparer<string> Members
     
        public int Compare(string x, string y)
        {
            throw new NotImplementedException();
        }
     
        #endregion
     
        #region IComparer<string> Members
     
        int IComparer<string>.Compare(string x, string y)
        {
            if (x == y)
                return 0;
     
            string[] x1, y1;
     
            if (!table.TryGetValue(x, out x1))
            {
                x1 = Regex.Split(x.Replace(" ", ""), "([0-9]+)");
                table.Add(x, x1);
            }
     
            if (!table.TryGetValue(y, out y1))
            {
                y1 = Regex.Split(y.Replace(" ", ""), "([0-9]+)");
                table.Add(y, y1);
            }
     
            int returnVal;
     
            for (int i = 0; i < x1.Length && i < y1.Length; i++)
            {
                if (x1[i] != y1[i])
                {
                    returnVal = PartCompare(x1[i], y1[i]);
                    return isAscending ? returnVal : -returnVal;
                }
            }
     
            if (y1.Length > x1.Length)
            {
                returnVal = 1;
            }
            else if (x1.Length > y1.Length)
            {
                returnVal = -1;
            }
            else
            {
                returnVal = 0;
            }
     
            return isAscending ? returnVal : -returnVal;
        }
     
        private static int PartCompare(string left, string right)
        {
            int x, y;
            if (!int.TryParse(left, out x))
                return left.CompareTo(right);
     
            if (!int.TryParse(right, out y))
                return left.CompareTo(right);
     
            return x.CompareTo(y);
        }
     
        #endregion
     
        private Dictionary<string, string[]> table = new Dictionary<string, string[]>();
     
        public void Dispose()
        {
            table.Clear();
            table = null;
        }
    }
  
    public static class ODataExtensions
    {
        private const string ODATA_URI_KEY = "OData_Uri";

        private static NameValueCollection MyParseUriOptions(NancyContext context)
        {
            object item;
            if (context.Items.TryGetValue(ODATA_URI_KEY, out item))
            {
                return item as NameValueCollection;
            }
            NameValueCollection nv = new NameValueCollection();
            context.Items.Add(ODATA_URI_KEY, nv);
            var queryString = context.Request.Url.Query;
            if (string.IsNullOrWhiteSpace(queryString))
            {
                return nv;
            }
            if (!queryString.StartsWith("?"))
            {
                throw new InvalidOperationException("Invalid OData query string " + queryString);
            }
            var parameters = queryString.Substring(1).Split('&', '=');
            if (parameters.Length % 2 != 0)
            {
                throw new InvalidOperationException("Invalid OData query string " + queryString);
            }
            for (int i = 0; i < parameters.Length; i += 2)
            {
                nv.Add(parameters[i], Uri.UnescapeDataString(parameters[i + 1]));
            }
            return nv;
        }
        
        public static string GetReflectedPropertyValue(this object subject, string field)
        {
            object reflectedValue = subject.GetType().GetProperty(field).GetValue(subject, null);
            return reflectedValue != null ? reflectedValue.ToString() : "";
        }
        
        public static IEnumerable<object> ApplyODataUriFilter<T>(this NancyContext context, IEnumerable<T> modelItems, ref int totalCount)
        {
            var nv = MyParseUriOptions(context);
                        
            
            // $select is broken somehow....remove it for now
            //NameValueCollection selectNV = new NameValueCollection();
            //selectNV.Add("$select", nv.Get("$select"));
            nv.Remove("$select");
            
            NameValueCollection pagingNV = new NameValueCollection();
            // We want the total count of the query before limiting the result set with $top and $skip
            if (null != nv.Get("$skip"))
            {
              pagingNV.Add("$skip", nv.Get("$skip"));
              nv.Remove("$skip");
            }
            
            if (null != nv.Get("$top"))
            {
              pagingNV.Add("$top", nv.Get("$top"));
              nv.Remove("$top");
            }
            
            // perform sorting ourselves, because linq2rest doesn't allow custom comparers.
            NameValueCollection sortNV = new NameValueCollection();
            if (null != nv.Get("$orderby"))
            {
              sortNV.Add("$orderby", nv.Get("$orderby"));
              nv.Remove("$orderby");
            }

            // Now do a query that returns all records
            var parser = new ParameterParser<T>();
            var filter = parser.Parse(nv);
            var objects = filter.Filter(modelItems);
            totalCount = objects.Count();
            
            // Now sort
            if (null != sortNV.Get("$orderby"))
            {
              char[] delimiterChars = {','};
              string[] orderby = sortNV.Get("$orderby").Split(delimiterChars);
              char[] delimiterSpace = {' '};
              string[] terms = orderby[0].Split(delimiterSpace);
              bool ascending = true;
              if (terms.Count() == 2)
                ascending = terms[1] != "desc";
              
              if (orderby.Count() == 1)
              {
                objects = objects.OrderBy(item => item.GetReflectedPropertyValue(terms[0]), new NaturalSortComparer<string>(ascending));
              }
              else
              if (orderby.Count() > 1)
              {
                // get the second orderby
                string[] terms2 = orderby[1].Split(delimiterSpace);
                bool ascending2 = true;
                if (terms2.Count() == 2)
                  ascending2 = terms2[1] != "desc";
                
                objects = objects.OrderBy(item => item.GetReflectedPropertyValue(terms[0]), new NaturalSortComparer<string>(ascending))
                                 .ThenBy(item => item.GetReflectedPropertyValue(terms2[0]), new NaturalSortComparer<string>(ascending2));
              }
                
            }

            
            // Now limit the resultset
            var parser2 = new ParameterParser<T>();
            var filter2 = parser2.Parse(pagingNV);
            var objects2 = filter2.Filter(objects.Cast<T>());
            return objects2;
        }

        public static Response AsOData<T>(this IResponseFormatter formatter, IEnumerable<T> modelItems, HttpStatusCode code = HttpStatusCode.OK)
        {
            bool isJson = formatter.Context.Request.Headers.Accept.Select(x => x.Item1).Where(x => x.StartsWith("application/json", StringComparison.InvariantCultureIgnoreCase)).Any();

            var nv = MyParseUriOptions(formatter.Context);
            string value = nv.Get("$format");
            if (string.Compare(value, "json", true) == 0)
            {
              isJson = true;
            }

            // BCR only supports json, no need to supply the $format every time....
            isJson = true;
            
            if (isJson)
            {
              int totalCount = 0;
              return formatter.AsJson(formatter.Context.ApplyODataUriFilter(modelItems, ref totalCount), code);
            }
            throw new NotImplementedException("Atom feeds not implemented");
        }
    }
}
